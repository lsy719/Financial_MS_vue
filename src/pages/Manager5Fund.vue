<template>
    <div class="fund-list">
        <div class="page-title">
            <p>基金收录</p>
            <p class="fund-add" @click="managerAdd"><i class="fas fa-plus">新增</i></p>
        </div>
        <span class="all" @click="showAll">全部</span>
        <span class="all" @click="showApply">用户申请</span>
        <div class="like-search">
            <p>选择查询类型：</p>
            <select ref="searchChoose" >
                <option value="1">代码</option>
                <option value="2">名称</option>
            </select>
            <input type="text" maxlength="25" ref="searchInput" @keyup="codeSet" @keydown="codeSet">
            <span @click="searchByInput">搜索</span>
        </div>
        <span class="searchAlert" v-if="searchAlertShow === 1">不能为空</span>
        <span class="searchAlert" v-if="searchAlertShow === 2">无结果</span>
        <ul class="begin-number">
            <li v-for="n in 10" :key="n-1" @click="searchBy1stNum(n-1)">{{n-1}}</li>
        </ul>
        <span class="searchAlert" v-if="searchAlertShow === 3">无结果</span>
        <!-- 不用显示数量，分页那里已经显示了 -->
        <!-- <span class="searchAlert" v-if="searchAlertShow === 3">共{{searchResNum}}条</span> -->
        <div class="fund-all" v-if="nowList === 1">
            <ul>
                <li v-for="item in fundList" :key="item.financeId">
                    <span v-if="item.financeName.length > 12" :title="item.financeName">（{{item.financeCode}}）{{item.financeName.slice(0,11)}}...</span>
                    <span v-if="item.financeName.length <= 12">（{{item.financeCode}}）{{item.financeName}}</span>
                    <span>|</span>
                    <span @click="editCollected(item)">编辑</span>
                </li>
            </ul>
        </div>
        <div class="fund-userapply" v-if="nowList === 2">
            <p>用户需要添加：</p>
            <ul class="userapply-list">
                <li class="list-head">
                    <div>用户ID</div>
                    <div>基金代码</div>
                    <div>基金名称</div>
                    <div>申请时间</div>
                    <div>操作</div>
                </li>
                <li class="list-body" v-for="item in userApplyList" :key="item.applyId">
                    <div>{{item.userId}}</div>
                    <div>{{item.fundCode}}</div>
                    <div>{{item.fundName}}</div>
                    <div>{{item.applyTime}}</div>
                    <div class="action"><span @click="applyAdd(item)">添加</span><span @click="applyRefuse(item)">拒绝</span></div>
                </li>
            </ul>
        </div>

        <!-- 分页 -->
        <!-- 展示全部系用户时的分页 -->
        <template v-if="nowList === 1">
            <div class="page">
                <span @click="firstPage"><i class="fas fa-angle-double-left"></i>首页</span>
                <span @click="previousPage"><i class="fas fa-angle-left"></i>上一页</span>
                <span><span>{{indexRange}}</span>条，共<span>{{fundNum}}</span>条</span>
                <span @click="nextPage">下一页<i class="fas fa-angle-right"></i></span>
                <span @click="lastPage">尾页<i class="fas fa-angle-double-right"></i></span>
            </div>
        </template>
        <!-- 展示搜索后的分页 -->
        <template v-if="nowList === 2">
            <div class="page">
                <span @click="firstPageApply"><i class="fas fa-angle-double-left"></i>首页</span>
                <span @click="previousPageApply"><i class="fas fa-angle-left"></i>上一页</span>
                <span><span>{{indexRangeApply}}</span>条，共<span>{{fundNum}}</span>条</span>
                <span @click="nextPageApply">下一页<i class="fas fa-angle-right"></i></span>
                <span @click="lastPageApply">尾页<i class="fas fa-angle-double-right"></i></span>
            </div>
        </template>

        <div class="caouzuo-area" v-if="nowEditAction !== 0">
            <!-- 基金修改 -->
            <template v-if="nowEditAction == 1">
                <div class="allfund-add">
                    <span>修改名称</span>
                    <p>基金代码：<span>{{nowEditObject.financeCode}}</span></p>
                    <p>基金名称：</p>
                    <template v-if="nameIsChanging == 0">
                        <div class="input-box">
                            <input type="text" maxlength="25" ref="newFundName" v-model="nowEditFundName">
                        </div>
                        <div class="name-change-option">
                            <span @click="nameChangeReset">重置</span>
                            <span @click="showChange">确认</span>
                        </div>
                    </template>
                    <template v-if="nameIsChanging == 1">
                        <p class="fundNameChange">{{nowEditObject.financeName}}</p>
                        <p style="text-align:center;font-size:12px;color:#999">更改为<i class="fas fa-arrow-circle-down"></i></p>
                        <p class="fundNameChange">{{nowEditFundName}}</p>
                        <div class="name-change-option" style="margin: 0 auto;">
                            <span @click="cancleChangeInner">取消</span>
                            <span @click="saveName">确认</span>
                        </div>
                    </template>
                    <template v-if="nameIsChanging == 2">
                        <p class="fundNameChange">{{nowEditFundName}}</p>
                        <p style="text-align:center;font-size:12px;color:#999">修改成功，点击下方按钮返回</p>
                    </template>
                </div>
            </template>
            <!-- 用户申请添加 -->
            <template v-if="nowEditAction == 2"> 
                <div class="allfund-add">
                    <span>用户申请添加</span>
                    <p>基金代码：<span>{{nowEditObject.fundCode}}</span></p>
                    <p>基金名称：</p>
                    <template v-if="nameIsChanging == 0">
                        <div class="input-box">
                            <input type="text" maxlength="25" ref="newFundName" v-model="nowEditFundName">
                        </div>
                        <div class="name-change-option">
                            <span @click="applyChangeReset">重置</span>
                            <span @click="showAdd">确认</span>
                        </div>
                    </template>
                    <template v-if="nameIsChanging == 1 || nameIsChanging == 3">
                        <p style="font-size:16px;color:#999;margin-top:10px">添加<i class="fas fa-arrow-circle-down"></i>：</p>
                        <p class="fundApplyAdd">
                            <span style="font-size:16px">代码：{{nowEditObject.fundCode}}</span>
                            <span style="font-size:16px" :title="nowEditFundName">名称：{{nowEditFundName}}</span>
                        </p>
                        <div class="name-change-option" style="margin: 10px auto;">
                            <span @click="cancleChangeInner">取消</span>
                            <span @click="saveAdd">确认</span>
                        </div>
                        <p v-if="nameIsChanging == 3" style="text-align:center;font-size:12px;color:#999;margin-top:10px">处理失败</p>
                    </template>
                    <template v-if="nameIsChanging == 2">
                        <p class="fundApplyAdd">
                            <span style="font-size:16px">代码：{{nowEditObject.fundCode}}</span>
                            <span style="font-size:16px" :title="nowEditFundName">名称：{{nowEditFundName}}</span>
                        </p>
                        <p style="text-align:center;font-size:12px;color:#999;margin-top:10px">处理成功，点击下方按钮返回，<br>完成申请<span style="text-decoration: underline;">{{finishApplyNum}}</span></p>
                    </template>
                </div>
            </template>
            <!-- 用户申请拒绝 -->
            <template v-if="nowEditAction == 3">
                <div class="allfund-add">
                    <span style="display:block">拒绝用户申请</span>
                    <p class="fundApplyAdd" style="margin-top:10px">
                        <span style="font-size:16px">代码：{{nowEditObject.fundCode}}</span>
                        <span style="font-size:16px" :title="nowEditObject.fundName">名称：{{nowEditObject.fundName}}</span>
                    </p>
                    <p style="font-size:14px;color:red;">确认拒绝此申请？</p>
                    <div class="name-change-option">
                        <span @click="cancleChange">取消</span>
                        <span @click="saveRefuse">确认</span>
                    </div>
                </div>
            </template>
            <!-- 基金添加 -->
            <template v-if="nowEditAction == 4">
                <div class="manager-fund-add">
                    <p>基金添加</p>
                    <template v-if="managerAddCfm == 0">
                        <p class="mfa-title1">输入基金代码：(6位数字)</p>
                        <div class="input-box">
                            <input type="text" maxlength="6" ref="newFundCode" v-model="newFundCodeInput" @keydown="managerAddCodeSet" @keyup="managerAddCodeSet">
                        </div>
                        <span v-if="showMaddInfo == 1" class="checkExist" style="margin-top:10px" @click="managerAddCheckCodeExist">检查</span>
                        <p v-if="showMaddInfo == -1">已存在，不可添加</p>
                        <template v-if="showMaddInfo == 2">
                            <p class="mfa-title1">输入基金名称：</p>
                            <div class="input-box">
                                <input type="text" maxlength="25" ref="newFundName" @keydown="managerAddNameSet" @keyup="managerAddNameSet">
                            </div>
                            <div class="name-change-option">
                                <span @click="managerAddCancleInner">取消</span>
                                <span @click="showAddFundInfo">确认</span>
                            </div>
                        </template>
                    </template>
                    <template v-if="managerAddCfm == 1">
                        <p class="mfa-title1">将添加以下基金：</p>
                        <p class="fundApplyAdd">
                            <span style="font-size:16px">代码：{{newFundCodeInput}}</span>
                            <span style="font-size:16px" :title="newFundNameInput">名称：{{newFundNameInput}}</span>
                        </p>
                        <template v-if="managerAddMsg != 1">
                            <div class="name-change-option">
                                <span @click="managerAddCancelFinal">取消</span>
                                <span @click="saveManageAdd">确认</span>
                            </div>
                        </template>
                        <!-- 添加成功 -->
                        <template v-if="managerAddMsg == 1">
                            <p class="mfa-title1" style="color:#999">添加成功，点击下方按钮返回</p>
                        </template>
                        <template v-if="managerAddMsg == 2">
                            <p class="mfa-title1" style="color:red">添加失败</p>
                        </template>
                    </template>
                </div>
            </template>
            <span class="close-change" @click="cancleChange">返回</span>
        </div>
    </div>
</template>

<script>
let debounceTimer;
let timerAsync;
import request from '../utils/request';
export default {
    name:'Manager5Fund',
    data(){
        return {
            managerInfo:'',
            nowList:1,//当前展示列表的对象，1.全部 2.用户申请(默认显示用户申请，这里的主要执行功能是添加)
            searchType:0,//当前是否进行搜索，搜索类型 0.未搜索 1.按代码搜索 2.按名称搜索 3.点击开头数字
            searchContent:'',//搜索内容 默认就是空
            pageSet:1,
            pageAll:1,
            pageSizeAll:50,
            pageSizeApply:15,
            searchAlertShow:0,
            fundNum:0,
            searchResNum:0,
            fundList:[],
            userApplyList:[],
            nowEditAction:0,//1.全部编辑 2.用户申请添加 3.用户申请拒绝 4.全部添加
            nowEditObject:'',//当前正在编辑/修改/拒绝的对象
            nowEditFundName:'',
            nameIsChanging:0,//0.没有编辑，1.第一次确认，2.修改成功
            finishApplyNum:0,
            newFundCodeInput:'',
            newFundNameInput:'',
            showMaddInfo:0,
            managerAddCfm:0,
            managerAddMsg:0,//0.不显示，1.添加成功， 2.添加失败
        }
    },
    computed:{
        indexRange(){
            let indexBegin = (this.pageSet-1)*50+1;
            let indexEnd = indexBegin + 49;
            if(indexEnd > this.fundNum){
                indexEnd = this.fundNum;
            }
            return indexBegin + '-' +indexEnd;
        },
        indexRangeApply(){
            let indexBegin = (this.pageSet-1)*15+1;
            let indexEnd = indexBegin + 14;
            if(indexEnd > this.fundNum){
                indexEnd = this.fundNum;
            }
            return indexBegin + '-' +indexEnd;
        }
    },
    watch:{
        searchResNum:{
            handler(newValue){
                if(this.searchType == 1 || this.searchType == 2){
                    if(newValue == 0){
                        this.searchAlertShow = 2;
                    }
                }else if(this.searchType == 3){
                    if(newValue == 0){
                        this.searchAlertShow = 3;
                    }
                }else{
                    this.searchAlertShow = 0;
                }
            }
        },
    },
    methods:{
        changeNavHL(page){
            this.$bus.$emit('changeNowPage',page);
        },
        backTOLogin(){
            localStorage.removeItem('admin');
            this.$router.push({
                path:'/manager/mlogin'
            });
        },
        // ---------------------分页查询功能----------------------
        nextPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet < this.pageAll){
                    this.pageSet ++;
                    this.getFundList();
                }
            },500);
        },
        previousPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet > 1){
                    this.pageSet --;
                    this.getFundList();
                }
            },500);
        },
        firstPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet !== 1){
                    this.pageSet = 1;
                    this.getFundList();
                }
            },500);
        },
        lastPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet !== this.pageAll){
                    this.pageSet = this.pageAll;
                    this.getFundList();
                }
            },500);
        },
        nextPageApply(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet < this.pageAll){
                    this.pageSet ++;
                    this.getUserApplyList();
                }
            },500);
        },
        previousPageApply(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet > 1){
                    this.pageSet --;
                    this.getUserApplyList();
                }
            },500);
        },
        firstPageApply(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet !== 1){
                    this.pageSet = 1;
                    this.getUserApplyList();
                }
            },500);
        },
        lastPageApply(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet !== this.pageAll){
                    this.pageSet = this.pageAll;
                    this.getUserApplyList();
                }
            },500);
        },
        getManagerInfo(){
            const manager = JSON.parse(localStorage.getItem('admin'));
            const formDate = new FormData();
            formDate.append('account',manager.account);
            formDate.append('password',manager.password);
            formDate.append('id',manager.id);
            request.post('/api/manage/getmanager',formDate).then(res => {
                if(res.data.code === '0'){
                    this.managerInfo = res.data.data;
                }else{
                    this.backTOLogin();
                }
            },err => console.log(err));
        },
        getFundList(){
            if(this.nowList === 1){//保险
                const formData = new FormData();
                formData.append('searchType',this.searchType);
                formData.append('searchContent',this.searchContent);
                formData.append('anchor',(this.pageSet - 1)*this.pageSizeAll);
                formData.append('pageSize',this.pageSizeAll);
                request.post('/api/manage/fundallnum',formData).then(res => {
                    this.searchResNum = res.data;
                    if(this.searchResNum == 0){
                        // 系统没有收录这样的基金
                    }else{
                        this.fundNum = res.data;
                        if(this.searchResNum % this.pageSizeAll > 0){
                            this.pageAll = parseInt(this.fundNum/this.pageSizeAll+1);
                            if(this.pageAll < this.pageSet){
                                this.pageSet = this.pageAll;
                            }
                        }else{
                            this.pageAll = parseInt(this.fundNum/this.pageSizeAll);
                            if(this.pageAll < this.pageSet){
                                this.pageSet = this.pageAll;
                            }
                        }
                        request.post('/api/manage/fundall',formData).then(res => {
                            this.fundList = res.data.data;
                            this.nowList = 1;
                        },err => console.log(err));
                    }
                },err => console.log(err));
            }
        },
        getUserApplyList(){
            if(this.nowList === 2){
                const formData = new FormData();
                formData.append('searchType',this.searchType);
                formData.append('searchContent',this.searchContent);
                formData.append('anchor',(this.pageSet - 1)*this.pageSizeApply);
                formData.append('pageSize',this.pageSizeApply);
                request.post('/api/manage/fundapplynum',formData).then(res => {
                    this.searchResNum = res.data;
                    if(this.searchResNum == 0){
                        //暂无用户申请
                    }else{
                        this.fundNum = res.data;
                        if(this.searchResNum % this.pageSizeApply > 0){
                            this.pageAll = parseInt(this.fundNum/this.pageSizeApply+1);
                            if(this.pageAll < this.pageSet){
                                this.pageSet = this.pageAll;
                            }
                        }else{
                            this.pageAll = parseInt(this.fundNum/this.pageSizeApply);
                            if(this.pageAll < this.pageSet){
                                this.pageSet = this.pageAll;
                            }
                        }
                        request.post('/api/manage/fundapply',formData).then(res => {
                            this.userApplyList = res.data.data;
                            this.nowList = 2;
                        },err => console.log(err));
                    }
                },err => console.log(err));
            }
        },
        showAll(){
            this.nowList = 1;
            this.searchType = 0;
            this.searchContent = '';
            this.pageSet = 1;//从第一页开始
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.getFundList();
                clearTimeout(timerAsync);
                timerAsync = setTimeout(() => {
                    if(this.searchResNum == 0){
                        this.searchAlertShow = 2;
                    }
                },0);
            },500);
        },
        showApply(){
            this.nowList = 2;
            this.searchType = 0;
            this.searchContent = '';
            this.pageSet = 1;//从第一页开始
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.getUserApplyList();
                clearTimeout(timerAsync);
                timerAsync = setTimeout(() => {
                    if(this.searchResNum == 0){
                        this.searchAlertShow = 2;
                    }
                },0);
            },500);
        },
        searchBy1stNum(number){
            this.searchType = 3;
            this.searchContent = number;
            this.pageSet = 1;
            if(this.nowList == 1){
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.getFundList();
                },500);
            }else if(this.nowList == 2){
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.getUserApplyList();
                },500);
            }
        },
        searchByInput(){
            // console.log(this.$refs['searchChoose'].value);
            // console.log(this.$refs['searchInput'].value);
            this.searchAlertShow = 0;
            this.searchType = this.$refs['searchChoose'].value;
            this.searchContent = this.$refs['searchInput'].value;
            if(this.searchContent.length == 0){
                this.searchAlertShow = 1;
            }else{
                if(this.nowList == 1){
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        this.getFundList();
                    },500);
                }else if(this.nowList == 2){
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        this.getUserApplyList();
                    },500);
                }
            }
        },
        codeSet(){
            let choose = this.$refs['searchChoose'].value;
            let fundCode = this.$refs['searchInput'].value;
            if(fundCode.length > 0){this.searchAlertShow = 0};
            fundCode = fundCode.replace(/[ ]/g,'');
            if(choose == 1){
                fundCode = fundCode.replace(/[^\d]/g,'');
                if(fundCode.length >= 6){
                    fundCode = fundCode.slice(0,6);
                }
            }
            this.$refs['searchInput'].value = fundCode;
        },
        // =====================系统已收录基金编辑=========================
        editCollected(item){
            this.nameIsChanging = 0;
            this.nowEditAction = 1;
            this.nowEditObject = item;
            this.nowEditFundName = item.financeName;
            this.$nextTick(() => {
                this.$refs['newFundName'].focus();
            })
        },
        nameChangeReset(){
            this.nowEditFundName = this.nowEditObject.financeName;
        },
        showChange(){
            if(this.nowEditFundName.length !== '' && this.nowEditFundName !== this.nowEditObject.financeName){
                this.nameIsChanging = 1;
            };
        },
        cancleChangeInner(){
            this.nameIsChanging = 0;
        },
        saveName(){
            const formData = new FormData();
            formData.append('fundId',this.nowEditObject.financeId);
            formData.append('newName',this.nowEditFundName);
            request.post('/api/manage/changename',formData).then(res => {
                if(res.data == 1){
                    //修改成功
                    this.reloadData();
                    this.nameIsChanging = 2;
                }else{
                    //修改失败
                    console.log("未知错误");
                }
            },err => console.log(err));

        },
        // ====================用户申请编辑与添加=============================
        applyAdd(item){
            this.nameIsChanging = 0;
            this.nowEditAction = 2;
            this.nowEditObject = item;
            this.nowEditFundName = item.fundName;
            this.$nextTick(() => {
                this.$refs['newFundName'].focus();
            })
        },
        applyChangeReset(){
            this.nowEditFundName = this.nowEditObject.fundName;
        },
        showAdd(){
            if(this.nowEditFundName.length !== ''){
                this.nameIsChanging = 1;
            };
        },
        saveAdd(){
            const formData = new FormData();
            formData.append('fundCode',this.nowEditObject.fundCode);
            formData.append('fundName',this.nowEditObject.fundName);
            request.post('/api/manage/adduserapply',formData).then(res => {
                if(res.data > 0){
                    this.finishApplyNum = res.data;
                    this.reloadData();
                    this.nameIsChanging = 2;
                }else{
                    this.nameIsChanging = 3;
                    // console.log("未知错误");
                }
            },err => console.log(err));
        },
        // =====================拒绝用户申请==========================================
        applyRefuse(item){
            this.nameIsChanging = 0;
            this.nowEditAction = 3;
            this.nowEditObject = item;
        },
        saveRefuse(){
            const formData = new FormData();
            formData.append('applyId',this.nowEditObject.applyId);
            // console.log(this.nowEditObject.applyId)
            request.post('/api/manage/applyreject',formData).then(res => {
                if(res.data == 1){
                    this.reloadData();
                    this.cancleChange();
                }
            },err => console.log(err));
        },
        // ==================管理员添加基金收录===============================
        managerAdd(){
            this.nameIsChanging = 0;
            this.showMaddInfo = 0;
            this.managerAddCfm = 0;
            this.managerAddMsg = 0;
            if(this.nowEditAction !== 4){
                this.nowEditAction = 4;
                this.$nextTick(() => {
                    this.$refs['newFundCode'].value = '';
                    this.$refs['newFundCode'].focus();
                });
            }
        },
        managerAddCodeSet(){
            let inputCode = this.$refs['newFundCode'].value;
            inputCode = inputCode.replace(/[^\d]/g,'');
            if(inputCode.length >= 6){
                inputCode = inputCode.slice(0,6);
            }
            if(inputCode.length == 6){
                this.showMaddInfo = 1;
            }else{
                this.showMaddInfo = 0;
            }
            this.$refs['newFundCode'].value = inputCode;
        },
        managerAddCheckCodeExist(){
            const formData = new FormData();
            formData.append('fundCode',this.newFundCodeInput);
            request.post('/api/manage/codeexist',formData).then(res => {
                if(res.data == 0){
                    this.showMaddInfo = 2;//没有重复，可以添加
                    this.$nextTick(() => {
                        this.$refs['newFundName'].focus();
                    })
                }else{
                    this.showMaddInfo = -1;//重复或错误，不可添加
                }
            },err => console.log(err));
        },
        managerAddNameSet(){
            let inputName = this.$refs['newFundName'].value;
            inputName = inputName.replace(/[ ]/g,'');
            this.$refs['newFundName'].value = inputName;
        },
        managerAddCancleInner(){
            this.showMaddInfo = 1;
            this.$nextTick(() => {
                this.$refs['newFundCode'].focus();
            })
        },
        showAddFundInfo(){
            if(this.$refs['newFundName'].value.length != 0){
                this.newFundNameInput = this.$refs['newFundName'].value;
                this.managerAddCfm = 1;
            }
        },
        managerAddCancelFinal(){
            this.managerAddCfm = 0;
            this.managerAddMsg = 0;
            this.$nextTick(() => {
                this.$refs['newFundName'].value = this.newFundNameInput;
                this.$refs['newFundName'].focus();
            })
        },
        saveManageAdd(){
            const formData = new FormData();
            formData.append('fundCode',this.newFundCodeInput);
            formData.append('fundName',this.newFundNameInput);
            request.post('/api/manage/manageradd',formData).then(res => {
                if(res.data == 1){
                    this.managerAddMsg = 1
                    this.reloadData();
                }else{
                    this.managerAddMsg = 2;
                }
            },err => console.log(err));
        },

        // =====================关闭窗口与数据更新============================
        cancleChange(){
            this.nowEditAction = 0;
            this.nowEditObject = '';
            this.nowEditFundName = '';
            this.nameIsChanging = 0;
        },
        reloadData(){
            this.getFundList();
            this.getUserApplyList();
        },
    },
    mounted(){
        this.changeNavHL(5);
        this.getManagerInfo();
        this.getFundList();
        this.getUserApplyList();
        this.$refs['searchInput'].focus();
    },
    beforeDestroy(){
        clearTimeout(debounceTimer);
        clearTimeout(timerAsync);
    }
}
</script>

<style scoped>
.fund-list{
    margin-top: 40px;
    margin-left: 20px;
    position: relative;
}
.page-title{
    display: flex;
    justify-content: space-between;
    margin-right: 100px;
}
.fund-add{
    cursor: pointer;
}
.fund-add:hover{
    color: rgb(90, 193, 253);
}
.fund-add:active{
    opacity: .6;
}
.like-search{
    position: relative;
    margin-top: 10px;
    display: inline-block;
    border: 1px solid #999;
    height: 30px;
}
.like-search > p{
    display: inline-block;
    height: 30px;
    line-height: 28px;
    font-size: 13px;
    padding-left: 10px;
}
.like-search > select{
    outline: 0px;
}
.like-search > input{
    margin-left: 10px;
    padding-left: 10px;
    outline: 0px;
    height: 28px;
    line-height: 28px;
    background-color: transparent;
    border: none;
    border-left: 1px solid #999;
    width: 300px;
}
.like-search > span{
    display: inline-block;
    height: 28px;
    line-height: 28px;
    padding: 0 10px;
    border-left: 1px solid #999;
    font-weight: lighter;
    cursor: pointer;
    color: #aaa;
    background-color: #2d3f50;
}
.like-search > span:hover{
    background-color: #2d3f50d7;
}
.like-search > span:active{
    opacity: 0.6;
}
.searchAlert{
    margin-left: 10px;
    font-size: 12px;
    color: #999;
}
.all,
.none{
    display: inline-block;
    border: 1px solid #999;
    height: 30px;
    line-height: 28px;
    margin-right: 10px;
    padding: 0 10px;
    font-size: 13px;
    color: #999;
    background-color: #2d3f50;
    cursor: pointer;
}
.all:hover,
.none:hover{
    opacity: 0.8;
}
.all:active,
.none:active{
    opacity: 0.6;
}
.none{
    margin-left: 5px;
}
.begin-number-title{
    display: inline-block;
}
.begin-number{
    display: inline-flex;
    border: 1px solid #2d3f50;
    margin-top: 10px;
    border-right: none;
    width: 500px;
}
.begin-number > li{
    height: 30px;
    line-height: 32px;
    font-weight: lighter;
    font-size: 24px;
    width: 50px;
    text-align: center;
    border-right: 1px solid #2d3f50;
    cursor: pointer;
}
.begin-number > li:hover{
    background: #ddd;
}
.page{
    margin-right: 300px;
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
.fund-all{
    width: 500px;
}
.fund-all > ul{
    display: inline-flex;
    flex-wrap: wrap;
    border-left: 1px solid #2d3f5060;
    border-top: 1px solid #2d3f5060;
}
.fund-all > ul > li{
    display: inline-block;
    width: 249px;
    height: 20px;
    overflow: hidden;
    font-size: 12px;
    border-right: 1px solid #2d3f5060;
    border-bottom: 1px solid #2d3f5060;
}
.fund-all > ul > li > span{
    margin-right: 3px;
}
.fund-all > ul > li > span:last-child{
    margin-right: 0;
    text-decoration: underline;
    cursor: pointer;
}
.fund-all > ul > li > span:last-child:hover{
    color: orange;
}
.fund-userapply{
    margin-top: 5px;
}
.fund-userapply > p{
    font-size: 14px;
    color: #555;
}
.userapply-list{
    display: inline-block;
    border-top: 1px solid #999;
    margin-top: 10px;
}
.userapply-list > li{
    display: flex;
    border-bottom: 1px solid #999;
    border-right: 1px solid #999;
}
.userapply-list > li:first-child{
    height: 20px;
    line-height: 19px;
    font-size: 12px;
    font-weight: lighter;
    text-align: center;
    background-color: #2d3f50;
    color: #aaa;
    font-weight: lighter;
}
.list-body{
    height: 30px;
    line-height: 29px;
    font-size: 14px;
    font-weight: lighter;
}
.userapply-list > li > div{
    border-left: 1px solid #999;
}
.userapply-list > li > div:nth-child(1){
    width: 60px;
}
.userapply-list > li > div:nth-child(2){
    width: 65px;
    text-align: center;
}
.userapply-list > li > div:nth-child(3){
    width: 155px;
    font-size: 12px;
}
.userapply-list > li > div:nth-child(4){
    width: 140px;
    text-align: center;
}
.userapply-list > li > div:nth-child(5){
    width: 80px;
    text-align: center;
}
.action > span{
    text-decoration: underline;
    cursor: pointer;
}
.action > span:first-child{
    margin-right: 3px;
}
.action > span:hover{
    color: orange;
}
.caouzuo-area{
    position: absolute;
    top: 139px;
    right: 20px;
    width: 260px;
    height: 400px;
    border: 1px solid #2d3f50;
}
.allfund-add{
    margin-top: 10px;
    margin-left: 10px;
}
/* .allfund-add > p{
    color: #999;
} */
.allfund-add > p > span{
    font-weight: lighter;
    font-size: 20px;
    color: #2d3f50;
}
.input-box{
    display: inline-block;
    width: 240px;
    border-bottom: 1px solid #2d3f50;
}
.input-box > input{
    margin-top: 10px;
    outline: 0px;
    height: 30px;
    width: 240px;
    font-size: 14px;
    background-color: transparent;
    border: none;
}
.name-change-option{
    width: 120px;
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
}
.checkExist,
.close-change,
.name-change-option > span{
    width: 50px;
    height: 30px;
    line-height: 30px;
    position: relative;
    cursor: pointer;
    text-align: center;
    font-size: 14px;
    color: #888;
    background: #fafafa;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    display: inline-block;
    text-decoration: none;
}
.checkExist:hover,
.close-change:hover,
.name-change-option > span:hover{
    color: #444;
    background: #eee;
    border-color: #ccc;
    text-decoration: none
}
.fundNameChange{
    height: 50px;
    line-height: 50px;
    text-align: center;
    font-size: 14px;
    color: #2d3f50;
}
.close-change{
    position: absolute;
    bottom: 10px;
    right: 20px;
    color: #007bff65;
}
.fundApplyAdd{
    display: inline-block;
    border: 1px solid #2d3f50;
    padding: 10px 5px;
}
.fundApplyAdd > span{
    display: block;
    overflow: hidden;
    max-width: 230px;
}
.manager-fund-add{
    margin-top: 10px;
    margin-left: 10px;
}
.mfa-title1{
    margin-top: 10px;
    font-size: 14px;
    color: #2d3f50;
}
</style>