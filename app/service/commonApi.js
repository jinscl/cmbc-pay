const COMMON_API = {
    // 招行银行：一网通支付接口
     cmbcBasePay:{
        method:'post',
        url:"/netpayment/BaseHttp.dll?MB_APPPay"
    },
    // 登录前请求登录数据接口
    requestPreLoginData:{
        method:'post',
        url:'/CmbHttpController/requestPreLoginData'
    },
    // 用户登录信息校验
    httpLogin:{
        method:'post',
        url:'/CmbHttpController/validateLogin',
    },
    // 根据通知单号查询通知单详情
    getNtcInfo:{
        method:'post',
        url:'/CmbHttpController/CMB/queryNtcFromCz',
    },
    // 获取库中区划信息
    getFinanceCode:{
        method:'get',
        url:'/CmbHttpController/getFinanceCode',
    },
    // 柜面支付接口，银行记录核心，支付数据加密
    commonPay:{
        method:'post',
        url:'/CmbHttpController/CMB/payNtc'
    },
    // 柜面：支付结果校验
    checkPayResult:{
        method:'post',
        url:'/CmbHttpController/CMB/checkPayResult'
    },
    // 请求路径
    forwardUrl:{
        protocol:'http://',
        ip:'szfs-bankend2.bcs.cmburl',
        domain:'.cn',
    }
}
export default COMMON_API;
