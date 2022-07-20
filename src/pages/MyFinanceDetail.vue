<template>
<!-- created前就会读取为虚拟dom，多层次的没有数据就会报错，所以加一个v-if -->
    <div class="fund-detail" v-if="fund">
        <div class="fund-detail-content">
            <div class="fund-detail-title">
                <h2>{{fundInfo.finance.financeName}}</h2>
                <span>{{fundInfo.finance.financeCode}}</span>
            </div>
            <div class="fund-detail-data">
                <div class="fund-detail-all-yestaday">
                    <ul>
                        <li>金额(元)</li>
                        <li>{{allMoney}}</li>
                    </ul>
                    <ul>
                        <li>上一次收益</li>
                        <li ref="lastprofit">{{lastprofitShow}}</li>
                    </ul>
                </div>
                <div class="fund-detail-profit">
                    <ul>
                        <li>持有收益(元)</li>
                        <li ref="profit">{{profitShow}}</li>
                    </ul>
                    <ul>
                        <li>持有收益率</li>
                        <li ref="profitRate">{{profitRateShow}}</li>
                    </ul>
                </div>
                <!-- 收益变化折线图 -->
                <div class="fund-detail-chart">
                    <div ref="charts1" class="rise-down-charts"></div>
                </div>
                <div class="fund-detail-trade">
                    <span @click="soldAll">全部卖出</span>
                    <span @click="soldPart">卖出</span>
                    <span @click="buyIn">买入</span>
                </div>
                <div class="fund-detail-back">
                    <span @click="backToHold">返回</span>
                </div>
            </div>
            <!-- 操作弹窗 -->
            <div v-if="alertWindow !== 0" class="fund-detail-operation" @click.self="cancleAlert">
                <div class="fund-detail-operation-content">
                    <p v-show="alertWindow === 2">全部卖出</p>
                    <span v-show="alertWindow === 2">此操作将收取现有全部金额</span>
                    <p v-show="alertWindow === 4">卖出</p>
                    <span v-show="alertWindow === 4">将按现持有比例选择卖出</span>
                    <p v-show="alertWindow === 3">买入</p>
                    <span v-show="alertWindow === 3">单次买入最低金额为(100元)</span>

                    <div v-show="alertWindow === 4 || alertWindow === 2" class="sold-money-go">选择卖出金额去向</div>
                    <div v-show="alertWindow === 3" class="sold-money-go">选择买入支付来源</div>
                    <select ref="moneyPlace" @change="selectTest">
                        <option value="o">其它</option>
                        <option value="p">余额</option>
                        <option v-for="card in myCards" 
                                :key="card.cardId"
                                :value="card.cardId">
                            <span>{{card.cardName}}</span>
                            <span>({{card.cardKey.slice(-4,)}})</span>
                        </option>
                    </select>

                    <div v-show="alertWindow === 4" class="sold-money-go">输入卖出比例(最高90%)</div>
                    <input class="sdfijbi" v-show="alertWindow === 4" type="text" ref="soldMoneySet" @keydown="moneyRatedown" @keyup="moneyRateup">
                    <span class="xicvibewr" v-show="alertWindow === 4">%</span>
                    <div class="ad-rate-choice" v-show="alertWindow === 4">
                        <span @click="choiceRate(obj)" v-for="obj in adChoiceSold" :key="obj.index">{{obj}}</span>
                    </div>
                    <div class="fund-detail-operation-buttons">
                        <span @click="cancleAlert">取消</span>
                    </div>

                    <div v-show="alertWindow === 3" class="sold-money-go">输入买入金额(元)</div>
                    <input v-show="alertWindow === 3" type="text" ref="buyMoneySet" @keydown="moneySetDown" @keyup="moneySetUp" maxlength="11">
                    <div class="fund-detail-operation-buttons">
                        <span @click="cancleAlert">取消</span>
                    </div>

                    <!--  -->
                    <div class="fund-detail-operation-buttons2">
                        <span @click="toSecondCfm">确定</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="fund-change-record">
            <!-- 传入一个标识，约定好基金为3 -->
            <RecordObj :target = '3' :fundHoldId = 'fundInfo.userHoldId'/>
        </div>

        <!-- 二次确认弹窗 -->
        <div v-if="confirmWindow === 1" class="alter-background" @click.self="confirmWindow = 0">
            <div class="alter-content">
                <p v-if="alertWindow === 2">全部卖出</p>
                <p v-if="alertWindow === 4">卖出</p>
                <p v-if="alertWindow === 3">买入</p>
                <p>操作时间：{{nowTime}}</p>
                <p v-if="alertWindow === 2">金额：{{allMoney}}</p>
                <p v-if="alertWindow === 2 && $refs['moneyPlace'].value === 'p'">将转入到：余额</p>
                <p v-if="alertWindow === 2 && $refs['moneyPlace'].value > 0 ">将转入到：银行卡</p>
                <p v-if="alertWindow === 2 && $refs['moneyPlace'].value === 'p'">转入后余额为：{{moneyAfterAllSold}}</p>
                <p v-if="alertWindow === 2 && $refs['moneyPlace'].value > 0 ">{{getChoiceCard().cardName + '(' + getChoiceCard().cardKey.slice(-4,) + ')'}}</p>

                <p v-if="alertWindow === 4">金额：{{soldMoneyAmount}}</p>
                <p v-if="alertWindow === 4 && $refs['moneyPlace'].value === 'p'">将转入到：余额</p>
                <p v-if="alertWindow === 4 && $refs['moneyPlace'].value > 0 ">将转入到：银行卡</p>
                <p v-if="alertWindow === 4 && $refs['moneyPlace'].value === 'p'">转入后余额为：{{afterSoldPocketMoney}}</p>
                <p v-if="alertWindow === 4 && $refs['moneyPlace'].value > 0 ">{{getChoiceCard().cardName + '(' + getChoiceCard().cardKey.slice(-4,) + ')'}}</p>

                <p v-if="alertWindow === 3">金额：{{buyMoney}}</p>
                <p v-if="alertWindow === 3 && $refs['moneyPlace'].value === 'p'">买入来源：余额</p>
                <p v-if="alertWindow === 3 && $refs['moneyPlace'].value > 0 ">买入来源：银行卡</p>
                <p v-if="alertWindow === 3 && $refs['moneyPlace'].value === 'p'">买入后余额为：{{afterBuyPocketMoney}}</p>
                <p v-if="alertWindow === 3 && $refs['moneyPlace'].value > 0 ">{{getChoiceCard().cardName + '(' + getChoiceCard().cardKey.slice(-4,) + ')'}}</p>
                <div class="alter-content-buttons">
                    <span v-if="alertWindow === 2 && $refs['moneyPlace'].value === 'o'" @click="soldAllOtherCfm">确定</span>
                    <span v-if="alertWindow === 2 && $refs['moneyPlace'].value === 'p'" @click="soldAllPocketCfm">确定</span>
                    <span v-if="alertWindow === 2 && $refs['moneyPlace'].value > 0" @click="soldAllCardCfm">确定</span>

                    <span v-if="alertWindow === 4 && $refs['moneyPlace'].value === 'o'" @click="soldPartOtherCfm">确定</span>
                    <span v-if="alertWindow === 4 && $refs['moneyPlace'].value === 'p'" @click="soldPartPocketCfm">确定</span>
                    <span v-if="alertWindow === 4 && $refs['moneyPlace'].value > 0" @click="soldPartCardCfm">确定</span>

                    <span v-if="alertWindow === 3 && $refs['moneyPlace'].value === 'o'" @click="buyOtherCfm">确定</span>
                    <span v-if="alertWindow === 3 && $refs['moneyPlace'].value === 'p'" @click="buyPocketCfm">确定</span>
                    <span v-if="alertWindow === 3 && $refs['moneyPlace'].value > 0" @click="buyCardCfm">确定</span>
                    <span @click="confirmWindow = 0" style="background-color:#318d38">取消</span>
                </div>
            </div>
        </div>
        <div v-show="confirmWindow === 2" class="alter-background" @click.self="confirmWindow = 0">
            <div class="alter-content">
                <p style="color:red">未设置金额</p>
            </div>
        </div>
        <div v-show="confirmWindow === 100" class="alter-background" @click.self="confirmWindow = 0">
            <div class="alter-content">
                <p style="color:red">最低买入金额为100(元)</p>
            </div>
        </div>
        <div v-show="confirmWindow === 555" class="alter-background" @click.self="confirmWindow = 0">
            <div class="alter-content">
                <p style="color:red">未知错误</p>
            </div>
        </div>
        <div v-show="confirmWindow === 666" class="alter-background" @click.self="confirmWindow = 0">
            <div class="alter-content">
                <p style="color:green">操作完成</p>
            </div>
        </div>
        <div v-show="confirmWindow === 667" class="alter-background" @click.self="soldAllDone">
            <div class="alter-content">
                <p style="color:green">操作完成</p>
            </div>
        </div>
    </div>
</template>

<script>
let timer;
import request from '../utils/request'
import * as echarts from 'echarts';
import RecordObj from '../components/RecordObj.vue'
let charts1;
export default {
    name:'MyFinanceDetail',
    props:['fund'],
    components:{RecordObj},
    data(){
        return {
            pocketMoney:0.00,
            fundInfo:{},
            financeState:[],
            moneySum:0,
            allMoneyOrigin:0,
            allMoney:0,
            allMoneyShow: '0',
            profit:0,
            profitShow:'0',
            profitRate: '0.00%',
            profitRateShow: '+0.00%',
            lastprofit:0,
            lastprofitShow:'',
            thenStateArrforChart:[],
            updDateArrforChart:[],
            myCards: [],
            alertWindow:0,
            nowTime:'',
            /**
             * 0：不显示
             * 2：全部卖出
             * 3：买入
             * 4：卖出
             */
            adChoiceSold:['25%','50%','60%','90%'],
            confirmWindow:0,

            soldBaseMoney:0,
            soldProfit:0,
            soldMoneyAmount:0,
            afterSoldBaseMoney:0,
            afterSoldProfit:0,

            afterSoldPocketMoney:0,

            buyMoney:0,
            afterBuyPocketMoney:0,
            afterBuyBaseMoney:0,
        }
    },
    computed:{
        lastUpdDate(){
            if(this.financeState){
                if(this.financeState.length > 0){
                    return this.financeState[0].updDate;
                }else{
                    return this.fundInfo.iniDate;
                }
            }else{
                return this.fundInfo.iniDate;
            }
        },
        today(){
            return this.formatDate();
        },
        moneyAfterAllSold(){
            return (parseFloat(this.allMoneyOrigin) + parseFloat(this.pocketMoney)).toFixed(2);
        }
    },
    watch:{
        financeState:{
            deep:true,
            handler(newValue){
                this.allMoneyOrigin = this.countAllMoneyOrigin();
                this.allMoney = this.countAllMoney();
                this.profitRate = this.countProfitRate();
                this.profit = this.countProfit();
            }
        }
    },
    methods:{
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
        // 获取当前时间
        formatTime(){//yyyy-mm-dd
            const date = new Date();
            const dash = '-'
            const year = date.getFullYear();
            let month = date.getMonth()+1;
            let day = date.getDate();
            let h = date.getHours();
            let m = date.getMinutes();
            let s = date.getSeconds();
            if(month >= 1 && month <=9){
                month = '0' + month;
            }
            if(day >= 1 && day <= 9){
                day = '0' + day;
            }
            if(h >= 0 && h <= 9 ){
                h = '0' + h
            }
            if(m >= 0 && m <= 9 ){
                m = '0' + m
            }
            if(s >= 0 && s <= 9 ){
                s = '0' + s
            }
            const currentTime = year + dash + month + dash + day + ' ' + h + ':' + m + ':' + s;
            return currentTime;
        },
        countAllMoneyOrigin(){
            if(this.financeState.length > 0){
                return parseFloat(this.fundInfo.baseMoney + this.financeState[0].thenState);
            }else{
                return parseFloat(this.fundInfo.baseMoney);
            }
        },
        countAllMoney(){
            if(this.financeState.length > 0){
                return this.formatNum(parseFloat(this.fundInfo.baseMoney + this.financeState[0].thenState).toFixed(2));
            }else{
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
                return 0;
            }
        },
        // 两次收益记录差值
        countLastProfit(){
            if(this.financeState.length > 1){
                let cLP = this.financeState[0].thenState - this.financeState[1].thenState;
                cLP = this.formatNum(cLP.toFixed(2));
                return cLP
            }else{
                return '未设置';
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
        soldAll(){
            this.alertWindow = 2;
        },
        soldPart(){
            this.alertWindow = 4;
        },
        buyIn(){
            this.alertWindow = 3;
        },
        // 返回
        backToHold(){
            this.$router.replace({
                name:'myfinance',
            })
        },
        // 取消交易弹窗
        cancleAlert(){
            this.alertWindow = 0;
        },
        // 获取银行卡
        getMyBankCards(userId){
            this.$store.dispatch('secondCheck');
            const formData = new FormData();
            formData.append('id',userId);
            request.post('/api/cards/loadcards',formData).then(res => {
                if(res.data.code === '0'){
                    this.myCards = res.data.data;
                    // console.log(this.myCards);
                }else{
                    console.log('未知错误')
                }
            },err => console.log(err.message));
        },
        // 更新用户信息，更新余额
        reloadUserMoney(){
            this.pocketMoney = this.$store.state.userInfo.pocketMoney;
        },
        // 重载收益数据
        reloadNum(){
            this.profitRate = this.countProfitRate();
            this.profit = this.countProfit();
            this.lastprofit = this.countLastProfit();
        },
        // 重载收益数据并改变颜色
        changeNumColor(){
            if(parseFloat(this.profit) >= 0){
                this.profitShow = '+' + this.profit;
                this.profitRateShow = '+' + this.profitRate;
                this.$refs['profitRate'].style.color = 'red';
                this.$refs['profit'].style.color = 'red';
            }else{
                this.profitShow = this.profit;
                this.profitRateShow = this.profitRate;
                this.$refs['profitRate'].style.color = 'green';
                this.$refs['profit'].style.color = 'green';
            };
            if(parseFloat(this.lastprofit) >= 0){
                this.lastprofitShow = '+' + this.lastprofit;
                this.$refs['lastprofit'].style.color = 'red';
            }else{
                this.lastprofitShow = this.lastprofit;
                this.$refs['lastprofit'].style.color = 'green';
            }
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
                    this.$store.dispatch("reloadUserFundHold",this.fundInfo.userHoldId);
                    this.fundInfo.financeState = res.data.data;
                    this.financeState = res.data.data;
                    this.createChartsData();
                    this.createCharts();
                    this.reloadNum();
                    this.changeNumColor();
                },err => console.log(err.message));
            },err => console.log(err.message));
        },
        selectTest(){
            if(this.$refs['buyMoneySet']){
                this.$refs['buyMoneySet'].value = '';
            }
        },
        getChoiceCard(){
            const choiceCard = this.myCards.filter((elem, index, arr) => {
                return elem.cardId === parseInt(this.$refs['moneyPlace'].value);
            })
            return choiceCard[0];
        },
        choiceRate(obj){
            this.$refs['soldMoneySet'].value = obj.slice(0,-1)
        },
        // 百分比输入限制(只能输入两位数小于等于90)
        setRate(){
            this.$refs['soldMoneySet'];
            let rate = this.$refs['soldMoneySet'].value;
            rate = rate.replace(/[^\d]/g,'');
            rate = rate.replace(/^(\d\d).*$/,'$1');
            this.$refs['soldMoneySet'].value = rate;
        },
        setMoney(){
            let money = this.$refs['buyMoneySet'].value;
            money = money.replace(/[^\d]/g,'');

            this.$refs['buyMoneySet'].value = money;
        },
        // 输入卖出比例键入键出事件
        moneyRatedown(){
            this.setRate();
        },
        moneyRateup(){
            this.setRate();
            if(parseInt(this.$refs['soldMoneySet'].value) > 90){
                this.$refs['soldMoneySet'].value = 90;
            }
        },
        // 输入买入金额键入键出事件
        moneySetDown(){
            this.setMoney();
        },
        moneySetUp(){
            this.setMoney();
            // 选的是零钱买入
            if(this.$refs['moneyPlace'].value === 'p'){
                if(parseInt(this.$refs['buyMoneySet'].value) > parseInt(this.pocketMoney)){
                    this.$refs['buyMoneySet'].value = parseInt(this.pocketMoney)
                }
            }else if(this.$refs['moneyPlace'].value !== 'o'){
                const choiceCard = this.getChoiceCard();
                if(parseInt(this.$refs['buyMoneySet'].value) > parseInt(choiceCard.cardMoney)){
                    this.$refs['buyMoneySet'].value = parseInt(choiceCard.cardMoney);
                }
            }
        },
        toSecondCfm(){
            if(this.alertWindow === 2){//全部卖出
                this.confirmWindow = 1;
                if(this.$refs['moneyPlace'].value === 'o'){
                    // request将此条基金baseMoney置0，删除其全部financeState，
                    // vuex reloadUserFundHold
                    // 添加交易记录
                    // 返回首页
                }else if(this.$refs['moneyPlace'].value === 'p'){
                    // request将此条基金baseMoney置0，删除其全部financeState，
                    // 将余额与当前总金额相加，修改余额
                    let moneyAfterAllSold = parseFloat(this.allMoneyOrigin) + parseFloat(this.pocketMoney);
                    moneyAfterAllSold = parseFloat(moneyAfterAllSold.toFixed(2));
                    this.afterSoldPocketMoney = moneyAfterAllSold;
                    // vuex reloadUserFundHold
                    // vuex reloadUserInfo
                    // 添加交易记录
                    // 返回首页
                }else{
                    // request将此条基金baseMoney置0，删除其全部financeState，
                    // 将余额与当前银行卡余额相加，修改银行卡余额
                    let choiceCard = this.myCards.filter((elem, index, arr) => {
                        return elem.cardId === parseInt(this.$refs['moneyPlace'].value);
                    });
                    choiceCard = choiceCard[0];
                    let moneyAfterAllSold = parseFloat(this.allMoneyOrigin) + parseFloat(choiceCard.cardMoney);
                    moneyAfterAllSold = parseFloat(moneyAfterAllSold.toFixed(2));
                    this.afterSoldCardMoney = moneyAfterAllSold;
                    // vuex reloadUserFundHold
                    // 添加交易记录
                    // 返回首页
                }
            }else if(this.alertWindow === 4){//选择部分卖出
                if(this.$refs['soldMoneySet'].value === ''){
                    this.confirmWindow = 2;
                }else{
                    this.confirmWindow = 1;
                    if(this.financeState.length > 0){
                        this.soldProfit = parseFloat(this.profit) / 100 * parseInt(this.$refs['soldMoneySet'].value);
                        this.soldProfit = parseFloat(this.soldProfit.toFixed(2));
                        this.afterSoldProfit = parseFloat(this.profit) - this.soldProfit;
                        this.afterSoldProfit = parseFloat(this.afterSoldProfit.toFixed(2));
                    }
                    this.soldBaseMoney = parseFloat(this.fundInfo.baseMoney) / 100 * parseInt(this.$refs['soldMoneySet'].value);
                    this.soldMoneyAmount = this.soldBaseMoney + this.soldProfit;
                    this.afterSoldBaseMoney = parseFloat(this.fundInfo.baseMoney) - this.soldBaseMoney;
                    // ----------------------------------------------------------------------------------------
                    this.soldBaseMoney = parseFloat(this.soldBaseMoney.toFixed(2));
                    this.soldMoneyAmount = parseFloat(this.soldMoneyAmount.toFixed(2));
                    this.afterSoldBaseMoney = parseFloat(this.afterSoldBaseMoney.toFixed(2));
                    // console.log(this.afterSoldBaseMoney,this.afterSoldProfit,this.soldMoneyAmount);
                    /**
                     * 将本基金的baseMoney改为afterSoldBaseMoney
                     * 将本基金的最后一条收益改为afterSoldProfit，如果没有就不改
                     */
                }
                if(this.$refs['moneyPlace'].value === 'o'){
                    // console.log('卖出到其它');
                }else if(this.$refs['moneyPlace'].value === 'p'){
                    // console.log('卖出到余额');
                    this.afterSoldPocketMoney = parseFloat(this.pocketMoney + this.soldMoneyAmount).toFixed(2);
                }else{
                    // console.log('卖出到银行卡');
                    let choiceCard = this.myCards.filter((elem, index, arr) => {
                        return elem.cardId === parseInt(this.$refs['moneyPlace'].value);
                    });
                    choiceCard = choiceCard[0];
                    let afterSoldCardMoney = parseFloat(choiceCard.cardMoney + this.soldMoneyAmount).toFixed(2);
                    // 修改的银行卡金额
                    this.afterSoldCardMoney = afterSoldCardMoney;
                }
            }else if(this.alertWindow === 3){//买入
                if(this.$refs['buyMoneySet'].value === ''){
                    this.confirmWindow = 2;
                }else{
                    this.buyMoney = parseInt(this.$refs['buyMoneySet'].value);
                    this.afterBuyBaseMoney = parseFloat(this.fundInfo.baseMoney + this.buyMoney).toFixed(2);
                    if(this.buyMoney < 100){
                        this.confirmWindow = 100;
                    }else{
                        this.confirmWindow = 1;
                    }
                }
                if(this.$refs['moneyPlace'].value === 'o'){
                    // console.log('其它支付买入');
                }else if(this.$refs['moneyPlace'].value === 'p'){
                    // console.log('余额支付买入');
                    this.afterBuyPocketMoney = parseFloat(this.pocketMoney - this.buyMoney).toFixed(2);
                }else{
                    // console.log('银行卡支付买入');
                    let choiceCard = this.myCards.filter((elem, index, arr) => {
                        return elem.cardId === parseInt(this.$refs['moneyPlace'].value);
                    });
                    choiceCard = choiceCard[0];
                    let afterBuyCardMoney = parseFloat(choiceCard.cardMoney - this.buyMoney).toFixed(2);
                    this.afterBuyCardMoney = afterBuyCardMoney;
                }
            }
        },
        soldAllOtherCfm(){
            const formData = new FormData();
            const formData2 = new FormData();
            formData.append('userId',this.fundInfo.userId);
            formData.append('financeCode',this.fundInfo.finance.financeCode);
            formData2.append('userId',this.fundInfo.userId);
            formData2.append('mainContentId',this.fundInfo.userHoldId);
            formData2.append('tdate',new Date());
            formData2.append('moneyAmount',this.allMoneyOrigin);
            request.post('/api/finance/soldallother',formData).then(res => {
                if(res.data === 1){
                    this.$store.dispatch('reloadUserFundHold',this.fundInfo.userId);
                    request.post('/api/records/soldallother',formData2).then(res => {
                        if(res.data === 1){
                            this.confirmWindow = 667;
                        }else{
                            this.confirmWindow = 555;
                        }
                    },err => console.log(err));
                }else{
                    this.confirmWindow = 555;
                }
            },err => console.log(err));
        },
        soldAllPocketCfm(){
            const formData = new FormData();
            const formData2 = new FormData();
            const formData3 = new FormData();
            formData.append('userId',this.fundInfo.userId);
            formData.append('financeCode',this.fundInfo.finance.financeCode);
            formData2.append('userId',this.fundInfo.userId);
            formData2.append('newMoney',this.afterSoldPocketMoney);
            formData3.append('userId',this.fundInfo.userId);
            formData3.append('mainContentId',this.fundInfo.userHoldId);
            formData3.append('tdate',new Date());
            formData3.append('MoneyResult',this.afterSoldPocketMoney);
            formData3.append('moneyAmount',this.allMoneyOrigin);
            request.post('/api/finance/soldallother',formData).then(res => {
                if(res.data === 1){
                    this.$store.dispatch('reloadUserFundHold',this.fundInfo.userId);
                    request.post('/api/user/changepm',formData2).then(res => {
                        if(res.data === 1){
                            this.$store.dispatch('reloadUserInfo',this.fundInfo.userId);
                            request.post('/api/records/soldallpocket',formData3).then(res => {
                                if(res.data === 1){
                                    this.confirmWindow = 667;
                                }else{
                                    this.confirmWindow = 555;
                                }
                            },err => console.log(err));
                        }else{
                            this.confirmWindow = 555;
                        }
                    },err => console.log(err));
                }else{
                    this.confirmWindow = 555;
                }
            },err => console.log(err));
        },
        soldAllCardCfm(){
            const formData = new FormData();
            const formData2 = new FormData();
            const formData3 = new FormData();
            formData.append('userId',this.fundInfo.userId);
            formData.append('financeCode',this.fundInfo.finance.financeCode);
            formData2.append('cardMoney',this.afterSoldCardMoney);
            formData2.append('cardId',parseInt(this.$refs['moneyPlace'].value));
            formData2.append('userId',this.fundInfo.userId);
            formData3.append('userId',this.fundInfo.userId);
            formData3.append('mainContentId',this.fundInfo.userHoldId);
            formData3.append('objContentId',parseInt(this.$refs['moneyPlace'].value));
            formData3.append('tdate',new Date());
            formData3.append('moneyAmount',this.allMoneyOrigin);
            request.post('/api/finance/soldallother',formData).then(res => {
                if(res.data === 1){
                    this.$store.dispatch('reloadUserFundHold',this.fundInfo.userId);
                    request.post('/api/cards/modmoney',formData2).then(res => {
                        if(res.data === 1){
                            request.post('/api/records/soldallcard',formData3).then(res => {
                                if(res.data == 1){
                                    this.confirmWindow = 667;
                                }else{
                                    this.confirmWindow = 555;
                                }
                            },err => console.log(err));
                        }else{
                            this.confirmWindow = 555;
                        }
                    },err => console.log(err));
                }else{
                    this.confirmWindow = 555;
                }
            },err => console.log(err));
        },
        soldPartOtherCfm(){
            const formData = new FormData();
            const formData2 = new FormData();
            formData.append('holdId',this.fundInfo.userHoldId);
            formData.append('newMoney',this.afterSoldBaseMoney);
            formData.append('userId',this.fundInfo.userId);
            formData.append('financeCode',this.fundInfo.finance.financeCode);
            formData2.append('userId',this.fundInfo.userId);
            formData2.append('mainContentId',this.fundInfo.userHoldId);
            formData2.append('tdate',new Date());
            formData2.append('moneyAmount',this.soldMoneyAmount);
            if(this.financeState.length > 0){
                formData.append('fsId',this.financeState[0].fsId);
                formData.append('newState',this.afterSoldProfit);
                formData.append('changeState',1);
            }else{
                formData.append('fsId',0);
                formData.append('newState',0);
                formData.append('changeState',0);
            }
            request.post('/api/finance/soldpartother',formData).then(res => {
                if(res.data === 1){
                    this.$store.dispatch('reloadUserFundHold',this.fundInfo.userId);
                    this.reloadFundInfo();
                    request.post('/api/records/soldpartother',formData2).then(res => {
                        if(res.data === 1){
                            this.confirmWindow = 666;
                            this.informUpdRecord();
                        }else{
                            this.confirmWindow = 555;
                        }
                    },err => console.log(err));
                }else{
                    this.confirmWindow = 555;
                }
            },err => console.log(err));
        },
        soldPartPocketCfm(){
            const formData = new FormData();
            const formData2 = new FormData();
            const formData3 = new FormData();
            formData.append('holdId',this.fundInfo.userHoldId);
            formData.append('newMoney',this.afterSoldBaseMoney);
            formData.append('userId',this.fundInfo.userId);
            formData.append('financeCode',this.fundInfo.finance.financeCode);
            if(this.financeState.length > 0){
                formData.append('fsId',this.financeState[0].fsId);
                formData.append('newState',this.afterSoldProfit);
                formData.append('changeState',1);
            }else{
                formData.append('fsId',0);
                formData.append('newState',0);
                formData.append('changeState',0);
            }
            formData2.append('userId',this.fundInfo.userId);
            formData2.append('newMoney',this.afterSoldPocketMoney);
            formData3.append('userId',this.fundInfo.userId);
            formData3.append('mainContentId',this.fundInfo.userHoldId);
            formData3.append('tdate',new Date());
            formData3.append('MoneyResult',this.afterSoldPocketMoney);
            formData3.append('moneyAmount',this.soldMoneyAmount);
            request.post('/api/finance/soldpartother',formData).then(res => {
                if(res.data == 1){
                    this.$store.dispatch('reloadUserFundHold',this.fundInfo.userId);
                    this.reloadFundInfo();
                    request.post('/api/user/changepm',formData2).then(res => {
                        if(res.data === 1){
                            this.$store.dispatch('reloadUserInfo',this.fundInfo.userId);
                            this.reloadUserMoney();
                            request.post('/api/records/soldpartpocket',formData3).then(res => {
                                if(res.data === 1){
                                    this.confirmWindow = 666;
                                    this.informUpdRecord();
                                }else{
                                    this.confirmWindow = 555;
                                }
                            },err => console.log(err));
                        }else{
                            this.confirmWindow = 555;
                        }
                    },err => console.log(err));
                }else{
                    this.confirmWindow = 555;
                }
            },err => console.log(err));
        },
        soldPartCardCfm(){
            const formData = new FormData();
            const formData2 = new FormData();
            const formData3 = new FormData();
            formData.append('holdId',this.fundInfo.userHoldId);
            formData.append('newMoney',this.afterSoldBaseMoney);
            formData.append('userId',this.fundInfo.userId);
            formData.append('financeCode',this.fundInfo.finance.financeCode);
            if(this.financeState.length > 0){
                formData.append('fsId',this.financeState[0].fsId);
                formData.append('newState',this.afterSoldProfit);
                formData.append('changeState',1);
            }else{
                formData.append('fsId',0);
                formData.append('newState',0);
                formData.append('changeState',0);
            }
            formData2.append('cardMoney',this.afterSoldCardMoney);
            formData2.append('cardId',parseInt(this.$refs['moneyPlace'].value));
            formData2.append('userId',this.fundInfo.userId);
            formData3.append('userId',this.fundInfo.userId);
            formData3.append('mainContentId',this.fundInfo.userHoldId);
            formData3.append('objContentId',parseInt(this.$refs['moneyPlace'].value));
            formData3.append('tdate',new Date());
            formData3.append('moneyAmount',this.soldMoneyAmount);
            request.post('/api/finance/soldpartother',formData).then(res => {
                if(res.data == 1){
                    this.$store.dispatch('reloadUserFundHold',this.fundInfo.userId);
                    this.reloadFundInfo();
                    request.post('/api/cards/modmoney',formData2).then(res => {
                        if(res.data === 1){
                            this.getMyBankCards(this.fundInfo.userId);
                            request.post('/api/records/soldpartcard',formData3).then(res => {
                                if(res.data == 1){
                                    this.confirmWindow = 666;
                                    this.informUpdRecord();
                                }else{
                                    this.confirmWindow = 555;
                                }
                            },err => console.log(err));
                        }else{
                            this.confirmWindow = 555;
                        }
                    },err => console.log(err));
                }else{
                    this.confirmWindow = 555;
                }
            },err => console.log(err));
        },
        buyOtherCfm(){
            const formData = new FormData();
            const formData2 = new FormData();
            formData.append('holdId',this.fundInfo.userHoldId);
            formData.append('newMoney',this.afterBuyBaseMoney);
            formData.append('userId',this.fundInfo.userId);
            formData2.append('userId',this.fundInfo.userId);
            formData2.append('mainContentId',this.fundInfo.userHoldId);
            formData2.append('tdate',new Date());
            formData2.append('moneyAmount',this.buyMoney);
            request.post('/api/finance/buy',formData).then(res => {
                if(res.data == 1){
                    this.$store.dispatch('reloadUserFundHold',this.fundInfo.userId);
                    this.reloadFundInfo();
                    request.post('/api/records/buyother',formData2).then(res => {
                        if(res.data == 1){
                            this.confirmWindow = 666;
                            this.informUpdRecord();
                        }else{
                            this.confirmWindow = 555;
                        }
                    },err => console.log(err));
                }else{
                    this.confirmWindow = 555;
                }
            },err => console.log(err));
        },
        buyPocketCfm(){
            const formData = new FormData();
            const formData2 = new FormData();
            const formData3 = new FormData();
            formData.append('holdId',this.fundInfo.userHoldId);
            formData.append('newMoney',this.afterBuyBaseMoney);
            formData2.append('userId',this.fundInfo.userId);
            formData2.append('newMoney',this.afterBuyPocketMoney);
            formData3.append('userId',this.fundInfo.userId);
            formData3.append('mainContentId',this.fundInfo.userHoldId);
            formData3.append('tdate',new Date());
            formData3.append('MoneyResult',this.afterBuyPocketMoney);
            formData3.append('moneyAmount',this.buyMoney);
            request.post('/api/finance/buy',formData).then(res => {
                if(res.data == 1){
                    this.$store.dispatch('reloadUserFundHold',this.fundInfo.userId);
                    this.reloadFundInfo();
                    request.post('/api/user/changepm',formData2).then(res => {
                        if(res.data === 1){
                            this.$store.dispatch('reloadUserInfo',this.fundInfo.userId);
                            this.reloadUserMoney();
                            request.post('/api/records/buypocket',formData3).then(res => {
                                if(res.data === 1){
                                    this.confirmWindow = 666;
                                    this.informUpdRecord();
                                }else{
                                    this.confirmWindow = 555;
                                }
                            },err => console.log(err));
                        }else{
                            this.confirmWindow = 555;
                        }
                    },err => console.log(err));
                }else{
                    this.confirmWindow = 555;
                }
            },err => console.log(err));
        },
        buyCardCfm(){
            const formData = new FormData();
            const formData2 = new FormData();
            const formData3 = new FormData();
            formData.append('holdId',this.fundInfo.userHoldId);
            formData.append('newMoney',this.afterBuyBaseMoney);
            formData2.append('cardMoney',this.afterBuyCardMoney);
            formData2.append('cardId',parseInt(this.$refs['moneyPlace'].value));
            formData2.append('userId',this.fundInfo.userId);
            formData3.append('userId',this.fundInfo.userId);
            formData3.append('mainContentId',this.fundInfo.userHoldId);
            formData3.append('objContentId',parseInt(this.$refs['moneyPlace'].value));
            formData3.append('tdate',new Date());
            formData3.append('moneyAmount',this.buyMoney);
            request.post('/api/finance/buy',formData).then(res => {
                if(res.data == 1){
                    this.$store.dispatch('reloadUserFundHold',this.fundInfo.userId);
                    this.reloadFundInfo();
                    request.post('/api/cards/modmoney',formData2).then(res => {
                        if(res.data === 1){
                            this.getMyBankCards(this.fundInfo.userId);
                            request.post('/api/records/buycard',formData3).then(res => {
                                if(res.data == 1){
                                    this.confirmWindow = 666;
                                    this.informUpdRecord();
                                }else{
                                    this.confirmWindow = 555;
                                }
                            },err => console.log(err));
                        }else{
                            this.confirmWindow = 555;
                        }
                    },err => console.log(err));
                }else{
                    this.confirmWindow = 555;
                }
            },err => console.log(err));
        },
        informUpdRecord(){
            this.$bus.$emit('updFundRecord');
        },
        soldAllDone(){
            this.$router.replace({
                name:'myfinance',
            })
        },
    },
    created(){
        if(this.fund === undefined){
            this.$router.push({
                name:'myfinance',
            })
        }else{
            this.fundInfo = this.fund;
            this.financeState = this.fund.financeState;
            this.reloadNum();
            this.reloadUserMoney();
        }
    },
    mounted(){
        // console.log(this.fund);
        // console.log(this.today);
        if(this.fund === undefined){
            
        }else{
            this.createChartsData();
            this.createCharts();
            this.getMyBankCards(this.fund.userId);
            // 此页面买入、卖出、全部卖出不会影响收益
            this.changeNumColor();
            timer = setInterval(() => {
                this.nowTime = this.formatTime();
            },1000);
        }
        
        // 还是搞不懂为什么我刷新页面，created都路由跳出去了，mounted还会执行
        // 添加这个判断可以节省点资源，
    },
    beforeDestroy(){
        clearInterval(timer);
    },
    
}
</script>

<style scoped>
.fund-detail{
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
}
.fund-detail-content{
    width: 670px;
    background-color: #fff;
    position: relative;
}
.fund-detail-title > h2{
    margin-top: 10px;
    margin-left: 20px;
}
.fund-detail-title > span{
    display: inline-block;
    margin-top: 2px;
    margin-left: 20px;
    font-size: 18px;
    color: #999;
}
.fund-detail-profit,
.fund-detail-all-yestaday{
    display: flex;
}
.fund-detail-profit > ul,
.fund-detail-all-yestaday > ul{
    width: 200px;
    margin-top: 30px;
    margin-left: 20px;
}
.fund-detail-profit > ul > li,
.fund-detail-all-yestaday > ul > li{
    width: 200px;
    text-align: center;
}
.fund-detail-profit > ul > li:nth-child(1),
.fund-detail-all-yestaday > ul > li:nth-child(1){
    color: #999;
    font-size: 18px;
}
.fund-detail-profit > ul > li:nth-child(2),
.fund-detail-all-yestaday > ul > li:nth-child(2){
    font-size: 26px;
}
.fund-detail-chart{
    /* background-color: rgb(4, 12, 6); */
    height: 250px;
    width: 400px;
    position: absolute;
    bottom: 0;
    left: 40px;
}
.rise-down-charts{
    margin: 0 auto;
    height: 250px;
    width: 400px;
}
.fund-detail-back{
    position: absolute;
    top: 0;
    right: 0;
}
.fund-detail-trade{
    position: absolute;
    bottom: 0px;
    right: 0px;
}
.fund-detail-back > span,
.fund-detail-trade > span{
    display: inline-block;
    height: 40px;
    line-height: 40px;
    background-color: #007aff;
    color: white;
    padding: 0 10px;
    cursor: pointer;
}
.fund-detail-trade > span:nth-child(1){
    background-color: #007bff2d;
    color: #007aff;
}
.fund-detail-trade > span:nth-child(2){
    background-color: #007bff71;
}
.fund-detail-operation{
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.137);
}
.fund-detail-operation-content{
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 300px;
    background-color: #fff;
}
.fund-detail-operation-content > p{
    height: 50px;
    line-height: 50px;
    font-size: 24px;
    margin-left: 20px;
}
.fund-detail-operation-content > span{
    display: block;
    margin-left: 20px;
    color: #999;
}
.sold-money-go{
    font-size: 20px;
    margin-top: 20px;
    margin-left: 20px;
}
.fund-detail-operation-content > input,
.fund-detail-operation-content > select{
    margin-left: 20px;
    height: 28px;
    line-height: 28px;
    width: 240px;
}
.fund-detail-operation-content > .sdfijbi{
    width: 100px;
    display: inline;
}
.fund-detail-operation-content > .xicvibewr{
    margin-left: 5px;
    display: inline-block;
    font-size: 20px;
}
.fund-detail-operation-buttons{
    position: absolute;
    bottom: 0;
    right: 0;
}
.fund-detail-operation-buttons2{
    position: absolute;
    bottom: 0;
    left: 0;
}
.fund-detail-operation-buttons2 > span,
.fund-detail-operation-buttons > span{
    display: inline-block;
    text-align: center;
    width: 188px;
    height: 40px;
    line-height: 40px;
    background-color: #007aff;
    color: white;
    cursor: pointer;
}
.fund-detail-operation-buttons2 > span{
    background-color: #ff4040;
}
.ad-rate-choice{
    position: absolute;
    right: 120px;
    bottom: 78px;
}
.ad-rate-choice > span{
    display: inline-block;
    text-align: center;
    width: 80px;
    height: 28px;
    line-height: 28px;
    cursor: pointer;
    border-radius: 5px;
    background-color: #e0efff;
    margin-right: 5px;
}
.ad-rate-choice > span:hover,
.fund-detail-back > span:hover,
.fund-detail-trade > span:hover,
.fund-detail-operation-buttons2 > span:hover,
.fund-detail-operation-buttons > span:hover{
    opacity: 0.9;
}
.ad-rate-choice > span:active,
.fund-detail-back > span:active,
.fund-detail-trade > span:active,
.fund-detail-operation-buttons2 > span:active,
.fund-detail-operation-buttons > span:active{
    opacity: 0.7;
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
    height: 300px;
    border-radius: 5px;
    background-color: white;
}
.alter-content p{
    text-align: center;
    font-size: 18px;
    margin: 20px auto;
}
.alter-content > p > span{
    color: #007aff;
    text-decoration: underline;
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

.fund-change-record{
    width: 320px;
    background-color: #fff;
    height: 550px;
}
</style>