<template>
    <div>
        <div class="card-add">
            <div class="card-add-title">
                <div>
                    <span style="font-weight:bold">我的卡</span>
                    <span>共({{cardsNum}})张</span>
                </div>
                <div class="back-card" @click="back">
                    返回
                </div>
                <div class="all-money">
                    <span style="color:#999">总余额：</span>
                    <span v-if="!showMoney" style="color:#007aff">***</span>
                    <span v-if="showMoney" style="color:#007aff">{{allMoney}}元</span>
                    <span v-if="showMoney" @click="eyeOpen" class="show-eye"><i class="fas fa-eye"></i></span>
                    <span v-if="!showMoney" @click="eyeClose" class="show-eye"><i class="fas fa-eye-slash"></i></span>
                </div>
            </div>
        </div>
        <div class="card-add-input">
            <div class="card-add-slogan">添加银行卡</div>
            <div class="card-add-write">输入卡号添加</div>
            <input @keydown="cardKeyFormat" @keyup="cardSearch" ref="cardKey" class="card-add-write-input" type="text" maxlength="23"><br>
            <div v-show="bankGetted === 0" class="prompt-message">
                <span>未查询到此号码的相关信息，请检查，或手动输入卡全称</span>
            </div>
            <ul class="card-band-info" v-show="cardkeyCompleted === 1">
                <li v-show="bankGetted === 1">
                    <div class="card-band-lable">银行</div>
                    <div class="card-bind-content">
                        <input type="text" :value="bankName" disabled>
                    </div>
                </li>
                <li v-show="bankGetted === 1">
                    <div class="card-band-lable">卡类型</div>
                    <div class="card-bind-content">
                        <input type="text" :value="cardType" disabled>
                    </div>
                </li>
                <li>
                    <div class="card-band-lable">卡全称</div>
                    <div class="card-bind-content">
                        <input type="text" @keyup="cardWholeName" @keydown="cardWholeName" :value="cardName" ref="cardWholeName" maxlength="25">
                    </div>
                </li>
            </ul>
            <ul class="card-band-info"  v-show="cardkeyCompleted === 1">
                <li>
                    <div class="card-band-lable">余额</div>
                    <div class="card-bind-content">
                        <input type="text" ref="money" @keydown="setMoneyDown" @keyup="setMoneyUp">
                    </div>
                </li>
            </ul>
            <div v-show="bankGetted === 0" class="sumbit-card" @click="toConfirm">提交卡号</div>
            <div v-show="bankGetted === 1" class="confirm-bind" @click="toConfirm">确认绑定</div>

            <div style="height: 20px;width: 100%"></div>
        </div>
        
        <!-- 修改账号弹窗 -->
        <div v-show="alterWindow === 1" class="alter-background" @click.self="cancle">
            <div class="alter-content" v-show="HTTPResponse === 0">
                <div class="alert-top">
                    <span>Confirm</span>
                    <span style="font-size:26px;" @click="cancle" v-if="HTTPResponse !== 1">×</span>
                </div>
                <div class="alter-words">
                    <div class="alter-img">
                        <img src="/img/Warning.png" alt="">
                    </div>
                    <h3 v-show="moneySet === 1">确认添加该银行卡吗？</h3>
                    <h3 v-show="moneySet === 0 && cardNameSet === 1" style="color:red">余额暂未填写，确认添加该银行卡吗？</h3>
                    <h3 v-show="cardNameSet === 0" style="color:red">卡全称不能为空</h3>
                </div>
                <ul v-show="cardNameSet === 1">
                    <li @click="confirmAdd">确定</li>
                    <li @click="cancle">取消</li>
                </ul>
            </div>
        </div>
        <div v-show="alterWindow === 2" class="alter-background">
            <div class="alter-content" v-show="HTTPResponse !== 0">
                <div class="alert-top">
                    <span>Confirm</span>
                    <span style="font-size:26px;" @click="cancle" v-if="HTTPResponse !== 1">×</span>
                </div>
                <div class="alter-words">
                    <div class="alter-img">
                        <img src="/img/Warning.png" alt="">
                    </div>
                    <h3 v-show="HTTPResponse === 4" style="color:red">已绑定该卡，不可重复绑定</h3>
                    <h3 v-show="HTTPResponse === 999" style="color:red">未知错误</h3>
                    <h3 v-show="HTTPResponse === 1" >绑定成功，{{countDown}}秒后退出</h3>
                </div>
                <ul v-show="HTTPResponse === 4 || HTTPResponse === 999">
                    <li @click="cancle">取消</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import request from '../utils/request';
const BIN = require('bankcardinfo')
export default {
    name:'UserInfoCardAdd',
    props:['nowPageS','cardsNum','allMoney'],//32
    data(){
        return {
            showMoney:0,
            cardType:'',
            cardkeyCompleted:0,
            bankGetted: -1,
            /**
             *  -1：未输入完整
             *  
             *  0:输入完整未找到
             *  1:输入完整找到
             * 
             *  卡全称已填写，卡全称未填写
             */

            /**
             * 控制弹窗显示 1显示 0隐藏
             * 余额已填写 1 
             * 余额未填写 0
             */

            alterWindow:0,
            moneySet:0,
            cardNameSet:0,

            userId:'',
            cardKey:'',
            cardName:'',
            cardMoney:0.00,
            bankCode:'',
            bankName:'',

            // 请求收到结果 0:未收到（未发送）、
            // 1:已收到成功添加 、4:已收到，不可重复绑定，添加失败、
            // 999：未知错误
            HTTPResponse:0,

            countDown:2,
            timer: null,
        }
    },
    methods:{
        eyeOpen(){
            this.showMoney = 0;
        },
        eyeClose(){
            this.showMoney = 1;
        },
        back(){
            this.$router.push({
                name:'userCards',
            })
        },
        // onkeydown
        cardKeyFormat(e){
            // console.log(e.keyCode);
            /**
             * backspace键：8
             * delete键：46
             * 空格：32
             * 
             * 唉别自己和自己过不去
             * 不会输入空格的
             * 19位复制进来的肯定是对的不要管
             * 谁用delete？？
             */
            let cardKeyStr = this.$refs['cardKey'].value;
            // if(e.keyCode !== 8 && e.keyCode !== 46){
            if(e.keyCode !== 8){
                // console.log(this.$refs['cardKey'].value);
                // 输入的不是数字或空格就不显示,在此设置是为了防止按住输入连续字符
                cardKeyStr = cardKeyStr.replace(/[^\d\s]/g,'');
                this.$refs['cardKey'].value = cardKeyStr;
                // 什么时候加空格？
                // 每次都先去掉其中所有空格，再循环去加
                cardKeyStr = cardKeyStr.replace(/[\s]/g,'');
                for(let i = 4; i <= cardKeyStr.length; i+=5){
                    cardKeyStr = cardKeyStr.slice(0,i) + ' ' + cardKeyStr.slice(i);
                }
                this.$refs['cardKey'].value = cardKeyStr;
            }else if(e.keyCode === 8){
                // 如果是回退键backspace，删到带空格的那一位时也要自动把空格删掉
                if(cardKeyStr.charAt(cardKeyStr.length - 1) === ' '){
                    cardKeyStr = cardKeyStr.slice(0,cardKeyStr.length-1);
                }
                this.$refs['cardKey'].value = cardKeyStr;
            }
        },
        // onkeyup
        // 保证输入格式的方法绑定在keypress事件上，导致最后输入的一位取不到，所以自动搜索银行卡的方法绑定到keyup上为一个新的函数
        cardSearch(){
            let cardKeyStr = this.$refs['cardKey'].value;
            cardKeyStr = cardKeyStr.replace(/[^\d\s]/g,'');
            this.$refs['cardKey'].value = cardKeyStr;
            cardKeyStr = cardKeyStr.replace(/[\s]/g,'');
            if(cardKeyStr.length <= 19 && cardKeyStr.length >= 13){
                this.cardkeyCompleted = 1;
                // console.log(cardKeyStr);
                BIN.getBankBin(cardKeyStr,(err,data)=>{
                    if(!err){
                        // console.log(data);
                        this.cardType = data.cardTypeName;
                        if(data.bankName !== '' && data.cardTypeName !== ''){
                            this.bankGetted = 1;
                            this.cardNameSet = 1;
                            // 可能提交
                            this.cardName = data.bankName + data.cardTypeName;
                            this.cardKey = cardKeyStr;
                            this.bankCode = data.bankCode;
                            this.bankName = data.bankName;
                        }else{
                            this.cardName = '';
                            this.bankGetted = 0;
                            // 可能提交
                            this.cardKey = cardKeyStr;
                            this.bankCode = '';
                            this.bankName = '';
                        }
                    }else{
                        this.cardType = '',
                        this.cardName = '',
                        this.bankGetted = 0;
                        // 可能提交
                        this.cardKey = cardKeyStr;
                        this.bankCode = '';
                        this.bankName = '';
                    }
                });
            }else{
                this.cardkeyCompleted = 0;
                this.bankGetted = -1;
                this.HTTPResponse = 0;
            }
        },
        cardWholeName(){
            // console.log(this.$refs['cardWholeName'].value);
            let cardNm = this.$refs['cardWholeName'].value;
            cardNm =  cardNm.replace(/[\s]/g,'');
            this.$refs['cardWholeName'].value = cardNm;
            this.cardName = cardNm;
            if(this.cardName === ''){
                this.cardNameSet = 0;
                this.HTTPResponse = 0;
            }else{
                this.cardNameSet = 1;
            }
            // console.log('@',this.cardName);
        },
        // 余额输入的键入键出事件
        setMoneyDown(){
            let money = this.$refs['money'].value;
            // 清除数字和.以外的字符
            money = money.replace(/[^\d.]/g,'');
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
            // 清除数字和.以外的字符
            money = money.replace(/[^\d.]/g,'');
            // 验证第一个字符是数字
            money = money.replace(/^\./g,'');
            // 只保留一个.,清除多余的
            money = money.replace(/\.{2,}/g,'');
            // 只能输入两位小数
            money = money.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3')
            // money = money.replace(/[^\d{1,}\.\d{1,}|\d{1,}]/g,'');
            this.$refs['money'].value = money;

            if(money === ''){
                // console.log('@');
            }else{
                this.moneySet = 1;
                this.cardMoney = 0;
            }
            this.cardMoney = parseFloat(money).toFixed(2);
        },
        toConfirm(){
            // console.log('userId',this.$store.state.userInfo.id);
            // console.log('cardKey',this.cardKey);
            // console.log('cardName',this.cardName);
            // console.log('cardMoney',this.cardMoney);
            // console.log('bankCode',this.bankCode);
            // console.log('bankName',this.bankName);
            this.alterWindow = 1;
        },
        confirmAdd(){
            const formData = new FormData();
            formData.append('userId',this.$store.state.userInfo.id);
            formData.append('cardKey',this.cardKey);
            formData.append('cardName',this.cardName);
            formData.append('cardMoney',this.cardMoney);
            formData.append('bankCode',this.bankCode);
            formData.append('bankName',this.bankName);
            request.post('/api/cards/addbankcard',formData).then(res => {
                // console.log(res.data);
                this.alterWindow = 2;
                if(res.data === 1){//添加成功
                    this.getCardIdJustAdd(this.$store.state.userInfo.id, this.cardKey);
                    // this.HTTPResponse = 1;
                    // this.timer = setInterval(() => {
                    //     // console.log(this.countDown);
                    //     if(this.countDown === 0){
                    //         this.timer && this.clearTimer();
                    //         this.$router.push({
                    //             name:'userCards',
                    //         })
                    //     }else{
                    //         this.loading();
                    //     }
                    // },1000);
                }else if(res.data === 4){
                    this.HTTPResponse = 4;
                }else{
                    this.HTTPResponse = 999;
                }
            },err => console.log(err.message))
        },
        cancle(){
            this.alterWindow = 0;
            this.HTTPResponse = 0;
        },
        // 启动定时器
        loading(){
            this.countDown -= 1;
        },
        clearTimer(){
            clearInterval(this.timer);
            this.timer = null;
        },
        // 获取刚添加的银行卡的id
        getCardIdJustAdd(userId,cardKey){
            const formData = new FormData();
            formData.append('userId',userId);
            formData.append('cardKey',cardKey);
            request.post('/api/cards/getidjustadd',formData).then(res => {
                if(res.data !== 0){
                    // console.log(res.data);
                    // return res.data;
                    this.cardBindRecord(res.data);
                }else{
                    return 0;
                }
            },err => console.log(err));
        },
        cardBindRecord(cardId){
            // console.log('userId',this.$store.state.userInfo.id);
            // console.log('mainMark',1);//银行卡为1
            // console.log('mainContentId',cardId);//刚刚添加的银行卡Id
            // console.log('vmark', 1);//添加银行卡为1
            // console.log('tdate',new Date());
            // console.log('moneyAmount',this.cardMoney);
            const formData = new FormData();
            formData.append('userId',this.$store.state.userInfo.id);
            formData.append('mainMark',1);
            formData.append('mainContentId',cardId);
            formData.append('vmark', 1);
            formData.append('tdate',new Date());
            formData.append('moneyAmount',this.cardMoney);
            request.post('/api/records/cardaddunbind',formData).then(res => {
                // console.log(res.data);
                if(res.data === 1){
                    this.HTTPResponse = 1;
                    this.timer = setInterval(() => {
                        // console.log(this.countDown);
                        if(this.countDown === 0){
                            this.timer && this.clearTimer();
                            this.$router.push({
                                name:'userCards',
                            })
                        }else{
                            this.loading();
                        }
                    },1000);
                }else{
                    this.HTTPResponse = 999;
                }
            },err => console.log(err));
        }

    },
    created(){
        // console.log(this.cardsNum,this.allMoney);
        if(this.cardsNum === undefined || this.allMoney === undefined){
            this.$router.push({
                name:'userCards',
            })
        }
    },
    mounted(){
        this.$store.commit('changePageS',this.nowPageS);
        this.$nextTick(() => {
            this.$refs['cardKey'].focus();
        })
    },
    beforeDestroy(){

    }
}
</script>

<style scoped>
.card-add{
    height: 100%;
    background-color: white;
    overflow: hidden;
}
.card-add-title{
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
}
.card-add-title span{
    margin-left: 5px;
}
.all-money{
    margin-right: 20px;
}
.show-eye{
    cursor: pointer;
    color: #999;
}
.show-eye:hover{
    color: rgb(80, 80, 80);
}
.back-card{
    cursor: pointer;
    color: #007aff;
}
.back-card:hover{
    text-decoration: underline;
}
.card-add-input{
    height: 100%;
    width: 100%;
    background-color: rgb(204, 204, 204);
}
.card-add-slogan{
    padding-left: 10px;
    font-size: 20px;
    font-weight: bold;
}
.card-add-write{
    margin-top: 20px;
    padding-left: 10px;
    font-size: 16px;
}
.card-add-write-input{
    margin-top: 10px;
    margin-left: 10px;
    margin-bottom: 10px;
    height: 30px;
    width: 200px;
    outline: 0px;
    padding-left: 10px;
}
.card-band-info{
    margin: 10px 10px;
    border-radius: 5px;
    border: 1px solid #999;
    border-bottom: none;
    overflow: hidden;
}
.card-band-info li{
    font-size: 14px;
    height: 30px;
    line-height: 30px;
    border-bottom: 1px solid #999;
    display: flex;
}
.card-band-lable{
    width: 60px;
    margin-left: 10px;
}
.card-bind-content{
    margin-right: 10px;
}
.card-bind-content input{
    height: 25px;
    width: 300px;
}
.sumbit-card, 
.confirm-bind{
    width: 100px;
    height: 30px;
    border-radius: 5px;
    text-align: center;
    line-height: 30px;
    background-color: #3396ff;
    margin-top: 10px;
    margin-left: 10px;
    cursor: pointer;
    color: #fff;
}
.sumbit-card:hover, .confirm-bind:hover{
    background-color: #1988ff;
}
.sumbit-card:active, .confirm-bind:active{
    background-color: #12569e;
}
.prompt-message{
    margin-left: 10px;
    font-size: 14px;
    color: rgb(88, 0, 0);
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
    height: 230px;
    border-radius: 5px;
    background-color: white;
}
.alert-top{
    width: 100%;
    height: 30px;
    background-color: #999;
    border-radius: 5px 5px 0 0;
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
}
.alert-top span{
    display: inline-block;
    line-height: 30px;
    font-size: 14px;
    color: #fff;
}
.alert-top span:nth-child(2){
    cursor: pointer;
    user-select: none;
}
.alert-top span:nth-child(2):hover{
    color: #eee;
}
.alert-top span:nth-child(2):active{
    color: #ccc;
}
.alter-words{
    display: flex;
}
.alter-words h3{
    margin: 0 20px;
    margin-top: 25px;
}
.alter-words .alter-img{
    width: 100px;
    height: 100px;
    /* border: 1px solid #999; */
    margin-top: 20px;
    margin-left: 30px;
}
.alter-img img{
    width: 100px;
    height: 100px;
}
.alter-content ul{
    margin-top: 25px;
    display: flex;
    justify-content: right;
    gap: 50px;
    margin-right: 50px;
}
.alter-content ul li {
    cursor: pointer;
    display: inline-block;
    border: 2px solid #999;
    border-radius: 5px;
    padding: 5px 15px;
    
}
.alter-content ul li:hover{
    opacity: 0.8;
}
</style>