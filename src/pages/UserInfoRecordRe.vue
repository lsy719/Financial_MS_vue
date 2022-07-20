<template>
    <div class="user-bin">
        <div class="title">
            <span>已删除交易记录</span>
        </div>
        <div class="content">
            <ul class="record-title">
                <li>分类</li>
                <li>时间</li>
                <li>详情</li>
                <li>金额(元)</li>
                <li>操作</li>
            </ul>
            <ul class="record-content">
                <li v-for="item in transactionList" :key="item.id">
                    <!-- 选择状态圆圈 -->
                    <div class="choose"><input type="checkbox" ref="selectRecord" :value="item.id" @click="itemSelect"></div>
                    <!-- 分类 -->
                    <div class="content-type">{{item.transactionMain.tMName}}</div>
                    <!-- 时间 -->
                    <div class="content-time">
                        <p v-if="item.tdate.slice(0,10) !== jintian && item.tdate.slice(0,10) !== zuotian">{{item.tdate.slice(0,10)}}</p>
                        <p v-if="item.tdate.slice(0,10) === jintian">今天</p>
                        <p v-if="item.tdate.slice(0,10) === zuotian">昨天</p>
                        <p>{{item.tdate.slice(-8,)}}</p>
                    </div>
                    <!-- 详情 -->
                    <div class="content-detail">
                        <template v-if="item.transactionMain.tMId === 3">
                            <p>{{item.transactionVerb.tVname.slice(3,)}} - {{item.mainInfoName}}({{item.mainInfoCode}})</p>
                            <p v-if="item.transactionObj.tOId === 1">{{item.objInfoName}}({{item.objInfoCode.slice(-4,)}})</p>
                            <p v-if="item.transactionObj.tOId === 2">余额 - 剩余：{{item.moneyResult}}</p>
                            <p v-if="item.transactionObj.tOId === 4">其它</p>
                        </template>
                        <template v-if="item.transactionMain.tMId === 2">
                            <p v-if="item.transactionObj.tOId === 4">{{item.transactionVerb.tVname.slice(0,2)}} - {{item.transactionObj.tMOName}}</p>
                            <p v-if="item.transactionObj.tOId === 1">{{item.transactionVerb.tVname.slice(0,2)}} - {{item.objInfoName}}({{item.objInfoCode.slice(-4,)}})</p>
                            <p>操作后余额：{{item.moneyResult}}</p>
                        </template>
                        <template v-if="item.transactionMain.tMId === 1">
                            <p>{{item.transactionVerb.tVname.slice(0,2)}}</p>
                            <p>{{item.mainInfoName}}({{item.mainInfoCode.slice(-4,)}})</p>
                        </template>
                    </div>
                    <!-- 金额 -->
                    <div class="content-money">
                        {{item.moneyAmount}}
                    </div>
                    <!-- 操作 -->
                    <div class="content-action">
                        <template v-if="readyDelSolo !== item.id && readyRcvSolo !== item.id">
                            <p @click="recoverSolo(item.id)">
                                <span>恢复</span>
                            </p>
                            <p @click="destroySolo(item.id)">
                                <span>彻底删除</span>
                            </p>
                        </template>
                        <template v-if="readyDelSolo === item.id">
                            <p>
                                <span @click="actionCfm(-1,item.id)">确认</span>
                                <span @click="cancle">取消</span>
                            </p>
                            <p style="color:red; cursor:default">确认彻底删除？</p>
                        </template>
                        <template v-if="readyRcvSolo === item.id">
                            <p style="color:red; cursor:default">确认恢复此条记录？</p>
                            <p>
                                <span @click="actionCfm(1,item.id)">确认</span>
                                <span @click="cancle">取消</span>
                            </p>
                        </template>
                    </div>
                </li>
            </ul>
            <div class="choose-all">
                <div class="choose-all-cube">
                    <input type="checkbox" ref="selectAll" @click="selectAll($event)">
                </div>
                <div class="choose-all-title">
                    <span>全选/全不选</span>
                </div>
                <div class="choose-all-action">
                    <template v-if="readyDelSelect === 0 && readYRcvSelect === 0">
                        <p>
                            <span @click="recoverSelect">恢复已选</span>
                        </p>
                        <p>
                            <span @click="destroySelect">删除已选</span>
                        </p>
                    </template>
                    <template v-if="readyDelSelect === 1">
                        <p>
                            <span @click="actionCfm(-1,123)">确认</span>
                            <span @click="cancle">取消</span>
                        </p>
                        <p style="color:red; cursor:default">确认彻底删除所选？</p>
                    </template>
                    <template v-if="readYRcvSelect === 1">
                        <p style="color:red; cursor:default">确认恢复所选？</p>
                        <p>
                            <span @click="actionCfm(1,123)">确认</span>
                            <span @click="cancle">取消</span>
                        </p>
                    </template>
                </div>
            </div>
            <div class="heightBox"></div>
            <!-- 分页 -->
            <div class="page">
                <span @click="firstPage"><i class="fas fa-angle-double-left"></i>首页</span>
                <span @click="previousPage"><i class="fas fa-angle-left"></i>上一页</span>
                <span><span>{{indexRange}}</span>条，共<span>{{recordNumber}}</span>条</span>
                <span @click="nextPage">下一页<i class="fas fa-angle-right"></i></span>
                <span @click="lastPage">尾页<i class="fas fa-angle-double-right"></i></span>
            </div>
        </div>
    </div>
</template>

<script>
import request from '../utils/request';
let timer;
let debounceTimer;
export default {
    name:'UserInfoRecordRe',
    props:['nowPageS'],//34
    data(){
        return {
            jintian:'',
            zuotian:'',
            userId:'',
            vForTest:[1,2,3],

            // -------------删除与恢复-------------
            readyDelSolo:0,
            readyRcvSolo:0,

            readyDelSelect:0,
            readYRcvSelect:0,

            // -----------------------------------交易记录数据-------------------------------------
            // 条目总数，用来规划分页
            recordNumber:0,
            // 当前第几页，默认总是第一页
            pageSet:1,
            pageAll:1,
            // 每页的记录
            transactionList:[],
        }
    },
    computed:{
        indexRange(){
            let indexBegin = (this.pageSet-1)*10+1;
            let indexEnd = indexBegin + 9;
            if(indexBegin < 0){
                indexBegin = 0;
            }
            if(indexEnd > this.recordNumber){
                indexEnd = this.recordNumber;
            }
            return indexBegin + '-' +indexEnd;
        }
    },
    methods:{
        // 日期格式化为字符串,带参数
        formatDateLsy(date){
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
            const currentTime = year + dash + month + dash + day;
            return currentTime;
        },
        // 由天数计算多少天之前的日期(由当天的00:00:00算起，返回年月日)
        formatDateCounter(endDate, day){
            let end = new Date(Date.parse(endDate.replace(/-/g,'/')));
            let begin = end.getTime(); // 当天的00:00:00
            begin -= day * (24*3600*1000);
            let beginDate = new Date(begin);
            return this.formatDateLsy(beginDate);
        },
        itemSelect(){
            // forEach不能用berak和continue
            for(let i = 0; i < this.$refs['selectRecord'].length; i++){
                this.$refs['selectAll'].checked = true;
                if(!this.$refs['selectRecord'][i].checked){
                    this.$refs['selectAll'].checked = false;
                    break;
                }
            }
        },
        selectAll(e){
            this.$refs['selectRecord'].forEach((obj) => {
                obj.checked = e.target.checked;
            })
        },
        recoverSolo(id){
            this.readyRcvSolo = id;
        },
        recoverSelect(){
            this.readYRcvSelect = 1;
        },
        destroySolo(id){
            this.readyDelSolo = id;
        },
        destroySelect(){
            this.readyDelSelect = 1;
        },
        cancle(){
            this.readyDelSolo = 0;
            this.readyRcvSolo = 0;
            this.readyDelSelect = 0;
            this.readYRcvSelect = 0;
        },

        getRcc(){
            const verifyInfo = localStorage.getItem('user');
            const id = verifyInfo.split("-")[0];
            const userId = id;
            const formDate = new FormData();
            formDate.append('userId',userId);
            request.post('/api/records/myrrccnum',formDate).then(res => {
                this.recordNumber = res.data;
                if(this.recordNumber % 10 > 0){
                    this.pageAll = parseInt(this.recordNumber/10+1);
                    if(this.pageAll < this.pageSet){
                        this.pageSet = this.pageAll;
                    }
                }else{
                    this.pageAll = parseInt(this.recordNumber/10);
                    if(this.pageAll < this.pageSet){
                        this.pageSet = this.pageAll;
                    }
                }
                if((this.pageSet - 1)*10 < 0){
                    formDate.append('anchor',0);
                }else{
                    formDate.append('anchor',(this.pageSet - 1)*10);
                }
                
                formDate.append('pageSize',10);
                request.post('/api/records/myrrcc',formDate).then(res => {
                    this.transactionList = res.data.data;
                },err => console.log(err));
            },err => console.log(err));
        },
        
        actionCfm(mark,id){
            if(id === 123){
                //删除或恢复已选
                let recordIdList = new Array();
                this.$refs['selectRecord'].forEach((item) => {
                    if(item.checked){
                        recordIdList.push(parseInt(item.value));
                    }
                })
                if(recordIdList.length > 0){
                    const formDate = new FormData();
                    formDate.append('existState',mark);
                    formDate.append('recordId', recordIdList);
                    request.post('/api/records/rccrecord',formDate).then(res => {
                        if(res.data >= 1){
                            this.getRcc();
                        }else{
                            console.log('wasted');
                        }
                    },err => console.log(err));
                }else{
                    this.cancle();
                }
            }else{
                // 删除或恢复单条
                let recordIdList = new Array();
                recordIdList.push(parseInt(id));
                const formDate = new FormData();
                formDate.append('existState',mark);
                formDate.append('recordId', recordIdList);
                request.post('/api/records/rccrecord',formDate).then(res => {
                    if(res.data >= 1){
                        this.getRcc();
                    }else{
                        console.log('wasted');
                    }
                },err => console.log(err));
            }
        },

        // ---------------------分页查询功能----------------------
        nextPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet < this.pageAll){
                    this.pageSet ++;
                    this.getRcc();
                }
            },500);
        },
        previousPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet > 1){
                    this.pageSet --;
                    this.getRcc();
                }
            },500);
        },
        firstPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet !== 1){
                    this.pageSet = 1;
                    this.getRcc();
                }
            },500);
        },
        lastPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet !== this.pageAll){
                    this.pageSet = this.pageAll;
                    this.getRcc();
                }
            },500);
        },
    },
    mounted(){
        this.$store.commit('changePageS',this.nowPageS);
        this.jintian = this.formatDateLsy(new Date());
        this.zuotian = this.formatDateCounter(this.jintian,1);
        timer = setTimeout(() => {
            // console.log(this.$store.state.userInfo.id);
            this.userId = this.$store.state.userInfo.id;
            this.getRcc();
        },0);
    },
    beforeDestroy(){
        clearTimeout(timer);
        clearTimeout(debounceTimer);
    }
}
</script>

<style scoped>
.user-bin{
    height: 100%;
}
.title{
    height: 30px;
    line-height: 30px;
    margin-left: 5px;
    font-size: 14px;
    background-color: #fff;
    font-weight: bold;
    padding-left: 5px;
}
.content{
    padding-top: 10px;
    background-color: #fff;
    margin-top: 5px;
    margin-left: 5px;
    min-height: 465px;
}
.record-title{
    display: flex;
    margin: 5px 10px;
    border-bottom: 1px solid #aaa;
    font-size: 14px;
    color: #999;
    padding-left: 30px;
}
.record-title > li:first-child{
    width: 60px;
}
.record-title > li:nth-child(2){
    width: 100px;
}
.record-title > li:nth-child(3){
    width: 320px;
}
.record-title > li:nth-child(4){
    width: 120px;
}
.record-content > li{
    margin: 5px 10px;
    display: flex;
    height: 40px;
    border-bottom: 1px solid #ccc;
    font-size: 12px;
}

.choose{
    width: 30px;
    position: relative;
}
.content-type{
    width: 60px;
    line-height: 30px;
}
.content-time{
    width: 100px;
    color: #555;
}
.content-detail{
    width: 320px;
}
.content-money{
    width: 120px;
    line-height: 30px;
    color: #555;
}
.choose-all-action > p > span,
.content-action > p > span{
    cursor: pointer;
    margin-right: 10px;
}
.choose-all-action > p > span:hover,
.content-action > p > span:hover{
    text-decoration: underline;
}
.choose-all{
    margin-top: 20px;
    margin-left: 10px;
    margin-right: 10px;
    height: 30px;
    overflow: hidden;
    display: flex;
}
.choose input,
.choose-all input{
    display: inline-block;
    position: absolute;
    height: 15px;
    width: 15px;
    top: 7px;
    left: 7px;
}
.heightBox{
    margin: 10px;
    border-bottom: 1px dashed #999;
}
.choose-all-cube{
    position: relative;
    display: inline-block;
    height: 100%;
    width: 30px;
}

.choose-all-title{
    height: 100%;
    line-height: 30px;
    font-size: 12px;
}
.choose-all-action{
    margin-left: auto;
    margin-right: 65px;
}
.choose-all-action > p{
    font-size: 12px;
    line-height: 15px;
}
.page{
    margin-right: 30px;
    text-align: right;
    margin-top: 10px;
    height: 50px;
    font-weight: lighter;
    font-size: 12px;
}
.page > span{
    margin: 0 10px;
    cursor: pointer;
}
.page > span:hover{
    text-decoration: underline;
}
.page i{
    color: #555;
}
</style>