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
                <label class="item-name">加罚和减免共计</label>
                <span class="item-value">{{penaltyAndDerateAmt}}</span>
            </div>
            <div class="item-row">
                <label class="item-name">应缴总金额</label>
                <span class="item-value">{{totalAmt}}</span>
            </div>
            <!-- 删除确认弹窗 -->
            <el-dialog
                    title="提示"
                    :visible.sync="closeDialogVisible"
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

    export default {
        name: "QueryResult.vue",
        mounted() {
            /**
             * 从cookie中获取用户唯一标识信息
             * 不存在则关闭页面，为非法访问
             */
            let userId = this.$StoreJs.getUserCookie();
            console.log(userId);
            if(userId && '' != userId ){
                if(this.$route.params.ntcId && this.$route.params.orderNo && this.$route.params.areaCode){
                    this.ntcId = this.$route.params.ntcId;
                    this.orderNo = this.$route.params.orderNo;
                    this.areaCode = this.$route.params.areaCode;
                    setTimeout(()=>{
                        this.queryData();
                        },10);
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
            };
        },
        methods:{
            doClose(){
                this.closeDialogVisible = false;
                commonUtil.closeWindow();
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

                    } else {
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
