<template>
    <div class="user-manage">
        <div class="page-title">
            <p>系统用户</p>
        </div>
        <span class="all" @click="showAllUser">全部</span>
        <div class="like-search">
            <p>选择查询类型：</p>
            <select ref="searchChoose" v-model="searchType">
                <option value="1">id</option>
                <option value="2">账号</option>
                <option value="3">用户名</option>
            </select>
            <input type="text" maxlength="16" ref="searchInput" v-model="searchContent">
            <span @click="doSearch">搜索</span>
        </div>
        <span class="searchAlert" v-if="searchAlertShow === 1">不能为空</span>
        <span class="searchAlert" v-if="searchAlertShow === 2">无结果</span>
        <span class="searchAlert" v-if="searchAlertShow === 3">共{{searchResNum}}条</span>
        <ul class="user-list">
            <li class="list-head">
                <div>id</div>
                <div>账号</div>
                <div>用户名</div>
                <div>资料</div>
                <div>头像</div>
                <div>状态</div>
                <div>操作</div>
            </li>
            <li class="list-body" v-for="item in userList" :key="item.id">
                <div class="userid">{{item.id}}</div>
                <div class="useracc">{{item.account}}</div>
                <div class="username">{{item.nick_name}}</div>
                <div class="userInfo">
                    <p>记录基金数：<span v-if="item.fundNum > 0" style="text-decoration: underline;color: #007aff;">{{item.fundNum}}</span><span v-if="item.fundNum == 0">0</span></p>
                    <p>绑定银行卡：<span v-if="item.cardNum > 0" style="text-decoration: underline;color: #007aff;">{{item.cardNum}}</span><span v-if="item.cardNum == 0">0</span></p>
                </div>
                <div class="useravatar">
                    <img :src="item.img_url" ref="userImg">
                </div>
                <div class="state">
                    <span v-if="item.userState === 1">正常</span>
                    <span v-if="item.userState === 0" style="color:red">冻结</span>
                </div>
                <div class="action">
                    <div class="fast">
                        <template v-if="isEdit === 0 || isEditUser !== item.id">
                            <span v-if="item.userState === 1" @click="editUser(1,item.id)">冻结</span>
                            <span v-if="item.userState === 0" @click="editUser(2,item.id)">恢复</span>
                            <span @click="editUser(3,item.id)">重置头像</span>
                            <span @click="editUser(4,item.id)">重置用户名</span>
                        </template>
                        <template v-if="isEdit > 0 && isEditUser === item.id">
                            <p v-if="isEdit === 1">冻结该用户？</p>
                            <p v-if="isEdit === 2">恢复该用户？</p>
                            <p v-if="isEdit === 3">确认重置头像？</p>
                            <p v-if="isEdit === 4">确认重置用户名？</p>
                            <p><span @click="doChangeUser(item.id)">确定</span><span @click="cancleEdit">取消</span></p>
                        </template>
                    </div>
                </div>
            </li>
        </ul>
        <!-- 分页 -->
        <!-- 展示全部系用户时的分页 -->
        <template v-if="nowList === 1">
            <div class="page">
                <span @click="firstPage"><i class="fas fa-angle-double-left"></i>首页</span>
                <span @click="previousPage"><i class="fas fa-angle-left"></i>上一页</span>
                <span><span>{{indexRange}}</span>条，共<span>{{userNumber}}</span>条</span>
                <span @click="nextPage">下一页<i class="fas fa-angle-right"></i></span>
                <span @click="lastPage">尾页<i class="fas fa-angle-double-right"></i></span>
            </div>
        </template>
        <!-- 展示搜索后的分页 -->
        <template v-if="nowList === 2">
            <div class="page">
                <span @click="firstPageSearch"><i class="fas fa-angle-double-left"></i>首页</span>
                <span @click="previousPageSearch"><i class="fas fa-angle-left"></i>上一页</span>
                <span><span>{{indexRangeSearch}}</span>条，共<span>{{searchResNum}}</span>条</span>
                <span @click="nextPageSearch">下一页<i class="fas fa-angle-right"></i></span>
                <span @click="lastPageSearch">尾页<i class="fas fa-angle-double-right"></i></span>
            </div>
        </template>
    </div>
</template>

<script>
let timerShowAll;
let debounceTimer;
import uuid from '../utils/uuid';
import request from '../utils/request';
export default {
    name:'Manager3User',
    data(){
        return {
            managerInfo:'',

            // 条目总书
            userNumber:0,
            // 当前第几页，默认总是第一页
            pageSet:1,
            pageAll:1,
            pageSize:10,
            userList:'',
            searchType:3,//1.id 2.账号 3.用户名，默认按用户名查
            searchTypeKeep:3,
            searchContent:'',
            searchContentKeep:'',//再一次点击搜索才更换这个值
            searchAlertShow:0,//1.不呢为空 2.无结果 3.结束
            searchResNum:0,
            // 当前展示 1.全部 2.搜索内容（主要是分页的时候）
            nowList:1,
            isEdit:0,
            isEditUser:0,
        }
    },
    computed:{
        indexRange(){
            let indexBegin = (this.pageSet-1)*10+1;
            let indexEnd = indexBegin + 9;
            if(indexEnd > this.userNumber){
                indexEnd = this.userNumber;
            }
            return indexBegin + '-' +indexEnd;
        },
        indexRangeSearch(){
            let indexBegin = (this.pageSet-1)*10+1;
            let indexEnd = indexBegin + 9;
            if(indexEnd > this.searchResNum){
                indexEnd = this.searchResNum;
            }
            return indexBegin + '-' +indexEnd;
        },
    },
    watch:{
        searchContent:{
            handler(newValue){
                if(newValue !== ''){
                    this.searchAlertShow = 0
                }
            }
        }
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
        showAllUser(){
            clearTimeout(timerShowAll);
            timerShowAll = setTimeout(() => {
                this.pageSet = 1;
                this.getUserList();
                this.nowList = 1;
                this.searchAlertShow = 0;
                this.searchContent = '';
            },500)
        },
        getUserList(){
            const manager = JSON.parse(localStorage.getItem('admin'));
            const formDate = new FormData();
            formDate.append('account',manager.account);
            formDate.append('password',manager.password);
            formDate.append('anchor',(this.pageSet - 1)*this.pageSize);
            formDate.append('pageSize',this.pageSize);
            request.post('/api/manage/usernum').then(res => {
                this.userNumber = res.data;
                if(this.userNumber % this.pageSize > 0){
                    this.pageAll = parseInt(this.userNumber/this.pageSize+1);
                    if(this.pageAll < this.pageSet){
                        this.pageSet = this.pageAll;
                    }
                }else{
                    this.pageAll = parseInt(this.userNumber/this.pageSize);
                    if(this.pageAll < this.pageSet){
                        this.pageSet = this.pageAll;
                    }
                }
                request.post('/api/manage/alluser',formDate).then(res => {
                    if(res.data.code === '0'){
                        this.userList = res.data.data;
                    }else{
                        this.backTOLogin();
                    }
                },err => console.log(err))
            },err => console.log(err));
        },
        // ---------------------分页查询功能----------------------
        nextPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet < this.pageAll){
                    this.pageSet ++;
                    this.getUserList();
                }
            },500);
        },
        previousPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet > 1){
                    this.pageSet --;
                    this.getUserList();
                }
            },500);
        },
        firstPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet !== 1){
                    this.pageSet = 1;
                    this.getUserList();
                }
            },500);
        },
        lastPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet !== this.pageAll){
                    this.pageSet = this.pageAll;
                    this.getUserList();
                }
            },500);
        },

        // ----------------------输入查询后的分页---------------------------
        nextPageSearch(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet < this.pageAll){
                    this.pageSet ++;
                    this.doSearchRequest();
                }
            },500);
        },
        previousPageSearch(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet > 1){
                    this.pageSet --;
                    this.doSearchRequest();
                }
            },500);
        },
        firstPageSearch(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet !== 1){
                    this.pageSet = 1;
                    this.doSearchRequest();
                }
            },500);
        },
        lastPageSearch(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet !== this.pageAll){
                    this.pageSet = this.pageAll;
                    this.doSearchRequest();
                }
            },500);
        },
        doSearch(){
            if(this.searchContent === ''){
                this.searchAlertShow = 1;
            }else{
                // searchType:3,//1.id 2.账号 3.用户名，默认按用户名查
                // searchContent:'',//搜索内容
                this.pageSet = 1;
                this.searchContentKeep = this.searchContent;
                this.searchTypeKeep = this.searchType;
                this.doSearchRequest();
            }
        },
        doSearchRequest(){
            const formDate = new FormData();
            formDate.append('searchType',this.searchTypeKeep);
            formDate.append('searchContent',this.searchContentKeep);
            request.post('/api/manage/searchusernum',formDate).then(res => {
                this.searchResNum = res.data;
                if(this.searchResNum === 0){
                    this.searchAlertShow = 2;
                }else{
                    if(this.searchResNum % this.pageSize > 0){
                        this.pageAll = parseInt(this.searchResNum/this.pageSize+1);
                        if(this.pageAll < this.pageSet){
                            this.pageSet = this.pageAll;
                        }
                    }else{
                        this.pageAll = parseInt(this.searchResNum/this.pageSize);
                        if(this.pageAll < this.pageSet){
                            this.pageSet = this.pageAll;
                        }
                    }
                    this.searchAlertShow = 3;
                    formDate.append('anchor',(this.pageSet - 1)*this.pageSize);
                    formDate.append('pageSize',this.pageSize);
                    request.post('/api/manage/searchuser',formDate).then(res => {
                        this.userList = res.data.data;
                        this.nowList = 2;
                    },err => console.log(err));
                }
            },err => console.log(err));
        },
        // 开始操作
        editUser(type, userId){
            this.isEdit = type;
            this.isEditUser = userId;
        },
        cancleEdit(){
            this.isEdit = 0;
            this.isEditUser = 0;
        },
        doChangeUser(userId){
            // this.isEdit
            // 1.冻结 2.恢复 3.重置头像 4.重置用户名
            const formDate = new FormData()
            formDate.append('isEdit',this.isEdit);
            formDate.append('userId',userId);
            if(this.isEdit > 2){
                // 发送 id + 更新对象 + 更新内容(用户名/头像地址)
                if(this.isEdit === 3){
                    formDate.append('updContent',this.defaultImgURl());
                }else if(this.isEdit === 4){
                    formDate.append('updContent',this.randomUserName());
                }
                // 
            }else{
                // 发送 id + 更新对象 + 空字符串
                formDate.append('updContent','');
            }
            request.post('/api/manage/edituser',formDate).then(res => {
                if(res.data == 1){
                    // 更新数据
                    if(this.nowList === 1){
                        // 全部的
                        this.getUserList();
                    }
                    if(this.nowList === 2){
                        // 搜索的
                        this.doSearchRequest();
                    }
                    this.isEdit = 0;
                }else{
                    console.log('未知错误')
                }
            },err => console.log(err))
        },
        randomUserName(){
            return '用户' + uuid.uuid(8);
        },
        defaultImgURl(){
            return '/img/mr.png';
        }
    },
    mounted(){
        this.changeNavHL(3);
        this.getManagerInfo();
        this.getUserList();
        this.$nextTick(()=>{
            this.$refs['searchInput'].focus();
        })
    },
    beforeDestroy(){
        clearTimeout(debounceTimer);
        clearTimeout(timerShowAll);
    }
}
</script>

<style scoped>
.user-manage{
    margin-top: 40px;
    margin-left: 20px;
}
.user-list{
    display: inline-block;
    border-top: 1px solid #999;
    margin-top: 10px;
}
.user-list > li{
    display: flex;
    border-bottom: 1px solid #999;
    border-right: 1px solid #999;
}
.user-list > li:first-child{
    height: 30px;
    line-height: 28px;
    text-align: center;
    background-color: #2d3f50;
    color: #aaa;
    font-weight: lighter;
}
.user-list > li > div{
    border-left: 1px solid #999;
}
.list-body{
    height: 48px;
}
.list-body > div{
    line-height: 46px;
}
.user-list > li > div:nth-child(1){
    width: 90px;
}
.user-list > li > div:nth-child(2){
    width: 120px;
}
.user-list > li > div:nth-child(3){
    width: 160px;
}
.user-list > li > div:nth-child(4){
    width: 140px;
}
.user-list > li > div:nth-child(5){
    width: 48px;
}
.user-list > li > div:nth-child(6){
    width: 80px;
}
.user-list > li > div:nth-child(7){
    width: 120px;
}
.userid,
.useracc,
.username{
    font-size: 12px;
    padding-left: 10px;
}
.state{
    line-height: 46px;
    text-align: center;
}
.action{
    position: relative;
    display: flex;
}
.action span{
    cursor: pointer;
}
.action span:hover{
    text-decoration: underline;
}
.action .fast{
    margin-left: 10px;
}
.action .fast > span{
    display: inline-block;
    line-height: 15px;
    font-size: 13px;
    display: block;
}
.fast > p{
    height: 23px;
    line-height: 23px;
    font-size: 13px;
    color: red;
}
.fast > p > span{
    color: #333;
    display: inline-block;
    margin-right: 10px;
}
.useravatar img{
    display: block;
    margin: 0 auto;
    margin-top: 3px;
    width: 40px;
    height: 40px;
    object-fit: cover;
}
.page{
    margin-right: 30px;
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
.all{
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
.all:hover{
    opacity: 0.8;
}
.all:active{
    opacity: 0.6;
}
.userInfo p{
    height: 23px;
    line-height: 23px;
    font-size: 12px;
    font-weight: lighter;
    color: #555;
    margin-left: 10px;
}

</style>