<template>
    <div class="content" v-loading="loading" style="width: 100%" element-loading-text="拼命加载中">
        <div class="wrapper">
            <div class="item-row">
                <label class="item-name">通知书单号</label>
                <span class="item-value">{{ntcId}}</span>
            </div>
            <div v-if="acceptAgencyName">
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
            <div v-if="tatefeeAmt&&tatefeeAmt!='0'&&tatefeeAmt!='0.00'" class="item-row">
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
            <div v-else-if="resultCode">
                <div class="item-row">
                    <label class="item-name">财政响应码</label>
                    <span class="item-value">{{resultCode}}</span>
                </div>
                <div class="item-row">
                    <label class="item-name">财政响应描述</label>
                    <span class="item-value">{{resultMessage}}</span>
                </div>
            </div>
            <div class="button-row">
                <el-row>
                    <el-button type="primary"  @click="goToSearch">进入查询页面</el-button>
                </el-row>
            </div>
            <div v-if="!resultCode&&errorMsg" style="width: 200px;position:fixed;left: 100px;top: 120px">
                    <div style="color: red">错误信息:</div>
                    <span class="item-error">{{errorMsg}}</span>
            </div>
            <!-- 退出确认弹窗 -->
            <!-- showClose主要是这个属性设为false即可 -->
            <el-dialog
                    title="提示"
                    :visible.sync="closeDialogVisible"
                    :showClose="false"
                    :before-close="doClose"
                    width="calc(100% - 30px)">
                <span>{{errorMsg}}</span>
                <span slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="doClose">确 定</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>

<script>
    import commonApi from "../service/commonApi";
    import commonUtil from "../js/commonUtil";
    import cmblapi from "cmblapi";

    export default {
        name: "QueryResult.vue",
        created() {
            commonUtil.showTopBar(this,"executeJs");
            /**
             * 从cookie中获取用户唯一标识信息
             * 不存在则关闭页面，为非法访问
             */
            let userId = this.$StoreJs.getUserCookie();
            if(userId && '' != userId ){
                if(this.$route.params.ntcId && this.$route.params.orderNo && this.$route.params.areaCode){
                    this.ntcId = this.$route.params.ntcId;
                    this.orderNo = this.$route.params.orderNo;
                    this.areaCode = this.$route.params.areaCode;
                    this.$nextTick(()=>{this.queryData();});
                }else{
                    this.errorMsg = "链接传递参数有误,界面即将关闭";
                    this.closeDialogVisible = true;
                }
            }else{
                this.errorMsg = "用户信息为空,界面即将关闭";
                this.closeDialogVisible = true;
            }
        },
        data: function() {
            return {
                loading: true,
                errorMsg:"",//弹窗信息
                closeDialogVisible:false,//关闭弹窗是否可视化
                ntcId:"",//通知书单号
                orderNo:"",//订单号
                areaCode:"",//区划
                acceptAgencyName: "",//执收单位名称
                payer: "",//缴款人
                tatefeeAmt: "",//滞纳金
                totalAmt: "",//应缴总金额
                ntcStatus: "",//通知书状态
                penaltyAndDerateAmt: "",//加罚+减免
                cnNtcStatus:"",//中文状态
                resultMessage:"",//财政相应描述
                resultCode:""//财政响应码
            };
        },
        methods:{
            goToSearch(){
                this.$router.push("/search");
            },
            sleep(d) {
                return new Promise((resolve) => setTimeout(resolve, d))
            },
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
            async queryData(){
                let checkParams = {
                    "ntcId": this.ntcId,
                    "orderNo":this.orderNo,
                    "areaCode":this.areaCode
                };
                let self = this;
                for(let i = 1 ; i < 4; i++) {
                    this.loading = true;
                    if(this.acceptAgencyName || this.resultCode || this.errorMsg) {
                        this.loading = false;
                        break;
                    }else{
                        await this.sleep(i*6000);
                        this.loading = false;
                        let res = await self.$Http.checkNtcOrder(checkParams, false, {
                            baseURL: commonApi.forwardUrl.protocol + commonApi.forwardUrl.ip + commonApi.forwardUrl.domain
                        });
                        if (res) {
                            // 获取通知书成功
                            if (!res.errorMsg) {
                                let ntcDetails = res.data;
                                this.acceptAgencyName = ntcDetails.acceptAgencyName;
                                this.payer = ntcDetails.payer;
                                this.tatefeeAmt = ntcDetails.tatefeeAmt;
                                this.totalAmt = ntcDetails.totalAmt;
                                this.penaltyAndDerateAmt = commonUtil.accSub(this.totalAmt,this.tatefeeAmt);
                                this.ntcStatus = ntcDetails.ntcStatus;
                                if (this.ntcStatus == '01') {
                                    this.cnNtcStatus = "待缴款";
                                } else if (self.ntcStatus == '02') {
                                    this.cnNtcStatus = "支付中";
                                } else if (self.ntcStatus == '03') {
                                    this.cnNtcStatus = "已缴款";
                                } else {
                                    this.cnNtcStatus = "已废止";
                                }
                            } else if (res.resultCode) {
                                this.resultCode = res.resultCode;
                                this.resultMessage = res.resultMessage;
                            } else {
                                if(res.errorMsg.indexOf("登录")>-1){
                                  this.errorMsg = res.errorMsg;
                                  this.closeDialogVisible = true;
                                  this.loading = false;
                                  break;
                                }else {
                                  this.errorMsg = res.errorMsg;
                                  this.$alert(res.errorMsg, '温馨提示', {
                                    confirmButtonText: '确定',
                                    center: true
                                  });
                                  break;
                                }
                            }
                        }
                    }
                }
                this.loading = false;
            }
        }
    }

</script>

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
    /*.btn-custom-cancel{
        height: 10px;
        width: 10px;
    }
    .btn-custom-confirm{
      height: 10px;
      width: 10px;
    }*/
    .el-row,
    .el-button {
        width: 100%;
    }
    .item-error{
      white-space: pre-wrap;
      flex: 2;
      text-align: center;
      font-size: 16px;
      border-style:ridge;
      border-radius: 0px;
      border-width:1px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    }
</style>
