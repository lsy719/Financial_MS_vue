<template>
    <div class="top-nav">
        <div class="topbar">
            <span>理财<span class="gotomanager" @click="gotomanager">管理</span>系统</span>
            <ul class="user-info">
                <li>你好，</li>
                <li @mouseenter="changeI" @mouseleave="changeIL" class="topbar-username">
                    <span>
                        {{userInfo.nick_name}}
                        <i :class='classObj'></i>
                        <div class="pulldown">
                            <div class="pd-up">
                                <div class="pd-up-img" @click="myInfo"><img :src="userInfo.img_url"></div>
                                <div class="pd-up-text">
                                    <span>{{userInfo.account}}</span>
                                    <ul>
                                        <li @click="myInfo">账户设置</li>
                                        <li>|</li>
                                        <li @click="myRecord">交易记录</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="pd-down">
                                <span @click="myFinance">理财</span>
                                <span @click="myBankCards">银行卡</span>
                                <span @click="myPocketMoney">余额</span>
                            </div>
                        </div>
                    </span>
                </li>
                <li class="line">|</li>
                <li class="topbar-quit" @click="quitToLogin"><span>退出系统</span></li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    name:'Header',
    data() {
        return {
            classObj:{
                fas:true,
                'fa-angle-down':true,
                'fa-angle-up':false,
            },
            userInfo:{},
        }
    },
    methods: {
        changeI(){
            this.classObj['fa-angle-down'] = false;
            this.classObj['fa-angle-up'] = true;
        },
        changeIL(){
            this.classObj['fa-angle-down'] = true;
            this.classObj['fa-angle-up'] = false;
        },
        quitToLogin(){
            this.$router.push({
                path:'/login'
            });
            localStorage.removeItem('user');
            this.$store.commit('cleraUserInfo');
            this.$store.commit('clearAllMoneyAndAllProfit');
        },
        myFinance(){
            this.$router.push({
                path:'/myfinance'
            });
        },
        myBankCards(){
            this.$router.push({
                path:'/user/card'
            });
        },
        myPocketMoney(){
            this.$router.push({
                path:'/user/userPocketMoney'
            })
        },
        myRecord(){
            this.$router.push({
                path:'/record'
            })
        },
        myInfo(){
            this.$router.push({
                path:'/user'
            })
        },
        gotomanager(){
            this.$router.push({
                path:'/manager'
            })
        }
    },
    computed:{
        getUserInfo(){
            return this.$store.state.userInfo;
        }
    },
    watch:{
        getUserInfo(newValue){
            this.userInfo = newValue;
        }
    },
    mounted(){
        this.userInfo = this.$store.state.userInfo
        // console.log(this.$store.state.userInfo);
    }
}
</script>

<style scoped>
    .top-nav{
        font-size: 12px;
        width: 100%;
        height: 28px;
        line-height: 28px;
        background-color: rgb(26, 28, 31);
        color: #b0b0b0;
    }
    .topbar{
        width: 999px;
        margin: 0 auto;
    }
    .user-info{
        float: right;
        list-style: none;
    }
    .user-info li{
        float: left;
        padding: 0 5px;
    }
    .topbar-quit{
        cursor: pointer;
    }
    .topbar-username{
        display: inline-block;
        cursor: pointer;
        position: relative;
    }
    
    .topbar-username:hover{
        background-color: azure;
        color: rgb(19, 18, 18);
    }
    .topbar-quit:hover{
        text-decoration: underline;
    }
    .topbar-username:hover .pulldown{
        height: auto;
        opacity: 1;
    }
    .pulldown{
        position: absolute;
        overflow: hidden;/*防止塌陷*/
        height: 0;
        opacity: 0;
        width: 230px;
        left: -100px;
        transition: opacity 0.3s;
        box-shadow: 0 0 10px rgba(0, 0, 0, .2);
        z-index: 9999;
        cursor: auto;
    }
    .pd-up{
        overflow: hidden;
        padding: 10px 10px;
        color: #666;
        background-color: #eee;
    }
    .pd-up-img{
        float: left;
        cursor: pointer;
    }
    .pd-up-img img{
        width: 40px;
        height: 40px;
        object-fit: cover;
    }
    .pd-up-text{
        float: left;
        margin-left: 10px;
        height: 40px;
    }
    .pd-up-text span{
        display: block;
        line-height: 18px;
        margin-bottom: 4px;
    }
    .pd-up-text ul li{
        float: left;
        height: 18px;
        line-height: 18px;
        list-style: none;
        padding: 0;
        margin-right: 12px;
    }
    .pd-up-text ul li:nth-child(2n+1){
        color: #08c;
        cursor: pointer;
    }
    .pd-up-text ul li:nth-child(2n+1):hover{
        color: #e66e1e;
        text-decoration: underline;
    }
    .pd-down{
        line-height: 12px;
        background-color: #fff;
        padding: 10px;
    }
    .pd-down span{
        color: #08c;
        cursor: pointer;
        margin-right: 12px;
    }
    .pd-down span:hover{
        color: #e66e1e;
        text-decoration: underline;
    }
    .gotomanager{
        cursor: pointer;
    }
</style>