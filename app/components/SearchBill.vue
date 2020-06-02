<template>
    <div class="content">
      <div class="input-wrapper">
       <div class="item-row">
        <div class="item-name">缴款识别码</div>
        <div class="item-value">
          <input class="item-input ntc-id" style="width:190px" type="text" v-model="ntcId" onkeyup="this.value=this.value.replace(/[^_A-Z0-9_]/g,'');" placeholder="请在此输入"/>
          <i class="el-icon-full-screen" style="width:10px" @click="scanBarCode"></i>
          <!-- <img src="../assets/scanBar.png"> -->
        </div>
      </div>
      <div class="item-row">
          <div class="item-name">区划代码</div>
          <div class="item-value">
<!--      <Form :model="financeData" ref="formItem" :rules="ruleInline" :label-width="80">-->
<!--          <FormItem label="区划代码 : " prop="sendValue">-->
              <el-select class="item-input" v-model="areaCode">
                  <el-option v-for="item in financeData" :value="item.chr_code" :key="item.chr_code">
                      {{item.chr_name}}:{{item.chr_code}}
                  </el-option>
              </el-select>
<!--          </FormItem>-->
<!--      </Form>-->
<!--      <div class="item-row">-->
<!--        <div class="item-name">区划代码</div>-->
<!--        <div class="item-value">-->
<!--          <input type="number" class="item-input" v-model="areaCode" placeholder="请在此输入"/>-->
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
import commonUtil from '../js/commonUtil'
import commonApi from '../service/commonApi'
export default {
  name: 'SearchBill',
  data:function(){
    return {
        ntcId:"",
        areaCode:"",
        financeData:[]
    }
  },
  // updated() {
  //   let financeCookie = this.$StoreJs.getFinanceCookie();
  //   if(financeCookie && '' != financeCookie){
  //       this.financeData = JSON.parse(financeCookie)
  //   }else {
  //       this.financeData = this.$Http.getFinanceCode({}, false, {
  //           baseURL: commonApi.forwardUrl.url
  //       });
  //       this.$StoreJs.setFinanceCode(JSON.stringify(this.financeData));
  //   }
  // },
  async mounted() {

    let userId = this.$StoreJs.getUserCookie();
    let financeCookie = this.$StoreJs.getFinanceCookie();
    console.log(userId);
    if(userId && '' != userId ){
      this.$alert(userId);
      if(financeCookie && '' != financeCookie){
          this.financeData = JSON.parse(financeCookie)
          this.$alert("id时"+this.financeData);
      }else {
          this.financeData = await this.$Http.getFinanceCode({}, false, {
              baseURL: commonApi.forwardUrl.protocol+commonApi.forwardUrl.ip+commonApi.forwardUrl.domain
          });
          this.$StoreJs.setFinanceCookie(JSON.stringify(this.financeData));
          this.$alert("获取"+this.financeData);
      }
    }else{
      commonUtil.closeWindow();
    }
    //let finance = localStorage.getItem("finance");
    // let data = JSON.parse(finance);
    // for(let i in data){
    //   this.financeData.push(data[i]);      //this指向vue实例
    // }
    //   let financeCookie2 = this.$StoreJs.getFinanceCookie();
    //   if(financeCookie2 && '' != financeCookie2 ){
    //       this.financeData = JSON.parse(financeCookie2)
    //       this.$alert("第二次"+this.financeData);
    //   }else{
    //       this.$alert("测试打印，这里是因为financeCookie被清除且未获取才弹窗，正式环境页面会被关闭，这里是未解决的bug，需要行方协调");
    //       //commonUtil.closeWindow();
    //   }
    // if(this.financeData && '' != this.financeData){
    //     this.$alert("校验"+this.financeData);
    // }else{
    //     this.$alert("获取区划失败！");
    // }
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
          let info = JSON.parse(res.result);
          self.ntcId = info.ntcId;
          self.areaCode = info.areaCode;
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
        this.$alert('通知单号为位数字', '温馨提示', {
          confirmButtonText: '确定',
          center: true
        });
      }else{
        this.isDisabled = false;
        let searchParams = {
            "ntcId": ntcId,
            "areaCode":this.areaCode
        };
          console.log("searchParams"+searchParams.areaCode);
        let res = await this.$Http.getNtcInfo(searchParams, false, {
            baseURL: commonApi.forwardUrl.protocol+commonApi.forwardUrl.ip+commonApi.forwardUrl.domain
          });
        console.log("通知书详情查询结果"+res);
        if(res){
          // 获取通知书成功
          if(!res.errorMsg){
              this.isDisabled = true;
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
       margin-right:0.5rem;
    }
    .el-icon-share{
      margin-left: 8px;
    }
    .item-input:focus{
      outline:transparent;
    }
</style>

