/**
 * 设置用户唯一标识cookie
 */
function setUserCookie(userName, exdays){
    //获取时间
    var exdate = new Date();
    //保存的天数
    exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 1000 * exdays);
    //字符串拼接cookie
    window.document.cookie = "userName" + "=" + userName + ";path=/;expires=" + exdate.toGMTString();
}
/**
 * 设置区划cookie
 */
function setFinanceCookie(financeData, exdays){
    //获取时间
    var exdate = new Date();
    //保存的天数
    exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 1000 * exdays);
    //字符串拼接cookie
    window.document.cookie = "financeData" + "=" + financeData + ";path=/;expires=" + exdate.toGMTString();
}
/**
 * 读取用户唯一标识cookie
 */
function getUserCookie() {
    let result = '';
    if (document.cookie.length > 0) {
        var arr = document.cookie.split('; '); //这里显示的格式需要切割一下自己可输出看下
        for (var i = 0; i < arr.length; i++) {
            var arr2 = arr[i].split('='); //再次切割
            //判断查找相对应的值
            if (arr2[0] == 'userName') {
                result = arr2[1]; //保存到保存数据的地方
                return result;
            }else{
                continue;
            }
        }
    }
    return result;
}
/**
 * 读取区划cookie
 */
function getFinanceCookie() {
    let result = '';
    if (document.cookie.length > 0) {
        var arr = document.cookie.split('; '); //这里显示的格式需要切割一下自己可输出看下
        for (var i = 0; i < arr.length; i++) {
            var arr2 = arr[i].split('='); //再次切割
            //判断查找相对应的值
            if (arr2[0] == 'financeData') {
                result = arr2[1]; //保存到保存数据的地方
                return result;
            }else{
                continue;
            }
        }
    }
    return result;
}

/**
 * 清除所有cookie
 */
function clearCookie() {
    this.setFinanceCookie("", -1); //修改值都为空，天数为负1天就好了
    this.setUserCookie("", -1);
}
export default {
    clearCookie,
    getFinanceCookie,
    getUserCookie,
    setUserCookie,
    setFinanceCookie
}
