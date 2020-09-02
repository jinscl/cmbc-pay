<template>
  <div class="content">
    <div class="wrapper">
      <div class="item-row">
        <label class="item-name">通知书单号</label>
        <span class="item-value">{{ntcId}}</span>
      </div>
      <div class="item-row">
        <label class="item-name">执收单位名称</label>
        <span class="item-value">{{acceptAgencyName}}</span>
      </div>
      <div class="item-row">
        <label class="item-name">缴款人</label>
        <span class="item-value">{{payer}}</span>
      </div>
      <div class="item-row">
        <label class="item-name">通知书状态</label>
        <span class="item-value">{{cnNtcStatus}}</span>
      </div>
      <div class="item-row">
        <label class="item-name">总滞纳金</label>
        <span class="item-value">{{tatefeeAmt}}</span>
      </div>
      <div class="item-row">
        <label class="item-name">标准金额</label>
        <span class="item-value">{{penaltyAndDerateAmt}}</span>
      </div>
      <div class="item-row">
        <label class="item-name">应缴总金额</label>
        <span class="item-value">{{totalAmt}}</span>
      </div>
    </div>
    <div>
      <form id="payForm" name="payForm" action="http://121.15.180.66:801/netpayment/BaseHttp.dll?MB_APPPay" method="post">
        <input id="jsonRequestData" type="hidden" name="jsonRequestData" v-bind:value="bankPayResJson"/>
        <input type="hidden" name="charset" value="utf-8"/>
        <!--<input type="submit" value="提交"/>-->
      </form>
      <div class="button-row">
        <el-row>
          <el-button type="primary" :disabled="cantClick" v-show="show" @click="confirmPay">确认支付</el-button>
        </el-row>
      </div>
    </div>
    <el-dialog
            title="提示"
            :visible.sync="closeDialogVisible"
            :showClose="false"
            :before-close="doClose"
            width="calc(100% - 30px)">
      <span>用户信息丢失,页面即将关闭</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="doClose">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import commonUtil from "../js/commonUtil";
import commonApi from '../service/commonApi'
import cmblapi from "cmblapi";

export default {
  name: "ConfirmPay",
  props: {
    msg: String
  },
  mounted() {
    commonUtil.showTopBar(this,"executeJs");
    /**
     * 从缓存中获取用户唯一标识
     */
    let userId = this.$StoreJs.getUserCookie();
    if(userId && '' != userId ){
      this.closeDialogVisible=false;
    }else{
      this.closeDialogVisible=true;
    }
    // 初始化页面，通过路由传入的参数，填充详情页面
    this.ntcId=this.$route.params.ntcId;
    let ntcDetails = this.$route.params.ntcDetails;
    this.acceptAgencyName = ntcDetails.acceptAgencyName;
    this.payer = ntcDetails.payer;
    this.tatefeeAmt = ntcDetails.tatefeeAmt;
    this.totalAmt = ntcDetails.totalAmt;
    this.ntcStatus = ntcDetails.ntcStatus;
    this.penaltyAndDerateAmt = this.totalAmt-this.tatefeeAmt;
    if(this.ntcStatus){
      if(this.ntcStatus=='01'){
        this.cnNtcStatus=this.ntcStatus+"待缴款";
        this.show=true;
        this.cantClick = false;
      } else if(this.ntcStatus=='02'){
        this.cnNtcStatus=this.ntcStatus+"支付中";
        this.cantClick = true;
        this.show=false;
      }else if(this.ntcStatus=='03'){
        this.cnNtcStatus=this.ntcStatus+"已缴款";
        this.cantClick = true;
        this.show=false;
      }else{
        this.cnNtcStatus=this.ntcStatus+"已废止";
        this.cantClick = true;
        this.show=false;
      }
    }else{
      this.cnNtcStatus="未定义,需联系行方";
      this.show=false;
      this.cantClick=true;
    }
  },
  data: function() {
    return {
      closeDialogVisible:false,
      show:false,//是否显示
      cantClick:true,//是否不能点击
      acceptAgencyName: "",//执收单位名称
      payer: "",//缴款人
      tatefeeAmt: "",//滞纳金
      totalAmt: "",//应缴总金额
      ntcStatus: "",//通知书状态
      bankPayResJson:"",//提交一网通支付的数据
      bankPayRes:"",//从后台获取一网通支付的数据
      penaltyAndDerateAmt: "",//加罚+减免
      cnNtcStatus:"",//中文状态
      ntcId:""//通知书单号
    };
  },
  methods: {
    doClose(done){
      this.$confirm('确认关闭？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        this.$StoreJs.clearCookie();
        this.closeDialogVisible = false;
        commonUtil.shutDown(this);
        cmblapi.popWindow();
        done();
      }).catch(() => {});
    },
    /**
     * 通用支付
     * 第一步：调用柜面支付接口，获取订单信息：记录核心日志，并加密返回前台
     * 第二步：调用招行一网通支付：网页直接展示结果，无响应报文
     * @param 通知单号+通知单详情
     * @returns 错误信息errorMsg,成功信息successMsg
     */
    async confirmPay() {
      this.cantClick=true;
      let ntcId = this.ntcId;
      let areaCode = this.$route.params.areaCode;
      /**
       * 调用柜面接口
       */
      // ⚠️ 参数统一采用驼峰命名方式
      let bankPayRes = await this.$Http.commonPay({
        ntcId: ntcId,
        areaCode: areaCode,
        //data: this.$route.params.ntcDetails
      }, false, {
        baseURL: commonApi.forwardUrl.protocol+commonApi.forwardUrl.ip+commonApi.forwardUrl.domain,
      });
      this.bankPayRes = bankPayRes;
      // 柜面支付接口畅通
      if (bankPayRes) {
        if (!bankPayRes.errorMsg) {
          //let bankPayResData = bankPayRes.reqData;
          this.bankPayResJson = JSON.stringify(bankPayRes);
          // 调用支付结果校验接口,参数：柜面支付返回结果
          var payForm = document.getElementById("payForm");
          /**
           * 调用一网通支付
           */
          var jsonRequestData = document.getElementById("jsonRequestData");
          jsonRequestData.value = this.bankPayResJson;
          payForm.submit();
        } else {
          if(bankPayRes.errorMsg.indexOf("登录")>0){
            this.errorMsg = bankPayRes.errorMsg;
            this.closeDialogVisible = true;
          }else {
            this.$alert(bankPayRes.errorMsg, '温馨提示', {
              confirmButtonText: '确定',
              center: true
            })
          }
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
  /*height: 40px;*/
  /*line-height: 40px;*/
  padding: 0.5rem 1rem;
  background-color: #fff;
  border-top: 1px solid #eeeeee;
}
.el-row,
.el-button {
  width: 100%;
}
</style>


