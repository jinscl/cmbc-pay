module.exports = {
    outputDir: 'dist',   //build输出目录
    assetsDir: 'assets', //静态资源目录（js, css, img）
    lintOnSave: false, //是否开启eslint
    pages: {
        index: {
            // page 的入口
            entry: 'app/main.js',
            // 在 dist/index.html 的输出
            filename: 'index.html',
            // 当使用 title 选项时，
            // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
            title: 'Index Page',
            // 在这个页面中包含的块，默认情况下会包含
            // 提取出来的通用 chunk 和 vendor chunk。
            chunks: ['chunk-vendors', 'chunk-common', 'index']
        },
    },
    devServer: {
        disableHostCheck: false,
        host: "0.0.0.0",
        port: 8090,
        https: false,
        hotOnly: false,
        //将API请求代理到API服务器上，设置devServer.proxy
        proxy: {
            '/cmbc': {
                target: 'http://121.15.180.66:801', // 招行测试地址
                changeOrigin: true,
                pathRewrite: {
                    '^/cmbc': ''
                }
            },
            '/nontax':{
                target: 'http://125.35.5.131:8804', // 柜面服务器地址
                changeOrigin: true,
                pathRewrite: { //重写路径 比如'/ebank/aaa/ccc'重写为'/aaa/ccc'
                    '^/nontax': ''
                }
            },
            '/ebank':{
                target: 'http://10.10.66.57:8801', // 柜面服务器地址
                changeOrigin: true,
                pathRewrite: { //重写路径 比如'/ebank/aaa/ccc'重写为'/aaa/ccc'
                    '^/ebank': ''
                }
            },
        },
    },
}

