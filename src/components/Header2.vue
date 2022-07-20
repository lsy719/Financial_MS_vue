<template>
    <div class="top-nav2">
        <div class="main">
            <div class="sys-logo">
                <!-- <img src="/cyberpink2077.png"> -->
                <img src="/mainlogo.png">
            </div>
            <div class="menu">
                <ul>
                    <li :class="li1" @click="myFinance">我的理财</li>
                    <li :class="li2" @click="myRecord">交易记录</li>
                    <li :class="li3" @click="myInfo">个人信息</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script scoped>
export default {
    name:'Header2',
    data(){
        return {
            highlight:'normal',
            nowPage:1,
            li1:"hightLight",
            li2:"",
            li3:"",
        }
    },
    methods:{
        myFinance(){
            // this.$router.push({
            //     path:'/myfinance'
            // })
            this.$router.push({
                name:'myfinance',
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
    },
    computed:{
        listenNowPage(){
            return this.$store.state.nowPage;
        }
    },
    watch:{
        listenNowPage(newValue){
            // console.log(newValue);
            this.nowPage = newValue;
            if(newValue == 1){
                this.li1 = 'hightLight'
                this.li2 = ''
                this.li3 = ''
            }
            if(newValue == 2){
                this.li1 = ''
                this.li2 = 'hightLight'
                this.li3 = ''
            }
            if(newValue == 3){
                this.li1 = ''
                this.li2 = ''
                this.li3 = 'hightLight'
            }
        }
    },
    mounted(){
        // console.log(this.nowPage);
    },
    beforeUpdate(){
        // console.log(this.$store.state.nowPage);
    }
}
</script>

<style scoped>
.top-nav2{
    width: 100%;
    height: 100px;
    border-bottom: 1px solid #999;
}
.main{
    width: 999px;
    height: 100%;
    margin: 0 auto;
    overflow: hidden;
}
.sys-logo{
    float: left;
    padding: 10px;
}
.sys-logo img{
    height: 80px;
    cursor: pointer;
}
.menu{
    float: right;
    font-size: 20px;
    margin-right: 20px;
}
.menu ul li{
    font-weight: bold;
    float: left;
    list-style: none;
    margin-top: 30px;
    padding: 10px 10px;
    cursor: pointer;
}
.menu ul li:hover{
    color: #e66e1e;
}
.hightLight{
    color: #e66e1e;
}
</style>