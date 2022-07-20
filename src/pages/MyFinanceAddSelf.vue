<template>
    <div class="add-self">
        <h3>理财记录添加</h3>
        <!-- 输入基金代码（只能输入数字，键入键出事件控制）=> 输入满6位 => 检查是否存在于allFund
            是 => 请求出详细信息，出现查看详情按钮，可进入垓基金详情页
            否 => 检查是否在于allFund
                是 => 名称不能修改，选择其它、余额、银行卡进行添加(和MyFinanceAddCall一样)
                否 => 自行输入名称，发给管理员后台，后台能够接收到消息，由一张数据表暂存，后面由后台管理界面进行添加 -->
        <div class="backtoadd-button" @click="back2add">
            <span><i class="fas fa-angle-double-left"></i>返回</span>
        </div>
        <div class="step1">
            <p>请输入基金代码(6位):</p>
            <input type="text" ref="fundCode" maxlength="6" @keydown="codeSet" @keyup="codeSetReady">
        </div>
        <div class="content" v-if="searchRes === 1">
            <h2>{{searchResFundHold.financeName}}</h2><span v-if="searchRes === 1">已记录</span>
            <p>基金代码：{{searchResFundHold.financeCode}}</p>
        </div>
        <div v-if="searchRes === 1 && loadThisHadDone === 1">
            <span class="operate-detail" @click="go2detail">前往查看详情</span>
        </div>

        <div class="content" v-if="searchRes === 2">
            <h2>{{searchResInAllFund.financeName}}</h2><span v-if="searchRes === 2" style="background-color: red;">未记录</span>
            <p>基金代码：{{searchResInAllFund.financeCode}}</p>
        </div>
        <div v-if="searchRes === 2">
            <span class="operate-detail" @click="chooseThis1">前往添加</span>
        </div>

        <div class="content" v-if="searchRes === 3">
            <p>暂未收录此代码对应基金，可暂时申请添加，最多3条。<br>目前已申请：<span style="color:#007aff;text-decoration: underline;">{{myApply.length}}</span>条</p><br>
            <p style="font-size:20px">请输入基金名称：(选填)</p>
            <input type="text" ref="fundName" maxlength="30">
        </div>
        <div v-if="searchRes === 3">
            <span class="operate-detail" @click="submitApply">提交</span>
        </div>
        <div class="my-apply-list">
            <p>申请记录</p>
            <ul class="my-apply-list-content">
                <li>
                    <span>基金名称</span>
                    <span>基金代码</span>
                    <span>状态</span>
                    <span>申请时间</span>
                </li>
                <li v-for="item in myApply" :key="item.applyId">
                    <span :title="item.fundName">{{item.fundName}}</span>
                    <span>{{item.fundCode}}</span>
                    <span v-if="item.applyState === 0">等待中</span>
                    <span v-if="item.applyState === 1">已添加</span>
                    <span v-if="item.applyState === -1">已拒绝</span>
                    <span>{{item.applyTime}}</span>
                    <span @click="delApply(item.applyId)">删除</span>
                </li>
            </ul>
        </div>

        <div v-show="confirmWindow === 666" class="alter-background" @click.self="confirmWindow = 0">
            <div class="alter-content">
                <p style="color:green">操作完成</p>
            </div>
        </div>
        <div v-show="confirmWindow === 555" class="alter-background" @click.self="confirmWindow = 0">
            <div class="alter-content">
                <p style="color:red">未知错误</p>
            </div>
        </div>
        <div v-show="confirmWindow === 777" class="alter-background" @click.self="confirmWindow = 0">
            <div class="alter-content">
                <p style="color:red">不能添加更多，如果必要，可删除部分申请</p>
            </div>
        </div>
        <div v-show="confirmWindow === 776" class="alter-background" @click.self="confirmWindow = 0">
            <div class="alter-content">
                <p style="color:red">不能重复添加，如果必要，可删除部分申请</p>
            </div>
        </div>
    </div>
</template>

<script>
import request from '../utils/request';
let timer;
let timer2;
let timer3;
export default {
    name:'MyFinanceAddSelf',
    props:['allFund','fundHold'],
    data(){
        return {
            fundHoldList:'',
            allFundList:'',
            searchResFundHold:'',
            propsFundHold:'',
            searchResInAllFund:'',
            /**
             * 输入的代码在用户持有中：1
             * 输入的代码在预存所有基金中：2
             * 都不在：3
             */
            searchRes:0,
            loadThisHadDone:0,
            confirmWindow:0,
            myApply:[],
        }
    },
    methods:{
        // 防抖
        debounce(fun, delay){
            return function(args){
                let that = this;
                let _args = args;
                clearTimeout(timer);
                timer = setTimeout(function(){
                    fun.call(that, _args)
                },delay);
            }
        },
        back2add(){
            this.$router.push({
                name:'myfinanceAdd',
            })
        },
        getFundHoldList(){
            // 进入异步队列
            timer2 = setTimeout(()=>{
                const userId = new FormData();
                // console.log(localStorage.getItem('user').split("-")[0])
                // userId.append('userId',this.$store.state.userInfo.id);//获取不到
                userId.append('userId',localStorage.getItem('user').split("-")[0]);//获取不到
                request.post('/api/finance/holdhund',userId).then(res => {
                    if(res.data.code === "0"){
                        this.fundHoldList = res.data.data;
                    }else{
                        /**
                         * 
                         */
                        console.log("未知错误");
                    }
                },err => console.log(err));
            },0);
        },
        getAllFundList(){
            request.post('/api/finance/allfund').then(res => {
                if(res.data.code === "0"){
                    this.allFundList = res.data.data;
                }else{
                    /**
                     * 
                     */
                    console.log("未知错误");
                }
            },err => console.log(err));
        },
        codeSet(){
            let fundCode = this.$refs['fundCode'].value;
            fundCode = fundCode.replace(/[^\d]/g,'');
            this.$refs['fundCode'].value = fundCode;
        },
        codeSetReady(){
            let fundCode = this.$refs['fundCode'].value;
            fundCode = fundCode.replace(/[^\d]/g,'');
            this.$refs['fundCode'].value = fundCode;
            if(fundCode.length === 6){
                // console.log(fundCode);
                clearTimeout(timer);
                timer = setTimeout(() => {
                    this.searchFundHold(fundCode);
                },500);
            }else{
                this.searchResFundHold = '';
                this.searchRes = 0;
                this.loadThisHadDone = 0;
            }
        },
        searchFundHold(fundCode){
            this.loadThisHadDone = 0;
            let resFundHold = this.fundHoldList.filter(elem => {
                return elem.financeCode === fundCode;
            })
            if(resFundHold.length === 1){
                this.searchResFundHold = resFundHold[0];
                this.loadThisHad();
                this.searchRes = 1;
            }else{
                let resFundAll = this.allFundList.filter(elem => {
                    return elem.financeCode === fundCode;
                })
                if(resFundAll.length === 1){
                    this.searchResInAllFund = resFundAll[0];
                    this.searchRes = 2;
                }else{
                    this.searchRes = 3;
                }
            }
        },
        // 如果已经持有，加载完整信息
        loadThisHad(){
            const formData = new FormData();
            formData.append('userHoldId',this.searchResFundHold.fundHoldId);
            request.post('/api/finance/reloadsolofund',formData).then(res => {
                this.propsFundHold = res.data.data;
                const formData2 = new FormData();
                formData2.append('userId',localStorage.getItem('user').split("-")[0]);
                formData2.append('financeCode',this.searchResFundHold.financeCode);
                request.post('/api/finance/loadfondstate',formData2).then(res => {
                    this.propsFundHold.financeState = res.data.data;
                    // 保证异步加载完成
                    this.loadThisHadDone = 1
                },err => console.log(err.message));
            },err => console.log(err.message));
        },
        go2detail(){
            this.$router.replace({
                name:'myfinanceDetail',
                params:{
                    fund:JSON.parse(JSON.stringify(this.propsFundHold)),
                }
            })
        },
        chooseThis1(){
            // console.log(JSON.parse(JSON.stringify(finance)));
            this.$router.push({
                name:'myfinanceAddCall',
                params:{
                    fund: JSON.parse(JSON.stringify(this.searchResInAllFund)),
                    fundHave: JSON.parse(JSON.stringify(this.fundHoldList)),
                }
            })
        },
        getApply(){
            timer3 = setTimeout(()=>{
                const formData = new FormData();
                formData.append('userId',localStorage.getItem('user').split("-")[0]);
                request.post('/api/finance/getmyappley', formData).then(res => {
                    if(res.data.code === '0'){
                        this.myApply = res.data.data;
                    }else{
                        this.myApply = [];
                    }
                })
            },0)
        },
        submitApply(){
            if(this.myApply.length >= 3){
                this.confirmWindow = 777;
            }else{
                let isExist = 0;
                this.myApply.forEach((item) => {
                    if(this.$refs['fundCode'].value == item.fundCode){
                        isExist = 1;
                    }
                })
                if(isExist === 1){
                    this.confirmWindow = 776;
                }else{
                    this.sendApply();
                }
            }
        },
        sendApply(){
            const applyFundCode = this.$refs['fundCode'].value;
            const appluFundName = this.$refs['fundName'].value;
            const userId = this.$store.state.userInfo.id;
            const formData = new FormData()
            formData.append('userId', userId);
            formData.append('fundName',appluFundName);
            formData.append('fundCode',applyFundCode);
            formData.append('applyTime',new Date());
            request.post('/api/finance/fundaddapply',formData).then(res => {
                if(res.data === 1){
                    this.confirmWindow = 666;
                    this.getApply();
                    this.$refs['fundName'].value = '';
                }else{
                    this.confirmWindow = 555;
                }
            },err => console.log(err));
        },
        delApply(applyId){
            const formData = new FormData();
            formData.append('applyId',applyId);
            request.post('/api/finance/delmyapply',formData).then(res => {
                if(res.data === 1){
                    this.getApply();
                }else{
                    this.confirmWindow = 555;
                }
            },err => console.log(err));
        }
    },
    created(){
        this.getApply();
    },
    mounted(){
        // 那这样了我为什么还要props呢？演示就不要刷新了，少一次请求-
        if(this.fundHold === undefined || this.allFund === undefined){
            this.getFundHoldList();
            this.getAllFundList();
        }else{
            this.fundHoldList = this.fundHold;
            this.allFundList = this.allFund;
        }
    },
    beforeDestroy(){
        clearTimeout(timer2);
        clearTimeout(timer3);
    }
}
</script>

<style scoped>
.add-self{
    position: relative;
    background-color: #fff;
    padding-bottom: 20px;
    min-height: 300px;
}
.add-self > h3{
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
.step1 > p{
    margin-top: 20px;
    margin-left: 20px;
    font-size: 20px;
}
.step1 > input{
    display: block;
    margin-top: 5px;
    margin-left: 20px;
    height: 28px;
    line-height: 28px;
    width: 180px;
    outline: 0px;
}
.content > h2{
    display: inline-block;
    margin-top: 20px;
    margin-left: 20px;
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
    margin-left: 20px;
    font-size: 14px;
}
.content > input{
    display: block;
    margin-top: 5px;
    margin-left: 20px;
    height: 28px;
    line-height: 28px;
    width: 300px;
    outline: 0px;
}
.operate-detail{
    display: inline-block;
    margin-left: 20px;
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
.alter-content p{
    text-align: center;
    font-size: 18px;
    margin: 20px auto;
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
.my-apply-list{
    position: absolute;
    top: 50px;
    right: 20px;
}
.my-apply-list p{
    font-size: 18px;
    border-bottom: 2px solid #000;
}
.my-apply-list-content{
    margin-top: 10px;
}
.my-apply-list-content > li:first-child{
    border-bottom: 1px solid #999;
}
.my-apply-list-content > li{
    margin: 5px 0;
    font-size: 12px;
}
.my-apply-list-content > li > span{
    display: inline-block;
    height: 16px;
    line-height: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
}
.my-apply-list-content > li > span:nth-child(1){
    width: 120px;
}
.my-apply-list-content > li > span:nth-child(2){
    width: 60px;
}
.my-apply-list-content > li > span:nth-child(3){
    width: 60px;
}
.my-apply-list-content > li > span:nth-child(4){
    width: 140px;
}
.my-apply-list-content > li > span:nth-child(5){
    cursor: pointer;
}
.my-apply-list-content > li > span:nth-child(5):hover{
    text-decoration: underline;
}
</style>