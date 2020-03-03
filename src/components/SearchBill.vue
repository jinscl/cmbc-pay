<template>
  <div>
    <header class="header">
      <div class="header-icon"><i class="el-icon-arrow-left"></i></div>
      <div class="header-title"> <span>通知单缴费</span></div>
    </header>
    <div class="content">
      <div class="input-wrapper">
       <div class="item-row">
        <div class="item-name">通知单号</div>
        <div class="item-value">
          <input class="item-input" v-model="ntcId" placeholder="请在此输入"/>
          <i class="el-icon-full-screen" @click="scanBarCode"></i>
          <!-- <img src="../assets/scanBar.png"> -->
        </div>
      </div>
      <div class="item-row">
        <div class="item-name">区划代码</div>
        <div class="item-value">
          <input class="item-input" v-model="areaCode" placeholder="请在此输入"/>
        </div>
      </div>
      <div class="button-row">
          <el-row>
              <el-button type="primary" :disabled="isDisabled" @click="getNtcInfoFromCZ">查询</el-button>
          </el-row>
      </div>
      </div>
    </div>
  </div>
</template>
<script>
import cmblapi from 'cmblapi'
export default {
  name: 'SearchBill',
  data:function(){
    return {
        ntcId:"",
        areaCode:"",
        isDisabled:true
    }
  },
  // watch: {
  //    ntcId:function(val){
  //     this.isDisabled = (val !== '') ? false :true;
  //    }
  //  },
  computed:{
    isDisabled:function(){
      return (this.ntcId && this.areaCode)
    }
  },
  methods: {
    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push('/');
    },
    /**
     * 招商银行扫描二维码接口
     */
    scanBarCode(){
      cmblapi.scanBarcode({
        success:function(res){
          console.log("扫描结果："+res.result);
          console.log("二维码/条形码来源："+res.source);
          this.ntcId = res.result.ntcId;
          this.areaCode = res.result.areaCode;
        },
        fail:function(res){
          console.log("错误代码"+res.errCode);
          console.log("错误信息"+res.errMsg);
        }
      })
      alert("扫一扫查询获取通知单成功！");
      this.ntcId = "12345678";
      this.areaCode = "87";
    },
    /**
     * 从财政查询通知单详情 
     * @param ntcId 通知单
     * @returns 通知单详情
     */
    async getNtcInfoFromCZ() {
      let ntcId = this.ntcId;
      if( ntcId === ''){
        // ⚠️通知单格式校验 格式需要再确认
        this.$alert('通知单号为8位数字', '温馨提示', {
          confirmButtonText: '确定',
          center: true
        });
      }else{
        let searchParams = { ntcId: ntcId, areaCode:this.areaCode};
        let res = await this.$Http.getNtcInfo(searchParams);
        // 获取通知书成功
        if(!res.errMsg){
          this.$router.push({name: 'pay', params: {ntcDetail: res.data, ntcId: ntcId}});
        }else{
          this.$alert(res.errMsg, '温馨提示', {
            confirmButtonText: '确定',
            center: true
          })
        }
 
        
        // let testData = {
        //     businessName: "手机银行饭票jscl",
        //     tradeNo: "00001",
        //     payAccount: "1",
        //     needPayMoney: "¥95.00",
        //     orderPhoneNo: "12345678900"
        // }
        // this.$router.push({name: 'pay', params: {noticeDetail: testData, noticeNo: "12345678"}});
      }
    },
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .item-row{
      display: flex; 
      height: 40px;
      line-height: 40px;
      padding:0 1rem;
      background-color: #fff;
      border-top:1px solid #eeeeee;
      border-bottom:1px solid #eeeeee;
    }
    .item-input{
      font-size: 16px;
      text-align: right;
    }
    .el-icon-share{
      margin-left: 8px;
    }
    .item-input:focus{
      outline:transparent;
    }
    
  
</style>

