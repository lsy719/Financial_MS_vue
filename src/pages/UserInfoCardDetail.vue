<template>
    <div class="one-card">
        <div class="card-detail" @click.self="nowMod = 0">
            <h2>{{card.cardName}}</h2>
            <div class="card-detail-bank" @click.self="nowMod = 0">
                <!-- vue多级渲染机制，一开始只看bank，和bank同级的card的属性，不会看bank里面的，然后再去看bank里面的。所以最终会正常显示，但前两次渲染时遍历会报错 -->
                <div  v-if="card.bank != undefined" class="card-detail-bank-img">
                    <img :src="card.bank.bankImg">
                </div>
                <div v-if="card.bank != undefined">
                    <p class="title">{{card.bank.bankName}}</p>
                    <li class="card-key">
                        <!-- {{card.cardKey}}<br> -->
                        <span v-for="(cardKey,index) in cardKeylist" :key="index">
                            {{cardKey}}
                        </span>
                    </li>
                    <li>{{cardTypeName}}</li>
                </div>
            </div>
            <div class="card-detail-info">
                <ul class="money" @click.self="nowMod = 0">
                    <li>余额:&nbsp;&nbsp;{{card.cardMoney}}</li>
                    <!-- <li @click="nowMod = 1"> -->
                    <li>
                        <span @click="nowMod = 11" class="modify modify-2">转入<i class="fas fa-reply"></i></span>
                        <span @click="nowMod = 16" class="modify modify-2">转出<i class="fas fa-share-square"></i></span>
                    </li>
                </ul>
                <ul class="note" @click.self="nowMod = 0">
                    <li v-show="!card.cardNote">银行卡备注:&nbsp;&nbsp;暂无</li>
                    <li v-show="card.cardNote">银行卡备注:&nbsp;&nbsp;{{card.cardNote}}</li>
                    <li v-show="!card.cardNote" class="modify" @click="nowMod = 2">设置</li>
                    <li v-show="card.cardNote" class="modify" @click="nowMod = 2">修改</li>
                </ul>
            </div>
            <div class="card-detail-buttons">
                <span @click="toUnbind">解除绑定</span>
                <span @click="back">返回</span>
            </div>
            <!-- <div ref="money" class="mod-money">
                <input ref="moneySet" type="text" :value="card.cardMoney">
                <button @click="confirmSet">确定</button>
                <button @click="nowMod = 0">取消</button>
                <button @click="resetMoney">重置</button>
            </div> -->

            <!-- 细分为转入和转出 -->
            <div v-if="nowMod === 11 || nowMod === 16" class="mod-money">
                <p v-show="nowMod === 11">当前为：转入<i class="fas fa-reply"></i></p>
                <p v-show="nowMod === 16">当前为：转出<i class="fas fa-share-square"></i></p>
                <!-- 转入填写 -->
                <input v-if="nowMod === 11" @keydown="setMoneyDown" @keyup="setMoneyUp" ref="money" type="text" maxlength="10">
                <!-- 转出填写 -->
                <input v-if="nowMod === 16" @keydown="dropMoneyDown" @keyup="dropMoneyUp" ref="money" type="text" maxlength="10">
                <span @click="toSecondCfm">确认</span>
                <span @click="cancle">取消</span>
            </div>

            <!-- 设置备注 -->
            <div v-if="nowMod === 2" ref="note" class="mod-note">
                <div class="take-note-action">
                    <input type="text" :value="noteOn" maxlength="6" placeholder="最多输入6个字" ref="inputNote">
                    <span @click="saveNote">确认</span>
                    <span @click="nowMod = 0" style="background-color:#318d38">取消</span>
                </div>
                <ul class="take-notes-list">
                    <BankCardNote
                        v-for="note in cardNotes" :key="note.cardNoteId"
                        :note = "note"
                    />
                </ul>
            </div>
        </div>
        <div class="card-change">
            <RecordObj :target="1" :cardId = 'cardId'/>
        </div>
        <!-- 二次确认弹窗 -->
        <div v-show="alterWindow === 1" class="alter-background" @click.self="alterWindow = 0">
            <div class="alter-content">
                <p v-show="nowMod === 11">转入金额：<span>{{actionMoneyShow}}</span></p>
                <p v-show="nowMod === 16">转出金额：<span>{{actionMoneyShow}}</span></p>
                <p>操作时间：{{nowTime}}</p>
                <p>本次操作后卡内余额为：<span>{{cardMoneyAfterAShow}}</span></p>
                <div class="alter-content-buttons">
                    <span @click="moneyActionCfm">确定</span>
                    <span @click="alterWindow = 0" style="background-color:#318d38">取消</span>
                </div>
            </div>>
        </div>
        <div v-show="alterWindow === -1" class="alter-background" @click.self="alterWindow = 0">
            <div class="alter-content">
                <p style="color:red">需填写有效金额</p>
            </div>
        </div>
        <div v-show="alterWindow === 666" class="alter-background" @click.self="alterWindow = 0">
            <div class="alter-content">
                <p style="color:green">操作完成</p>
            </div>
        </div>
        <div v-show="alterWindow === 555" class="alter-background" @click.self="alterWindow = 0">
            <div class="alter-content">
                <p style="color:red">未知错误</p>
            </div>
        </div>
        <div v-show="alterWindow === 321" class="alter-background" @click.self="alterWindow = 0">
            <div class="alter-content">
                <p>确定解除绑定此卡吗？</p>
                <p>{{card.cardName}}</p>
                <p>{{cardKeylist.join(' ')}}</p>
                <div class="alter-content-buttons">
                    <span @click="cardUnbindCfm">确定</span>
                    <span @click="alterWindow = 0" style="background-color:#318d38">取消</span>
                </div>
            </div>
        </div>
        <div v-show="alterWindow === 321666" class="alter-background" @click.self="unbindDone">
            <div class="alter-content">
                <p style="color:green">解绑操作完成</p>
            </div>
        </div>
    </div>
</template>

<script>
let timer;
import request from '../utils/request';
import BankCardNote from '../components/BankCardNote.vue';
import RecordObj from '../components/RecordObj.vue'
const BIN = require('bankcardinfo')
export default {
    name:'UserInfoCardDetail',
    components:{BankCardNote, RecordObj},
    props:['nowPageS','cardId','userId'],//32
    data(){
        return {
            isRouterAlice:true,
            card: [],
            cardTypeName:'',
            cardInfo:'',
            cardNotes:'',
            // 正在修改：0：无；1，余额  11:转入 16：转出 ；2.备注
            nowMod:0, 
            noteOn:'',
            alterWindow: 0,
            moneyIn:0.00,
            moneyOut:0.00,
            nowTime:'',
            actionMoney:0.00,
            cardMoneyAfterA:0.00,
        }  
    },
    computed:{
        cardKeylist(){  
            let cardKeyArr = [];
            // 防报错
            if(this.card){
                if(this.card.cardKey){
                    for(let i = 0; i < this.card.cardKey.length; i += 4){
                        cardKeyArr.push(this.card.cardKey.slice(i, i+4));
                    }
                }
            }
            // console.log(cardKeyArr);
            return cardKeyArr;
        },
        actionMoneyShow(){
            return this.formatNum(this.actionMoney.toFixed(2));
        },
        cardMoneyAfterAShow(){
            return this.formatNum(this.cardMoneyAfterA.toFixed(2));
        }
    },
    watch:{
        card:{
            deep:true,
            immediate:true,
            handler(newValue){
                // console.log(newValue.cardMoney);
                this.card = newValue;
            }
        },
        // 切换转入转出时清空输入框
        nowMod(newValue){
            if(this.$refs['money']){
                this.$refs['money'].value = '';
            }
        },
    },
    methods:{
        // 获取当前时间
        // 准备给交易记录，交易记录时间直接存new Date()，后端也无需格式化，前端来(因为需要时分秒)
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
        resetMoney(){
            this.$refs['moneySet'].value = this.card.cardMoney;
        },
        confirmSet(value, vmark){
            let newMoney = value;
            newMoney = parseFloat(newMoney).toFixed(2);
            // console.log(newMoney);
            const formData = new FormData();
            formData.append('cardMoney',newMoney);
            formData.append('cardId',this.card.cardId);
            formData.append('userId',this.card.userId);
            request.post('/api/cards/modmoney',formData).then(res => {
                if(res.data === 1){
                    // console.log('修改成功');
                    this.card.cardMoney = newMoney;
                    // this.nowMod = 0;
                    // this.alterWindow = 666;
                    this.moneyChangeRecord(vmark);
                }else{
                    this.alterWindow = 555;
                    console.log(res,'未知错误');
                }
            },err => console.log(err.message));
        },
        moneyChangeRecord(vmark){
            const formData = new FormData();
            formData.append('userId',this.card.userId);
            formData.append('mainMark',1);
            formData.append('mainContentId',this.card.cardId);
            if(vmark === 3){
                formData.append('vmark', 3);
            }else if(vmark === 4){
                formData.append('vmark', 4);
            }
            formData.append('tdate',new Date());
            formData.append('moneyAmount',parseFloat(this.actionMoney));
            request.post('/api/records/cardaddunbind',formData).then(res => {
                if(res.data === 1){
                    this.nowMod = 0;
                    this.alterWindow = 666;
                    this.informUpdRecord();
                    // this.$bus.$emit('doUpd','更新！');
                }else{
                    this.alterWindow = 555;
                }
            },err => console.log(err));
        },
        back(){
            this.$router.push({
                name:'userCards',
            })
        },
        writeOnNote(note){
            this.noteOn = note;
        },
        saveNote(){
            if(this.$refs['inputNote'].value !== ''){
                this.noteOn = this.$refs['inputNote'].value;
            }else{
                this.noteOn = '';
            }
            const formData = new FormData();
            formData.append('cardId',this.card.cardId);
            formData.append('userId',this.card.userId);
            formData.append('cardNote',this.noteOn);
            request.post('/api/cards/modNote',formData).then(res => {
                if(res.data === 1){
                    this.card.cardNote = this.noteOn;
                    this.nowMod = 0;
                }else{
                    console.log('修改失败');
                }
            },err => console.log(err.message));
        },
        // 余额输入的键入键出事件
        setMoneyDown(){
            let money = this.$refs['money'].value;
            // 清除数字和.-以外的字符
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
        cancle(){
            this.nowMod = 0;
            this.alterWindow = 0;
        },
        // 银行卡转出键入事件
        dropMoneyDown(){
            this.setMoneyDown();
        },
        // 银行卡转出键出事件
        dropMoneyUp(){
            this.setMoneyUp();
            const dropMoney = parseFloat(this.$refs['money'].value);
            const cardHaveMoney = parseFloat(this.card.cardMoney);
            if(dropMoney > cardHaveMoney){
                this.$refs['money'].value = cardHaveMoney;
            }
        },
        toSecondCfm(){
            if(this.$refs['money'].value !== '' && parseFloat(this.$refs['money'].value) > 0){
                const cardHaveMoney = parseFloat(this.card.cardMoney);
                const saveMoney = parseFloat(this.$refs['money'].value);
                let newSaveMoney;
                if(this.nowMod === 11){
                    newSaveMoney = parseFloat((cardHaveMoney + saveMoney).toFixed(2));
                }else if(this.nowMod === 16){
                    newSaveMoney = parseFloat((cardHaveMoney - saveMoney).toFixed(2));
                }else{
                    newSaveMoney = parseFloat(this.card.cardMoney)
                }
                this.actionMoney = saveMoney;
                this.cardMoneyAfterA = newSaveMoney;
                this.alterWindow = 1;
            }else{
                this.alterWindow = -1;
            }
        },
        moneyActionCfm(){
            if(this.nowMod === 11){
                this.moneyInCfm();
            }else if(this.nowMod === 16){
                this.moneyOutCfm();
            }
        },
        moneyInCfm(){
            this.confirmSet(this.cardMoneyAfterA, 3);
            // 添加银行卡转入金额的【交易记录】
            // 转入标记为3
        },
        moneyOutCfm(){
            this.confirmSet(this.cardMoneyAfterA, 4);
            // 添加银行卡转出金额的【交易记录】
            // 转出标记为4
        },
        toUnbind(){
            this.alterWindow = 321;
        },
        cardUnbindCfm(){
            // console.log(this.card.userId, this.card.cardName, this.card.cardKey, parseFloat(this.card.cardMoney),new Date());
            const formData = new FormData();
            formData.append('userId',this.card.userId);
            formData.append('cardKey',this.card.cardKey);
            formData.append('cardName',this.card.cardName);
            formData.append('disbindMoney',parseFloat(this.card.cardMoney));
            formData.append('disbindDate',new Date());
            formData.append('cardId',this.card.cardId);
            request.post('/api/cards/unbindcard', formData).then(res => {
                // if(res.data === 1){
                //     this.alterWindow = 321666;
                // }else{
                //     this.alterWindow = 555;
                // }
                this.cardUnbindRecord();
            },err => console.log(err));
        },
        unbindDone(){
            this.$router.replace({
                name:'userCards',
            })
        },
        cardUnbindRecord(){
            // console.log('userId',this.card.userId);
            // console.log('mainMark',1);//银行卡为1
            // console.log('mainContentId',this.card.cardId);//刚刚解绑的银行卡Id
            // console.log('vmark', 2);//解绑银行卡为2
            // console.log('tdate',new Date());
            // console.log('moneyAmount',parseFloat(this.card.cardMoney));
            const formData = new FormData();
            formData.append('userId',this.card.userId);
            formData.append('mainMark',1);
            formData.append('mainContentId',this.card.cardId);
            formData.append('vmark', 2);
            formData.append('tdate',new Date());
            formData.append('moneyAmount',parseFloat(this.card.cardMoney));
            request.post('/api/records/cardaddunbind',formData).then(res => {
                if(res.data == 1){
                    this.alterWindow = 321666;
                }else{
                    this.alterWindow = 555;
                }
            })
        },
        // 通知更新记录
        informUpdRecord(){
            this.$bus.$emit('updCardRecord');
        },
    },
    created(){
        // console.log(this.cardId,this.userId);
        // console.log(this.cardId === undefined, this.userId === undefined);
        // 在此页面刷新数据会消失，所以刷新的话就让你出去。（只有路由点击来才有初始数据去请求）
        if(this.cardId === undefined || this.userId === undefined){
            this.$router.push({
                name:'userCards',
            })
        }else{
            const formData = new FormData();
            formData.append('cardId',this.cardId);
            formData.append('userId',this.userId);
            request.post('/api/cards/onecard',formData).then(res => {
                // console.log(res.data.data);
                this.card = res.data.data;
                this.card.cardMoney = this.card.cardMoney.toFixed(2);
                BIN.getBankBin(this.card.cardKey,(err, data) => {
                    if(!err){
                        this.cardTypeName = data.cardTypeName;
                    }else{
                        this.cardTypeName = 'Unknown Card Type';
                    }
                });
            },err => console.log(err.message));
            this.cardNotes = JSON.parse(localStorage.getItem('cardNotes'));
        };
    },
    mounted(){
        this.$store.commit('changePageS',this.nowPageS);
        this.$bus.$on('writeOnNote',this.writeOnNote);
        timer = setInterval(() => {
            this.nowTime = this.formatTime();
        },1000);
    },
    beforeDestroy(){
        this.$bus.$off('writeOnNote');
        clearInterval(timer);
    }
}
</script>

<style scoped>
.one-card{
    display: flex;
    justify-content: space-between;
}
.card-detail{
    height: 100%;
    width: 450px;
    height: 500px;
    background-color: #fff;
    overflow: hidden;/**BFC */
    position: relative;
}
.card-detail h2{
    padding: 10px 5px;
    border-bottom: 10px solid rgb(219, 219, 219);
}
.card-detail-bank-img{
    height: 120px;
    width: 120px;
    background-color: #fff;
}
.card-detail-bank-img img{
    display: block;
    height: 80%;
    width: 80%;
    margin: 12px auto;
}
.card-detail-bank{
    display: flex;
    border-bottom: 10px solid rgb(219, 219, 219);
}
.card-detail-bank .title{
    height: 50px;
    line-height: 50px;
    font-size: 24px;
    letter-spacing: 1.5px;
    margin-top: 6px;
}
.card-detail-bank .card-key{
    letter-spacing: 1.5px;
    height: 30px;
    line-height: 20px;
}
.card-detail-info{
    border-bottom: 10px solid rgb(219, 219, 219);
}
.card-detail-info ul{
    display: flex;
    height: 40px;
    padding-left: 5px;
    padding-right: 30px;
    justify-content: space-between;
}
.card-detail-info .money{
    border-bottom: 2px solid rgb(219, 219, 219);
}
.card-detail-info ul li{
    line-height: 40px;
}
.card-detail-buttons{
    display: flex;
    justify-content: space-between;
    margin: 20px 100px;
}
.card-detail-buttons > span{
    cursor: pointer;
    display: inline-block;
    color: #fff;
    height: 30px;
    width: 100px;
    text-align: center;
    line-height: 26px;
    background-color: #007aff;
    border-radius: 5px;
    border: 2px solid #007bff1f;
}
.card-detail-buttons > span:last-child{
    background-color: #318d38;
}
.card-detail-buttons > span:hover,
.take-note-action > span:hover,
.mod-money > span:hover{
    opacity: 0.8;
}
.card-detail-buttons > span:active,
.take-note-action > span:active,
.mod-money > span:active{
    opacity: 0.5;
}
.modify{
    cursor: pointer;
}
.modify:hover{
    text-decoration: underline;
}
.modify-2{
    margin-left: 20px;
}
.mod-money,
.mod-note{
    position: absolute;
    bottom: 0px;
    height: 150px;
    width: 100%;
    border-top: 2px solid #000;
    background-color: rgba(185, 185, 185, 0.308);
}
.mod-money > p{
    margin-top: 10px;
    margin-left: 5px;
}
.mod-money > input{
    margin-top: 20px;
    margin-left: 30px;
    height: 30px;
}
.mod-money > span{
    display: inline-block;
    height: 30px;
    width: 60px;
    line-height: 26px;
    text-align: center;
    background-color: #2f8ef5;
    color: #fff;
    border: 2px solid #2f8ff565;
    margin-left: 20px;
    cursor: pointer;
}
.mod-money > span:last-child{
    background-color: rgb(250, 95, 95);
}
.take-notes-list{
    display: flex;
    flex-flow: row wrap;
    margin-top: 20px;
}
.take-note-action > input{
    margin-left: 5px;
    height: 30px;
}
.take-note-action > span{
    margin-top: 10px;
    display: inline-block;
    height: 20px;
    width: 50px;
    font-size: 12px;
    line-height: 16px;
    text-align: center;
    background-color: #2f8ef5;
    color: #fff;
    border: 2px solid #2f8ff565;
    margin-left: 20px;
    cursor: pointer;
}
.alter-background{
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, .5);
    top: 0;
    left: 0;
    z-index: 11;
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

.card-change{
    height: 500px;
    width: 320px;
    background-color: #fff;
}
</style>