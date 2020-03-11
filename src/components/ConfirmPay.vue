<template>
    <div class="content">
      <div class="wrapper">
        <div class="item-row">
          <label class="item-name">执行单位名称</label>
          <span class="item-value">{{acceptAgencyName}}</span>
        </div>
        <div class="item-row">
          <label class="item-name">缴款人</label>
          <span class="item-value">{{payer}}</span>
        </div>
        <div class="item-row">
          <label class="item-name">通知书状态</label>
          <span class="item-value">{{ntcStatus}}</span>
        </div>
        <div class="item-row">
          <label class="item-name">总滞纳金</label>
          <span class="item-value">{{tatefeeAmt}}</span>
        </div>
        <div class="item-row">
          <label class="item-name">应缴总金额</label>
          <span class="item-value">{{totalAmt}}</span>
        </div>
       
        <div class="button-row">
          <el-row>
            <el-button type="primary" @click="confirmPay">确认支付</el-button>
          </el-row>
        </div>
      </div>
    </div>
</template>
<script>
export default {
  name: "ConfirmPay",
  props: {
    msg: String
  },
  mounted() {
    // 初始化页面，通过路由传入的参数，填充详情页面
    let ntcDetails = this.$route.params.ntcDetails;
    console.log(ntcDetails);
    this.acceptAgencyName = ntcDetails.acceptAgencyName;
    this.payer = ntcDetails.payer;
    this.tatefeeAmt = ntcDetails.tatefeeAmt;
    this.totalAmt = ntcDetails.totalAmt;
    this.ntcStatus = ntcDetails.ntcStatus;
  },
  data: function() {
    return {
      acceptAgencyName: "",//执收单位名称
      payer: "",//缴款人
      tatefeeAmt: "",//滞纳金
      totalAmt: "",//应缴总金额
      ntcStatus: ""//通知书状态
    };
  },
  methods: {
    /**
     * 通用支付
     * 第一步：柜面支付：记录核心日志，并加密返回前台
     * 第二步：调用招行一网通支付：网页直接展示结果，无响应报文
     * 第三步：调用支付结果校验
     * @param 通知单号+通知单详情
     * @returns 错误信息errorMsg,成功信息successMsg
     */
    async confirmPay(){
        let ntcId = this.$route.params.ntcId;
        let areaCode = this.$route.params.areaCode;
        // ⚠️ 参数统一采用驼峰命名方式
        let bankPayRes = await this.$Http.commonPay({
            ntcId:ntcId,
            areaCode:areaCode,
            data:this.$route.params.ntcDetails
        });
        // 柜面支付接口畅通
        if(bankPayRes){
          if(!bankPayRes.errorMsg){
              let bankPayResData = bankPayRes.reqData;
              let bankPayResJson = JSON.stringify(bankPayResData);
              // 调用招行一网通支付,参数：柜面支付返回结果转为json,无响应报文
              await this.$Http.cmbcBasePay({charset:"UTF-8",jsonRequestData:bankPayResJson},true,{
                  baseURl:'http://121.15.180.66:801',
              });
              // 调用支付结果校验接口,参数：柜面支付返回结果
              let autoCheckPayRes = await this.$Http.checkPayResult({
                ntcId:ntcId,
                areaCode:areaCode,
                dateTime:bankPayResData.dateTime,
                orderNo:bankPayResData.orderNo,
                date:bankPayResData.date
              });
              if(autoCheckPayRes && !autoCheckPayRes.errorMsg){
                // 支付成功，调用招行消息通知类
              }else{
                this.$alert(autoCheckPayRes.errorMsg, '温馨提示', {
                  confirmButtonText: '确定'
                });
              }
          }else{
              this.$alert(bankPayRes.errorMsg, '温馨提示', {
                  confirmButtonText: '确定'
              });
          }
        }
    }
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.item-row {
  display: flex;
  height: 40px;
  line-height: 40px;
  padding: 0 1rem;
  background-color: #fff;
  border-top: 1px solid #eeeeee;
}

</style>


