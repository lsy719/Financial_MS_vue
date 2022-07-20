<template>
    <div class="add-fund">
        <div class="backtohold-button" @click="back2hold">
            <span><i class="fas fa-angle-double-left"></i>返回</span>
        </div>
        <div class="to-top-button" v-show="needBackToTop === 1" @click="back2Top">
            <span><i class="fas fa-angle-double-up"></i>回到顶部</span>
        </div>
        <h3>理财记录添加</h3>
        <div class="add-fund-nav">
            <ul>
                <li>选择基金代码开头数字:</li>
                <li @click="getFundList">全部</li>
                <li @click="getFundListByHeadNum(index)" v-for="index in numberArr" :key="index">{{index}}</li>
            </ul>
            <div class="add-fund-nav-ex">
                <input @keyup="searchFund" ref="codeOrName" type="text" placeholder="输入基金代码、名称">
                <span @click="searchFundClick">查询</span>
            </div>
            <span @click="addBySelf" style="background-color: rgb(0, 119, 255);">自主添加</span>
        </div>
        <ul class="add-fund-list">
            <li v-for="item in fundListShow" :key="item.financeId">
                <span @click="chooseThis1(item)" :title="item.financeName">（{{item.financeCode}}）{{item.financeName}}</span>
            </li>
        </ul>
        <div class="no-res" v-if="fundListShow.length === 0">
            <p>没有结果,可<span @click="addBySelf">自行添加</span></p>
        </div>
    </div>
</template>

<script>
let timer;
import request from '../utils/request'
export default {
    name:'MyFinanceAdd',
    data(){
        return {
            numberArr:[0,1,2,3,4,5,6,7,8,9],
            holdList:[],
            fundList:[],
            fundListShow:[],
            needBackToTop:0,
        }
    },
    methods:{
        getFundHoldList(){
            // 进入异步队列
            if(this.$store.state.userInfo.id){
                const userId = new FormData();
                userId.append('userId',this.$store.state.userInfo.id);
                request.post('/api/finance/holdhund',userId).then(res => {
                    if(res.data.code === "0"){
                        this.holdList = res.data.data;
                    }else{
                        /**
                         * 
                         */
                        console.log("未知错误");
                    }
                },err => console.log(err));
            }else{
                timer = setInterval(()=>{
                    if(this.$store.state.userInfo.id){
                        const userId = new FormData();
                        userId.append('userId',this.$store.state.userInfo.id);
                        request.post('/api/finance/holdhund',userId).then(res => {
                            if(res.data.code === "0"){
                                this.holdList = res.data.data;
                            }else{
                                /**
                                 * 
                                 */
                                console.log("未知错误");
                            }
                        },err => console.log(err));
                        clearInterval(timer);
                    }
                },100);
            }
        },
        getFundList(){
            request.get('/api/finance/allfund').then(res => {
                if(res.data.code === "0"){
                    this.fundList = res.data.data;
                    this.fundListShow = this.fundList;
                }else{
                    /**
                     * 
                     */
                    console.log("未知错误");
                }
            },err => console.log(err));
        },
        getFundListByHeadNum(number){
            this.fundListShow = this.fundList.filter((item,index,arr) => {
                return parseInt(item.financeCode.slice(0,1)) === number;
            })
        },
        searchFund(){
            const allNumberPattern = /^\d+$/;
            const searchContent = this.$refs['codeOrName'].value;
            if(searchContent !== ''){
                if(allNumberPattern.test(searchContent)){
                    this.fundListShow = this.fundList.filter((item,index,arr) => {
                        return parseInt(item.financeCode.slice(0,searchContent.length)) === parseInt(searchContent);
                    })
                }else{
                    this.fundListShow = this.fundList;
                }
            }else{
                this.fundListShow = this.fundList;
            }
        },
        searchFundClick(){
            const allNumberPattern = /^\d+$/;
            const searchContent = this.$refs['codeOrName'].value;
            if(searchContent !== ''){
                if(allNumberPattern.test(searchContent)){
                    this.fundListShow = this.fundList.filter((item,index,arr) => {
                        return parseInt(item.financeCode.slice(0,searchContent.length)) === parseInt(searchContent);
                    })
                }else{
                    const formData = new FormData();
                    formData.append('searchName',searchContent);
                    request.post('/api/finance/searchfund',formData).then(res => {
                        if(res.data.code === '0'){
                            this.fundListShow = res.data.data;
                        }else{
                            this.fundListShow = this.fundList;
                        }
                    },err => console.log(err));
                }
            }else{
                this.fundListShow = this.fundList;
            }
        },
        back2hold(){
            this.$router.push({
                name:'myfinance',
            })
        },
        back2Top(){
            document.body.scrollTop = document.documentElement.scrollTop = 0
        },
        scrollTop(){
            let scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            if(scrollTop >= 200){
                this.needBackToTop = 1;
            }else{
                this.needBackToTop = 0;
            }
        },
        chooseThis1(finance){
            // console.log(JSON.parse(JSON.stringify(finance)));
            this.$router.push({
                name:'myfinanceAddCall',
                params:{
                    fund: JSON.parse(JSON.stringify(finance)),
                    fundHave: JSON.parse(JSON.stringify(this.holdList)),
                }
            })
        },
        addBySelf(){
            this.$router.push({
                name:'myfinanceAddSelf',
                params:{
                    allFund: JSON.parse(JSON.stringify(this.fundList)),
                    fundHave: JSON.parse(JSON.stringify(this.holdList)),
                }
            })
        }
    },
    created(){
        this.getFundList();
    },
    mounted(){
        window.addEventListener('scroll',this.scrollTop,true);
        this.getFundHoldList();
    },
    beforeDestroy(){
        clearInterval(timer);
    }
}
</script>

<style scoped>
.add-fund{
    background-color: #fff;
    position: relative;
}
.to-top-button{
    position: fixed;
    bottom: 90px;
    left: 50%;
    margin-left: 510px;
    cursor: pointer;
    width: 18px;
    text-align: center;
}
.backtohold-button{
    position: fixed;
    bottom: 120px;
    right: 50%;
    margin-right: 510px;
    cursor: pointer;
    width: 18px;
    text-align: center;
}
.add-fund > h3{
    margin-top: 5px;
    padding-left: 8px;
    background-color: aliceblue;
}
.add-fund-nav{
    display: flex;
    justify-content: space-between;
    padding: 0 5px;
}
.add-fund-nav > ul{
    margin-top: 10px;
    display: flex;
}
.add-fund-nav > ul > li{
    height: 30px;
    line-height: 30px;
    border: 1px solid #55c0e0;
    border-left: none;
    padding: 0px 15px;
    background-color: #fff;
    cursor: pointer;
}
.add-fund-nav > ul > li:first-child{
    border: 1px solid #1fcbff;
    background-color: #c7f2ff;
    padding: 0 20px;
    font-size: 13px;
    cursor: auto;
}
.add-fund-nav > ul > li:first-child ~ li:hover{
    background-color: rgb(216, 216, 216);
}
.add-fund-nav > ul > li:first-child ~ li:active{
    opacity: 0.7;
}
.add-fund-nav-ex{
    display: flex;
}
.add-fund-nav input{
    margin-top: 10px;
    display: block;
    height: 30px;
    outline: 0px;
    border: none;
    border: 1px solid #1fcbff;
    border-right: none;
}
.add-fund-nav span{
    margin-top: 10px;
    display: block;
    height: 30px;
    line-height: 30px;
    border: #1fcbff 1px solid;
    border-left: none;
    background-color: rgb(0, 89, 255);
    color: #fff;
    font-size: 14px;
    padding: 0 20px;
    cursor: pointer;
}
.add-fund-nav span:hover{
    opacity: 0.9;
}
.add-fund-nav span:active{
    opacity: 0.6;
}
.add-fund-list{
    display: flex;
    flex-flow: wrap;
    margin: 0 3px;
    margin-top: 10px;
    margin-bottom: 10px;
    border: 1px solid rgb(189, 212, 230);
    border-right: none;
}
.add-fund-list > li{
    width: 330px;
    height: 25px;
    line-height: 25px;
    overflow: hidden;
    /* flex布局无效 */
    /* text-overflow: ellipsis; */
    border: 1px solid rgb(189, 212, 230);
    border-top: none;
    border-left: none;
}
.add-fund-list > li:nth-child(6n+4),
.add-fund-list > li:nth-child(6n+5),
.add-fund-list > li:nth-child(6n+6){
    background-color: #ddd;
}
.add-fund-list > li > span{
    display: inline-block;
    cursor: pointer;
}
.add-fund-list > li > span:hover{
    text-decoration: underline;
}
.no-res{
    padding-bottom: 10px;
}
.no-res p{
    margin-left: 10px;
}
.no-res span{
    cursor: pointer;
    text-decoration: underline;
}
.no-res span:hover{
    color: #d48b04;
}
</style>