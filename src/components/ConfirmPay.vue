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
<!--        <div class="button-row">-->
<!--          <el-row>-->
<!--            <el-button type="primary" @click="queryResult">查询支付</el-button>-->
<!--          </el-row>-->
<!--        </div>-->
      </div>
      <div>
        <form id="payForm" name="payForm" action="http://121.15.180.66:801/netpayment/BaseHttp.dll?MB_APPPay" method="post">
          <input type="hidden" name="jsonRequestData" v-bind:value="bankPayResJson"/>
          <input type="hidden" name="charset" value="utf-8"/>
<!--          <input type="submit" value="提交"/>-->
        </form>
        <div class="button-row">
          <el-row>
            <el-button type="primary" @click="confirmPay">确认支付</el-button>
          </el-row>
        </div>
      </div>
<!--      <div class="button-row">-->
<!--        <el-row>-->
<!--          <el-button type="primary" @click="returnResult">支付回调</el-button>-->
<!--        </el-row>-->
<!--      </div>-->
    </div>
</template>
<script>
export default {
  name1: "ConfirmPay",
  name2: "QueryResult",
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
      ntcStatus: "",//通知书状态
      bankPayResJson:"",
      bankPayRes:""
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
    async confirmPay() {

      let ntcId = this.$route.params.ntcId;
      let areaCode = this.$route.params.areaCode;
      // ⚠️ 参数统一采用驼峰命名方式
      let bankPayRes = await this.$Http.commonPay({
        ntcId: ntcId,
        areaCode: areaCode,
        data: this.$route.params.ntcDetails
      }, false, {
        baseURL: 'http://wxnontax.vipgz1.idcfengye.com',
      });
      this.bankPayRes = bankPayRes;
      console.log(bankPayRes);
      // 柜面支付接口畅通
      if (bankPayRes) {
        if (!bankPayRes.errorMsg) {
          //let bankPayResData = bankPayRes.reqData;
          this.bankPayResJson = JSON.stringify(bankPayRes);
          // 调用招行一网通支付,参数：柜面支付返回结果转为json,无响应报文
          // await this.$Http.cmbcBasePay({jsonRequestData:bankPayResJson},true,{
          //     baseURL:'http://121.15.180.66:801',
          //   headers:{
          //     'Content-Type': 'application/x-www-form-urlencoded'
          //   }
          // });
          // 调用支付结果校验接口,参数：柜面支付返回结果
          var payForm = document.getElementById("payForm");
          setTimeout(() => {
            payForm.submit();
          }, 1000);
        } else {
          this.$alert(bankPayRes.errorMsg, '温馨提示error', {
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


