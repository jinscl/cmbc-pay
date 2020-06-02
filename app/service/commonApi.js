const COMMON_API = {
    // 招行银行：一网通支付接口
     cmbcBasePay:{
        method:'post',
        url:"/netpayment/BaseHttp.dll?MB_APPPay"
    },
    // 登录前数据处理接口
    requestPreLoginData:{
        method:'post',
        url:'/CmbHttpController/requestPreLoginData'
    },
    // 缓存用户登录信息
    httpLogin:{
        method:'post',
        url:'/CmbHttpController/validateLogin',
    },
    // 根据通知单号查询通知单详情
    getNtcInfo:{
        method:'post',
        url:'/CmbHttpController/CMB/queryNtcFromCz',
    },
    getFinanceCode:{
        method:'get',
        url:'/CmbHttpController/getFinanceCode',
    },
    // 支付接口，银行记录核心，支付数据加密
    commonPay:{
        method:'post',
        url:'/CmbHttpController/CMB/payNtc'
    },
    // 柜面：支付结果校验
    checkPayResult:{
        method:'post',
        url:'/CmbHttpController/CMB/checkPayResult'
    },
    forwardUrl:{
        protocol:'http://',
        ip:'yyngrok.vipgz1.idcfengye',
        domain:'.com',
    }
}
export default COMMON_API;
