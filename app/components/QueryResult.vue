<template>
    <div class="content">
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
            <div class="item-row">
                <label class="item-name">总滞纳金</label>
                <span class="item-value">{{tatefeeAmt}}</span>
            </div>
            <div class="item-row">
                <label class="item-name">加罚减免共计</label>
                <span class="item-value">{{penaltyAndDerateAmt}}</span>
            </div>
            <div class="item-row">
                <label class="item-name">应缴总金额</label>
                <span class="item-value">{{totalAmt}}</span>
            </div>
            </div>
            <div v-else>
                <div class="item-row">
                    <label class="item-name">财政响应码</label>
                    <span class="item-value">{{resultCode}}</span>
                </div>
                <div class="item-row">
                    <label class="item-name">财政响应描述</label>
                    <span class="item-value">{{resultMessage}}</span>
                </div>
            </div>
            <!-- 退出确认弹窗 -->
            <!-- showClose主要是这个属性设为false即可 -->
            <el-dialog
                    title="提示"
                    :visible.sync="closeDialogVisible"
                    :showClose="false"
                    :before-close="doClose"
                    width="30%">
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
        mounted() {
            commonUtil.showTopBar();
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
                    this.queryData();
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
            doClose(done){
                this.$confirm('确认关闭？')
                    .then(() => {
                        this.closeDialogVisible=false;
                        this.$StoreJs.clearCookie();
                        this.closeDialogVisible = false;
                        cmblapi.popWindow();
                        commonUtil.closeWindow();
                        done();
                    })
                    .catch(() => {});
            },
            async queryData(){
                let checkParams = {
                    "ntcId": this.ntcId,
                    "orderNo":this.orderNo,
                    "areaCode":this.areaCode
                };
                let res = await this.$Http.checkNtcOrder(checkParams, false, {
                    baseURL: commonApi.forwardUrl.protocol+commonApi.forwardUrl.ip+commonApi.forwardUrl.domain
                });
                if(res) {
                    // 获取通知书成功
                    if (!res.errorMsg) {
                        let ntcDetails = res.data;
                        this.acceptAgencyName = ntcDetails.acceptAgencyName;
                        this.payer = ntcDetails.payer;
                        this.tatefeeAmt = ntcDetails.tatefeeAmt;
                        this.totalAmt = ntcDetails.totalAmt;
                        this.penaltyAndDerateAmt = this.totalAmt-this.tatefeeAmt;
                        this.ntcStatus = ntcDetails.ntcStatus;
                        if(this.ntcStatus=='01'){
                            this.cnNtcStatus=this.ntcStatus+"待缴款";
                        } else if(this.ntcStatus=='02'){
                            this.cnNtcStatus=this.ntcStatus+"支付中";
                        }else if(this.ntcStatus=='03'){
                            this.cnNtcStatus=this.ntcStatus+"已缴款";
                        }else{
                            this.cnNtcStatus=this.ntcStatus+"已废止";
                        }
                    } else if(res.resultCode){
                        this.resultCode = res.resultCode;
                        this.resultMessage = res.resultMessage;
                    }else{
                        this.errorMsg = res.errorMsg;
                        this.closeDialogVisible=true;
                    }
                }
            }
        }
    }

</script>

<style scoped>
    .item-row {
        display: flex;
        /*height: 40px;*/
        /*line-height: 40px;*/
        padding: 0.5rem 1rem;
        background-color: #fff;
        border-top: 1px solid #eeeeee;
    }
</style>
