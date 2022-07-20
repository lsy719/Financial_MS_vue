<template>
    <div class="chosen1">
        <div class="backtoadd-button" @click="back2add">
            <span><i class="fas fa-angle-double-left"></i>返回</span>
        </div>
        <h3>理财记录添加</h3>
        <div class="content" v-if="fund !== undefined">
            <h2>{{fund.financeName}}</h2><span v-if="doIHave === 1">已记录</span>
            <p>基金代码：{{fund.financeCode}}</p>
        </div>
        <div v-if="doIHave === 1">
            <span class="operate-detail" @click="go2detail">前往查看详情</span>
        </div>
        <div class="operate" v-if="doIHave === 0">
            <p>选择初始金额来源：</p>
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
            <p>设置初始金额(最低100元)：</p>
            <input ref="moneySet" type="text" @keydown="moneySetDown" @keyup="moneySetUp" maxlength="11">
            <span class="operate-add" @click="toSecondCfm">确认添加</span>
        </div>
        <div v-if="confirmWindow === 1" class="alter-background" @click.self="confirmWindow = 0">
            <div class="alter-content">
                <p>添加记录：</p>
                <p style="color:#007aff;text-decoration: underline;">{{fund.financeName}}（{{fund.financeCode}}）</p>
                <p>操作时间：{{nowTime}}</p>
                <p>金额：<span style="color:#007aff;text-decoration: underline;">{{buyMoneyShow}}</span></p>
                <p v-if="$refs['moneyPlace'].value === 'p'">来源：余额</p>
                <p v-if="$refs['moneyPlace'].value > 0 ">来源：银行卡</p>
                <p v-if="$refs['moneyPlace'].value === 'p'" >添加后余额为：<span style="color:#007aff;text-decoration: underline;">{{afterBuyPocketMoneyShow}}</span></p>
                <p v-if="$refs['moneyPlace'].value > 0 " style="color:#007aff;text-decoration: underline;">{{getChoiceCard().cardName + '(' + getChoiceCard().cardKey.slice(-4,) + ')'}}</p>
                <div class="alter-content-buttons">
                    <span v-if="$refs['moneyPlace'].value === 'o'" @click="addOtherCfm">确定</span>
                    <span v-if="$refs['moneyPlace'].value === 'p'" @click="addPocketCfm">确定</span>
                    <span v-if="$refs['moneyPlace'].value > 0" @click="addCardCfm">确定</span>
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
        <div v-show="confirmWindow === 555" class="alter-background" @click.self="back2add">
            <div class="alter-content">
                <p style="color:red">未知错误</p>
            </div>
        </div>
        <div v-show="confirmWindow === 666" class="alter-background" @click.self="back2add">
            <div class="alter-content">
                <p style="color:green">操作完成</p>
            </div>
        </div>
    </div>
</template>

<script>
import request from '../utils/request';
let timer;
let timer2;
export default {
    name:'MyFinanceAddCall',
    props:['fund','fundHold'],
    data(){
        return {
            doIHave:0,
            // 当前页面是已记录的才有这2数据
            haveFundId:'',
            haveFund:'',
            // 当前页面时未记录的才有者2数据
            pocketMoney:0.00,
            myCards: [],
            confirmWindow:0,
            
            nowTime:'',

            buyMoney:0,
            buyMoneyShow:0,

            afterBuyPocketMoney:0,
            afterBuyPocketMoneyShow:0,

            afterBuyCardMoney:0,

            // 之前买过这支基金，后面全部卖出了，但userhold表里没删，更新
            boughtBefore:0,
        }
    },
    methods:{
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
        back2add(){
            this.$router.push({
                name:'myfinanceAdd',
            })
        },
        // 检查是否已记录该基金
        checkHave(){
            if(this.fundHold){
                this.fundHold.forEach(element => {
                    if(this.fund.financeCode === element.financeCode){
                        this.doIHave = 1;
                        this.haveFundId = element.fundHoldId;
                    }
                });
            }
        },
        // 如果已经持有，加载完整信息
        loadThisHad(){
            const formData = new FormData();
            formData.append('userHoldId',this.haveFundId);
            request.post('/api/finance/reloadsolofund',formData).then(res => {
                this.haveFund = res.data.data;
                const formData2 = new FormData();
                formData2.append('userId',this.$store.state.userInfo.id);
                formData2.append('financeCode',this.fund.financeCode);
                request.post('/api/finance/loadfondstate',formData2).then(res => {
                    this.haveFund.financeState = res.data.data;
                },err => console.log(err.message));
            },err => console.log(err.message));
        },
        go2detail(){
            this.$router.replace({
                name:'myfinanceDetail',
                params:{
                    fund:JSON.parse(JSON.stringify(this.haveFund)),
                }
            })
        },
        // 获取，更新余额
        reloadUserMoney(){
            this.pocketMoney = this.$store.state.userInfo.pocketMoney;
        },
        // 获取银行卡
        getMyBankCards(){
            this.$store.dispatch('secondCheck');
            const formData = new FormData();
            formData.append('id',this.$store.state.userInfo.id);
            request.post('/api/cards/loadcards',formData).then(res => {
                if(res.data.code === '0'){
                    this.myCards = res.data.data;
                    // console.log(this.myCards);
                }else{
                    console.log('未知错误')
                }
            },err => console.log(err.message));
        },
        selectTest(){
            this.$refs['moneySet'].value = '';
        },
        setMoney(){
            let money = this.$refs['moneySet'].value;
            money = money.replace(/[^\d]/g,'');

            this.$refs['moneySet'].value = money;
        },
        getChoiceCard(){
            const choiceCard = this.myCards.filter((elem, index, arr) => {
                return elem.cardId === parseInt(this.$refs['moneyPlace'].value);
            })
            return choiceCard[0];
        },
        // 输入买入金额键入键出事件
        moneySetDown(){
            this.setMoney();
        },
        moneySetUp(){
            this.setMoney();
            // 选的是零钱买入
            if(this.$refs['moneyPlace'].value === 'p'){
                if(parseInt(this.$refs['moneySet'].value) > parseInt(this.pocketMoney)){
                    this.$refs['moneySet'].value = parseInt(this.pocketMoney)
                }
            }else if(this.$refs['moneyPlace'].value !== 'o'){
                const choiceCard = this.getChoiceCard();
                if(parseInt(this.$refs['moneySet'].value) > parseInt(choiceCard.cardMoney)){
                    this.$refs['moneySet'].value = parseInt(choiceCard.cardMoney);
                }
            }
        },
        toSecondCfm(){
            if(this.$refs['moneySet'].value === ''){
                this.confirmWindow = 2;
            }else{
                this.buyMoney = parseInt(this.$refs['moneySet'].value);
                this.buyMoneyShow = this.formatNum(this.buyMoney.toFixed(2));
                if(this.buyMoney < 100){
                        this.confirmWindow = 100;
                }else{
                    this.confirmWindow = 1;
                }
                if(this.$refs['moneyPlace'].value === 'o'){
                // console.log('其它支付买入');
                }else if(this.$refs['moneyPlace'].value === 'p'){
                    // console.log('余额支付买入');
                    this.afterBuyPocketMoney = parseFloat(this.pocketMoney - this.buyMoney).toFixed(2);
                    this.afterBuyPocketMoneyShow = this.formatNum(this.afterBuyPocketMoney);
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

        addOtherCfm(){
            const userId = this.$store.state.userInfo.id;
            const timeAdd = new Date();
            // 往userhold表添加数据
            const formData = new FormData();
            const formData2 = new FormData();
            const formData3 = new FormData();
            formData.append('userId',userId);
            formData.append('financeCode',this.fund.financeCode);
            formData.append('baseMoney',parseFloat(this.buyMoney).toFixed(2));
            formData.append('iniDate',timeAdd);
            formData2.append('userId',userId);
            formData2.append('fundCode',this.fund.financeCode);
            formData3.append('userId',userId);
            formData3.append('tdate',new Date());
            formData3.append('moneyAmount',this.buyMoney);
            if(this.boughtBefore === 1){// 以前买过了，全部卖出了
                request.post('/api/finance/fundnewholdupd',formData).then(res => {
                    if(res.data === 1){
                        this.$store.dispatch('reloadUserFundHold',userId);
                        // 成功添加后还要向后台获取userHoldId，来添加到交易记录中
                        request.post('/api/finance/fundidjustadd',formData2).then(res => {
                            const newFundId = res.data;
                            formData3.append('mainContentId',newFundId);
                            request.post('/api/records/addother',formData3).then(res => {
                                if(res.data === 1){
                                    this.confirmWindow = 666;
                                }else{
                                    this.confirmWindow = 555;
                                }
                            },err => console.log(err));
                        },err => console.log(err));
                    }else{
                        this.confirmWindow = 555;
                    }
                },err => console.log(err));
            }else{
                request.post('/api/finance/fundnewhold',formData).then(res => {
                    if(res.data === 1){
                        this.$store.dispatch('reloadUserFundHold',userId);
                        // 成功添加后还要向后台获取userHoldId，来添加到交易记录中
                        request.post('/api/finance/fundidjustadd',formData2).then(res => {
                            const newFundId = res.data;
                            formData3.append('mainContentId',newFundId);
                            request.post('/api/records/addother',formData3).then(res => {
                                if(res.data === 1){
                                    this.confirmWindow = 666;
                                }else{
                                    this.confirmWindow = 555;
                                }
                            },err => console.log(err));
                        },err => console.log(err));
                    }else{
                        this.confirmWindow = 555;
                    }
                },err => console.log(err));
            }
            
            // 添加交易记录
        },
        addPocketCfm(){
            const userId = this.$store.state.userInfo.id;
            const timeAdd = new Date();
            const formData = new FormData();
            const formData2 = new FormData();
            const formData3 = new FormData();
            const formData4 = new FormData();
            formData2.append('userId',userId);
            formData2.append('newMoney',this.afterBuyPocketMoney);

            formData.append('userId',userId);
            formData.append('financeCode',this.fund.financeCode);
            formData.append('baseMoney',parseFloat(this.buyMoney).toFixed(2));
            formData.append('iniDate',timeAdd);

            formData3.append('userId',userId);
            formData3.append('fundCode',this.fund.financeCode);

            formData4.append('userId',userId);
            formData4.append('tdate',timeAdd);
            formData4.append('MoneyResult',this.afterBuyPocketMoney);
            formData4.append('moneyAmount',this.buyMoney);
            // 修改余额(给我一个这里修改余额之后不用更新vuex的理由)
            // 没有？this.$store.dispatch('reloadUserInfo',this.fundInfo.userId);
            if(this.boughtBefore === 1){
                request.post('/api/user/changepm',formData2).then(res => {
                    if(res.data === 1){
                        this.$store.dispatch('reloadUserInfo',userId);
                        request.post('/api/finance/fundnewholdupd',formData).then(res => {
                            if(res.data === 1){
                                this.$store.dispatch('reloadUserFundHold',userId);
                                request.post('/api/finance/fundidjustadd',formData3).then(res => {
                                    const newFundId = res.data;
                                    formData4.append('mainContentId',newFundId);
                                    request.post('/api/records/addpocket',formData4).then(res => {
                                        if(res.data === 1){
                                            this.confirmWindow = 666;
                                        }else{
                                            this.confirmWindow = 555;
                                        }
                                    },err => console.log(err));
                                },err => console.log(err));
                            }else{
                                this.confirmWindow = 555;
                            }
                        },err => console.log(err));
                    }else{
                        this.confirmWindow = 555;
                    }
                },err => console.log(err))
            }else{
                request.post('/api/user/changepm',formData2).then(res => {
                    if(res.data === 1){
                        this.$store.dispatch('reloadUserInfo',userId);
                        request.post('/api/finance/fundnewhold',formData).then(res => {
                            if(res.data === 1){
                                this.$store.dispatch('reloadUserFundHold',userId);
                                request.post('/api/finance/fundidjustadd',formData3).then(res => {
                                    const newFundId = res.data;
                                    formData4.append('mainContentId',newFundId);
                                    request.post('/api/records/addpocket',formData4).then(res => {
                                        if(res.data === 1){
                                            this.confirmWindow = 666;
                                        }else{
                                            this.confirmWindow = 555;
                                        }
                                    },err => console.log(err));
                                },err => console.log(err));
                            }else{
                                this.confirmWindow = 555;
                            }
                        },err => console.log(err));
                    }else{
                        this.confirmWindow = 555;
                    }
                },err => console.log(err))
            }
            
            // this.$store.dispatch('reloadUserInfo',this.fundInfo.userId);
            // 往userhold表添加数据
            // this.$store.dispatch('reloadUserFundHold',this.fundInfo.userId);
            // 添加交易记录
            // 退出当前页面到MyFinanceAdd 
        },
        addCardCfm(){
            const userId = this.$store.state.userInfo.id;
            const timeAdd = new Date();
            const cardId = parseInt(this.$refs['moneyPlace'].value);
            const formData = new FormData();
            const formData2 = new FormData();
            const formData3 = new FormData();
            const formData4 = new FormData();
            formData2.append('cardMoney',this.afterBuyCardMoney);
            formData2.append('cardId',cardId);
            formData2.append('userId',userId);

            formData.append('userId',userId);
            formData.append('financeCode',this.fund.financeCode);
            formData.append('baseMoney',parseFloat(this.buyMoney).toFixed(2));
            formData.append('iniDate',timeAdd);

            formData3.append('userId',userId);
            formData3.append('fundCode',this.fund.financeCode);

            formData4.append('userId',userId);
            formData4.append('objContentId',cardId);
            formData4.append('tdate',timeAdd);
            formData4.append('moneyAmount',this.buyMoney);
            if(this.boughtBefore === 1){
                request.post('/api/cards/modmoney',formData2).then(res => {
                    if(res.data === 1){
                        request.post('/api/finance/fundnewholdupd',formData).then(res => {
                            if(res.data === 1){
                                this.$store.dispatch('reloadUserFundHold',userId);
                                request.post('/api/finance/fundidjustadd',formData3).then(res => {
                                    const newFundId = res.data;
                                    formData4.append('mainContentId',newFundId);
                                    request.post('/api/records/addcard',formData4).then(res => {
                                        if(res.data === 1){
                                            this.confirmWindow = 666;
                                        }else{
                                            this.confirmWindow = 555;
                                        }
                                    },err => console.log(err));
                                },err => console.log(err));
                            }else{
                                this.confirmWindow = 555;
                            }
                        },err => console.log(err));
                    }else{
                        this.confirmWindow = 555;
                    }
                },err => console.log(err))
            }else{
                request.post('/api/cards/modmoney',formData2).then(res => {
                    if(res.data === 1){
                        request.post('/api/finance/fundnewhold',formData).then(res => {
                            if(res.data === 1){
                                this.$store.dispatch('reloadUserFundHold',userId);
                                request.post('/api/finance/fundidjustadd',formData3).then(res => {
                                    const newFundId = res.data;
                                    formData4.append('mainContentId',newFundId);
                                    request.post('/api/records/addcard',formData4).then(res => {
                                        if(res.data === 1){
                                            this.confirmWindow = 666;
                                        }else{
                                            this.confirmWindow = 555;
                                        }
                                    },err => console.log(err));
                                },err => console.log(err));
                            }else{
                                this.confirmWindow = 555;
                            }
                        },err => console.log(err));
                    }else{
                        this.confirmWindow = 555;
                    }
                },err => console.log(err))
            }
            
            // 修改对应银行卡余额
            // 往userhold表添加数据
            // this.$store.dispatch('reloadUserFundHold',this.fundInfo.userId);
            // 添加交易记录
            // 退出当前页面到MyFinanceAdd 
        },
        checkBoughtBefore(){
            timer2 = setTimeout(() => {
                const userId = this.$store.state.userInfo.id;
                const fundCode = this.fund.financeCode;
                const formData = new FormData();
                formData.append('userId',userId);
                formData.append('fundCode',fundCode);
                request.post('/api/finance/checkhadBought',formData).then(res => {
                    if(res.data === 1){
                        this.boughtBefore = 1;
                    }else{
                        this.boughtBefore = 0;
                    }
                },err => console.log(err))
            })
        }
    },
    created(){
        if(this.fund === undefined){
            this.back2add();
        }else{
            this.checkHave();
            if(this.doIHave === 1){
                this.loadThisHad();
            }else{
                this.reloadUserMoney();
                this.getMyBankCards();
                this.nowTime = this.formatTime();
            }
        };
        this.checkBoughtBefore();
    },
    mounted(){
        timer = setInterval(() => {
            this.nowTime = this.formatTime();
        },1000);
    },
    beforeDestroy(){
        clearInterval(timer);
        clearInterval(timer2);
    },
}
</script>

<style scoped>
.chosen1{
    position: relative;
    background-color: #fff;
    padding-bottom: 20px;
}
.chosen1 > h3{
    margin-top: 5px;
    padding-left: 8px;
    background-color: aliceblue;
}
.backtoadd-button{
    position: fixed;
    top: 240px;
    right: 50%;
    margin-right: 510px;
    cursor: pointer;
    width: 18px;
    text-align: center;
}
.content > h2{
    display: inline-block;
    margin-top: 10px;
    margin-left: 10px;
    margin-right: 20px;
}
.content > span {
    display: inline-block;
    font-size: 12px;
    padding: 3px 5px;
    color: #fff;
    background-color: green;
    border-radius: 5px;
}
.content > p{
    margin-top: 5px;
    margin-left: 10px;
}
.operate-detail{
    display: inline-block;
    margin-left: 10px;
    margin-top: 20px;
    height: 48px;
    line-height: 48px;
    padding: 0 50px;
    color: #fff;
    border: 1px solid #007aff;
    background-color: #429dff;
    cursor: pointer;
}
.operate-detail:hover{
    opacity: 0.9;
}
.operate-detail:active{
    opacity: 0.6;
}
.operate > p{
    margin-top: 20px;
    margin-left: 20px;
    font-size: 18px;
}
.operate > select,
.operate > input{
    display: block;
    margin-left: 20px;
    height: 28px;
    line-height: 28px;
    width: 240px;
    outline: 0px;
}
.operate-add{
    display: inline-block;
    margin-left: 20px;
    margin-top: 40px;
    height: 48px;
    line-height: 48px;
    padding: 0 50px;
    color: #fff;
    border: 1px solid #007aff;
    background-color: #429dff;
    cursor: pointer;
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
    min-height: 200px;
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
    height: 30px;
    width: 80px;
    line-height: 26px;
    text-align: center;
    /* color: #965151; */
    color: #fff;
    background-color: #3396ff;
    border-radius: 5px;
    cursor: pointer;
    margin: 20px 20px;
    border: 2px solid #007aff;
}
.alter-content-buttons span:hover{
    opacity: 0.8;
}
.alter-content-buttons span:active{
    opacity: 0.5;
}
</style>