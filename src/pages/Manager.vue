<template>
    <div class="manager-main">
        <div class="header">
            <div class="header-content">
                <span>理财管理系统</span>
                <p>admin</p>
                <ul class="header-info">
                    <li>账号：{{managerInfo.account}}</li>
                    <li>|</li>
                    <li class="quit" @click="backTOLogin">退出系统</li>
                </ul>
            </div>
        </div>
        <div class="content">
            <div class="nav-aside">
                <ul>
                    <li @click="li1">
                        <div :class="li1i"></div>
                        <i class="fas fa-hat-cowboy"></i>
                        <span>关于此账号</span>
                    </li>
                    <li @click="li2" v-if="managerInfo.adminLv === 99">
                        <div :class="li2i"></div>
                        <i class="fas fa-chess-king"></i>
                        <span>管理员</span>
                    </li>
                    <li @click="li3">
                        <div :class="li3i"></div>
                        <i class="fas fa-chess-knight"></i>
                        <span>用户</span>
                    </li>
                    <li @click="li4">
                        <div :class="li4i"></div>
                        <i class="fas fa-building"></i>
                        <span>银行信息</span>
                    </li>
                    <li @click="li5">
                        <div :class="li5i"></div>
                        <i class="fas fa-chart-line"></i>
                        <span>基金收录</span>
                    </li>
                    <!-- <li @click="li6">
                        <div :class="li6i"></div>
                        <i class="fas fa-paste"></i>
                        <span>操作记录</span>
                    </li> -->
                </ul>
            </div>
            <div class="action-area">
                <router-view></router-view>
            </div>
        </div>
        <div class="footer">

        </div>
    </div>
</template>

<script>
import request from '../utils/request';
export default {
    name:'Manager',
    data(){
        return {
            managerInfo:'',
            nowPage:1,
            li1i:'active',
            li2i:'',
            li3i:'',
            li4i:'',
            li5i:'',
            li6i:'',
        }
    },
    watch:{
        nowPage:{
            immediate:true,
            handler(newValue){
                this.hilightControl(newValue);
            }
        }
    },
    methods:{
        // 高亮控制
        hilightControl(newValue){
            if(newValue === 1){
                this.li1i = 'active';
                this.li2i = '';
                this.li3i = '';
                this.li4i = '';
                this.li5i = '';
                this.li6i = '';
            }else if(newValue === 2){
                this.li1i = '';
                this.li2i = 'active';
                this.li3i = '';
                this.li4i = '';
                this.li5i = '';
                this.li6i = '';
            }else if(newValue === 3){
                this.li1i = '';
                this.li2i = '';
                this.li3i = 'active';
                this.li4i = '';
                this.li5i = '';
                this.li6i = '';
            }else if(newValue === 4){
                this.li1i = '';
                this.li2i = '';
                this.li3i = '';
                this.li4i = 'active';
                this.li5i = '';
                this.li6i = '';
            }else if(newValue === 5){
                this.li1i = '';
                this.li2i = '';
                this.li3i = '';
                this.li4i = '';
                this.li5i = 'active';
                this.li6i = '';
            }else if(newValue === 6){
                this.li1i = '';
                this.li2i = '';
                this.li3i = '';
                this.li4i = '';
                this.li5i = '';
                this.li6i = 'active';
            }
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
        // 关于此账号
        li1(){
            this.nowPage = 1;
            this.$router.push({
                name:'adminInfo',
            })
        },
        // 管理员
        li2(){
            this.nowPage = 2;
            this.$router.push({
                name:'adminJunior',
            })
        },
        // 用户
        li3(){
            this.nowPage = 3;
            this.$router.push({
                name:'adminUser',
            })
        },
        // 银行信息
        li4(){
            this.nowPage = 4;
            this.$router.push({
                name:'adminBank',
            })
        },
        // 基金收录
        li5(){
            this.nowPage = 5;
            this.$router.push({
                name:'adminFund',
            })
        },
        li6(){
            this.nowPage = 6;
            this.$router.push({
                name:'adminRecord',
            })
        }
    },
    created(){
        this.getManagerInfo();
        this.$bus.$on('changeNowPage',(nowTag)=>{
            this.nowPage = nowTag;
        })
    },
    mounted(){

    },
    beforeDestroy(){
        this.$bus.$off('changeNowPage');
    },
}
</script>

<style scoped>
.header{
    width: 100%;
    height: 28px;
    background-color: #000;
}
.footer{
    width: 100%;
    height: 100px;
    background-color: #000;
}
.header-content{
    height: 100%;
    width: 999px;
    margin: 0 auto;
    display: flex;
    color: #b0b0b0;
}
.header-content > span{
    display: inline-block;
    font-size: 12px;
    line-height: 28px;
}
.header-content > p{
    margin-top: 4px;
    margin-left: 10px;
    color: #646464;
    font-size: 12px;
    height: 20px;
    line-height: 10px;
    padding: 5px 5px;
    background-color: #fff;
    border-radius: 4px;
}
.header-info{
    display: flex;
    margin-left: auto;
    margin-right: 0px;
    font-size: 12px;
    line-height: 28px;
}
.header-info > li{
    margin-left: 10px;
}
.quit{
    cursor: pointer;
}
.quit:hover{
    text-decoration: underline;
}
.content{
    display: flex;
    justify-content: space-between;
    width: 999px;
    min-height: 650px;
    background-color: antiquewhite;
    margin: 0 auto;
}
.content .nav-aside{
    width: 160px;
    background-color: rgb(45, 63, 80);
}
.nav-aside li{
    display: flex;
    margin: 5px 5px;
    cursor: pointer;
    height: 50px;
    line-height: 50px;
    background-color: rgb(51, 73, 93);
    color: rgb(231, 231, 231);
}
.nav-aside li:hover{
    opacity: 0.7;
}
.nav-aside li > div{
    height: 50px;
    width: 4px;
    border-radius: 2px;
    /* background-color: #2c88f1; */
}
.active{
    background-color: #2c88f1;
}
.nav-aside li i{
    display: inline-block;
    line-height: 50px;
    margin-left: 5px;
    width: 25px;
}
.content .action-area{
    width: 820px;
    background-color: #ebebeb;
}
</style>