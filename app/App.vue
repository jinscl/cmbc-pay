<template>
  <div id="app">
    <header class="header">
      <div class="header-icon" @click="goBack">
        <i class="el-icon-arrow-left"></i>
      </div>
      <div class="header-title">
        <span>通知单缴费</span>
      </div>
    </header>
    <router-view></router-view>
  </div>
</template>

<script>
import cmblapi from "cmblapi";
import commonUtil from './js/commonUtil'

export default {
  name: "app",
  data: function() {
    return {
      count : 0,
    };
  },
  created() {
    // 校验登录信息
    let logintest = {};
    this.validateLogin(logintest);
    // 柜面不存在登录信息
    // // 跨域测试数据
    // this.$Http.test({financeCode:"110000",fieldDisptype:1},true,{
    //               // baseURl:'http://10.10.66.57:8801',
    //               params:{tokenid:"A5E17230D947B868A071D6AE00E94EFF"}
    //           }).then(
    //   (res)=>{
    //     console.log(res);
    //   });
  },
  methods: {
    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push("/");
    },
    /**
     * 登录校验接口
     * @param loginData 不存在：查询登录信息，存在：保存登录信息
     */
    async validateLogin(loginData) {
      this.count++;
      let res = await this.$Http.httpLogin(loginData, false, {
        baseURL: "http://125.35.5.131:8804"
      });
      if (res) {
        // let tst = this.$Http.getNtcInfo({areaCode:"12",ntcId:"12"},false,{
        //   baseURl: "http://125.35.5.131:8804"
        // });
        // console.log("通知单"+tst);
        if(res.errorMsg){
          this.$alert(res.errorMsg, "温馨提示", {
            confirmButtonText: "确定"
          });
          if(this.count > 2){
            commonUtil.shutDown();
          }
          this.login();
        }else{
          this.$alert("登录授权成功！", "温馨提示", {
            confirmButtonText: "确定"
          });
          await this.$router.push("/search");
          return res;
        }
      } else {
        this.$alert("登录校验接口返回undefined！", "温馨提示", {
          confirmButtonText: "确定"
        });
        commonUtil.shutDown();
      }
    },
    // 登录接口
    async login() {
      // 获取小程序商户号，签名等信息
      let preLoginInfo = await this.$Http.requestPreLoginData();
      if (preLoginInfo) {
        // 柜面小程序登录信息不存在
        this.$alert(preLoginInfo, "温馨提示", {
          confirmButtonText: "确定"
        });
        if (!preLoginInfo.errorMsg) {
          /**
           * 招商银行官方用户登录和认证接口（进行客户核身，并获取部分客户信息，根据商户号不同，返回不同的权限内容）
           * @param corpNo string 商户号，reAuth string 是否需要重新授权
           * @param authInfo string 鉴权参数（timestamp：服务器当前时间，nonceStr：随机字符串，sign：签名）
           * @returns body string 客户信息报文，第三方应用先用base64解码并进行DES解密后方能看到明文数据
           * @returns cryptType string body加密类型：1表示明文，2表示DES加密，3表示非对称加密
           * @returns resultType string 登录授权结果：Y表示成功，N表示失败
           */
          let self = this;
          cmblapi.merchantLogin({
            corpNo: preLoginInfo.corpNo,
            reAuth: preLoginInfo.reAuth,
            authInfo: {
              timestamp: preLoginInfo.authInfo.timestamp,
              nonceStr: preLoginInfo.authInfo.nonceStr,
              sign: preLoginInfo.authInfo.sign
            },
            success: function(res) {
              console.log("招行登录成功回调");
              self.$alert("再次拉起登录", "温馨提示", {
                confirmButtonText: "确定"
              });
              self.$alert(res, "温馨提示", {
                confirmButtonText: "确定"
              });
              // 手机银行登录成功后，返回加密并签名的用户信息
              if (res.resultType === "Y") {
                self.$router.push("/search");
                //将小程序登录信息保存到柜面
                self.validateLogin(res);
              } else {
                this.$alert("登录授权失败，请稍后重试！", "温馨提示", {
                  confirmButtonText: "确定"
                });
                //commonUtil.shutDown();
              }
            },
            fail: function(res) {
              console.log("招行登录失败回调");
              self.$alert(res.errCode + ":" + res.errMsg, "温馨提示", {
                confirmButtonText: "确定"
              });
              commonUtil.shutDown();
            }
          });
        } else {
         commonUtil.shutDown();
        }
      }
    },

  }
};
</script>

<style>
#app {
  height: 100%;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background-color: #f8f8f8;
  margin: 0;
}
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}
.header {
  height: 44px;
  line-height: 44px;
  margin-top: 40px;
  display: -webkit-flex; /* Safari */
  display: flex;
  color: #383838;
  font-size: 18px;
}
.header .header-icon {
  width: 30px;
}
.header .header-title {
  flex: 1;
}
.content {
  width: 100%;
  height: calc(100% - 40px);
}
.input-wrapper {
  width: 100%;
  background-color: #eaeaea;
}
.item-name {
  flex: 1;
  text-align: left;
  font-size: 16px;
}
.item-value {
  flex: 2;
  text-align: right;
}
.button-row {
  padding: 1rem;
  background: #f8f8f8;
}
.el-button {
  background-image: linear-gradient(to bottom right, #54b8f4, #5c78eb);
}
.el-row,
.el-button {
  width: 100%;
}

.el-message-box {
  width: 340px;
}
</style>
