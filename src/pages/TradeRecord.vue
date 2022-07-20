<template>
    <div class="user-info">
        <div class="content">
            <p>交易记录
                <span @click="showDelete">查看已删除记录<i class="fas fa-trash-alt"></i></span>
            </p>
            <div class="heightbox"></div>
            <div class="search">
                <div class="search-time">
                    <span class="search-title">时间：</span>
                    <div class="date-select" v-if="visible">
                        <Datepicker range v-model="selectedDate" lang="cn"/>
                    </div>
                    <span class="timeInterval" style="margin-left:20px" :style="todayStyle" @click="selectTime(0)">今天</span>
                    <span>|</span>
                    <span style="margin-left:10px">最近：</span>
                    <span class="timeInterval" :style="oMoneyStyle" @click="selectTime(31)">1个月</span>
                    <span class="timeInterval" :style="tMoneyStyle" @click="selectTime(90)">3个月</span>
                    <span class="timeInterval" :style="oYearStyle" @click="selectTime(365)">1年</span>
                </div>
                <div class="search-object">
                    <span class="search-title">类别：</span>
                    <span style="margin-left:20px" :style="oTAllStyle" @click="selectMainObj(0)">全部</span>
                    <span :style="oTFundStyle" @click="selectMainObj(3)">基金</span>
                    <span :style="oTMoneyStyle" @click="selectMainObj(2)">余额</span>
                    <span :style="oTCardStyle" @click="selectMainObj(1)">银行卡</span>
                </div>
                <div class="search-v">
                    <span class="search-title">交易：</span>
                    <span style="margin-left:20px" :style="vAllStyle" @click="selectVMark(0)">全部</span>
                    <span :style="vInStyle" @click="selectVMark(3)">买入/转入</span>
                    <span :style="vOutStyle" @click="selectVMark(4)">卖出/转出</span>
                </div>
            </div>
            <div class="transaction">
                <ul class="record-title">
                    <li>分类</li>
                    <li>时间</li>
                    <li>名称 | 来源/去向 | 详情</li>
                    <li>金额(元)</li>
                    <li>操作</li>
                </ul>
                <ul class="record-content">
                    <!-- 列表渲染 -->
                    <li v-for="record in transactionList" :key="record.id">
                        <!-- 分类 80px -->
                        <div class="content-type" v-if="objectType === 0 || objectType === 3">
                            <span>{{record.transactionMain.tMName}}</span>
                        </div>
                        <div class="content-type" v-if="objectType === 1">
                            <span>银行卡</span>
                        </div>
                        <div class="content-type" v-if="objectType === 2">
                            <span>余额</span>
                        </div>
                        <!-- 时间 120px -->
                        <div class="content-time">
                            <p v-if="record.tdate.slice(0,10) !== jintian && record.tdate.slice(0,10) !== zuotian">{{record.tdate.slice(0,10)}}</p>
                            <p v-if="record.tdate.slice(0,10) === jintian">今天</p>
                            <p v-if="record.tdate.slice(0,10) === zuotian">昨天</p>
                            <p>{{record.tdate.slice(-8,)}}</p>
                        </div>
                        <!-- 内容 450px -->
                        <div class="content-detail">
                            <!-- 全部 -->
                            <template v-if="objectType === 0">
                                <!-- 基金 -->
                                <template v-if="record.transactionMain.tMId === 3">
                                    <p>
                                        <span v-if="record.transactionVerb.tVId === 3">买入 - </span>
                                        <span v-if="record.transactionVerb.tVId === 4">卖出 - </span>
                                        <span v-if="record.transactionVerb.tVId === 1">初次买入 - </span>
                                        <span v-if="record.transactionVerb.tVId === 2">全部卖出 - </span>
                                        <span>{{record.mainInfoName}}({{record.mainInfoCode}})</span>
                                    </p>
                                    <p>
                                        <template v-if="record.transactionObj.tOId === 1">
                                            <span>银行卡 - </span>
                                            <span>{{record.objInfoName}}({{record.objInfoCode.slice(-4,)}})</span>
                                        </template>
                                        <template v-if="record.transactionObj.tOId === 2">
                                            <span>余额 - </span>
                                            <span>剩余：<span style="color:#999">{{record.moneyResult}}</span></span>
                                        </template>
                                        <template v-if="record.transactionObj.tOId === 4">
                                            <span>其它</span>
                                        </template>
                                    </p>
                                </template>
                                <!-- 余额 -->
                                <template v-if="record.transactionMain.tMId === 2">
                                    <p>
                                        <span v-if="record.transactionVerb.tVId === 3">转入 - </span>
                                        <span v-if="record.transactionVerb.tVId === 4">转出 - </span>
                                        <span v-if="record.transactionObj.tOId === 1">银行卡&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                        <span v-if="record.transactionObj.tOId === 4">其它&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                        <span>剩余: <span style="color:#999;font-size:12px">{{record.moneyResult}}</span></span>
                                    </p>
                                    <p v-if="record.transactionObj.tOId === 1">
                                        <span>{{record.objInfoName}}({{record.objInfoCode.slice(-4,)}})</span>
                                    </p>
                                </template>
                                <!-- 银行卡 -->
                                <template v-if="record.transactionMain.tMId === 1">
                                    <p>
                                        <span>{{record.mainInfoName}}({{record.mainInfoCode.slice(-4,)}})</span>
                                    </p>
                                    <p>
                                        <span v-if="record.transactionVerb.tVId === 3">转入</span>
                                        <span v-if="record.transactionVerb.tVId === 4">转出</span>
                                        <span v-if="record.transactionVerb.tVId === 1">添加绑定</span>
                                        <span v-if="record.transactionVerb.tVId === 2">解除绑定</span>
                                    </p>
                                </template>
                            </template>

                            <!-- 基金 -->
                            <template v-if="objectType === 3">
                                <!-- 基金 -->
                                <template v-if="record.transactionMain.tMId === 3">
                                    <p>
                                        <span v-if="record.transactionVerb.tVId === 3">买入 - </span>
                                        <span v-if="record.transactionVerb.tVId === 4">卖出 - </span>
                                        <span v-if="record.transactionVerb.tVId === 1">初次买入 - </span>
                                        <span v-if="record.transactionVerb.tVId === 2">全部卖出 - </span>
                                        <span>{{record.mainInfoName}}({{record.mainInfoCode}})</span>
                                    </p>
                                    <p>
                                        <template v-if="record.transactionObj.tOId === 1">
                                            <span>银行卡 - </span>
                                            <span>{{record.objInfoName}}({{record.objInfoCode.slice(-4,)}})</span>
                                        </template>
                                        <template v-if="record.transactionObj.tOId === 2">
                                            <span>余额 - </span>
                                            <span>剩余：<span style="color:#999">{{record.moneyResult}}</span></span>
                                        </template>
                                        <template v-if="record.transactionObj.tOId === 4">
                                            <span>其它</span>
                                        </template>
                                    </p>
                                </template>
                            </template>

                            <!-- 余额 -->
                            <template v-if="objectType === 2">
                                <!-- 买入卖出基金选择的是余额 -->
                                <template v-if="record.transactionMain.tMId === 3">
                                    <p>
                                        <span>基金 - </span>
                                        <span>{{record.transactionVerb.tVname.slice(3,)}}({{record.moneyAmount}}元)</span>
                                        <span> - 交易后余额：<span style="color:#999">{{record.moneyResult}}</span></span>
                                    </p>
                                    <p>
                                        <span>{{record.mainInfoName}}({{record.mainInfoCode}})</span>
                                    </p>
                                </template>
                                <!-- 操作余额时转入转出到银行卡或其它(主为余额) -->
                                <template v-if="record.transactionMain.tMId === 2 && record.transactionObj.tOId === 1">
                                    <p>
                                        <span>{{record.transactionVerb.tVname.slice(0,2)}} - </span>
                                        <span>银行卡 - </span>
                                        <span>操作后余额：<span style="color:#999">{{record.moneyResult}}</span></span>
                                    </p>
                                    <p>
                                        <span>{{record.objInfoName}}({{record.objInfoCode.slice(-4,)}})</span>
                                    </p>
                                </template>
                                <template v-if="record.transactionMain.tMId === 2 && record.transactionObj.tOId === 4">
                                    <p>
                                        <span>{{record.transactionVerb.tVname.slice(0,2)}} - </span>
                                        <span>其它</span>
                                    </p>
                                    <p>
                                        <span>操作后余额：<span style="color:#999">{{record.moneyResult}}</span></span>
                                    </p>
                                </template>
                            </template>
                            <!-- 银行卡 -->
                            <template v-if="objectType === 1">
                                <!-- 买入卖出基金选择的是银行卡 -->
                                <template v-if="record.transactionMain.tMId === 3">
                                    <p>
                                        <span>基金 - </span>
                                        <span>{{record.mainInfoName}}({{record.mainInfoCode}})</span>
                                    </p>
                                    <p v-if="record.objInfoName">
                                        <span>{{record.transactionVerb.tVname.slice(3,)}}({{record.moneyAmount}}元) - </span>
                                        <span>{{record.objInfoName}}({{record.objInfoCode.slice(-4,)}})</span>
                                    </p>
                                </template>
                                <!-- 余额转入转入选择的是银行卡 -->
                                <template v-if="record.transactionMain.tMId === 2">
                                    <p>
                                        <span>余额 - {{record.transactionVerb.tVname.slice(0,2)}}({{record.moneyAmount}}元)</span>
                                        <span> - 操作后余额：<span style="color:#999">{{record.moneyResult}}</span></span>
                                    </p>
                                    <p v-if="record.objInfoName">
                                        <span>{{record.objInfoName}}({{record.objInfoCode.slice(-4,)}})</span>
                                    </p>
                                </template>
                                <!-- 银行卡自身转入转出 -->
                                <template v-if="record.transactionMain.tMId === 1">
                                    <p>
                                        <span>{{record.mainInfoName}}({{record.mainInfoCode.slice(-4,)}})</span>
                                    </p>
                                    <p>
                                        <span v-if="record.transactionVerb.tVId === 3">转入</span>
                                        <span v-if="record.transactionVerb.tVId === 4">转出</span>
                                        <span v-if="record.transactionVerb.tVId === 1">添加绑定</span>
                                        <span v-if="record.transactionVerb.tVId === 2">解除绑定</span>
                                    </p>
                                </template>
                            </template>
                        </div>
                        <div class="content-money">
                            <template v-if="objectType === 3">
                                <span style="color:#999"><span style="color:#999">{{record.moneyAmount}}</span></span>
                            </template>
                            <template v-if="objectType !== 3">
                                <span v-if="objectType === 0 && record.transactionMain.tMId === 3" style="color:#999">
                                    {{record.moneyAmount}}
                                </span>
                                <span v-else style="color:#999">
                                    <span v-if="record.transactionVerb.tVId === 3">+</span><span v-if="record.transactionVerb.tVId === 4">-</span>{{record.moneyAmount}}
                                </span>
                            </template>
                        </div>
                        <!-- 操作 -->
                        <div class="content-action">
                            <template v-if="deleteDialog === 0 || record.id !== deleteReady">
                                <p>
                                    <span @click="deleteRecord(record.id)">删除</span>
                                </p>
                            </template>
                            <template v-if="deleteDialog === 1 && record.id === deleteReady">
                                <p style="color:red;cursor:default">确定删除？</p>
                                <p>
                                    <span @click="deleteRecordCfm(record.id)">确定</span>
                                    <span @click="deleteCancle">取消</span>
                                </p>
                            </template>
                        </div>
                    </li>
                </ul>
            </div>
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
let timer;
let debounceTimer;
let searchByDateTimer;
let searchByTradeTimer;
let searchByMainObjTimer;
import request from '../utils/request';
import 'vue-datepicker-ui/lib/vuedatepickerui.css';
import VueDatepickerUi from 'vue-datepicker-ui';
export default {
    name:'TradeRecord',
    components: {
        Datepicker: VueDatepickerUi
    },
    props:['nowPage'],
    data(){
        return {
            jintian:'',
            zuotian:'',
            userId:'',
            // -------------------------------查询时间------------------------------
            // 默认选择查询的时间间隔
            dateInterval:31,
            // 用来提交的
            beginDate:'',
            endDate:'',
            // 刷新插件用
            visible:1,
            // 插件用来显示的
            selectedDate: [
                new Date(new Date().getTime() - 31 * 24 * 60 * 60 * 1000),
                new Date(),
            ],
            todayStyle:'',
            oMoneyStyle:'',
            tMoneyStyle:'',
            oYearStyle:'',
            // ------------------------------查询类别--------------------------------------
            // 默认选择查询的类别 0 全部  1 银行卡  2 余额  3 基金
            objectType:0,
            oTAllStyle:'',
            oTFundStyle:'',
            oTMoneyStyle:'',
            oTCardStyle:'',
            // ------------------------------查询交易行为------------------------------------
            // 默认选择查询的交易行为 0 全部  3 添加/买入转入  4 卖出/转出/全部卖出/解绑
            vMark:0,
            vAllStyle:'',
            vInStyle:'',
            vOutStyle:'',

            // -----------------------------------交易记录数据-------------------------------------
            // 条目总数，用来规划分页
            recordNumber:0,
            // 当前第几页，默认总是第一页
            pageSet:1,
            pageAll:1,
            // 每页的记录
            transactionList:[],

            // ---------------------------------删除操作（含弹窗）----------------------------------------
            deleteDialog: 0,
            // 当前选择删除的那条记录:
            deleteReady: 0,

        }
    },
    computed:{
        indexRange(){
            let indexBegin = (this.pageSet-1)*10+1;
            let indexEnd = indexBegin + 9;
            if(indexEnd > this.recordNumber){
                indexEnd = this.recordNumber;
            }
            return indexBegin + '-' +indexEnd;
        }
    },
    watch:{
        dateInterval:{
            immediate:true,
            handler(newValue){
                if(newValue === 31){
                    this.todayStyle = '';
                    this.oMoneyStyle = {backgroundColor: '#999',color:'#fff'};
                    this.tMoneyStyle = '';
                    this.oYearStyle = '';
                }else if(newValue === 0){
                    this.todayStyle = {backgroundColor: '#999',color:'#fff'};
                    this.oMoneyStyle = '';
                    this.tMoneyStyle = '';
                    this.oYearStyle = '';
                }else if(newValue === 90){
                    this.todayStyle = '';
                    this.oMoneyStyle = '';
                    this.tMoneyStyle = {backgroundColor: '#999',color:'#fff'};
                    this.oYearStyle = '';
                }else if(newValue === 365){
                    this.todayStyle = '';
                    this.oMoneyStyle = '';
                    this.tMoneyStyle = '';
                    this.oYearStyle = {backgroundColor: '#999',color:'#fff'};
                }else{
                    this.todayStyle = '';
                    this.oMoneyStyle = '';
                    this.tMoneyStyle = '';
                    this.oYearStyle = '';
                }
                this.searchByDate();
            }
        },
        selectedDate:{
            deep:true,
            handler(newValue){
                this.dateInterval = -1;
                this.beginDate = this.formatTimeDayBegin(this.formatDateLsy(newValue[0]));
                this.endDate = this.formatTimeDayEnd(this.formatDateLsy(newValue[1]));
                this.searchByDate();
            }
        },
        objectType:{
            immediate:true,
            handler(newValue){
                if(newValue === 0){
                    this.oTAllStyle = {backgroundColor: '#999',color:'#fff'};
                    this.oTFundStyle = '';
                    this.oTMoneyStyle = '';
                    this.oTCardStyle = '';
                }else if(newValue === 1){
                    this.oTAllStyle = '';
                    this.oTFundStyle = '';
                    this.oTMoneyStyle = '';
                    this.oTCardStyle = {backgroundColor: '#999',color:'#fff'};
                }else if(newValue === 2){
                    this.oTAllStyle = '';
                    this.oTFundStyle = '';
                    this.oTMoneyStyle = {backgroundColor: '#999',color:'#fff'};
                    this.oTCardStyle = '';
                }else if(newValue === 3){
                    this.oTAllStyle = '';
                    this.oTFundStyle = {backgroundColor: '#999',color:'#fff'};
                    this.oTMoneyStyle = '';
                    this.oTCardStyle = '';
                }
            }
        },
        vMark:{
            immediate:true,
            handler(newValue){
                if(newValue === 0){
                    this.vAllStyle = {backgroundColor: '#999',color:'#fff'};
                    this.vInStyle = '';
                    this.vOutStyle = '';
                }else if(newValue === 3){
                    this.vAllStyle = '';
                    this.vInStyle = {backgroundColor: '#999',color:'#fff'};
                    this.vOutStyle = '';
                }else if(newValue ===4){
                    this.vAllStyle = '';
                    this.vInStyle = '';
                    this.vOutStyle = {backgroundColor: '#999',color:'#fff'};
                }
            }
        },
        pageAll:{
            handler(newValue){
                if(newValue < this.pageSet){
                    this.pageSet = newValue;
                }
            }
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
        // 当天的开始 00:00:00
        formatTimeDayBegin(str){
            const currentTime = str + ' ' + '00' + ':' + '00' + ':' + '00';
            return currentTime;
        },
        // 当天的结束 23:59:59
        formatTimeDayEnd(str){
            const currentTime = str + ' ' + '23' + ':' + '59' + ':' + '59';
            return currentTime;
        },
        // 今天 yyyy-DD-mm，字符串
        formatDateToday(){
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
        selectTime(interval){
            this.dateInterval = interval;
            const endDate = this.formatDateToday();
            const beginDate = this.formatDateCounter(this.formatDateToday(), interval);
            let standardEndDate = new Date(Date.parse(endDate.replace(/-/g,'/'))); //为当天的 00:00:00
            let standardBeginDate = new Date(Date.parse(beginDate.replace(/-/g,'/')));
            standardEndDate = standardEndDate.getTime();
            standardEndDate += 24*3600*1000-1000;
            standardEndDate = new Date(standardEndDate);
            this.selectedDate[0] = standardBeginDate;
            this.selectedDate[1] = standardEndDate;
            // 强制刷新一波
            this.visible = 0;
            this.$nextTick(()=>{
                this.visible = 1;
            })
            // 实际提交 this.formatTimeDayEnd(endDate);
            // 实际提交 this.formatTimeDayBegin(beginDate);
            this.endDate = this.formatTimeDayEnd(endDate);
            this.beginDate = this.formatTimeDayBegin(beginDate);
            // this.searchByDate();
        },
        searchByDate(){
            // console.log('开始于',this.beginDate);
            // console.log('结束于',this.endDate);
            // 这两个数据在data中已经改了，直接查就行
            clearTimeout(searchByDateTimer);
            searchByDateTimer = setTimeout(() => {
                this.pageSet = 1;
                this.getTransaction();
            },500)
        },

        // 选择查找记录的对象
        selectMainObj(mainMark){
            if(this.objectType !== mainMark){
                this.transactionList = '';
                this.objectType = mainMark;
                // console.log(mainMark);
                // 不需要提交，前端按mainMark请求不同的api
                clearTimeout(searchByMainObjTimer);
                searchByMainObjTimer = setTimeout(() => {
                    this.pageSet = 1;
                    this.getTransaction();
                },50)
            }
        },

        // 选择查询的交易方式
        selectVMark(vMark){
            if(this.vMark === vMark){
                // 无动于衷
            }else{
                this.vMark = vMark;
                clearTimeout(searchByTradeTimer);
                searchByTradeTimer = setTimeout(() => {
                    this.pageSet = 1;
                    this.getTransaction();
                },500);
            }
            // 需要提交 1 3 4，详细对应后端接口
        },

        getTransaction(){
            const obj = this.objectType;
            const verifyInfo = localStorage.getItem('user');
            const userId = verifyInfo.split("-")[0];
            const beginDate = this.beginDate;
            const endDate = this.endDate;
            const vMark = this.vMark;
            const formDate = new FormData();
            formDate.append('userId',userId);
            formDate.append('beginDate',beginDate);
            formDate.append('endDate',endDate);
            formDate.append('vMark',vMark);
            if(obj === 0){
                request.post('/api/records/myrecordallnum',formDate).then(res => {
                    if(res.data !== -1 && res.data !== 0){
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
                        formDate.append('anchor',(this.pageSet - 1)*10);
                        formDate.append('pageSize',10);
                        request.post('/api/records/myrecordall',formDate).then(res => {
                            this.transactionList = res.data.data;
                        },err => console.log(err));
                    }else{
                        // console.log('无结果');
                        alert('无结果！');
                        this.recordNumber = 0;
                    }
                })
            }else if(obj === 3){
                // 请求基金myrecordfundnum、myrecordfund
                request.post('/api/records/myrecordfundnum',formDate).then(res => {
                    if(res.data !== -1 && res.data !== 0){
                        this.recordNumber = res.data;
                        if(this.recordNumber % 10 > 0){
                            this.pageAll = parseInt(this.recordNumber/10+1);
                        }else{
                            this.pageAll = parseInt(this.recordNumber/10);
                        }
                        formDate.append('anchor',(this.pageSet - 1)*10);
                        formDate.append('pageSize',10);
                        request.post('/api/records/myrecordfund',formDate).then(res => {
                            this.transactionList = res.data.data;
                        },err => console.log(err));
                    }else{
                        this.recordNumber = 0;
                    }
                })
            }else if(obj === 2){
                // 请求余额myrecordpocketnum、myrecordpocket
                request.post('/api/records/myrecordpocketnum',formDate).then(res => {
                    if(res.data !== -1 && res.data !== 0){
                        this.recordNumber = res.data;
                        if(this.recordNumber % 10 > 0){
                            this.pageAll = parseInt(this.recordNumber/10+1);
                        }else{
                            this.pageAll = parseInt(this.recordNumber/10);
                        }
                        formDate.append('anchor',(this.pageSet - 1)*10);
                        formDate.append('pageSize',10);
                        request.post('/api/records/myrecordpocket',formDate).then(res => {
                            this.transactionList = res.data.data;
                        },err => console.log(err));
                    }else{
                        this.recordNumber = 0;
                    }
                })
            }else if(obj === 1){
                // 请求银行卡myrecordcardnum、myrecordcard
                request.post('/api/records/myrecordcardnum',formDate).then(res => {
                    if(res.data !== -1 && res.data !== 0){
                        this.recordNumber = res.data;
                        if(this.recordNumber % 10 > 0){
                            this.pageAll = parseInt(this.recordNumber/10+1);
                        }else{
                            this.pageAll = parseInt(this.recordNumber/10);
                        }
                        formDate.append('anchor',(this.pageSet - 1)*10);
                        formDate.append('pageSize',10);
                        request.post('/api/records/myrecordcard',formDate).then(res => {
                            this.transactionList = res.data.data;
                        },err => console.log(err));
                    }else{
                        this.recordNumber = 0;
                    }
                })
            }
        },
        // ---------------------分页查询功能----------------------
        nextPage(){
            if(this.recordNumber == 0){
                return;
            }
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet < this.pageAll){
                    this.pageSet ++;
                    this.getTransaction();
                }
            },500);
        },
        previousPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet > 1){
                    this.pageSet --;
                    this.getTransaction();
                }
            },500);
        },
        firstPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet !== 1){
                    this.pageSet = 1;
                    this.getTransaction();
                }
            },500);
        },
        lastPage(){
            if(this.recordNumber == 0){
                return;
            }
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet !== this.pageAll){
                    this.pageSet = this.pageAll;
                    this.getTransaction();
                }
            },500);
        },
        // -----------------删除功能------------------
        deleteRecord(recordId){
            this.deleteDialog = 1;
            this.deleteReady = recordId;
        },
        deleteRecordCfm(recordId){
            const formDate = new FormData();
            formDate.append('recordId',recordId);
            request.post('/api/records/delrecord',formDate).then(res => {
                if(res.data === 1){
                    this.deleteCancle();
                    this.getTransaction();
                }else{
                    console.log('删除失败')
                    this.deleteCancle();
                }
            },err => {
                console.log(err);
            })
        },
        deleteCancle(){
            this.deleteDialog = 0;
            this.deleteReady = 0;
        },
        showDelete(){
            this.$router.push({
                name:'userInfoRecordRe',
            })
        }
    },
    mounted(){
        this.$store.commit('changePage',this.nowPage);
        this.jintian = this.formatDateLsy(new Date());
        this.zuotian = this.formatDateCounter(this.jintian,1);
        timer = setTimeout(() => {
            // console.log(this.$store.state.userInfo.id);
            this.userId = this.$store.state.userInfo.id;
            this.getTransaction();
        },0);
        this.selectTime(this.dateInterval);
    },
    beforeDestroy(){
        clearTimeout(timer);
        clearTimeout(debounceTimer);
        clearTimeout(searchByDateTimer);
        clearTimeout(searchByTradeTimer);
        clearTimeout(searchByMainObjTimer);
    }
}
</script>

<style scoped>
/* #region */
.user-info{
    height: 100%;
    background-color: #eee;
}
.content{
    min-height: 500px;
    width: 999px;
    margin: 0 auto;
    background-color: #fff;
}
.content > p{
    position: relative;
    padding-left: 30px;
    color: #555;
    height: 30px;
    line-height: 30px;
    border-bottom: 1px solid #555;
}
.content > p > span{
    position: absolute;
    height: 30px;
    right: 50px;
    line-height: 31px;
    font-size: 12px;
    cursor: pointer;
}
.content > p > span:hover{
    text-decoration: underline;
    color: #000;
}
.search-object,
.search-v{
    margin: 20px 0;
    margin-left: 30px;
}
.search-time{
    height: 60px;
    margin-left: 30px;
    margin-right: 30px;
    margin-bottom: 10px;
    border-bottom: 1px dashed #999;
}
.search-time > .timeInterval{
    cursor: pointer;
    margin: 0 5px;
    padding: 5px 5px;
    border-radius: 5px;
}
.search-time > .timeInterval:hover{
    background-color: rgb(255, 249, 198);
}
.date-select{
    display: inline-block;
    margin-left: 20px;
}
.search-v > span:first-child ~ span,
.search-object > span:first-child ~ span{
    padding: 5px 5px;
    margin: 0 5px;
    border-radius: 5px;
    cursor: pointer;
}
.search-v > span:first-child ~ span:hover,
.search-object > span:first-child ~ span:hover{
    background-color: rgb(255, 249, 198);
}
.heightbox{
    height: 10px;
    background-color: rgb(244, 245, 250);
}
.search{
    padding-bottom: 10px;
    background-color: rgb(244, 245, 250);
}
/* #endregion */
/* #region */
.transaction{
    margin-top: 10px;
}
.record-title{
    display: flex;
    margin: 0 30px;
    border-bottom: 1px solid #999;
}
.record-title > li{
    color: #555;
    font-size: 12px;
    height: 20px;
    line-height: 20px;
}
.record-title > li:first-child{
    width: 80px;
}
.record-title > li:nth-child(2){
    width: 120px;
}
.record-title > li:nth-child(3){
    width: 450px;
}
.record-title > li:nth-child(4){
    width: 200px;
}
/* #endregion */
.record-content > li{
    display: flex;
    line-height: 25px;
    padding-bottom: 5px;
    font-size: 14px;
    margin: 5px 30px;
    border-bottom: 1px solid #eee;
}
.record-content > li .content-type{
    width: 80px;
    height: 50px;
    line-height: 50px;
}
.record-content > li .content-time{
    width: 120px;
    font-size: 12px;
    color: #999;
}
.record-content > li .content-detail{
    width: 450px;
}
.record-content > li .content-money{
    width: 200px;
    font-size: 12px;
    line-height: 50px;
}
.page{
    margin-right: 100px;
    text-align: right;
    margin-top: 10px;
    height: 50px;
    font-weight: lighter;
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
.content-action p{
    font-size: 13px;
    color: #555;
    cursor: pointer;
}
.content-action p > span{
    margin-right: 3px;
}
.content-action p > span:hover{
    text-decoration: underline;
}
</style>