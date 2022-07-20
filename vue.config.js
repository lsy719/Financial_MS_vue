module.exports = {
    pages: {
        index: {
          // page 的入口
          entry: 'src/main.js',
        },
      },
    lintOnSave:false,  //关闭语法检查
    devServer:{
      port: 5006,
      proxy: {
        '/api':{
          // target: "http://localhost:5005",
          target: "http://192.168.163.100:5005",//后端部署后
          pathRewrite:{'^/api':''},
        }
      }
    }
    // devServer: {
    //     // port: 9876, //自定义端口号
    //     proxy: {
    //       '/api': {
    //             target: 'http://localhost:5000',//服务器地址
    //             pathRewrite:{'^/api':''},//匹配所有以/api开头的路径，转换为空字符串
    //             ws: true,//用于支持websocket
    //             changeOrigin: true//用于告诉请求的服务器 请求来自哪里 false如实告诉（来自8080） true：说谎（来自5000）
    //             // ws 和 changeOrigin 默认都为true，react中默认为false
    //             // changeOrigin 用于控制请求头中的host值
    //         },
    //     }
    // }
}