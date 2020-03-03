<template>
  <div>
    <header class="header">
      <div class="header-icon" @click="goBack">
        <i class="el-icon-arrow-left"></i>
      </div>
      <div class="header-title">
        <span>通知单缴费</span>
      </div>
    </header>
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
  </div>
</template>
<script>
export default {
  name: "ConfirmPay",
  props: {
    msg: String
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
  created() {
    // 初始化页面，通过路由传入的参数，填充详情页面
    let ntcDetail = this.$route.params.ntcDetail;
    this.acceptAgencyName = ntcDetail.acceptAgencyName;
    this.payer = ntcDetail.payer;
    this.tatefeeAmt = ntcDetail.tatefeeAmt;
    this.totalAmt = ntcDetail.totalAmt;
    this.ntcStatus = ntcDetail.ntcStatus;
  },
  methods: {
    goBack() {
        window.history.length > 1 ? this.$router.go(-1) : this.$router.push('/');
    },
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
        // ⚠️ 参数统一采用驼峰命名方式
        let bankPayRes = await this.$Http.commonPay({
            payParam : {
                acceptAgencyName: this.acceptAgencyName,
                payer: this.payer,
                tatefeeAmt: this.tatefeeAmt,
                totalAmt: this.totalAmt,
                ntcStatus: this.ntcStatus
            },
            ntcId:ntcId
        });
        // 柜面支付接口畅通
        if(bankPayRes && !bankPayRes.errorMsg){
            let bankPayResData = bankPayRes.data;
            let bankPayResJson = JSON.stringify(bankPayResData);
            // 调用招行一网通支付,参数：柜面支付返回结果转为json,无响应报文
            await this.$Http.cmbcBasePay({charset:"UTF-8",jsonRequestData:bankPayResJson},true,{
                baseURl:'http://121.15.180.66:801',
            });
            // 调用支付结果校验接口,参数：柜面支付返回结果
            await this.$Http.checkPayResult(bankPayResData);
            this.$alert("支付成功！", '温馨提示', {
                confirmButtonText: '确定'
            });
        }else{
            this.$alert(res.errorMsg, '温馨提示', {
                confirmButtonText: '确定'
            });
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


