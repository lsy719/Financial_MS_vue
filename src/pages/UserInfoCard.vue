<template>
    <div class="user-card">
        <div class="user-card-title">
            <div>
                <span style="font-weight:bold">我的卡</span>
                <span>共({{cardsNum}})张</span>
            </div>
            <div class="add-card" @click="addCard">
                添加绑定
            </div>
            <div class="all-money">
                <span style="color:#999">总余额：</span>
                <span v-if="!showMoney" style="color:#007aff">***</span>
                <span v-if="showMoney" style="color:#007aff">{{allMoney}}元</span>
                <span v-if="showMoney" @click="eyeOpen" class="show-eye"><i class="fas fa-eye"></i></span>
                <span v-if="!showMoney" @click="eyeClose" class="show-eye"><i class="fas fa-eye-slash"></i></span>
            </div>
        </div>
        <div class="user-card-list">
            <ul>
                <BankCard
                    v-for="card in myCards" :key="card.cardId"
                    :card = "card" :cardNotes = 'cardNotes'
                />
            </ul>
        </div>
    </div>
</template>

<script>
import request from '../utils/request';
import BankCard from '../components/BankCard.vue';
// const BIN = require('bankcardinfo');
export default {
    name:'UserInfoCard',
    components:{BankCard},
    props:['nowPageS'],//32
    data(){
        return {
            cardsNum:0,
            myCards: [],
            cardNotes: [],
            userId:'',
            showMoney:0,
        }
    },
    methods:{
        eyeOpen(){
            this.showMoney = 0;
        },
        eyeClose(){
            this.showMoney = 1;
        },
        reloadCards(){
            const formData = new FormData();
            formData.append('id',this.userId);
            request.post('/api/cards/loadcards',formData).then(res => {
                if(res.data.code === '0'){
                    this.myCards = res.data.data;
                }else{
                    console.log('未知错误')
                }
            },err => console.log(err.message));
        },
        addCard(){
            this.$router.push({
                name:'userCardAdd',
                params:{
                    cardsNum: this.cardsNum,
                    allMoney: this.allMoney,
                },
            })
        }
    },
    created(){
        const verifyInfo = localStorage.getItem('user');
        const id = verifyInfo.split("-")[0];
        this.userId = id;
        this.showMoney = 0;
        const formData = new FormData();
        formData.append('id',this.userId);
        request.post('/api/cards/loadcards',formData).then(res => {
            if(res.data.code === '0'){
                this.myCards = res.data.data;
            }else{
                console.log('未知错误')
            }
        },err => console.log(err.message));
        this.$store.commit('setCardIsNote',0);
        // console.log(this.nowPageS);
        // console.log(this.$store.state.nowPageS);// 获取备注提示
        request.post('/api/cards/getNote').then(res => {
            if(res.data.code = '0'){
                // console.log(res.data.data);
                this.cardNotes = res.data.data;
            }else{
                console.log('未知错误')
            }
        },err => console.log(err.message));
        this.$store.dispatch('userCardsNum',this.userId);
    },
    mounted(){
        this.$store.dispatch('secondCheck');
        this.$store.commit('changePageS',this.nowPageS);
        this.cardsNum = this.$store.state.cardsNum;
        // console.log(this.allMoney);
        // console.log(this.nowPageS);
        this.$bus.$on('reloadCards',this.reloadCards);
    },
    computed:{
        getUserCardsNum(){return this.$store.state.cardsNum;},
        allMoney(){
            const initialValue = 0;
            const total = this.myCards.reduce((acc,item)=>{
                return acc + item.cardMoney
            },initialValue)
            return parseFloat(total.toFixed(2));
        },
    },
    watch:{
        getUserCardsNum(newValue){this.cardsNum = newValue;},
        // myCards:{
        //     deep:true,
        //     handler(newValue){
        //         localStorage.setItem('cards',JSON.stringify(newValue));
        //     }
        // },
        cardNotes:{
            deep:true,
            immediate:true,
            handler(newValue){
                localStorage.setItem('cardNotes',JSON.stringify(newValue));
            }
        }
    },
    beforeDestroy(){
        localStorage.removeItem('cards');
        // 在上一级UserInfo组件中销毁
        // localStorage.removeItem('cardNotes');
        this.$bus.$off('reloadCards');
    }
}
</script>

<style scoped>
.user-card{
    height: 100%;
    background-color: white;
    overflow: hidden;
}
.user-card-title{
    display: flex;
    justify-content: space-between;
}
.user-card-title span{
    height: 30px;
    line-height: 30px;
    margin-left: 5px;
    font-size: 14px;
}
.all-money{
    margin-right: 20px;
}
.user-card-list{
    width: 100%;
    height: calc(100% - 30px);
    background-color: #ccc;
    overflow: hidden;
    /* BFC作用 */
}
.user-card-list ul{
    margin-left: 20px;
    margin-right: 20px;
}
.show-eye{
    cursor: pointer;
    color: #999;
}
.show-eye:hover{
    color: rgb(80, 80, 80);
}
.add-card{
    cursor: pointer;
    line-height: 30px;
}
.add-card:hover{
    color: #007aff;
    text-decoration: underline;
}
</style>