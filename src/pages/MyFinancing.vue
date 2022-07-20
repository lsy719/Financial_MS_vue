<template>
    <div class="user-info">
        <div class="financial-gather">
        <!-- 用户信息 -->
            <div class="user-data">
                <!-- 头像 -->
                <div class="user-avatar">
                    <img :src="userInfo.img_url">
                </div>
                <div class="user-greet">
                    <div class="user-greet-info">
                        <h3>{{greetings}}</h3>
                        <span class="rexvhsd" @click="goToUserInfo">{{userInfo.nick_name}}</span>
                        <span class="klsdjld" @click="goToUserInfo">设置个人资料</span>
                    </div>
                    <ul>
                        <li>账号：<span @click="goToUserInfo">{{userInfo.account}}</span></li>
                        <li>|</li>
                        <li>等待更新项：<span class="waitNumber">{{userFondUpdWait.length}}</span></li>
                    </ul>
                </div>
            </div>
            <!-- 资产总览 总金额、持有收益 -->
            <div class="fortune-data">
                <ul>
                    <li>
                        <span class="fortune-type">总金额(元)</span>
                        <!-- 3位需要用都好隔开 -->
                        <span v-show="showMoney === 1" ref="aM" class="fortune-money all-fortune">{{allMoney}}</span>
                        <span v-show="showMoney === 0" ref="aM" class="fortune-money all-fortune">****</span>
                    </li>
                    <li>
                        <span class="fortune-type">持有收益(元)</span>
                        <span v-show="showMoney === 1" ref="aP" class="fortune-money all-income">{{allProfit}}</span>
                        <span v-show="showMoney === 0" class="fortune-money all-income">****</span>
                        <!-- 如果是正的，用红色，负的用绿色 -->
                        <!-- <span class="fortune-money all-income" style="color:red">+462.96</span> -->
                        <i @click="showHide(0)" v-show="showMoney === 1" class="fas fa-eye"></i>
                        <i @click="showHide(1)" v-show="showMoney === 0" class="fas fa-eye-slash"></i>
                    </li>
                </ul>
            </div>
        </div>
        <div class="content">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import request from '../utils/request'
export default {
    name:'MyFinancing',
    props:['nowPage'],//1
    data(){
        return {
            userInfo: {},
            greetings:'',
            userFondHolds:[],
            userFondUpdWait:[],
            showMoney:0,

            allMoney:0.00,
            allProfit:0.00,
        }
    },
    methods:{
        // 获取问候语
        getGreetings(){
            const now = new Date();
            const hour = now.getHours();
            if(hour < 9){this.greetings = '早上好,'}
            else if(hour < 12){this.greetings = '上午好,'}
            else if(hour < 19){this.greetings = '下午好,'}
            else if(hour < 24){this.greetings = '晚上好,'}
            else{this.greetings = '你好,'}
        },
        goToUserInfo(){
            this.$router.push({
                path:'/user'
            })
        },
        setUserFondHoldsEach(value){
            this.userFondHolds.push(value);
            // console.log(this.userFondHolds);
        },
        setuserFondUpdWaitEach(value){
            this.userFondUpdWait.push(value);
        },
        // 格式化数字，给数字加逗号
        formatNum(str) {
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
                    return '-' + str;
                }else{
                    return str;
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
                    return '-' + str;
                }else{
                    return str;
                }
            }
        },
        showHide(val){
            this.showMoney = val;
        },
        formatDate(){//yyyy-mm-dd
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
            return currentDate;
        },
        // 通过用户全部持有计算出总金额（Float未格式化）
        getAllMoney(userFondHolds){
            let sum = 0;
            userFondHolds.forEach((obj,index,arr) => {
                sum += obj.baseMoney;
                if(obj.financeState.length > 0){
                    sum += obj.financeState[0].thenState;
                }
            })
            sum = parseFloat(sum).toFixed(2);
            return sum;
        },
        // 通过用户全部持有计算出总收益（Float未格式化）
        getProfit(userFondHolds){
            let sum2 = 0;
            userFondHolds.forEach((obj,index,arr) => {
                if(obj.financeState.length > 0){
                    sum2 += obj.financeState[0].thenState;
                }
            })
            sum2 = parseFloat(sum2).toFixed(2);
            return sum2
        },
    },
    computed:{
        getUserInfo(){
            return this.$store.state.userInfo;
        },
        // allMoney(){
        //     let sum = this.getAllMoney(this.userFondHolds);
        //     return this.formatNum(sum.toString());
        //     this.formatNum(this.getAllMoney(this.userFondHolds).toString());
        // },
        // allProfit(){
        //     let sum2 = this.getProfit(this.userFondHolds);
        //     if(sum2 >= 0){
        //         return '+' + this.formatNum(sum2.toString());
        //     }else{
        //         return this.formatNum(sum2.toString());
        //     }
        //     this.getProfit(this.userFondHolds) >= 0 ? '+' + this.formatNum(this.getProfit(this.userFondHolds).toString()) : this.formatNum(this.getProfit(this.userFondHolds).toString())
        // },
        getUserHolds(){
            return this.$store.state.userFondHolds;
        },
        getuserFondUpdWait(){
            return this.$store.state.userFondUpdWait;
        },
        getVuexAllMoney(){
            return this.$store.state.allMoney;
        },
        getVuexAllProfit(){
            return this.$store.state.allProfit;
        }
    },
    watch:{
        getUserInfo(newValue){
            this.userInfo = newValue;
        },
        allProfit:{
            immediate:true,
            handler(newValue){
                if(this.$refs['aP']){
                    if(newValue > 0){
                        this.$refs['aP'].style.color = 'red';
                    }else{
                        this.$refs['aP'].style.color = 'green';
                    }
                }
            }
        },
        getUserHolds:{
            deep:true,
            handler(newValue){
                this.userFondHolds = newValue;
                // let sum = this.getAllMoney(this.userFondHolds);
                // this.allMoney = sum;
            }
        },
        getuserFondUpdWait:{
            deep:true,
            handler(newValue){
                this.userFondUpdWait = newValue;
            }
        },
        getVuexAllMoney:{
            handler(newValue){
                this.allMoney = newValue;
            }
        },
        getVuexAllProfit:{
            handler(newValue){
                this.allProfit = newValue;
            }
        }
    },
    created(){
        // this.userInfo = this.$store.state.userInfo;
        this.getGreetings();
        // this.$store.dispatch('getUserHolds',JSON.parse(localStorage.getItem('user')).id);
        
    },
    mounted(){
        this.$store.dispatch('secondCheck').then(res => {
            
            this.userInfo = this.$store.state.userInfo;
            this.$store.commit('changePage',this.nowPage);
            // console.log(this.$store.state.userFondHolds);
            // console.log(this.userFondHolds);
            const today = this.formatDate();
            const verifyInfo = localStorage.getItem('user');
            const id = verifyInfo.split("-")[0];
            const formData = new FormData();
            formData.append('userId',id);
            request.post('/api/finance/loadfonds',formData).then(res => {
                // console.log(res.data.data);
                /**
                 * 遍历数组和遍历时的请求是异步的，导致最后数组顺序乱
                 */
                res.data.data.forEach((obj,index,arr) => {
                    const formData2 = new FormData();
                    formData2.append('userId',obj.userId);
                    formData2.append('financeCode',obj.finance.financeCode);
                    request.post('/api/finance/loadfondstate',formData2).then(res => {
                        // console.log(res.data.data);
                        obj.financeState = res.data.data;
                        // console.log(obj);
                        this.setUserFondHoldsEach(obj);
                        // console.log(this.userFondHolds.length)
                        if(obj.financeState.length > 0){
                            if(today !== obj.financeState[0].updDate){
                                // console.log('需要更新');
                                this.setuserFondUpdWaitEach(obj);
                            }
                        }else{ 
                            if(today !== obj.iniDate){
                                this.setuserFondUpdWaitEach(obj);
                            }
                        }
                        if(this.userFondHolds.length === arr.length){
                            this.$store.commit('setUserFondHolds',this.userFondHolds);
                            // 数据冗余100%，先这样
                            this.$store.commit('setuserFondUpdWait',this.userFondUpdWait);

                            this.allMoney = this.formatNum(this.getAllMoney(this.userFondHolds).toString());
                            this.allProfit = this.getProfit(this.userFondHolds) >= 0 ? '+' + this.formatNum(this.getProfit(this.userFondHolds).toString()) : this.formatNum(this.getProfit(this.userFondHolds).toString())
                            this.$store.commit('setAllMoney',this.allMoney);
                            this.$store.commit('setAllProfit',this.allProfit);
                            
                            // 需要排序，理由在上面
                            this.$store.commit('sortByuserHoldId');
                            this.$store.commit('sortByuserHoldIdWait');
                        }
                        // context.commit('setUserFondHoldsEach',obj);
                    })
                },err => console.log(err.message))
            },err => console.log(err.message))
            // console.log('更新完调过来了 MyFinancing');
        });
    },
    beforeDestroy(){
        // 一定要清空userFondHolds！！！！！！！
        this.$store.commit('clearFondHolds');
        this.$store.commit('clearuserFondUpdWait');
    }
}
</script>

<style scoped>
.user-info{
    height: 100%;
    background-color: rgb(238, 238, 238);
}
.content{
    min-height: 500px;
    width: 999px;
    margin: 0 auto;
    /* background-color: rgb(0, 119, 128); */
}
.financial-gather{
    width: 100%;
    height: 100px;
    background: #4e7199 no-repeat center;
    background-image: url("/17Kjaa3aLl.jpg");
    display: flex;
    justify-content: center;
    gap: 49px;
}
.user-data{
    width: 550px;
    display: flex;
}
.user-avatar{
    margin-top: 8px;
    height: 84px;
    width: 84px;
    border-radius: 50%;
    cursor: pointer;
    /* overflow: hidden; */
}
.user-avatar img{
    display: block;
    margin: 0 auto;
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.39);
} 
.user-greet-info{
    margin-top: 24px;
    padding-left: 8px;
    padding-bottom: 4px;
    padding-right: 50px;
    border-bottom: 1px solid #DDD;
}
.user-greet-info h3{
    display: inline-block;
    color: #fff;
}
.user-greet-info span{
    margin-right: 10px;
    cursor: pointer;
    color: #fff;
}
.user-greet-info .rexvhsd{
    font-size: 20px;/* 和h3差不多大 */
    font-weight: bold;
}
.user-greet-info .klsdjld{
    font-size: 12px;
}
.user-greet-info span:hover{
    text-decoration: underline;
}
.user-greet ul{
    display: flex;
    padding-left: 8px;
    margin-top: 12px;
}
.user-greet ul li{
    font-size: 12px;
    margin-right: 20px;
    color: #fff;
}
.user-greet ul li span{
    cursor: pointer;
}
.user-greet ul li span:hover{
    text-decoration: underline;
}
.fortune-data{
    width: 400px;
}
.fortune-data ul{
    display: flex;
}
.fortune-data ul li{
    width: 150px;
    height: 100%;
    line-height: 30px;
    margin-top: 20px;
}
.fortune-data ul li:nth-child(2){
    position: relative;
}
.fortune-data i{
    cursor: pointer;
    position: absolute;
    top: 8px;
    right: -10px;
    color: #eee;
}
.fortune-data i:hover{
    color: #ddd;
}
.fortune-data span{
    text-align: center;
    display: block;
}
.fortune-type{
    font-size: 14px;
    color: #fff;
}
.fortune-money{
    font-size: 20px;
    color: #eee;
}
.waitNumber{
    text-decoration: underline;
    color: #83bfff;
}
</style>