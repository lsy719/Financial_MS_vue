<template>
    <div class="financing-hold">
        <h3>我的持有</h3>
        <!-- 左：持有基金列表， 右等待更新项 -->
        <div class="financing-hold-content">
            <div class="content-hold">
                <ul class="content-hold-title">
                    <li class="holdName">名称</li>
                    <li class="holdMoney">金额</li>
                    <li class="holdProfit">持有收益/率</li>
                    <li class="holdAction">操作</li>
                </ul>
                <ul class="content-hold-list">
                    <Finance 
                        v-for="obj in userFondHolds" 
                        :key="obj.userHoldId"
                        :fund = "obj"
                    />
                </ul>
                <div class="content-hold-add">
                    <div class="content-hold-add-linear"></div>
                    <span @click="toAdd">添加新记录</span>
                </div>
            </div>
            <div class="line-box2"></div>
            <div class="content-charge">
                <!-- 数据图表 -->
                <div class="chart-bank-finance">
                    <h4>持有分析</h4>
                    <div class="charts">
                        <div ref="charts1" class="charts-bankAM"></div>
                        <div ref="charts2" class="charts2-hold"></div>
                    </div>
                </div>
                <h4>等待更新</h4>
                <ul class="content-charge-title">
                    <li>名称</li>
                    <li>最后一次更新时间</li>
                </ul>
                <div class="line-box"></div>
                <ul v-if="userFondUpdWait.length > 0" class="content-charge-list">
                    <li class="content-charge-list-1" v-for="obj in userFondUpdWait" :key="obj.userHoldId" @click="toUpd(obj)">
                        <ul>
                            <li class="subject-name">{{obj.finance.financeName}}</li>
                            <li class="subject-date" v-if="obj.financeState.length > 0">{{obj.financeState[0].updDate}}</li>
                            <li class="subject-date" v-if="obj.financeState.length === 0">{{obj.iniDate}}</li>
                        </ul>
                    </li>
                </ul>
                <div v-if="userFondUpdWait.length === 0">
                    <h3>今日记录已完成,<span class="recordDoneAdd" @click="toAdd">点击添加记录</span></h3>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Finance from '../components/Finance.vue';
import request from '../utils/request'
import * as echarts from 'echarts';
let charts1;
let charts2;
let timer1;
export default {
    name: 'MyFinancingHold',
    components:{Finance},
    data(){
        return {
            userId:'',
            userFondHolds:[],
            userFondUpdWait:[],
            allMoney:0.00,
            allProfit:0.00,
            bankMoney:0.00,
            allMoneyNF:0.00,
            allProfitNF:0.00,
            pocketMoney:0.00,
        }
    },
    methods:{
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
        getAllMoney(userFondHolds){
            let sum = 0;
            userFondHolds.forEach((obj,index,arr) => {
                sum += obj.baseMoney;
                if(obj.financeState.length > 0){
                    sum += obj.financeState[0].thenState;
                }
            })
            sum = parseFloat(sum).toFixed(2);
            return this.formatNum(sum.toString());
        },
        // 无需格式化时
        getAllMoneyNF(userFondHolds){
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
        getAllProfit(userFondHolds){
            let sum2 = 0;
            userFondHolds.forEach((obj,index,arr) => {
                if(obj.financeState.length > 0){
                    sum2 += obj.financeState[0].thenState;
                }
            })
            sum2 = parseFloat(sum2).toFixed(2);
            // return '+' + this.formatNum(sum2.toString());
            return this.formatNum(sum2.toString());
        },
        getAllProfitNF(userFondHolds){
            let sum2 = 0;
            userFondHolds.forEach((obj,index,arr) => {
                if(obj.financeState.length > 0){
                    sum2 += obj.financeState[0].thenState;
                }
            })
            sum2 = parseFloat(sum2).toFixed(2);
            return sum2;
        },
        createCharts1(allMoney,bankMoney,pocketMoney){
            if(charts1 !== null && charts1 !=='' && charts1 !== undefined){
                charts1.dispose();
            }
            // 绘制图标
            // charts1必须是全局变量！！
            charts1 = echarts.init(this.$refs['charts1']);
            charts1.setOption({
                title: {
                    text: '所有资产',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item'
                },
                series: [
                    {
                    name: '金额统计',
                    type: 'pie',
                    radius: '50%',
                    data: [
                        { value: allMoney, name: '基金' },
                        { value: bankMoney, name: '银行卡' },
                        { value: pocketMoney, name: '余额' },
                    ],
                    emphasis: {
                        itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                    }
                ]
            });
        },
        createCharts2(allProfit,allMoney){
            if(charts2 !== null && charts2 !=='' && charts2 !== undefined){
                charts2.dispose();
            }
            charts2 = echarts.init(this.$refs['charts2']);
            if(this.allProfitNF > 0){
                charts2.setOption({
                    tooltip: {
                        trigger: 'axis',
                    },
                    legend: {
                        data: ['收益', '总金额']
                    },
                    xAxis: [
                        {
                        type: 'value'
                        }
                    ],
                    yAxis: [
                        {
                        type: 'category',
                        axisTick: {
                            show: false
                        },
                        }
                    ],
                    series: [
                        {
                        name: '收益',
                        type: 'bar',
                        label: {
                            show: true,
                            position: 'inside'
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [allProfit]
                        },
                        {
                        name: '总金额',
                        type: 'bar',
                        stack: 'Total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [allMoney]
                        }
                    ]
                })
            }else if(this.allProfit < 0){
                charts2.setOption({
                    tooltip: {
                        trigger: 'axis',
                    },
                    legend: {
                        data: ['收益', '总金额']
                    },
                    xAxis: [
                        {
                        type: 'value'
                        }
                    ],
                    yAxis: [
                        {
                        type: 'category',
                        axisTick: {
                            show: false
                        },
                        }
                    ],
                    series: [
                        {
                        name: '收益',
                        type: 'bar',
                        label: {
                            show: true,
                            position: 'left'
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [allProfit]
                        },
                        {
                        name: '总金额',
                        type: 'bar',
                        stack: 'Total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: [allMoney]
                        }
                    ]
                })
            }else{
                charts2.setOption({});
            }
        },
        toUpd(obj){
            this.$router.push({
                name:'myfinanceUpd',
                params:{
                    fund:obj,
                }
            })
        },
        toAdd(){
            this.$router.push({
                name:'myfinanceAdd',
            })
        }
    },
    computed:{
        today(){
            return this.formatDate();
        },
        getUserHolds(){
            return this.$store.state.userFondHolds;
        },
        getuserFondUpdWait(){
            return this.$store.state.userFondUpdWait;
        },
        getUserPocketMoney(){
            return this.$store.state.userInfo.pocketMoney;
        }
    },
    watch:{
        getUserHolds:{
            // immediate:true,
            deep:true,
            handler(newValue){
                this.userFondHolds = newValue;
                this.allMoney = this.getAllMoney(newValue);
                this.allProfit = this.getAllProfit(newValue);
                this.allMoneyNF = this.getAllMoneyNF(newValue);
                this.allProfitNF = this.getAllProfitNF(newValue);
                // this.bankMoney = this.bankMoney;
                // console.log('fond',this.allMoney);
                // const charts1 = echarts.init(this.$refs['charts1']);
                // 刷新页面其它的数据在这更新一次，然后在mounted里面更新一次，两次无意义的更新没有什么问题
                // 但是echarts在这里初始化一次，路由切换和刷新页面重复地初始化echarts会报警告
                // 在创建之前需要销毁,
                // 这样会眼睁睁看着它画两遍，但没办法
                this.$nextTick(() => {
                    this.createCharts1(this.allMoneyNF,this.bankMoney,this.pocketMoney);
                    this.createCharts2(this.allProfitNF,this.allMoneyNF);
                })
            }
        },
        getuserFondUpdWait:{
            // immediate:true,
            deep:true,
            handler(newValue){
                this.userFondUpdWait = newValue;
            }
        },
        getUserPocketMoney:{
            handler(newValue){
                this.pocketMoney = newValue;
            }
        }
    },
    mounted(){
        // console.log(JSON.parse(localStorage.getItem('user')).id)
        // console.log(this.$store.state.userInfo.id);

        // 这里这个组件时MyFinancing的子组件，此组件的mounted必在MyFinanceing中包含请求并赋予vuex数据的mounted前执行，
        // 所以就算是在此切换路由，这个组件的mounted也获取不到vuex里的数据
        this.userFondHolds = this.$store.state.userFondHolds;
        // console.log(this.userFondHolds);
        this.allMoney = this.getAllMoney(this.userFondHolds);
        this.allProfit = this.getAllProfit(this.userFondHolds);
        this.allMoneyNF = this.getAllMoneyNF(this.userFondHolds);
        this.allProfitNF = this.getAllProfitNF(this.userFondHolds);
        // console.log('mounted',this.allMoney);
        this.userFondUpdWait = this.$store.state.userFondUpdWait;
        this.pocketMoney = this.$store.state.userInfo.pocketMoney;
        if(!this.pocketMoney){
            timer1 = setInterval(() => {
                this.pocketMoney = this.$store.state.userInfo.pocketMoney;
                if(this.pocketMoney){
                    clearInterval(timer1);
                }
            },500)
        }
        // console.log(this.formatDate());
        // if(this.userFondHolds[0]){
        //     console.log(this.userFondHolds[0].financeState[0].updDate);
        // }

        // mounted只能保证正常路由切换能够获取到vuex里的数据，如果是属性页面，整个mounted中都获取不到userId，那ajax在此进行也没意义
        // 只能从上级组件获取userId，但是上级也是都是靠两步来获取userId的，
        // 用localStorage真的不安全！
        const verifyInfo = localStorage.getItem('user');
        const id = verifyInfo.split("-")[0];
        const formDate = new FormData();
        formDate.append('userId',id)
        request.post('/api/finance/bankcardMoney',formDate).then(res => {
            // console.log('bank',res.data.data);
            this.bankMoney = res.data.data;
            // 要放到这里面来，保证路由切换页面显示正常
            this.$nextTick(() => {
                this.createCharts1(this.allMoneyNF,this.bankMoney,this.pocketMoney);
                this.createCharts2(this.allProfitNF,this.allMoneyNF);
            })
        },err => console.log(err.message));
        // console.log('更新完调过来了 MyFinancingHold');
        
    },
    created(){

    }
}
</script>

<style scpoed>
.financing-hold h3{
    margin-top: 5px;
    padding-left: 8px;
    background-color: rgb(89, 117, 157);
    color: #fff;
}
.financing-hold h4{
    margin-top: 5px;
    padding-left: 8px;
    background-color: rgb(89, 117, 157);
    color: #fff;
}
.financing-hold-content{
    display: flex;
    justify-content: space-between;
}
.content-hold{
    width: 600px;
    position: relative;
    min-height: 450px;
    background-color: #fff;
}
.content-hold-title{
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    margin-left: 6px;
    border-bottom: 1px solid #888;
}
.holdName{
    width: 240px;
}
.holdMoney,
.holdProfit,
.holdAction{
    width: 120px;
}
.content-hold .content-hold-list{
    max-height: 600px;
    overflow: auto;
    margin-bottom: 50px;
}
.content-hold-add{
    position: absolute;
    bottom: 0px;
    width: 100%;
    height: 50px;
    background-color: #eeeeee;
}
.content-hold-add-linear{
    height: 8px;
    background-image: linear-gradient(to top, rgb(238, 238, 238), #fff);
}
.content-hold-add span{
    display: inline-block;
    margin-left: 180px;
    margin-top: 2px;
    background-color: #007aff;
    height: 35px;
    width: 200px;
    color: #fff;
    text-align: center;
    line-height: 31px;
    letter-spacing: 1.5px;
    border-radius: 5px;
    cursor: pointer;
    border: 2px solid rgba(0, 0, 0, 0.24);
}
.content-hold-add span:hover{
    background-color: #3295ff;
}
.content-hold-add span:active{
    background-color: #0654a7;
}
.content-charge{
    width: 380px;
}
.content-charge-list{
    max-height: 300px;
    overflow: auto;
}
.content-charge-title,
.content-charge-list li ul{
    display: flex;
    justify-content: space-between;
    margin: 5px 5px;
    cursor: pointer;
}
.content-charge-list li ul:hover{
    text-decoration: underline;
}
.subject-name{
    width: 200px;
    height: 30px;
    line-height: 30px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.line-box{
    height: 2px;
    background-color: #999;
}
.line-box2{
    width: 2px;
    height: 200px;
    background-color: #999;
    margin-top: 30px;
}
.chart-bank-finance{
    height: 200px;
}
.recordDoneAdd{
    cursor: pointer;
}
.recordDoneAdd:hover{
    text-decoration: underline;
}
.charts{
    display: flex;
    justify-content: space-between;
    padding-top: 10px;
    background-color: #fff;
}
.charts-bankAM{
    height: 180px;
    width: 190px;
    
}
.charts2-hold{
    height: 180px;
    width: 190px;
}
</style>