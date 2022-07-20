<template>
    <div>
        <div class="user-info">
            <div class="mainbody">
                <div class="title">
                    <span>账户设置</span>
                </div>
                <div class="content">
                    <div class="user-aside">
                        <ul>
                            <li :class="li1" @click="showDetail">
                                <span>
                                    <i class="fas fa-user"></i>基本信息
                                </span>
                                <i class='fas fa-angle-right'></i>
                            </li>
                            <li :class="li2" @click="showCards">
                                <span>
                                    <i class="fas fa-credit-card"></i>我的银行卡
                                </span>
                                <i class='fas fa-angle-right'></i>
                            </li>
                            <li :class="li3" @click="showPocketMoney">
                                <span>
                                    <i class="fas fa-yen-sign"></i>我的余额
                                </span>
                                <i class='fas fa-angle-right'></i>
                            </li>
                            <li :class="li4" @click="showRecordDel">
                                <span>
                                    <i class="fas fa-trash-alt"></i>回收站
                                </span>
                                <i class='fas fa-angle-right'></i>
                            </li>
                        </ul>
                    </div>
                    <div class="user-cfg">
                        <router-view></router-view>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name:'UserInfo',
    props:['nowPage'],//3
    data(){
        return {
            nowPageS:31,
            li1:'hightLight',
            li2:'',
            li3:'',
            li4:'',
        }
    },
    mounted(){
        this.$store.commit('changePage',this.nowPage);
        // console.log(this.nowPageS);
    },
    computed:{
        listenNowPageS(){
            // console.log(this.$store.state.nowPageS);
            return this.$store.state.nowPageS
        }
    },
    watch:{
        listenNowPageS:{
            immediate:true,
            handler(newValue){
                this.nowPageS = newValue;
                // console.log(this.nowPageS);
                if(this.nowPageS == 31){
                    this.li1 = 'hightLight';
                    this.li2 = '';
                    this.li3 = '';
                    this.li4 = '';
                }
                if(this.nowPageS == 32){
                    this.li1 = '';
                    this.li2 = 'hightLight';
                    this.li3 = '';
                    this.li4 = '';
                }
                if(this.nowPageS == 33){
                    this.li1 = '';
                    this.li2 = '';
                    this.li3 = 'hightLight';
                    this.li4 = '';
                }
                if(this.nowPageS == 34){
                    this.li1 = '';
                    this.li2 = '';
                    this.li3 = '';
                    this.li4 = 'hightLight';
                }
            }
        }
    },
    methods:{
        showDetail(){
            this.$router.push({
                name:'userDetail',
            })
        },
        showCards(){
            this.$router.push({
                name:'userCards',
            })
        },
        showPocketMoney(){
            this.$router.push({
                path:'/user/userPocketMoney'
            })
        },
        showRecordDel(){
            this.$router.push({
                name:'userInfoRecordRe',
            })
        }
    },
    beforeDestroy(){
        localStorage.removeItem('cardNotes');
    }
}
</script>

<style scoped>
.user-info{
    height: 100%;
    background-color: #eee;
}
.mainbody{
    width: 999px;
    margin: 0 auto;
}
.mainbody .title{
    padding-top: 5px;
    height: 50px;
    background-color: #fff;
    font-size: 20px;
    line-height: 50px;
    border-bottom: 1px solid rgb(192, 203, 200);
}
.content{
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    margin-bottom: 10px;
    height: 100%;
    min-height: 500px;
    /* overflow: hidden; */
}
.user-aside{
    width: 190px;
    background-color: #fff;
}
.user-aside ul{
    list-style: none;
}
.user-aside ul li{
    height: 60px;
    line-height: 60px;
    padding-left: 20px;
    padding-right: 10px;
    cursor: pointer;
}
.user-aside ul li:hover{
    color: #007aff;
}
.hightLight{
    color: #007aff;
}
.user-aside ul li span,
.user-aside ul li span i{
    margin-right: 5px;
    float: left;
}
.user-aside ul li span i{
    width: 20px;
    text-align: center;
}
.user-aside ul li i{
    line-height: 60px;
    float: right;
}
.user-cfg{
    width: 780px;
}
</style>