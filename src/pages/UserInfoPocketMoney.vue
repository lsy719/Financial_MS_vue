<template>
    <div class="user-pocketmoney">
        <div class="user-pocketmoney-info">
            <span>余额</span>
            <div class="pocketmoney-show-box">
                <span><i class="fas fa-yen-sign"></i>零用钱在这里</span>
                <!-- 这里必须用v-if，因为样式是靠伪类nth-child写的 -->
                <span v-if="showPocketMoney === 1">可用余额(元)&nbsp;<i @click="showPocketMoney = 0" class="fas fa-eye"></i></span>
                <span v-if="showPocketMoney === 0">可用余额(元)&nbsp;<i @click="showPocketMoney = 1" class="fas fa-eye-slash"></i></span>
                <span v-if="showPocketMoney === 1">{{pocketMoney}}</span>
                <span v-if="showPocketMoney === 0">****</span>
                <div class="pocketmoney-show-box-buttons">
                    <span @click="changeMoneyType = 16">转出&nbsp;&nbsp;<i class="fas fa-share-square"></i></span>
                    <span @click="changeMoneyType = 11">转入&nbsp;&nbsp;<i class="fas fa-reply"></i></span>
                </div>
            </div>
            <!-- 用v-if保证重新加载，input里的内容就会清掉，这点性能都没有的电脑砸了 -->
            <div @click.self="cancleChangeMoney" v-if="changeMoneyType === 16 || changeMoneyType === 11" class="user-pocketmoney-action">
                <!-- 转入弹窗 -->
                <div class="user-pocketmoney-action-content">
                    <h3 v-if="changeMoneyType === 11" style="text-align:right">转入<i class="fas fa-reply"></i></h3>
                    <h3 v-if="changeMoneyType === 16">转出<i class="fas fa-share-square"></i></h3>
                    <span v-if="changeMoneyType === 11">转入方式</span>
                    <span v-if="changeMoneyType === 16">转出到</span>
                    <select @change="selectTest" ref="moneyPlace">
                        <option value="0">其它</option>
                        <option v-for="card in myCards" 
                                :key="card.cardId"
                                :value="card.cardId">
                            <span>{{card.cardName}}</span>
                            <span>({{card.cardKey.slice(-4,)}})</span>
                        </option>
                    </select>
                    <div class="user-pocketmoney-action-content-input">
                        <span v-if="changeMoneyType === 11">转入金额<br></span>
                        <span v-if="changeMoneyType === 16">转出金额<br></span>
                        <input type="text" ref="pMoneyW" @keydown="moneyGoInDown" @keyup="moneyGoInUp" maxlength="6">
                    </div>
                    <div class="user-pocketmoney-action-content-buttons">
                        <span @click="toSecondCfm">确认</span>
                        <span @click="cancleChangeMoney">取消</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="user-pocketmoney-change">
            <RecordObj :target="2"/>
        </div>

        <!-- 二次确认弹窗 -->
        <div v-if="alterWindow === 1" class="alter-background" @click.self="alterWindow = 0">
            <div class="alter-content">
                
                <p>操作时间：{{nowTime}}</p>
                <p v-if="changeMoneyType === 11">转入金额：<span>{{actionMoney}}</span></p>
                <p v-if="changeMoneyType === 16">转出金额：<span>{{actionMoney}}</span></p>

                <p v-if="changeMoneyType === 11">转入后余额为：<span>{{actionAfterMoney}}</span></p>
                <p v-if="changeMoneyType === 16">转出后余额为：<span>{{actionAfterMoney}}</span></p>

                <p v-if="changeMoneyType === 11 && changeMoneySD === 1">来源：{{showDSBank}}</p>
                <p v-if="changeMoneyType === 16 && changeMoneySD === 1">去向：{{showDSBank}}</p>

                <p v-if="changeMoneyType === 11 && changeMoneySD === 1">转入后该卡余额：<span>{{actionAfterCardMoney}}</span></p>
                <p v-if="changeMoneyType === 16 && changeMoneySD === 1">转出后该卡余额：<span>{{actionAfterCardMoney}}</span></p>

                <div class="alter-content-buttons">
                    <span @click="cfmFinal">确定</span>
                    <span @click="alterWindow = 0" style="background-color:#318d38">取消</span>
                </div>
            </div>
        </div>
        <div v-show="alterWindow === -1" class="alter-background" @click.self="alterWindow = 0">
            <div class="alter-content">
                <p style="color:red">需填写有效金额</p>
            </div>
        </div>
        <div v-show="alterWindow === 555" class="alter-background" @click.self="alterWindow = 0">
            <div class="alter-content">
                <p style="color:red">未知错误</p>
            </div>
        </div>
        <div v-show="alterWindow === 666" class="alter-background" @click.self="cancleChangeMoney">
            <div class="alter-content">
                <p style="color:green">操作完成</p>
            </div>
        </div>
    </div>
</template>

<script>
let timer;
import request from '../utils/request';
import RecordObj from '../components/RecordObj.vue'
export default {
    name:'UserInfoPocketMoney',
    props:['nowPageS'],//33
    components:{RecordObj},
    data(){
        return {
            userId:'',
            pocketMoney:0.00,
            pocketMoneyOrigin:0.00,
            showPocketMoney:1,

            /**
             * 0:弹窗隐藏
             * 11:充值（转入）
             * 12:转出
             */
            changeMoneyType:0,

            /**
             * Source,Destination
             * 0:其它，直接改余额
             * 1:银行，需同时修改银行卡余额
             */
            changeMoneySD:0,
            myCards: [],
            nowTime:'',

            /**
             * 操作金额：this.$refs['pMoneyW'].value
             * 操作后金额：this.pocketMoney ± this.$refs['pMoneyW'].value
             * 去向/来源：cardName、其它
             * 操作后卡内余额：cardMoney ± this.$refs['pMoneyW'].value
             * 银行卡号
             * 原卡内余额
             */
            actionMoney:0.00,
            actionAfterMoney:0.00,
            DestSrc:'',
            actionAfterCardMoney:0.00,
            DestSrcKey:'',
            choiceCardId:0,
            originCardMoney:0.00,
            /**
             * 更新成功标识
             * 
             */
            
            alterWindow:0,
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
        cancleChangeMoney(){
            this.changeMoneyType = 0;
            this.changeMoneySD = 0;
            this.alterWindow = 0;
        },
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

        // 金额输入限制
        setMoneyDown(){
            let money = this.$refs['pMoneyW'].value;
            // 清除数字和.-以外的字符
            money = money.replace(/[^\d.]/g,'');
            // 验证第一个字符是数字
            money = money.replace(/^\./g,'');
            // 只保留一个.,清除多余的
            money = money.replace(/\.{2,}/g,'');
            // 只能输入两位小数
            money = money.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3')
            // money = money.replace(/[^\d{1,}\.\d{1,}|\d{1,}]/g,'');
            this.$refs['pMoneyW'].value = money;
        },
        setMoneyUp(){
            let money = this.$refs['pMoneyW'].value;
            money = money.replace(/[^\d.]/g,'');
            // 验证第一个字符是数字
            money = money.replace(/^\./g,'');
            // 只保留一个.,清除多余的
            money = money.replace(/\.{2,}/g,'');
            // 只能输入两位小数
            money = money.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3')
            // money = money.replace(/[^\d{1,}\.\d{1,}|\d{1,}]/g,'');
            this.$refs['pMoneyW'].value = money;
        },

        
        // 修改用户余额
        changePocketMoney(newMoney, userId, vMark){
            const formData = new FormData();
            formData.append('newMoney',newMoney);
            formData.append('userId',userId);
            request.post('/api/user/changepm',formData).then(res => {
                if(res.data === 1){
                    // 修改成功
                    // this.alterWindow = 666;
                    this.$store.dispatch('reloadUserInfo',userId);
                    // this.getMyBankCards(userId);
                    this.pocketMoneyChangeRecordOther(vMark);
                }else{
                    // 修改失败
                    this.alterWindow = 555;
                }
            },err => console.log(err));
        },
        // 修改银行卡余额(已经有接口了),这里是连带着修改用户余额的。
        changeCardMoney(newMoney, userId, cardId, cardNewMoney, originCardMoney, vMark){
            const formData = new FormData();
            formData.append('cardMoney',cardNewMoney);
            formData.append('cardId',cardId);
            formData.append('userId',userId);
            request.post('/api/cards/modmoney',formData).then(res => {
                if(res.data === 1){
                    // 银行卡的余额优先修改完成。
                    // 异步关系优点恶心，在写一遍请求算了
                    const formData2 = new FormData();
                    formData2.append('newMoney',newMoney);
                    formData2.append('userId',userId);
                    request.post('/api/user/changepm',formData2).then(res2 => {
                        if(res2.data = 1){
                            // 用户余额修改完成
                            // this.alterWindow = 666;
                            this.$store.dispatch('reloadUserInfo',userId);
                            this.getMyBankCards(userId);
                            this.pocketMoneyChangeRecordBank(vMark);
                        }else{
                            // 修改失败,银行卡的钱要该回去
                            this.alterWindow = 555;
                            const formData3 = new FormData();
                            formData.append('cardMoney',originCardMoney);
                            formData.append('cardId',cardId);
                            formData.append('userId',userId);
                            request.post('/api/cards/modmoney',formData).then(res3 => {
                                console.log('未知错误');
                            },err3 => console.log(err3));
                        }
                    },err2 => console.log(err2));
                }else{
                    this.alterWindow = 555;
                }
            },err => console.log(err));
        },
        // 通知更新记录
        informUpdRecord(){
            this.$bus.$emit('updPocketRecord');
        },

        // 转入转出金额的输入输出框
        moneyGoInDown(){
            this.setMoneyDown();         
        },
        moneyGoInUp(){
            this.setMoneyUp();
            // 如果是转出的情况：输入金额不能大于现有余额
            if(this.changeMoneyType === 16){
                const dropMoney = parseFloat(this.$refs['pMoneyW'].value);
                const haveMoney = parseFloat(this.pocketMoneyOrigin);
                if(dropMoney > haveMoney){
                    this.$refs['pMoneyW'].value = haveMoney;
                }
            };
            // 如果是转入的情况，输入金额不能超过所选银行卡的余额，除了选的是其它
            if(this.changeMoneyType === 11){
                if(this.$refs['moneyPlace'].value === '0'){
                    // 选的是其它
                    // 随意
                }else{
                    // console.log(this.$refs['moneyPlace'].value);// string
                    const choiceCard = this.myCards.filter((elem, index, arr) => {
                        return elem.cardId === parseInt(this.$refs['moneyPlace'].value);
                    })
                    // console.log(choiceCard[0]);
                    const chargeMoney = parseFloat(this.$refs['pMoneyW'].value);
                    const haveMoney = parseFloat(choiceCard[0].cardMoney);
                    if(chargeMoney > haveMoney){
                        this.$refs['pMoneyW'].value = haveMoney;
                    }
                }
            }
        },
        selectTest(){
            this.$refs['pMoneyW'].value = '';
            // console.log(this.$refs['moneyPlace'].value);//能行 都是string
            if(this.$refs['moneyPlace'].value === '0'){
                this.changeMoneySD = 0;
            }else{
                this.changeMoneySD = 1;
            }
        },
        toSecondCfm(){
            if(this.$refs['pMoneyW'].value === ''){
                this.alterWindow = -1;
            }else{
                if(this.$refs['moneyPlace'].value === '0'){
                    // 钱去向/来源为其它，随意
                    this.changeMoneySD = 0;
                    if(this.changeMoneyType == 11){
                        // 来源随意转入11-0
                        this.actionMoney = parseFloat(parseFloat(this.$refs['pMoneyW'].value).toFixed(2));
                        this.actionAfterMoney = (parseFloat(this.pocketMoneyOrigin) + this.actionMoney).toFixed(2);
                    }else if(this.changeMoneyType == 16){
                        // 去向随意转出16-0
                        this.actionMoney = parseFloat(parseFloat(this.$refs['pMoneyW'].value).toFixed(2));
                        this.actionAfterMoney = (parseFloat(this.pocketMoneyOrigin) - this.actionMoney).toFixed(2);
                    }
                }else{
                    // 钱去向/来源为银行卡
                    let choiceCard = this.myCards.filter((elem, index, arr) => {
                        return elem.cardId === parseInt(this.$refs['moneyPlace'].value);
                    });
                    choiceCard = choiceCard[0];
                    const choiceCardId = choiceCard.cardId;
                    this.changeMoneySD = 1;
                    if(this.changeMoneyType == 11){
                        // 来源银行卡转入11-1
                        this.actionMoney = parseFloat(parseFloat(this.$refs['pMoneyW'].value).toFixed(2));
                        this.actionAfterMoney = (parseFloat(this.pocketMoneyOrigin) + this.actionMoney).toFixed(2);
                        this.DestSrc = choiceCard.cardName;
                        this.actionAfterCardMoney = (choiceCard.cardMoney - this.actionMoney).toFixed(2);
                        this.DestSrcKey = choiceCard.cardKey;
                        this.choiceCardId = choiceCardId;
                        this.originCardMoney = choiceCard.cardMoney;
                    }else if(this.changeMoneyType == 16){
                        // 去向银行卡转出16-1
                        this.actionMoney = parseFloat(parseFloat(this.$refs['pMoneyW'].value).toFixed(2));
                        this.actionAfterMoney = (parseFloat(this.pocketMoneyOrigin) - this.actionMoney).toFixed(2);
                        this.DestSrc = choiceCard.cardName;
                        this.actionAfterCardMoney = (choiceCard.cardMoney + this.actionMoney).toFixed(2);
                        this.DestSrcKey = choiceCard.cardKey;
                        this.choiceCardId = choiceCardId;
                        this.originCardMoney = choiceCard.cardMoney;
                    }
                }
                this.alterWindow = 1;
            }
        },
        cfmFinal(){
            if(this.changeMoneyType === 16){
                if(this.changeMoneySD === 0){
                    // console.log('转出到其它');
                    // console.log('提交数据:');
                    // console.log('转出后余额:',this.actionAfterMoney)
                    // console.log('用户id',this.userId);

                    // reloadUserInfo，调vuex方法即可
                    // this.getMyBankCards(this.userId); // 刷银行卡数据，弹窗是用v-if，会重新加载（数据），所以还要关闭弹窗(点转入转出的)
                    this.changePocketMoney(this.actionAfterMoney, this.userId,4);//向其它转出
                    // 生成交易记录
                    // this.changeMoneyType = 0 // 关闭转入转出操作弹窗
                }else if(this.changeMoneySD === 1){
                    // console.log('转出到银行卡');
                    // console.log('提交数据:');
                    // console.log('用户id',this.userId);
                    // console.log('转出后余额:', this.actionAfterMoney); // number
                    // console.log('目标银行卡id:',this.choiceCardId);
                    // console.log('转出后银行卡内余额:',this.actionAfterCardMoney); // number
                    // console.log('原余额', parseFloat(this.pocketMoney)); // number
                    // console.log('原卡内余额', parseFloat(this.originCardMoney)); // number
                    this.changeCardMoney(this.actionAfterMoney,this.userId,this.choiceCardId,this.actionAfterCardMoney,this.pocketMoneyOrigin,4);//向银行卡转出
                    // reloadUserInfo，调vuex方法即可
                    // this.getMyBankCards(this.userId); // 刷银行卡数据，弹窗是用v-if，会重新加载（数据），所以还要关闭弹窗(点转入转出的)
                    // 生成交易记录
                    // this.changeMoneyType = 0 // 关闭转入转出操作弹窗
                }
            }else if(this.changeMoneyType === 11){
                if(this.changeMoneySD === 0){
                    // reloadUserInfo，调vuex方法即可
                    this.changePocketMoney(this.actionAfterMoney, this.userId, 3);//向其它转入
                    // 生成交易记录
                    // this.changeMoneyType = 0 // 关闭转入转出操作弹窗
                }else if(this.changeMoneySD === 1){
                    this.changeCardMoney(this.actionAfterMoney,this.userId,this.choiceCardId,this.actionAfterCardMoney,this.pocketMoneyOrigin,3);//向银行卡转入
                    // reloadUserInfo，调vuex方法即可
                    // this.getMyBankCards(this.userId); // 刷银行卡数据，弹窗是用v-if，会重新加载（数据），所以还要关闭弹窗(点转入转出的)
                    // 生成交易记录
                    // this.changeMoneyType = 0 // 关闭转入转出操作弹窗
                }
            }
        },
        // 余额改变，其它,携带转入/转出标记
        pocketMoneyChangeRecordOther(vMark){
            // console.log('userId',this.userId);
            // console.log('mainMark',2);//约定好，余额为2
            // if(vMark === 3){
            //     console.log('vMark',3);//约定好，转入为3
            // }else if(vMark === 4){
            //     console.log('vMark',4);//约定好，转出为4
            // }
            // console.log('objMark',4);//约定好，其它为4
            // console.log('MoneyResult',this.actionAfterMoney);//操作后的余额总量
            // console.log('tdate',new Date());
            // console.log('moneyAmount',this.actionMoney);//操作金额
            const formData = new FormData();
            formData.append('userId',this.userId);
            formData.append('mainMark',2);
            formData.append('vMark',vMark);
            formData.append('objMark',4);
            formData.append('MoneyResult',this.actionAfterMoney);
            formData.append('tdate',new Date());
            formData.append('moneyAmount',this.actionMoney);
            request.post('/api/records/pmoneymodother',formData).then(res => {
                if(res.data === 1){
                    this.alterWindow = 666;
                    this.informUpdRecord();
                }else{
                    this.alterWindow = 555;
                }
            },err => console.log(err));
        },
        // 余额改变，银行卡。携带转入/转出标记
        pocketMoneyChangeRecordBank(vMark){
            // console.log('userId',this.userId);
            // console.log('mainMark',2);//约定好，余额为2
            // if(vMark === 3){
            //     console.log('vMark',3);//约定好，转入为3
            // }else if(vMark === 4){
            //     console.log('vMark',4);//约定好，转出为4
            // }
            // console.log('objMark',1);//约定好，银行卡为
            // console.log('objContentId',this.choiceCardId);//选择的银行卡id
            // console.log('MoneyResult',this.actionAfterMoney);//操作后的余额总量
            // console.log('tdate',new Date());
            // console.log('moneyAmount',this.actionMoney);//操作金额
            const formData = new FormData();
            formData.append('userId',this.userId);
            formData.append('mainMark',2);
            formData.append('vMark',vMark);
            formData.append('objMark',1);
            formData.append('objContentId',this.choiceCardId);
            formData.append('MoneyResult',this.actionAfterMoney);
            formData.append('tdate',new Date());
            formData.append('moneyAmount',this.actionMoney);
            request.post('/api/records/pmoneymodcard',formData).then(res => {
                if(res.data === 1){
                    this.alterWindow = 666;
                    this.informUpdRecord();
                }else{
                    this.alterWindow = 555;
                }
            },err => console.log(err));
        },

    },
    computed:{
        getUserInfo(){
            return this.$store.state.userInfo;
        },
        showDSBank(){
            return this.DestSrc + '(' + this.DestSrcKey.slice(-4,) + ')'
        }
    },
    watch:{
        getUserInfo:{
            handler(newValue){
                this.userId = newValue.id;
                this.pocketMoney = this.formatNum(newValue.pocketMoney.toFixed(2));
                this.pocketMoneyOrigin = newValue.pocketMoney.toFixed(2);
            }
        }
    },
    created(){

    },
    mounted(){
        // 验证，保证浏览器缓存里账号信息是对的，就可以直接用了
        // this.$store.dispatch('secondCheck');//直接放到getMyBankCards里

        this.$store.commit('changePageS',this.nowPageS);
        this.userId = this.$store.state.userInfo.id
        if(this.$store.state.userInfo.pocketMoney){
            this.pocketMoney = this.formatNum(this.$store.state.userInfo.pocketMoney.toFixed(2));
            this.pocketMoneyOrigin = this.$store.state.userInfo.pocketMoney.toFixed(2)
        }

        // 第一条代码验证过了，放心用
        // 方法里面会验证（这里就是怕刷新正常路由切换页面，vuex获取不到userInfo，在后续要刷新银行卡列表直接用data的userId即可）
        const verifyInfo = localStorage.getItem('user');
        const id = verifyInfo.split("-")[0];
        this.getMyBankCards(id);
        timer = setInterval(() => {
            this.nowTime = this.formatTime();
        },1000)
    },
    beforeDestroy(){
        clearInterval(timer);
    }
}
</script>

<style scoped>
.user-pocketmoney{
    display: flex;
    justify-content: space-between;
}
.user-pocketmoney-info{
    position: relative;
    width: 450px;
    min-height: 500px;
    background-color: #ccc;
}
.user-pocketmoney-info > span{
    display: block;
    background-color: #fff;
    height: 30px;
    line-height: 30px;
    padding-left: 5px;
    font-size: 14px;
    font-weight: bold;
}
.pocketmoney-show-box{
    margin: 0 auto;
    margin-top: 20px;
    width: 410px;
    height: 230px;
    border-radius: 8px;
    background-color: #fff;
    overflow: hidden;
    position: relative;
}
.pocketmoney-show-box > span{
    display: block;
    text-align: center;
}
.pocketmoney-show-box > span i{
    cursor: pointer;
}
.pocketmoney-show-box > span:first-child{
    height: 25px;
    line-height: 25px;
    background-color: rgb(225, 238, 255);
    color: rgb(59, 128, 255);
    font-size: 12px;
}
.pocketmoney-show-box > span:nth-child(2){
    margin-top: 20px;
    font-size: 14px;
}
.pocketmoney-show-box > span:nth-child(3){
    margin-top: 20px;
    font-size: 32px;
}
.pocketmoney-show-box-buttons{
    position: absolute;
    height: 80px;
    width: 100%;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    /* 垂直居中 */
    align-items: center;
    padding: 0 20px;
}
.pocketmoney-show-box-buttons > span{
    display: inline-block;
    height: 45px;
    line-height: 41px;
    width: 160px;
    text-align: center;
    background-color: #fff;
    border: 2px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
}
.pocketmoney-show-box-buttons > span:last-child{
    background-color: #007aff;
    color: #fff;
}

.user-pocketmoney-action{
    position: absolute;
    height: 100%;
    width: 100%;
    bottom: 0;
}
.user-pocketmoney-action-content{
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 300px;
    border-top: 5px solid #ccc;
    background-color: #fff;
}
.user-pocketmoney-action-content h3{
    margin-left: 5px;
    padding-left: 5px;
    border-bottom: 1px solid #999;
    height: 30px;
    line-height: 30px;
}
.user-pocketmoney-action-content > span{
    display: block;
    margin-top: 10px;
    margin-left: 15px;
}
.user-pocketmoney-action-content > select{
    display: block;
    margin-left: 15px;
    height: 28px;
    line-height: 28px;
    width: 240px;
}
.user-pocketmoney-action-content-input{
    margin-left: 9px;
    margin-right: 10px;
    margin-top: 10px;
    padding-top: 10px;
    border: 1px solid rgb(228, 228, 228);
    border-radius: 5px;
}
.user-pocketmoney-action-content-input > span,
.user-pocketmoney-action-content-input > input{
    display: block;
    margin-left: 5px;
    height: 30px;
    margin-bottom: 10px;
}
.user-pocketmoney-action-content-buttons{
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    padding: 0 30px;
}
.user-pocketmoney-action-content-buttons > span{
    display: inline-block;
    height: 45px;
    line-height: 41px;
    width: 160px;
    text-align: center;
    background-color: #fff;
    border: 2px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
}
.user-pocketmoney-action-content-buttons > span:first-child{
    background-color: #007aff;
    color: #fff;
}

.pocketmoney-show-box-buttons > span:hover,
.user-pocketmoney-action-content-buttons > span:hover,
.pocketmoney-show-box > span i:hover{
    opacity: 0.8;
}
.pocketmoney-show-box-buttons > span:active,
.user-pocketmoney-action-content-buttons > span:active
.pocketmoney-show-box > span i:active{
    opacity: 0.5;
}

.user-pocketmoney-change{
    width: 320px;
    height: 500px;
    background-color: #fff;
}

.alter-background{
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, .5);
    top: 0;
    left: 0;
    z-index: 999;
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
</style>