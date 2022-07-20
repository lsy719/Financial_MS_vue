<template>
    <div class="transaction">
        <template v-if="target === 3">
            <p>基金交易记录</p>
            <ul class="record-type">
                <li ref="typeAll" :style="styleShowAll" @click="showAllFundRecord">全部</li>
                <li ref="typePart" :style="styleShowPart" @click="showFundPartType" v-if="recordType === 2 || recordType === 1">分类<i class="fas fa-angle-down"></i></li>
                <li :style="styleShowPart" @click="showFundPartType" v-if="recordType === 21">买入<i class="fas fa-angle-down"></i></li>
                <li :style="styleShowPart" @click="showFundPartType" v-if="recordType === 22">卖出<i class="fas fa-angle-down"></i></li>
            </ul>
            <ul class="chooseType" v-show="recordType === 2">
                <li @click="getfundBuy">买入</li>
                <li @click="getfundSold">卖出</li>
            </ul>
            <div style="height:10px;background-color:#ccc"></div>
            <ul class="recordList">
                <li class="recordList-item" v-for="item in recordListShow" :key="item.id">
                    <span v-if="item.transactionVerb.tVId === 3 || item.transactionVerb.tVId === 1" style="color:red">买入</span>
                    <span v-if="item.transactionVerb.tVId === 4 || item.transactionVerb.tVId === 2" style="color:#007aff">卖出</span>
                    <ul>
                        <li>方式：{{item.transactionObj.tMOName}}</li>
                        <li v-if="item.transactionObj.tOId === 1">{{item.objInfoName}}({{item.objInfoCode.slice(-4,)}})</li>
                        <li v-if="item.transactionObj.tOId !== 1"></li>
                        <li>{{item.tdate}}</li>
                    </ul>
                    <p>{{item.moneyAmount}}元</p>
                </li>
            </ul>
        </template>
        <!-- 余额明细部分 -->
        <template v-if="target === 2">
            <p>余额交易记录</p>
            <ul class="record-type">
                <li ref="typeAll" :style="styleShowAll" @click="showAllPocketRecord">全部</li>
                <li ref="typePart" :style="styleShowPart" @click="showPocketPartType" v-if="recordType === 2 || recordType === 1">分类<i class="fas fa-angle-down"></i></li>
                <li :style="styleShowPart" @click="showPocketPartType" v-if="recordType === 21">转入<i class="fas fa-angle-down"></i></li>
                <li :style="styleShowPart" @click="showPocketPartType" v-if="recordType === 22">转出<i class="fas fa-angle-down"></i></li>
            </ul>
            <ul class="chooseType" v-show="recordType === 2">
                <li @click="getPocketIn">转入</li>
                <li @click="getPocketOut">转出</li>
            </ul>
            <div style="height:10px;background-color:#ccc"></div>
            <ul class="recordList2">
                <li class="recordList-item" v-for="item in recordListShow2" :key="item.id">
                    <span v-if=" 
                        (item.transactionMain.tMId === 3 && (item.transactionVerb.tVId === 3 || item.transactionVerb.tVId === 1)) ||
                        (item.transactionMain.tMId === 2 && item.transactionVerb.tVId ===4)
                        " style="color:#007aff">转出</span>
                    <span v-if="
                        (item.transactionMain.tMId === 3 && (item.transactionVerb.tVId === 4 || item.transactionVerb.tVId === 2)) ||
                        (item.transactionMain.tMId === 2 && item.transactionVerb.tVId ===3)
                        " style="color:red">转入</span>
                    <ul>
                        <li v-if="item.transactionMain.tMId === 3">
                            基金 -
                            <span v-if="item.transactionVerb.tVId === 1">添加</span>
                            <span v-if="item.transactionVerb.tVId === 3">买入</span>
                            <span v-if="item.transactionVerb.tVId === 4">卖出</span>
                            <span v-if="item.transactionVerb.tVId === 2">全部卖出</span>
                        </li>
                        <li v-if="item.transactionMain.tMId === 2">
                            余额 -
                            <span v-if="item.transactionVerb.tVId === 3">转入</span>
                            <span v-if="item.transactionVerb.tVId === 4">转出</span>
                        </li>
                        <li v-if="item.transactionObj.tOId === 1">{{item.objInfoName}}({{item.objInfoCode.slice(-4,)}})</li>
                        <li v-if="item.transactionMain.tMId === 3">{{item.mainInfoName}}({{item.mainInfoCode}})</li>
                        <li v-if="item.transactionObj.tOId === 4">其它</li>
                        <li v-if="item.transactionObj.tOId !== 1 && item.transactionMain.tMId !== 3 && item.transactionObj.tOId !== 4"></li>
                        <li>{{item.tdate}}</li>
                    </ul>
                    <div class="moneyPart">
                        <p v-if="
                            (item.transactionMain.tMId === 3 && (item.transactionVerb.tVId === 3 || item.transactionVerb.tVId === 1)) ||
                            (item.transactionMain.tMId === 2 && item.transactionVerb.tVId ===4)
                        ">-{{item.moneyAmount}}元</p>
                        <p v-if="
                            (item.transactionMain.tMId === 3 && (item.transactionVerb.tVId === 4 || item.transactionVerb.tVId === 2)) ||
                            (item.transactionMain.tMId === 2 && item.transactionVerb.tVId ===3)
                        ">+{{item.moneyAmount}}元</p>
                        <p class="pocketM">余额{{item.moneyResult}}元</p>
                    </div>
                </li>
            </ul>
        </template>
        <!-- 银行卡明细部分 -->
        <template v-if="target === 1">
            <p>银行卡交易记录</p>
            <ul class="record-type">
                <li ref="typeAll" :style="styleShowAll" @click="showAllCardRecord">全部</li>
                <li ref="typePart" :style="styleShowPart" @click="showCardPartType" v-if="recordType === 2 || recordType === 1">分类<i class="fas fa-angle-down"></i></li>
                <li :style="styleShowPart" @click="showCardPartType" v-if="recordType === 21">转入<i class="fas fa-angle-down"></i></li>
                <li :style="styleShowPart" @click="showCardPartType" v-if="recordType === 22">转出<i class="fas fa-angle-down"></i></li>
            </ul>
            <ul class="chooseType" v-show="recordType === 2">
                <li @click="getCardIn">转入</li>
                <li @click="getCardOut">转出</li>
            </ul>
            <div style="height:10px;background-color:#ccc"></div>
            <ul class="recordList2">
                <li class="recordList-item" v-for="item in recordListShow3" :key="item.id">
                    <span v-if=" 
                        (item.transactionMain.tMId === 3 && (item.transactionVerb.tVId === 3 || item.transactionVerb.tVId === 1)) ||
                        (item.transactionMain.tMId === 2 && item.transactionVerb.tVId ===3) ||
                        (item.transactionMain.tMId === 1 && (item.transactionVerb.tVId === 4 || item.transactionVerb.tVId === 2))
                        " style="color:#007aff">转出</span>
                    <span v-if="
                        (item.transactionMain.tMId === 3 && (item.transactionVerb.tVId === 4 || item.transactionVerb.tVId === 2)) ||
                        (item.transactionMain.tMId === 2 && item.transactionVerb.tVId ===4) ||
                        (item.transactionMain.tMId === 1 && (item.transactionVerb.tVId === 3 || item.transactionVerb.tVId === 1))
                        " style="color:red">转入</span>
                    <ul>
                        <li v-if="item.transactionMain.tMId === 3">
                            基金 -
                            <span v-if="item.transactionVerb.tVId === 1">添加</span>
                            <span v-if="item.transactionVerb.tVId === 3">买入</span>
                            <span v-if="item.transactionVerb.tVId === 4">卖出</span>
                            <span v-if="item.transactionVerb.tVId === 2">全部卖出</span>
                        </li>
                        <li v-if="item.transactionMain.tMId === 2">
                            余额 -
                            <span v-if="item.transactionVerb.tVId === 3">转入</span>
                            <span v-if="item.transactionVerb.tVId === 4">转出</span>
                        </li>
                        <li v-if="item.transactionMain.tMId === 1">
                            银行卡(此卡) -
                            <span v-if="item.transactionVerb.tVId === 3">转入</span>
                            <span v-if="item.transactionVerb.tVId === 4">转出</span>
                            <span v-if="item.transactionVerb.tVId === 1">添加绑定</span>
                        </li>
                        <li v-if="item.transactionMain.tMId === 3">{{item.mainInfoName}}({{item.mainInfoCode}})</li>
                        <li v-if="item.transactionMain.tMId !== 3"></li>
                        <li>{{item.tdate}}</li>
                    </ul>
                    <div class="moneyPart">
                        <p v-if="
                            (item.transactionMain.tMId === 3 && (item.transactionVerb.tVId === 3 || item.transactionVerb.tVId === 1)) ||
                            (item.transactionMain.tMId === 2 && item.transactionVerb.tVId ===3) ||
                            (item.transactionMain.tMId === 1 && item.transactionVerb.tVId ===4)
                        ">-{{item.moneyAmount}}元</p>
                        <p v-if="
                            (item.transactionMain.tMId === 3 && (item.transactionVerb.tVId === 4 || item.transactionVerb.tVId === 2)) ||
                            (item.transactionMain.tMId === 2 && item.transactionVerb.tVId ===4) ||
                            (item.transactionMain.tMId === 1 && item.transactionVerb.tVId ===3)
                        ">+{{item.moneyAmount}}元</p>
                    </div>
                </li>
            </ul>
        </template>
    </div>
</template>

<script>
import request from '../utils/request';
let timer;
let timer2;
export default {
    name:'RecordObj',
    props:['msg','target','fundHoldId','cardId'],
    data(){
        return {
            // 当前选择记录分类 1:全部 2：分类（默认1）

            recordType:1,
            styleHighLight:{
                color: '#007aff',
                borderBottom: '1px solid #007aff',
            },
            styleShowAll:'',
            styleShowPart:'',
            

            recordList:'',
            recordListShow:'',

            recordList2:'',
            recordListShow2:'',

            recordList3:'',
            recordListShow3:'',
        }
    },
    watch:{
        recordType:{
            immediate:true,
            handler(newValue){
                if(newValue === 1){
                    this.styleShowAll = this.styleHighLight;
                    this.styleShowPart = '';
                }else if(newValue === 2){
                    this.styleShowAll = '';
                    this.styleShowPart = this.styleHighLight;
                }
            }
        }
    },
    methods:{
        getfundRecordAll(){
            const userId = this.$store.state.userInfo.id;
            const mainId = this.fundHoldId;
            const formData = new FormData();
            formData.append('userId',userId);
            formData.append('mainId',mainId);
            request.post('/api/records/funddetail',formData).then(res => {
                this.recordList = res.data.data;
                this.recordListShow = this.recordList;
                // 以下应该交给后端
                // this.recordListShow.forEach((elem,index,arr) => {
                //     if(elem.transactionObj.tOId === 1){
                //         // 查出对应银行卡的卡名和卡号
                //         const formData2 = new FormData();
                //         formData2.append('objId',elem.objContentId);
                //         request.post('/api/records/cardinfo', formData2).then(res => {
                //             if(res.data.code === '0'){
                //                 elem.cardInfo = res.data.data;
                //             }
                //         },err => console.log(err));
                //     }
                // });
            },err => console.log(err));
        },
        showAllFundRecord(){
            this.recordType = 1;
            this.recordListShow = this.recordList;
        },
        showFundPartType(){
            this.recordType = 2;
        },
        getfundBuy(){
            this.recordType = 21;
            this.recordListShow = this.recordList.filter((elem) => {
                return elem.transactionVerb.tVId === 3 || elem.transactionVerb.tVId === 1;
            })
        },
        getfundSold(){
            this.recordType = 22;
            this.recordListShow = this.recordList.filter((elem) => {
                return elem.transactionVerb.tVId === 4 || elem.transactionVerb.tVId === 2;
            })
        },
        updFundRecord(){
            this.recordType = 1;
            this.getfundRecordAll();
        },

        getPocketRecordAll(){
            const verifyInfo = localStorage.getItem('user');
            const id = verifyInfo.split("-")[0];
            const userId = id;
            const formData = new FormData();
            formData.append('userId',userId);
            request.post('/api/records/pocketdetail',formData).then(res => {
                this.recordList2 = res.data.data;
                this.recordListShow2 = this.recordList2;
            },err => console.log(err));
        },
        showAllPocketRecord(){
            this.recordType = 1;
            this.recordListShow2 = this.recordList2;
        },
        showPocketPartType(){
            this.recordType = 2;
        },
        getPocketIn(){
            this.recordType = 21;
            this.recordListShow2 = this.recordList2.filter((elem) => {
                let flag = false;
                if(elem.transactionMain.tMId === 3 && (elem.transactionVerb.tVId === 4 || elem.transactionVerb.tVId === 2)){
                    flag = true;
                }
                if(elem.transactionMain.tMId === 2 && elem.transactionVerb.tVId === 3){
                    flag = true;
                }
                return flag;
            })
        },
        getPocketOut(){
            this.recordType = 22;
            this.recordListShow2 = this.recordList2.filter((elem) => {
                let flag = false;
                if(elem.transactionMain.tMId === 3 && (elem.transactionVerb.tVId === 3 || elem.transactionVerb.tVId === 1)){
                    flag = true;
                }
                if(elem.transactionMain.tMId === 2 && elem.transactionVerb.tVId === 4){
                    flag = true;
                }
                return flag;
            })
        },
        updPocketRecord(){
            this.recordType = 1;
            this.getPocketRecordAll();
        },

        getCardRecordAll(){
            const userId = this.$store.state.userInfo.id;
            const formData = new FormData();
            formData.append('userId',userId);
            formData.append('cardId',this.cardId);
            request.post('/api/records/carddetail',formData).then(res => {
                this.recordList3 = res.data.data;
                this.recordListShow3 = this.recordList3;
            },err => console.log(err));
        },
        showAllCardRecord(){
            this.recordType = 1;
            this.recordListShow3 = this.recordList3;
        },
        showCardPartType(){
            this.recordType = 2;
        },
        getCardIn(){
            this.recordType = 21;
            this.recordListShow3 = this.recordList3.filter((elem) => {
                let flag = false;
                if(elem.transactionMain.tMId === 3 && (elem.transactionVerb.tVId === 4 || elem.transactionVerb.tVId === 2)){
                    flag = true;
                }
                if(elem.transactionMain.tMId === 2 && elem.transactionVerb.tVId === 4){
                    flag = true;
                }
                if(elem.transactionMain.tMId === 1 && elem.transactionVerb.tVId === 3){
                    flag = true;
                }
                return flag;
            })
        },
        getCardOut(){
            this.recordType = 22;
            this.recordListShow3 = this.recordList3.filter((elem) => {
                let flag = false;
                if(elem.transactionMain.tMId === 3 && (elem.transactionVerb.tVId === 3 || elem.transactionVerb.tVId === 1)){
                    flag = true;
                }
                if(elem.transactionMain.tMId === 2 && elem.transactionVerb.tVId === 3){
                    flag = true;
                }
                if(elem.transactionMain.tMId === 1 && elem.transactionVerb.tVId === 4){
                    flag = true;
                }
                return flag;
            })
        },
        updCardRecord(){
            this.recordType = 1;
            this.getCardRecordAll();
        }
    },
    mounted(){
        this.$bus.$on('doUpd',(msg) => {
            // console.log(msg);
        });
        this.$bus.$on('updFundRecord',this.updFundRecord);
        this.$bus.$on('updPocketRecord',this.updPocketRecord);
        this.$bus.$on('updCardRecord',this.updCardRecord);
        if(this.target === 3){
            this.getfundRecordAll();
        }else if(this.target === 2){
            // 进入异步队列，保证能够获取到userId，刷新页面也会显示
            timer = setTimeout(() => {
                this.getPocketRecordAll();
            })
        }else if(this.target === 1){
            timer2 = setTimeout(() => {
                this.getCardRecordAll();
            })
        }
    },
    beforeDestroy(){
        this.$bus.$off('doUpd');
        this.$bus.$off('updFundRecord');
        this.$bus.$off('updPocketRecord');
        this.$bus.$off('updCardRecord');
        clearTimeout(timer);
        clearTimeout(timer2);
    }
}
</script>

<style scoped>
.transaction{
    position: relative;
}
.transaction > p{
    height: 30px;
    line-height: 30px;
    font-size: 18px;
    padding-left: 10px;
    border-bottom: 1px solid #999;
}
.record-type,
.chooseType{
    display: flex;
    justify-content: space-between;
}
.chooseType{
    position: absolute;
    z-index: 10;
    margin-top: -1px;
    border-top: 1px solid #999;
    background-color: #fff;
}
.chooseType > li,
.record-type > li{
    box-sizing: border-box;
    width: 160px;
    text-align: center;
    height: 40px;
    line-height: 40px;
    cursor: pointer;
}
.chooseType > li:hover,
.record-type > li:hover{
    color: #007bffa2;
    border-bottom: 1px solid #007affa2;
}
.chooseType > li{
    border-bottom: 1px solid #999;
}
.chooseType > li:first-child{
    border-right: 1px solid #999;
}
.recordList{
    height: 470px;
    overflow: auto;
}
.recordList-item{
    display: flex;
    border-bottom: 1px solid #999;
    padding: 10px 0px;
}
.recordList-item > span{
    width: 40px;
    font-size: 12px;
    text-align: center;
}
.recordList-item > ul{
    width: 200px;
}
.recordList-item > ul > li:first-child{
    font-size: 14px;
    height: 20px;
    line-height: 20px;
}
.recordList-item > ul > li:nth-child(2){
    height: 40px;
    font-size: 14px;
}
.recordList-item > ul > li:last-child{
    font-size: 12px;
    color: #999;
}
.recordList-item > p{
    width: 80px;
    text-align: center;
}
.recordList-item > .moneyPart{
    width: 80px;
    text-align: center;
    position: relative;
}
.moneyPart > p{
    font-size: 14px;
}
.moneyPart > .pocketM{
    position: absolute;
    font-size: 12px;
    color: #999;
    bottom: 0;
    font-size: 12px;
}
.recordList2{
    height: 420px;
    overflow: auto;
}
</style>