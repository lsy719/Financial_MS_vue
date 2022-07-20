import Vue from 'vue'
import Vuex from 'vuex'
import request from '../utils/request';
import router from '../router/';
Vue.use(Vuex);

// 用来检验账号的正则，4-16位字母数字下划线减号
const accountPattern = /^[a-zA-Z0-9]{4,16}$/;
// 用户名正则
const usernamePattern = /^[a-zA-Z0-9\u4E00-\u9FA5]{1,18}$/;
// 手机号正则
const phonePattren = /^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,3,5-9]))\d{8}$/;
// 密码正则(6-16位字母数字.@)
const passwordPattern = /^[a-zA-Z0-9.@]{6,16}$/


// 准备actions———用于响应组件中的动作
const actions = {
    // 退出登陆
    quitToLogin(context,value){
        router.push({
            path:'/login'
        });
        localStorage.removeItem('user');
        // context.commit('clearBeforeQuit');
        context.commit('clearFondHolds');
        context.commit('clearuserFondUpdWait');
        context.commit('clearAllMoneyAndAllProfit');
        context.commit('cleraUserInfo');
    },
    // 传入用户id
    reloadUserInfo(context,value){
        const formData = new FormData();
        formData.append('id',value);
        request.post('/api/user/loaduser',formData).then(res => {
            if(res.data.code === '0'){
                // console.log('更新成功',res.data.data);
                // context.state.userInfo = res.data.data;
                context.commit('setUserInfo',res.data.data);
                let user = res.data.data;
                // 同时更新下LocalStorage
                let userNew = {};
                userNew.id = user.id;
                userNew.account = user.account;
                userNew.password = user.password;
                // localStorage.setItem("user",JSON.stringify(userNew));
            }else{
                console.log('reload更新失败',res);
            }
        },err => {
            console.log(err.message);
        });
    },
    // 二次验证
    secondCheck(context,value){
        if(localStorage.getItem('user')){
            const verifyInfo = localStorage.getItem('user');
            const id = verifyInfo.split("-")[0];
            const code = verifyInfo.split("-")[1];
            const formData = new FormData();
            formData.append("id",id);
            formData.append("code",code);
            request.post('/api/user/code',formData).then(res => {
                if(res.data.code === '0'){
                    context.dispatch('reloadUserInfo',res.data.data.id);
                    context.dispatch('userCardsNum',res.data.data.id);
                }else{
                    router.push("/login");
                    context.commit('clearFondHolds');
                    context.commit('clearuserFondUpdWait');
                    context.commit('clearAllMoneyAndAllProfit');
                    context.commit('cleraUserInfo');
                }
            },err => {
                console.log(err);
                router.push("/login");
                context.commit('clearFondHolds');
                context.commit('clearuserFondUpdWait');
                context.commit('clearAllMoneyAndAllProfit');
                context.commit('cleraUserInfo');
            });
        }else{
            router.push("/login");
            context.commit('clearFondHolds');
            context.commit('clearuserFondUpdWait');
            context.commit('clearAllMoneyAndAllProfit');
            context.commit('cleraUserInfo');
        }

        // if(localStorage.getItem('user')){
        //     const userProof = JSON.parse(localStorage.getItem('user'));
        //     request.post('/api/user/proof',userProof).then(res => {
        //         if(res.data.code === '0'){
        //             // console.log('验证完成');
        //             // context.commit('setUserInfo',res.data.data)
        //             context.dispatch('reloadUserInfo',res.data.data.id);
        //             context.dispatch('userCardsNum',res.data.data.id);
        //         }else{
        //             router.push("/login");
        //             context.commit('clearBeforeQuit');
        //             // alert('账户不存在');
        //         }
        //     },err => {
        //         console.log(err.message);
        //         router.push("/login");
        //         context.commit('clearBeforeQuit');
        //     })
        // }else{
        //     router.push("/login");
        //     context.commit('clearBeforeQuit');
        // }
    },

    // 获取用户绑定银行卡数量
    userCardsNum(context,value){
        const formData = new FormData();
        formData.append('id',value);
        request.post('/api/user/cardscount',formData).then(res => {
            // console.log('@@',res.data);
            context.commit('setUserCardsC',res.data);
        },err => console.log(err.message));
    },

    // 修改用户账号
    changeUserAccount(context,value){
        // console.log(context.state.userInfo.id);
        const result = accountPattern.test(value);
        if(result){
            // 准备在此返回成功值，或服务端报错值。
            // const formData = new FormData();
            // formData.append('id',context.state.userInfo.id);
            // formData.append('account',value);
            // request.post('/api/user/updacc',formData).then(res => {
            //     // console.log(res.data);
            //     if(res.data === 555){
            //         console.log('###');
            //         return 5;
            //     }
            // },err => {
            //     console.log(err.message);
            // })
            return 1;
        }else{
            return 4;
        }
    },
    // 修改用户名
    changeUserName(context,value){
        const result = usernamePattern.test(value);
        if(result){
            return 1
        }else{
            return 4
        }
    },
    // 修改手机号
    changePhone(context,value){
        const result = phonePattren.test(value);
        if(result){
            return 1
        }else{
            return 4
        }
    },
    // 修改密码
    changePassword(context,value){
        const result = passwordPattern.test(value);
        if(result){
            return 1
        }else{
            return 4
        }
    },

    // 获取用户持有基金信息
    // value为调用时传过来的userId，和state中的userIndo id对比验证一下
    getUserHolds(context,value){
        if(value === context.state.userInfo.id){
            const formData = new FormData();
            formData.append('userId',value);
            request.post('/api/finance/loadfonds',formData).then(res => {
                // console.log(res.data.data);
                
                res.data.data.forEach((obj,index,arr) => {
                    const formData2 = new FormData();
                    formData2.append('userId',obj.userId);
                    formData2.append('financeCode',obj.finance.financeCode);
                    request.post('/api/finance/loadfondstate',formData2).then(res => {
                        // console.log(res.data.data);
                        obj.financeState = res.data.data;
                        // console.log(obj);
                        context.commit('setUserFondHoldsEach',obj);
                    })
                },err => console.log(err.message))
            },err => console.log(err.message))
        }else{
            return 666;//改id是吧
        }
    },

    // 重新加载用户全部持有（value是userId）
    reloadUserFundHold(context,value){
        // reload前要销毁之前的数据
        context.dispatch('formatDate');
        context.commit('clearFondHolds');
        context.commit('clearuserFondUpdWait');
        const today = context.state.currentDate;
        const formData = new FormData();
        formData.append('userId',value);
        request.post('/api/finance/loadfonds',formData).then(res => {
            res.data.data.forEach((obj, index, arr) => {
                const formData2 = new FormData();
                formData2.append('userId',value);
                formData2.append('financeCode',obj.finance.financeCode);
                request.post('/api/finance/loadfondstate',formData2).then(res => {
                    obj.financeState = res.data.data;
                    context.dispatch('setUserFondHoldsEach',obj);
                    if(obj.financeState.length > 0){
                        if(today !== obj.financeState[0].updDate){
                            context.dispatch('setuserFondUpdWaitEach',obj)
                        }
                    }else{ 
                        if(today !== obj.iniDate){
                            context.dispatch('setuserFondUpdWaitEach',obj)
                        }
                    }
                    if(context.state.userFondHolds.length === arr.length){
                        context.dispatch('reloadAllMoney',context.state.userFondHolds);
                        context.dispatch('reloadAllProfit',context.state.userFondHolds);
                        context.commit('sortByuserHoldId');
                        context.commit('sortByuserHoldIdWait');
                    }
                })
            })
        })
    },
    setUserFondHoldsEach(context,value){
        context.state.userFondHolds.push(value);
    },
    setuserFondUpdWaitEach(context,value){
        context.state.userFondUpdWait.push(value);
    },
    // 格式化数字，给数字加逗号
    formatNum(context,str) {
        let newStr = "";
        let count = 0;
        let isMinus = 0;//是负数码 1是 0不是
        // 当数字是负数
        if(str.indexOf("-") !== -1){
            str = str.slice(1,);
            isMinus = 1;
        }
        // 当数字是整数
        if(str.indexOf(".") === -1) {
            for(var i = str.length - 1; i >= 0; i--){
                if(count % 3 === 0 && count !== 0) {
                    newStr = str.charAt(i) + "," + newStr;
                }else{
                    newStr = str.charAt(i) + newStr;
                }
                count++;
            }
            str = newStr ; //自动补小数点后两位
            if(isMinus === 1){
                // return '-' + str;
                context.commit('setCenterVal','-' + str);
            }else{
                // return str;
                context.commit('setCenterVal',str);
            }
        }
        // 当数字带有小数
        else{
            for(var i = str.indexOf(".") - 1; i >= 0; i--){
                if(count % 3 === 0 && count !== 0){
                    newStr = str.charAt(i) + "," + newStr;
                }else{
                    newStr = str.charAt(i) + newStr; //逐个字符相接起来
                }
                count++;
            }
            str = newStr + (str + "00").substr((str + "00").indexOf("."), 3);
            if(isMinus === 1){
                // return '-' + str;
                context.commit('setCenterVal','-' + str);
            }else{
                // return str;
                context.commit('setCenterVal',str);
            }
        }
    },
    formatDate(context,value){//yyyy-mm-dd
        const date = new Date();
        const dash = '-'
        const year = date.getFullYear();
        let month = date.getMonth()+1;
        let day = date.getDate();
        if(month >= 1 && month <=9){
            month = '0' + month;
        }
        if(day >= 1 && day <= 9){
            day = '0' + day;
        }
        const currentDate = year + dash + month + dash + day;
        // return currentDate;
        context.commit('setCurrentDate',currentDate);
    },
    // 通过用户全部持有计算出总金额（Float未格式化）
    countAllMoney(context,userFondHolds){
        let sum = 0;
        userFondHolds.forEach((obj,index,arr) => {
            sum += obj.baseMoney;
            if(obj.financeState.length > 0){
                sum += obj.financeState[0].thenState;
            }
        })
        sum = parseFloat(sum).toFixed(2);
        // return sum;
        context.commit('setCenterVal',sum);
    },
    // 通过用户全部持有计算出总收益（Float未格式化）
    countProfit(context,userFondHolds){
        let sum2 = 0;
        userFondHolds.forEach((obj,index,arr) => {
            if(obj.financeState.length > 0){
                sum2 += obj.financeState[0].thenState;
            }
        })
        sum2 = parseFloat(sum2).toFixed(2);
        // return sum2;
        context.commit('setCenterVal',sum2);
    },
    // 重新加载用户全部等待更新(在重新加载用户全部持有时也同时重新加载了),遍历的同时可以传入financeCode
    // reloadUserFundUpdWait(){},

    // 重新加载用户总金额（value是用户持有）,在重新加载用户全部持有时也同时重新加载
    reloadAllMoney(context,value){
        // console.log(context.dispatch('countAllMoney',value));
        // context.commit('setAllMoney', context.dispatch('formatNum',context.dispatch('countAllMoney',value).toString()));
        context.dispatch('countAllMoney',value);
        context.dispatch('formatNum',context.state.centerVal.toString());
        context.commit('setAllMoney',context.state.centerVal);
    },

    // 重新加载用户持有收益（value是用户持有）,在重新加载用户全部持有时也同时重新加载
    reloadAllProfit(context,value){
        // context.commit('setAllProfit', context.dispatch('countProfit',value) >= 0 ? '+' + context.dispatch('formatNum',context.dispatch('countProfit',value).toString()) : context.dispatch('formatNum',context.dispatch('countProfit',value).toString()));
        context.dispatch('countProfit',value);
        if(context.state.centerVal >= 0){
            context.dispatch('formatNum',context.state.centerVal.toString());
            context.commit('setAllProfit','+' + context.state.centerVal);
        }else{
            context.dispatch('formatNum',context.state.centerVal.toString());
            context.commit('setAllProfit',context.state.centerVal);
        }
    },

    

}

// 准备mutations——用于操作数据（state）
const mutations = {
    changePage(state,value){
        state.nowPage = value;
    },
    changePageS(state,value){
        state.nowPageS = value;
    },
    setUserInfo(state,value){
        state.userInfo = value;
    },
    cleraUserInfo(state){
        state.userInfo = {};
    },
    setUserCardsC(state,value){
        state.cardsNum = value;
    },
    setCardIsNote(state,value){
        state.cardIsNote = value;
    },

    setUserFondHoldsEach(state,value){
        state.userFondHolds.push(value);
        console.log(state.userFondHolds);
    },
    setUserFondHolds(state,value){
        state.userFondHolds = value;
    },
    setuserFondUpdWait(state,value){
        state.userFondUpdWait = value;
    },
    // 根据userHoldid排序小到大
    sortByuserHoldId(state){
        state.userFondHolds.sort((a,b) => {
            return a.userHoldId - b.userHoldId;
        })
    },
    // 按照日期排序
    sortByuserHoldIdWait(state){
        state.userFondUpdWait.sort((a,b) => {
            // console.log(a,b);
            // 应该传时间戳的
            let aNum = 0;
            let bNum = 0;
            if(a.financeState.length > 0){
                if(b.financeState.length > 0){
                    // console.log(a.financeState[0].updDate,b.financeState[0].updDate);
                    a.financeState[0].updDate.split('-').forEach(ele => aNum += ele);
                    b.financeState[0].updDate.split('-').forEach(ele => bNum += ele);
                }else{
                    // console.log(a.financeState[0].updDate,b.iniDate);
                    a.financeState[0].updDate.split('-').forEach(ele => aNum += ele);
                    b.iniDate.split('-').forEach(ele => bNum += ele);
                }
            }else{
                if(b.financeState.length > 0){
                    // console.log(a.iniDate,b.financeState[0].updDate);
                    a.iniDate.split('-').forEach(ele => aNum += ele);
                    b.financeState[0].updDate.split('-').forEach(ele => bNum += ele);
                }else{
                    // console.log(a.iniDate,b.iniDate);
                    a.iniDate.split('-').forEach(ele => aNum += ele);
                    b.iniDate.split('-').forEach(ele => bNum += ele);
                }
            }
            return aNum - bNum;
        })
    },
    setCurrentDate(state,value){
        state.currentDate = value;
    },
    setCenterVal(state,value){
        state.centerVal = value;
    },
    setAllMoney(state,value){
        state.allMoney = value;
    },
    setAllProfit(state,value){
        state.allProfit = value;
    },
    clearFondHolds(state){
        state.userFondHolds = [];
    },
    clearuserFondUpdWait(state){
        state.userFondUpdWait = [];
    },
    clearAllMoneyAndAllProfit(state){
        state.allMoney = 0.00;
        state.allProfit = 0.00;
    },

    clearBeforeQuit(){
        // clearFondHolds();
        // clearuserFondUpdWait();
        // clearAllMoneyAndAllProfit();
        // cleraUserInfo();
    },

}

// 准备state——用于存储数据
const state = {
    nowPage:0,
    userInfo:{},
    nowPageS:31,
    cardsNum:0,
    cardIsNote:0,
    userFondHolds:[],
    userFondUpdWait:[],

    currentDate:'',

    // 总金额和收益的中间量
    centerVal:0,
    allMoney:0.00,
    allProfit:0.00,

    // 当前浏览的详情页基金
}

// 加工state中的数据
const getters = {

}

// 创建并暴露store
export default new Vuex.Store({
    actions,
    mutations,
    state,
    getters,
})