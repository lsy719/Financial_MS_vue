<template>
    <div class="single-upd" v-if="fund">
        <!-- <button @click="test">测试</button>
        <button @click="backToMyF">返回</button>
        {{fund.finance}} -->
        <div class="single-upd-left">
            <h3 @click="toDetail">{{fundInfo.finance.financeName}}</h3><br>
            <span>{{fundInfo.finance.financeCode}}</span>
            <p v-show="lastUpdDate !== today">上次更新时间：<span>{{lastUpdDate}}</span></p>
            <p v-show="lastUpdDate === today">上次更新时间：<span>今天</span></p>
            <div class="upd-action">
                <label :for="`refs['money']`">输入当前累计收益：</label>
                <input type="text" ref="money" @keydown="setMoneyDown" @keyup="setMoneyUp">
            </div>
            <div class="upd-buttons">
                <span v-show="lastUpdDate !== today" @click="toCfm">更新</span>
                <span v-show="lastUpdDate === today" @click="toCfm" style="background-color: #62c272;">修改</span>
                <span class="backToHold" @click="backToHold">返回</span>
            </div>
        </div>

        <div class="single-upd-right">
            <div class="sur-up">
                <ul>
                    <li>
                        <span>金额(元)</span>
                        <span ref="allMoneyD">{{allMoney}}</span>
                    </li>
                    <li>
                        <span>持有收益(元)</span>
                        <span ref="profitD">{{profit}}</span>
                    </li>
                    <li>
                        <span>持有收益率</span>
                        <span ref="profitRateD">{{profitRate}}</span>
                    </li>
                </ul>
            </div>
            <div class="sur-down">
                <div ref="charts1" class="rise-down-charts"></div>
            </div>
        </div>

        <div v-show="alterWindow === 1" class="alter-background" @click.self="cancle">
            <div class="alter-content" v-show="httpResponse === 0">
                <p v-show="lastUpdDate === today && fundInfo.iniDate === today && financeState.length === 0">此基金为今天添加，确定要更新吗？</p>
                <p v-show="lastUpdDate === today && fundInfo.iniDate === today && financeState.length >= 0">今日总收益已经录入，确定要修改吗？</p>
                <p v-show="lastUpdDate === today && fundInfo.iniDate !== today">今日总收益已经录入，确定要修改吗？</p>
                <p v-show="lastUpdDate !== today">录入日期：{{today}}</p>
                <p>收益：<span ref="profitShow">{{moneySum}}</span></p>
                <div class="alter-content-buttons">
                    <span v-show="lastUpdDate === today && fundInfo.iniDate === today && financeState.length === 0" @click="cfmAdd">确定添加</span>
                    <span v-show="lastUpdDate === today && fundInfo.iniDate === today && financeState.length > 0" @click="cfmUpd" style="background-color: #62c272;">确定修改</span>
                    <span v-show="lastUpdDate !== today" @click="cfmAdd">确定添加</span>
                    <span v-show="lastUpdDate === today && fundInfo.iniDate !== today" @click="cfmUpd" style="background-color: #62c272;">确定修改</span>
                    <span style="background-color:#965151" @click="cancle">取消</span>
                </div>
            </div>
            <div  class="alter-content" v-show="httpResponse === 1">
                <p style="color:green">操作成功,点击空白处返回</p>
            </div>
            <div  class="alter-content" v-show="httpResponse === 555">
                <p style="color:red">未知错误</p>
            </div>
        </div>
        <div v-show="alterWindow === -1" class="alter-background" @click.self="cancle">
            <div class="alter-content">
                <p style="color:red">先输入当前累计收益!</p>
            </div>
        </div>
    </div>
</template>

<script>
import request from '../utils/request'
import * as echarts from 'echarts';
let charts1;
export default {
    name:'MyFinanceUpd',
    props:['fund'],
    data(){
        return {
            fundInfo:{},
            financeState:[],
            moneySum:0,
            alterWindow:0,
            httpResponse:0,
            allMoney:0,
            profit:0,
            profitRate: '0.00%',
            thenStateArrforChart:[],
            updDateArrforChart:[],
        }
    },
    methods:{
        backToMyF(){
            this.$router.push({
                name:'myfinance'
            })
        },
        reloadData(){
            // 更新完成，在res里面 => {
            this.$store.dispatch('reloadUserFundHold',this.fund.userId);
            // }
        },
        reloadFundInfo(){
            const formData = new FormData();
            formData.append('userHoldId',this.fundInfo.userHoldId);
            request.post('/api/finance/reloadsolofund',formData).then(res => {
                this.fundInfo = res.data.data;
                const formData2 = new FormData();
                formData2.append('userId',this.fundInfo.userId);
                formData2.append('financeCode',this.fundInfo.finance.financeCode);
                request.post('/api/finance/loadfondstate',formData2).then(res => {
                    this.fundInfo.financeState = res.data.data;
                    this.financeState = res.data.data;
                    this.createChartsData();
                    this.createCharts();
                    this.changeNumColor();
                },err => console.log(err.message));
            },err => console.log(err.message));
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
        // 获取当前日期
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
        // 余额输入的键入键出事件
        setMoneyDown(){
            let money = this.$refs['money'].value;
            // 清除数字和.-以外的字符
            money = money.replace(/[^\d.-]/g,'');
            // 验证第一个字符是数字
            money = money.replace(/^\./g,'');
            // 只保留一个.,清除多余的
            money = money.replace(/\.{2,}/g,'');
            // 只能输入两位小数
            money = money.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3')
            // money = money.replace(/[^\d{1,}\.\d{1,}|\d{1,}]/g,'');
            this.$refs['money'].value = money;
        },
        setMoneyUp(){
            let money = this.$refs['money'].value;
            // 除了第一位其它位置也不能有-
            if(money.length > 1){
                if(/-$/.test(money) === true){
                    money = money.slice(0,-1);
                }
            }
            // 清除数字和.以外的字符
            money = money.replace(/[^\d.-]/g,'');
            // 验证第一个字符是数字
            money = money.replace(/^\./g,'');
            // 只保留一个.,清除多余的
            money = money.replace(/\.{2,}/g,'');
            // 只能输入两位小数
            money = money.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3')
            // money = money.replace(/[^\d{1,}\.\d{1,}|\d{1,}]/g,'');
            this.$refs['money'].value = money;
            if(money === ''){
                this.moneySum = 0;
            }else{
                this.moneySum = parseFloat(money).toFixed(2);
            }
        },
        toCfm(){
            if(this.moneySum === 0){
                this.alterWindow = -1;
            }else{
                this.alterWindow = 1;
            }
        },
        cancle(){
            this.alterWindow = 0;
            this.httpResponse = 0;
        },
        backToHold(){
            this.$router.push({
                name:'myfinance',
            })
        },
        cfmAdd(){
            // console.log('userId ',this.fundInfo.userId, typeof this.fundInfo.userId);
            // console.log('financeCode ',this.fundInfo.finance.financeCode, typeof this.fundInfo.finance.financeCode);
            // console.log('thenState ',parseFloat(this.moneySum), typeof parseFloat(this.moneySum));
            // console.log('updDate ', new Date(), this.today, typeof this.today);

            const formData = new FormData();
            formData.append('userId', this.fundInfo.userId);
            formData.append('financeCode', this.fundInfo.finance.financeCode);
            formData.append('thenState', parseFloat(this.moneySum));
            // 后台类型是Date，直接传new Date()即可，后台会做格式化，否则会报400错误
            formData.append('updDate', new Date());
            request.post('/api/finance/addfundState',formData).then(res => {
                if(res.data === 1){
                    this.httpResponse = 1;
                    this.reloadData();
                    this.reloadFundInfo();
                    // 放到reloadFundInfo中去
                    // this.createChartsData();
                    // this.createCharts();
                    // this.changeNumColor();
                    this.moneySum = 0;
                    this.$refs['money'].value = '';
                }else if(res.data === 555){
                    this.httpResponse = 555;
                }
            },err => console.log(err.message));
        },
        cfmUpd(){
            // console.log('fsId', this.fundInfo.financeState[0].fsId, typeof this.fundInfo.financeState[0].fsId);
            // console.log('thenState ',parseFloat(this.moneySum), typeof parseFloat(this.moneySum));
            const formData = new FormData();
            formData.append('userId', this.fundInfo.userId);
            formData.append('financeCode', this.fundInfo.finance.financeCode);
            formData.append('fsId',this.fundInfo.financeState[0].fsId);
            formData.append('thenState', parseFloat(this.moneySum));
            request.post('/api/finance/modfundState',formData).then(res => {
                if(res.data === 1){
                    this.httpResponse = 1;
                    this.reloadData();
                    this.reloadFundInfo();
                    this.moneySum = 0;
                    this.$refs['money'].value = '';
                }else if(res.data === 555){
                    this.httpResponse = 555;
                }
            },err => console.log(err.message));
        },
        countAllMoney(){
            // console.log(this.fundInfo);//这里面都看得到financeState
            // console.log(this.fundInfo.financeState);//为什么这里还是undefined？？？？？？？？？？？？？？？？？？
            // 这种多层的搞不好，在data里再弄一个financeState
            if(this.financeState.length > 0){
                // console.log('@');
                return this.formatNum(parseFloat(this.fundInfo.baseMoney + this.financeState[0].thenState).toFixed(2));
            }else{
                // console.log('@@');
                return this.formatNum(parseFloat(this.fundInfo.baseMoney).toFixed(2));
            }
        },
        countProfitRate(){
            if(this.financeState.length > 0){
                let thisRate = this.financeState[0].thenState / this.fundInfo.baseMoney
                thisRate = parseFloat(thisRate * 100).toFixed(2) + '%';
                return thisRate;
            }else{
                return "0.00%"
            }
        },
        countProfit(){
            if(this.financeState.length > 0){
                let profit = this.financeState[0].thenState
                if(parseFloat(profit) >= 0){
                    
                }
                profit = parseFloat(profit).toFixed(2);
                return profit;
            }else{
                return '+' + 0;
            }
        },
        createChartsData(){
            this.thenStateArrforChart = [];
            this.updDateArrforChart = [];
            if(this.financeState.length > 0){
                this.financeState.forEach((obj,  index, arr) => {
                    this.thenStateArrforChart.unshift(parseFloat(obj.thenState));
                    this.updDateArrforChart.unshift(obj.updDate);
                });
            }
        },
        createCharts(){
            if(this.financeState.length > 0){
                if(charts1 !== null && charts1 !=='' && charts1 !== undefined){
                    charts1.dispose();
                };
                charts1 = echarts.init(this.$refs['charts1']);
                charts1.setOption({
                    xAxis: {
                        type: 'category',
                        data: this.updDateArrforChart,
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [
                        {
                        data: this.thenStateArrforChart,
                        type: 'line'
                        }
                    ],
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                                backgroundColor: '#6a7985'
                            }
                        }
                    }
                })
            }
        },
        changeNumColor(){
            if(this.$refs['profitD'] && this.$refs['profitRateD']){
                if(this.profit < 0){
                    this.$refs['profitD'].style.color = 'green';
                    this.$refs['profitRateD'].style.color = 'green';
                }else{
                    this.$refs['profitD'].style.color = 'red';
                    this.$refs['profitRateD'].style.color = 'red';
                }
            }
        },
        toDetail(){
            this.$router.replace({
                name:'myfinanceDetail',
                params:{
                    fund:JSON.parse(JSON.stringify(this.fund)),
                }
            })
        }
    },
    computed:{
        lastUpdDate(){
            if(this.financeState){
                if(this.financeState.length > 0){
                    return this.financeState[0].updDate;
                }else{
                    // 如果是今天添加的，更新点进来，是去修改最后一天的去了，严重bug
                    return this.fundInfo.iniDate;
                }
            }else{
                return this.fundInfo.iniDate;
            }
        },
        today(){
            return this.formatDate();
        },
    },
    watch:{
        moneySum:{
            handler(newValue){
                if(parseFloat(newValue) >= 0){
                    this.$refs['profitShow'].style.color = 'red'
                }else{
                    this.$refs['profitShow'].style.color = 'green'
                }
            }
        },
        fundInfo:{
            // 这里记录的变化是第一个请求的变化，第二个请求按理改了里面的financeState，但是监测不到，即便是开启了deep true
            // 所以要想改变allMoney，要监视data中新设置的financeState
            // deep:true,
            handler(newValue){
                // console.log(this.fundInfo);
                // this.allMoney = this.countAllMoney();
            }
        },
        financeState:{
            deep:true,
            handler(newValue){
                this.allMoney = this.countAllMoney();
                this.profitRate = this.countProfitRate();
                this.profit = this.countProfit();
            }
        }
    },
    created(){
        // console.log(this.fund);
        if(this.fund === undefined){
            this.$router.push({
                name:'myfinance',
            })
        }else{
            this.fundInfo = this.fund;
            this.financeState = this.fund.financeState;
            this.profitRate = this.countProfitRate();
            this.profit = this.countProfit();
        }
    },
    mounted(){
        // console.log(this.fund);
        // console.log(this.today);
        this.createChartsData();
        this.createCharts();
        this.changeNumColor();
    }
}
</script>

<style scoped>
.single-upd{
    display: flex;
    justify-content: space-between;
}
.single-upd-left{
    width: 400px;
    min-height: 400px;
    background-color: #fff;
}
.single-upd-left h3{
    display: inline-block;
    margin-top: 10px;
    margin-left: 5px;
}
.single-upd-left > h3{
    cursor: pointer;
}
.single-upd-left > h3:hover{
    text-decoration: underline;
}
.single-upd-left > span{
    margin-left: 5px;
    font-size: 14px;
    color: #888;
}
.single-upd-left > p{
    margin-top: 20px;
}
.single-upd-left p,
.upd-action label{
    margin-left: 5px;
    font-size: 14px;
    color: #888;
}
.single-upd-left > p > span{
    color: #3396ff;
    text-decoration: underline;
}
.upd-action{
    margin-top: 10px;
}
.upd-action input{
    height: 30px;
}
.upd-buttons{
    margin-top: 20px;
    margin-left: 50px;
}
.upd-buttons span,
.backToHold{
    cursor: pointer;
    display: inline-block;
    height: 30px;
    line-height: 26px;
    width: 100px;
    text-align: center;
    color: #fff;
    font-weight: bold;
    background-color: #3396ff;
    border-radius: 6px;
    border: 2px solid #aabfd686;
}
.change-today{
    background-color: #62c272;
}
.upd-buttons span:hover,
.backToHold:hover{
    opacity: 0.8;
}
.upd-buttons span:active,
.backToHold:active{
    opacity: 0.5;
}
.backToHold{
    margin-top: 10px;
    margin-left: 50px;
    background-color: #4614cf;
}
.single-upd-right{
    width: 550px;
    background-color: #eee;
}
.sur-up > ul{
    display: flex;
    justify-content: space-between;
}
.sur-up > ul li{
    width: 150px;
    height: 100px;
    text-align: center;
}
.sur-up > ul li span{
    display: block;
}
.sur-up > ul li span:first-child{
    color: #999;
    margin-top: 20px;
}
.sur-up > ul li span:last-child{
    margin-top: 10px;
}
.sur-down{
    background-color: #fff;
}
.rise-down-charts{
    margin: 0 auto;
    height: 300px;
    width: 500px;
}
.alter-background{
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, .5);
    top: 0;
    left: 0;
}
.alter-content{
    position: absolute;
    top: 200px;
    left: 50%;
    transform: translateX(-50%);
    width: 500px;
    height: 200px;
    border-radius: 5px;
    background-color: white;
}
.alter-content p{
    text-align: center;
    font-size: 18px;
    margin: 20px auto;
}
.alter-content-buttons{
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: inline-block;
    margin: 0 auto;
}
.alter-content-buttons span{
    display: inline-block;
    height: 25px;
    width: 80px;
    line-height: 21px;
    text-align: center;
    /* color: #965151; */
    color: #fff;
    background-color: #3396ff;
    border-radius: 5px;
    border: 2px solid #7e8d9e69;
    cursor: pointer;
    margin: 20px 20px;
}
.alter-content-buttons span:hover{
    opacity: 0.8;
}
.alter-content-buttons span:active{
    opacity: 0.5;
}
</style>