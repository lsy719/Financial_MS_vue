<template>
    <div class="admin-list">
        <div class="page-title">
            <p>系统管理员</p>
            <p class="manager-add" @click="managerAdd"><i class="fas fa-plus">新增</i></p>
        </div>
        <ul class="manager-list">
            <li class="list-head">
                <div>id</div>
                <div>账号</div>
                <div>创建日期</div>
                <div>最后一次更新</div>
                <div>状态</div>
                <div>操作</div>
            </li>
            <li class="list-body" v-for="item in managerList" :key="item.id">
                <div>{{item.id}}</div>
                <div>{{item.account}}</div>
                <div>
                    <p>{{item.createTime.slice(0,10)}}</p>
                    <p>{{item.createTime.slice(-8,)}}</p>
                </div>
                <div>
                    <p>{{item.lastUpdTime.slice(0,10)}}</p>
                    <p>{{item.lastUpdTime.slice(-8,)}}</p>
                </div>
                <div class="state">
                    <span v-if="item.adminState === 1">正常</span>
                    <span v-if="item.adminState === 0" style="color:red">禁用</span>
                </div>
                <div class="action">
                    <template v-if="isAction === 0 || isActionItem !== item.id">
                        <span v-if="item.adminState === 1" @click="manageState(1,item.id)">禁用</span>
                        <span v-if="item.adminState === 0" @click="manageState(0,item.id)" style="color:red">解除</span>
                    </template>
                    <template v-if="isAction === 1 && isActionItem === item.id">
                        <p>确认禁用该管理员？</p>
                        <span style="line-height:60px" @click="cancleState">取消</span>
                        <span style="line-height:60px" @click="manageStateCfm(0,item.id)">确定</span>
                    </template>
                    <template v-if="isAction === 2 && isActionItem === item.id">
                        <p style="color:red">确认恢复该管理员？</p>
                        <span style="line-height:60px" @click="cancleState">取消</span>
                        <span style="line-height:60px" @click="manageStateCfm(1,item.id)">确定</span>
                    </template>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import request from '../utils/request';
export default {
    name:'Manager2Junior',
    data(){
        return {
            managerInfo:'',
            managerList:'',
            isAction:0, //1禁用 2解除
            isActionItem:0,
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
                    if(this.managerInfo.adminLv === 1){
                        this.backTOLogin();
                    }else{
                        this.getManagerList();
                    }
                }else{
                    this.backTOLogin();
                }
            },err => console.log(err));
        },
        getManagerList(){
            const manager = JSON.parse(localStorage.getItem('admin'));
            const formDate = new FormData();
            formDate.append('account',manager.account);
            formDate.append('password',manager.password);
            request.post('/api/manage/managers',formDate).then(res => {
                if(res.data.code === '0'){
                    this.managerList = res.data.data;
                }else{
                    console.log(res.data.msg);
                }
            },err => console.log(err));
        },
        manageState(type,id){
            this.isActionItem = id;
            if(type === 1){
                // 禁用
                this.isAction = 1;
            }
            if(type === 0){
                // 解除
                this.isAction = 2;
            }
        },
        cancleState(){
            this.isAction = 0;
            this.isActionItem = 0;
        },
        manageStateCfm(type,id){
            const manager = JSON.parse(localStorage.getItem('admin'));
            const formDate = new FormData();
            formDate.append('account',manager.account);
            formDate.append('password',manager.password);
            formDate.append('id',id);
            formDate.append('newState',type);
            request.post('/api/manage/statechange',formDate).then(res => {
                if(res.data === 1){
                    this.getManagerList();
                    this.cancleState();
                }else{
                    console.log('未知错误');
                }
            },err => console.log(err));
        },
        managerAdd(){
            this.$router.push({
                name:'adminJuniorAdd',
                params:{
                    manager:JSON.parse(JSON.stringify(this.managerInfo)),
                }
            })
        },
    },

    mounted(){
        // 异步不能在此判断
        this.changeNavHL(2);
        this.getManagerInfo();
    },

}
</script>

<style scoped>
.page-title{
    display: flex;
    justify-content: space-between;
    margin-right: 100px;
}
.admin-list{
    margin-top: 40px;
    margin-left: 20px;
}
.manager-list{
    display: inline-block;
    border-top: 1px solid #999;
    margin-top: 10px;
}
.manager-list > li{
    display: flex;
    border-bottom: 1px solid #999;
    border-right: 1px solid #999;
}
.manager-list > li:first-child{
    height: 30px;
    line-height: 28px;
    text-align: center;
    background-color: rgb(45, 63, 80);
    color: #aaa;
    font-weight: lighter;
}
.list-body{
    height: 48px;
}
.list-body > div:first-child,
.list-body > div:nth-child(2){
    line-height: 46px;
}
.manager-list > li > div{
    border-left: 1px solid #999;
}
.manager-list > li > div:nth-child(1){
    width: 35px;
    text-align: center;
}
.manager-list > li > div:nth-child(2){
    width: 160px;
}
.manager-list > li > div:nth-child(3){
    width: 160px;
}
.manager-list > li > div:nth-child(4){
    width: 160px;
}
.manager-list > li > div:nth-child(5){
    width: 80px;
}
.manager-list > li > div:nth-child(6){
    width: 120px;
}
.list-body > div:nth-child(2){
    padding-left: 5px;
    font-weight: lighter;
}
.list-body p{
    line-height: 23px;
    text-align: center;
    font-size: 12px;
    color: #555;
}
.state{
    line-height: 46px;
    text-align: center;
}
.action{
    position: relative;
}
.action span{
    display: inline-block;
    margin-left: 10px;
    line-height: 46px;
    cursor: pointer;
}
.action span:hover{
    text-decoration: underline;
}
.action p{
    position: absolute;
    left: 10px;
}
.manager-add{
    cursor: pointer;
}
.manager-add:hover{
    color: rgb(90, 193, 253);
}
.manager-add:active{
    opacity: .6;
}
</style>