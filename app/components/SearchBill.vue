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
              <el-select class="item-input" v-model="areaCode">
                  <el-option v-for="item in financeData" :value="item.chr_code" :key="item.chr_code">
                      {{item.chr_name}}:{{item.chr_code}}
                  </el-option>
              </el-select>
        </div>
      </div>
      <div class="button-row">
          <el-row>
              <el-button type="primary" :disabled="isDisabled" @click="getNtcInfoFromCZ">查询</el-button>
          </el-row>
      </div>
      <!-- 退出确认弹窗 -->
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
import cmblapi from 'cmblapi'
import commonUtil from '../js/commonUtil'
import commonApi from '../service/commonApi'
export default {
  name: 'SearchBill',
  data:function(){
    return {
        closeDialogVisible:false,
        errorMsg: "",
        ntcId:"",
        areaCode:"",
        financeData:[]
    }
  },
  async mounted() {
      commonUtil.showTopBar(this,"default");
      /**
       * 从cookie中获取用户唯一标识、区划等信息
       * 如果用户唯一标识存在则验证区划
       * 不存在则关闭页面，为非法访问
       */
    let userId = this.$StoreJs.getUserCookie();
    if(userId && '' != userId ){
        let res = await this.$Http.getFinanceCode({}, false, {
            baseURL: commonApi.forwardUrl.protocol+commonApi.forwardUrl.ip+commonApi.forwardUrl.domain
        });
        if(!res.errorMsg){
            this.financeData = res;
            this.$StoreJs.setFinanceCookie(JSON.stringify(this.financeData));
        }else{
            this.closeDialogVisible = true;
            this.errorMsg = res.errorMsg;
        }
    }else{
        this.errorMsg = "用户信息丢失，页面即将关闭";
        this.closeDialogVisible = true;
    }
  },
    /**
     * 计算查询按钮是否可访问
     */
  computed:{
    isDisabled:function(){
      return ((this.ntcId && this.areaCode) ? false : true)
    }
  },
  methods: {
    doClose(done){
      this.$confirm('确认关闭？', '提示', {
          /*cancelButtonClass: 'btn-custom-cancel',
          confirmButtonClass: 'btn-custom-confirm',*/
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true,
      }).then(() => {
           this.closeDialogVisible=false;
           this.$StoreJs.clearCookie();
           this.closeDialogVisible = false;
           cmblapi.popWindow();
           commonUtil.closeWindow();
           done();
        })
        .catch(() => {});
    },
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
          self.$alert("扫描通知单信息失败！信息为："+res);
        }
      })

    },
    // 测试使用
    goToResult(){
        this.$router.push({name: 'result', params: {ntcId: "44030120000003613843",areaCode:"440301",orderNo:"440301"}});
    },
    /**
     * 从后台查询通知单详情
     * @param ntcId 通知单
     * @param areaCode 区划
     * @returns 通知单详情
     */
    async getNtcInfoFromCZ() {
      let ntcId = this.ntcId;
      if( ntcId === ''){
        // ⚠️通知单格式校验 格式需要再确认
        this.$alert('通知单号不能为空', '温馨提示', {
          confirmButtonText: '确定',
          center: true
        });
        this.isDisabled = true;
      }else{
        this.isDisabled = false;
        let searchParams = {
            "ntcId": ntcId,
            "areaCode":this.areaCode
        };
        let res = await this.$Http.getNtcInfo(searchParams, false, {
            baseURL: commonApi.forwardUrl.protocol+commonApi.forwardUrl.ip+commonApi.forwardUrl.domain
          });
        if(res){
          // 获取通知书成功
          if(!res.errorMsg){
            this.isDisabled = true;
            this.$router.push({name: 'pay', params: {ntcId: ntcId,areaCode:this.areaCode,ntcDetails:res.data}});
          }else{
            if(res.errorMsg.indexOf("登录")>0){
              this.errorMsg = res.errorMsg;
              this.closeDialogVisible = true;
            }else {
              this.$alert(res.errorMsg, '温馨提示', {
                confirmButtonText: '确定',
                center: true
              })
            }
          }
        }
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
</style>

