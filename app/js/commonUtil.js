import cmblapi from "cmblapi";

function formatDateToString(date){
  var year = date.getFullYear();
  var month = date.getMonth()+1;
  var day = date.getDate();
  if(month<10) month = "0"+month;
  if(day<10) day = "0"+day;
  return year+''+month+''+day;
}
function formateDateAndTimeToString(){
  var date = new Date();
  var hours = date.getHours();
  var mins = date.getMinutes();
  var secs = date.getSeconds();
  var msecs = date.getMilliseconds();
  if(hours<10) hours = "0"+hours;
  if(mins<10) mins = "0"+mins;
  if(secs<10) secs = "0"+secs;
  if(msecs<10) secs = "0"+msecs;
  return formatDateToString(date)+''+hours+''+mins+''+secs+''+msecs;
}
//生成随机字符串
function randomString(len) {
  len = len || 32;
  /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  var maxLen = $chars.length;
  var str = '';
  for (var i = 0; i < len; i++) {
    str += $chars.charAt(Math.floor(Math.random() * maxLen));
  }
  return str;
}
function shutDown() {
  var browserName = navigator.appName;
  if(browserName == "Microsoft Internet Explorer"){
    var ie7 = (document.all && !window.opera && window.XMLHttpRequest) ? true : false;
    if (ie7) {
      //This method is required to close a window without any prompt for IE7 & greater versions.
      window.open('','_parent','');
      window.close();
    } else {
      //This method is required to close a window without any prompt for IE6
      this.focus();
      self.opener = this;
      self.close();
    }
  }else{
    //For NON-IE Browsers except Firefox which doesnt support Auto Close
    try{
      this.focus();
      self.opener = this;
      self.close();
    } catch(e){
      console.log(e);
    }
    try{
      window.open('','_self','');
      window.close();
    } catch(e){
      console.log(e);
    }
  }
}
function closeWindow() {
  window.location.href="about:blank";
  window.close();
}
// 本接口只适用于设置App原生导航栏，不适用于设置小程序专属导航栏
function setLeftNavigationBar(){
  cmblapi.showNavigationBar({
    success:function(){
      this.$alert("showNavigationBar  success", '温馨提示error', {
        confirmButtonText: '确定'
      });
    },
    fail:function(res){
      this.$alert("showNavigationBar  fail", '温馨提示error', {
        confirmButtonText: '确定'
      });
    }
  });
  let self = this;
  //设置返回按钮行为
  cmblapi.setLeftNavigationBar({
    btnType:'goBack',
    btnContent:[{
      clickAction:"executeJs",
      clickContent:"window.history.length > 2 ? this.$router.go(-1) : this.$router.push(\"/search\");"
    }],
    success:function(){
      self.$alert("setLeftNavigationBar按钮设置成功", "温馨提示", {
        confirmButtonText: "确定"
      });
    },
    fail:function(res){
      self.$alert("setLeftNavigationBar按钮设置失败"+res, "温馨提示", {
        confirmButtonText: "确定"
      });
    }
  })
}
//检查是否小程序
function checkAppletContainer(){
  let flag;
  let self = this;
  cmblapi.applet({
    api: 'checkAppletContainer',
    success: function () { //如果是小程序容器，这里回调
      flag = true;
      self.$alert("小程序容器", "温馨提示", {
        confirmButtonText: "确定"
      });
    },
    fail: function (res) {//如果不是小程序容器，这里回调
      flag = false;
      self.$alert("不是小程序容器"+res, "温馨提示", {
        confirmButtonText: "确定"
      });
    }
  });
  return flag;
}
function setAppletBackButton(){
  // 设置小程序页面逐级返回可以通过该接口实现:
  cmblapi.applet({
    api:'setAppletBackButton',
    params:{
      btnAction:'executeJs',
      btnActionContent:"window.history.length > 2 ? this.$router.go(-1) : this.$router.push(\"/search\");"
    },
    success:function(){
      self.$alert("setAppletBackButton按钮设置成功", "温馨提示", {
        confirmButtonText: "确定"
      });
    },
    fail:function(res){
      self.$alert("setAppletBackButton按钮设置失败"+res, "温馨提示", {
        confirmButtonText: "确定"
      });
    }
  });
}
function showTopBar(){
  if(checkAppletContainer()){
    setAppletBackButton();
  }else{
    setLeftNavigationBar();
  }
}
export default {
  formateDateAndTimeToString,
  randomString,
  setLeftNavigationBar,
  checkAppletContainer,
  setAppletBackButton,
  shutDown,
  closeWindow,
  showTopBar
}
