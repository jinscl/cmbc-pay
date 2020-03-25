<template>
    <div class="content">
      <div class="input-wrapper">
       <div class="item-row">
        <div class="item-name">通知单号</div>
        <div class="item-value">
          <input type="number" class="item-input ntc-id" v-model="ntcId" placeholder="请在此输入"/>
          <i class="el-icon-full-screen" @click="scanBarCode"></i>
          <!-- <img src="../assets/scanBar.png"> -->
        </div>
      </div>
      <div class="item-row">
        <div class="item-name">区划代码</div>
        <div class="item-value">
          <input type="number" class="item-input" v-model="areaCode" placeholder="请在此输入"/>
        </div>
      </div>
      <div class="button-row">
          <el-row>
              <el-button type="primary" :disabled="isDisabled" @click="getNtcInfoFromCZ">查询</el-button>
          </el-row>
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
    }
  },
  computed:{
    isDisabled:function(){
      return ((this.ntcId && this.areaCode) ? false : true)
    }
  },
  methods: {
    /**
     * 招商银行扫描二维码接口
     */
    scanBarCode(){
      let self = this;
      cmblapi.scanBarcode({
        success:function(res){
          console.log("扫描结果："+res.result);
          console.log("二维码/条形码来源："+res.source);
          this.ntcId = res.result.ntcId;
          this.areaCode = res.result.areaCode;
          self.$alert("扫一扫查询获取通知单成功！");
        },
        fail:function(res){
          console.log("错误代码"+res.errCode);
          console.log("错误信息"+res.errMsg);
          self.$alert("扫一扫查询获取通知单失败！");
        }
      })

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
        let searchParams = {
            "ntcId": ntcId,
            "areaCode":this.areaCode
        };
          console.log("searchParams"+searchParams.areaCode);
        let res = await this.$Http.getNtcInfo(searchParams, false, {
            baseURL: "http://125.35.5.131:8804"
          });
        console.log("通知书详情查询结果"+res);
        if(res){
          // 获取通知书成功
          if(!res.errorMsg){
            this.$router.push({name: 'pay', params: {ntcId: ntcId,areaCode:this.areaCode,ntcDetails:res.data}});
          }else{
            this.$alert(res.errorMsg, '温馨提示', {
              confirmButtonText: '确定',
              center: true
            })
          }
        }
        // let testData = {
        //     acceptAgencyName: "深圳财政局",
        //     payer: "jscl",
        //     tatefeeAmt: "200.00",
        //     totalAmt: "1000.00",
        //     ntcStatus: "未支付"
        // }
        // this.$router.push({name: 'pay', params: {ntcId: ntcId,areaCode:this.areaCode,ntcDetails: testData}});
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
      border-bottom:1px solid #eeeeee;
    }
    .item-input{
      font-size: 16px;
      text-align: right;
      outline:none;
      border:none;
      background-color:transparent;
    }
    .ntc-id{
      /* margin-right:0.5rem; */
    }
    .el-icon-share{
      margin-left: 8px;
    }
    .item-input:focus{
      outline:transparent;
    }


</style>

