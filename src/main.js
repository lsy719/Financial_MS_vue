
import Vue from 'vue'
import App from './App.vue'

import VueRouter from 'vue-router';

import store from './store';
import router from './router';

// import * as echarts from 'echarts';
// import echarts from './assets/echarts';

Vue.use(VueRouter);


Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router:router,
  beforeCreate(){
    Vue.prototype.$bus = this;//安装全局事件总线
  },
  store,
}).$mount('#app')

//先把VueRouter原型对象的push，先保存下
let originPush=VueRouter.prototype.push;
let originReplace=VueRouter.prototype.replace;
//重写push|replace
//第一个参数：原来的push方法，你往哪里跳（传递参数）
//第二个参数：成功回调
//第三个参数：失败回调
VueRouter.prototype.push=function(location,resolve,reject){
  if(resolve|reject){
      //call|apply:都可以调用函数一次，改变改变上下文一次
      //不同点：call和apply传递参数不同，call用逗号隔开，apply传递数组
    originPush.call(this,location,resolve,reject)
  }else{
    originPush.call(this,location,()=>{},()=>{})
  }
}

VueRouter.prototype.replace=function(location,resolve,reject){
  if(resolve|reject){
      originReplace.call(this,location,resolve,reject)
  }else{
      originReplace.call(this,location,()=>{},()=>{})
  }
}