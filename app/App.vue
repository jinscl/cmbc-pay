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
import commonApi from './service/commonApi'

export default {
  name: "app",
  data: function() {
    return {
      count : 0
    };
  },
  created() {
    /**
     * 注释部分为测试数据
     * 在这里用一个空的 logintest = {}，最开始是为了生命周期，以及后台使用session而使用，后来发现session在app上无法使用，此时没有什么作用，可以删掉
     * let logintest = {
      // "resultType":"Y",
      // "cryptType":"2",
      // "body":"u9su4Mi92g8b2l1GjBEllZQBpjFxRbKYY4MNjgS7qyS4GajzsQbyHPC6Xon2lc+gPjF3kjQalI2WNWw3UpY6M3RU4B6GFEC6IWf6KxYtcF4D9BJ6SrnW+LG1ncaArA8yJaAnlF42uMP4pHnWfJcIwBlobdjBJtCM/jgyvqSDq8EbGuUbEzfTBdWNGul6Zfr4MfvQFNE/KcsETGb6HrXayCR+ZD7aQ6dfk4wdd47Lpw14apcdMK8S3YaoOWN5NTgFgvqN8CyoZWJWFtZvntMozOWfKcgSIC5iTnVQsDYtnyvoPXvLMQRK2RngCMfHNyj8KHmtqLvapwCimVrD34/vV3n4WmQ4d+yPpMthMwg9NH6dxuC92tmfmeSNnfB3Ru3sZyo5PlxCrAyEaP7V2nnMg+JC9KuBf43TcrvQFAMJ9/YzjnYQLw4uVH58q0ebCcCY5Wvoda74aMRM+uWYY8RTFclmCyyyCEcttY1XzDS+zOCDu6rhjiDswDXno+YWbgU3G2skHRoMMxjOGmCUS1u6rrHp+6ERZa/YiRH77PFcilAsIbINkmBKgm8r/qe3m81nO8u2U6pEHp4="
      };
     */
    //this.$alert("created生命周期");
    /**
     * 从缓存中获取用户唯一标识，本意也是为了生命周期考虑，后来是为了前端访问控制，如果vue实例和缓存不被销毁那么在这里可以派上用场
     */
    let userCookie = this.$StoreJs.getUserCookie();
    /**
     * 判断缓存中是否有用户标识
     * 1.true: 直接进入查询界面
     * 2.false: 重新拉起登录
     */
    if(userCookie && ''!=userCookie){
      //this.$alert("缓存的"+userCookie);
      this.$router.push("/search");
    }else {
      /**
       * 拉起登录
       */
      this.login();
    }
  },
  methods: {
    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push("/");
    },
    /**
     * 登录校验接口
     * @param loginData 不存在：查询登录信息，因session技术无法使用，现废弃；
     *                  存在：校验登录信息
     */
    async validateLogin(loginData) {
      // 统计登录次数
      this.count++;
      // 校验登录信息
      let res = await this.$Http.httpLogin(loginData, false, {
        baseURL: commonApi.forwardUrl.protocol+commonApi.forwardUrl.ip+commonApi.forwardUrl.domain
      });
      if (res) {
        if(res.errorMsg){
          if(this.count >= 2){
            commonUtil.shutDown();
          }else {
            // 失败则再次拉起登录
            this.login();
          }
        }else{
          // 本地缓存用户信息
          this.$StoreJs.setUserCookie(res.corpInfo.uniqueUserID,'1');
          // 获取区划信息
          this.$router.push("/search");
        }
      } else {
        if(this.count >= 2) {
          this.$alert("校验登录失败！", "温馨提示", {
            confirmButtonText: "确定"
          });
        }
        this.count=0;
        commonUtil.shutDown();
      }
    },
    /**
     * 登录方法
     */
    async login() {
      /**
       *  获取登录数据接口：向代理非税后台发出请求以获取小程序商户号，签名等登录所需数据
       */
      let preLoginInfo = await this.$Http.requestPreLoginData();
      if (preLoginInfo) {
        // 柜面小程序登录信息没有错误
        if (!preLoginInfo.errorMsg) {
          /**
           * 招商银行官方用户登录和认证接口（进行客户核身，并获取部分客户信息，根据商户号不同，返回不同的权限内容）
           * @param corpNo string 商户号，
           * @param reAuth string 是否需要重新授权
           * @param authInfo string 鉴权参数（timestamp：服务器当前时间，nonceStr：随机字符串，sign：签名）
           * @returns body string 客户信息报文，第三方应用先用base64解码并进行DES解密后方能看到明文数据
           * @returns cryptType string body加密类型：1表示明文，2表示DES加密，3表示非对称加密
           * @returns resultType string 登录授权结果：Y表示成功，N表示失败
           */
          let self = this;
          // 拉起app登录方法
          cmblapi.merchantLogin({
            corpNo: preLoginInfo.corpNo,
            reAuth: preLoginInfo.reAuth,
            authInfo: {
              timestamp: preLoginInfo.authInfo.timestamp,
              nonceStr: preLoginInfo.authInfo.nonceStr,
              sign: preLoginInfo.authInfo.sign
            },
            success: function(res) {
              self.$alert("授权登录成功", "温馨提示", {
                confirmButtonText: "确定"
              });
              // 手机银行登录成功后，返回加密并签名的用户信息
              if (res.resultType === "Y") {
                //将小程序登录信息发送至柜面校验、保存等
                self.validateLogin(res);
              } else {
                this.$alert("登录授权失败，resultType=N，请稍后重试！", "温馨提示", {
                  confirmButtonText: "确定"
                });
                // 关闭页面
                commonUtil.shutDown();
              }
            },
            fail: function(res) {
              self.$alert("App登录失败回调,"+res.errCode + ":" + res.errMsg, "温馨提示", {
                confirmButtonText: "确定"
              });
              // 关闭页面
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
