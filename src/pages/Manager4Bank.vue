<template>
    <div class="bank-manage">
        <div class="page-title">
            <p>银行信息管理</p>
            <!-- <p class="bank-add" @click="newInfo"><i class="fas fa-plus">新增</i></p> -->
        </div>
        <span class="all" @click="showAllBank">全部</span>
        <span class="none" v-if="noImg === 0" @click="doSearchNoImg">无图标</span>
        <span class="searchAlert" v-if="noImg === 1" style="margin:0 10px">只看无图标</span>
        <div class="like-search">
            <p>选择查询类型：</p>
            <select ref="searchChoose" v-model="searchType">
                <option value="1">代码</option>
                <option value="2">名称</option>
            </select>
            <input type="text" maxlength="16" ref="searchInput" v-model="searchContent">
            <span @click="doSearch">搜索</span>
        </div>
        <span class="searchAlert" v-if="searchAlertShow === 1">不能为空</span>
        <span class="searchAlert" v-if="searchAlertShow === 2">无结果</span>
        <span class="searchAlert" v-if="searchAlertShow === 3">共{{searchResNum}}条</span>
        <div class="bank-action">
            <ul class="bank-list">
                <li class="list-head">
                    <div>id</div>
                    <div>代码</div>
                    <div>银行</div>
                    <div>图标</div>
                    <div>操作</div> 
                </li>
                <li class="list-body" v-for="item in bankList" :key="item.bankId">
                    <div class="bankId">{{item.bankId}}</div>
                    <div class="bankCode">{{item.bankCode}}</div>
                    <div class="bankName">{{item.bankName}}</div>
                    <div class="bankImg">
                        <img :src="item.bankImg">
                    </div>
                    <div class="action">
                        <span @click="changeInfo(item)" v-if="isEdit === 0 || isEditBank !== item.bankId">修改</span>
                        <span @click="cancleChange" v-if="isEdit === 1 && isEditBank === item.bankId" style="color:red">取消</span>
                    </div>
                </li>
            </ul>
            <div class="caozuo-area" v-if="isEdit === 1 || isNew === 1">
                <div class="caozuo-area-title">
                    <span v-if="isEdit === 1">修改图标</span>
                    <span v-if="isNew === 1">添加图标</span>
                </div>
                <template v-if="isNew === 1">
                    添加
                </template>
                <template v-if="isShowDom && isEdit === 1">
                    <p class="bank-change-name">{{isEditBankEntity.bankName}}</p>
                    <p class="bank-change-code">代码：<span>{{isEditBankEntity.bankCode}}</span></p>
                    <p class="bank-change-img">目前图标：</p>
                    <div class="img-area">
                        <img ref="bankImg" :src="isEditBankEntity.bankImg" alt="">
                    </div>
                    <div class="img-change-option" v-show="imgIsChanging === 0">
                        <a href="javascript:;" class="a-upload">
                            修改
                            <input class="selectImg" type="file" accept="image/*" ref="imgSelect" @change="showImg">
                        </a>
                        <span @click="showImgReset">重置</span>
                    </div>
                    <div class="arrow" v-show="imgIsChanging === 1">
                        <span><i class="fas fa-arrow-circle-down"></i></span>
                    </div>
                    <div class="img-area" v-show="imgIsChanging === 1">
                        <img ref="newImg">
                    </div>
                    <div class="img-change-option" v-show="imgIsChanging === 1">
                        <span @click="imgChangeCancleInner">取消</span>
                        <span @click="imgSave">确认</span>
                    </div>
                </template>
                <span class="close-change" @click="cancleChange">取消</span>
            </div>
        </div>

        <!-- 分页 -->
        <!-- 展示全部系用户时的分页 -->
        <template v-if="nowList === 1">
            <div class="page">
                <span @click="firstPage"><i class="fas fa-angle-double-left"></i>首页</span>
                <span @click="previousPage"><i class="fas fa-angle-left"></i>上一页</span>
                <span><span>{{indexRange}}</span>条，共<span>{{bankNumber}}</span>条</span>
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
let debounceTimer;
let timerShowAll;
import request from '../utils/request';
export default {
    name:'Manager4Bank',
    data(){
        return {
            managerInfo:'',
            // 条目总数
            bankNumber:0,
            pageSet:1,
            pageAll:1,
            pageSize:10,
            bankList:'',
            searchType:1,//1.代码 2.名称 3.无图标
            searchTypeKeep:1,
            searchContent:'',
            searchContentKeep:'',
            searchAlertShow:0,//1.不呢为空 2.无结果 3.结束
            searchResNum:0,
            // 当前展示 1.全部 2.搜索内容（主要是分页的时候）
            nowList:1,

            // 无图标模式，只看没设置图标的银行(点击无图标按钮就开启，点击全部就关闭)
            noImg:0,
            isEdit:0,
            isEditBank:0,
            isEditBankEntity:'',
            isNew:0,

            imgIsChanging:0,
            isShowDom:true,
            bankDefaultImg: '/img/UNKNOWN.png',
            // 是修改还是重置？？ 1.设置，2回到默认
            imgChangeChoose:'',
        }
    },
    computed:{
        indexRange(){
            let indexBegin = (this.pageSet-1)*10+1;
            let indexEnd = indexBegin + 9;
            if(indexEnd > this.bankNumber){
                indexEnd = this.bankNumber;
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
        getBankList(){
            const formDate = new FormData();
            formDate.append('anchor',(this.pageSet - 1)*this.pageSize);
            formDate.append('pageSize',this.pageSize);
            request.post('/api/manage/allbanknum').then(res => {
                this.bankNumber = res.data;
                if(this.bankNumber % this.pageSize > 0){
                    this.pageAll = parseInt(this.bankNumber/this.pageSize+1);
                    if(this.pageAll < this.pageSet){
                        this.pageSet = this.pageAll;
                    }
                }else{
                    this.pageAll = parseInt(this.bankNumber/this.pageSize);
                    if(this.pageAll < this.pageSet){
                        this.pageSet = this.pageAll;
                    }
                }
                request.post('/api/manage/allbank',formDate).then(res => {
                    this.bankList = res.data.data;
                },err => console.log(err));
            },err => console.log(err));
        },
        getBankListni(){
            const formDate = new FormData();
            formDate.append('anchor',(this.pageSet - 1)*this.pageSize);
            formDate.append('pageSize',this.pageSize);
            request.post('/api/manage/allbanknumni').then(res => {
                this.bankNumber = res.data;
                if(this.bankNumber % this.pageSize > 0){
                    this.pageAll = parseInt(this.bankNumber/this.pageSize+1);
                    if(this.pageAll < this.pageSet){
                        this.pageSet = this.pageAll;
                    }
                }else{
                    this.pageAll = parseInt(this.bankNumber/this.pageSize);
                    if(this.pageAll < this.pageSet){
                        this.pageSet = this.pageAll;
                    }
                }
                request.post('/api/manage/allbankni',formDate).then(res => {
                    this.bankList = res.data.data;
                },err => console.log(err));
            },err => console.log(err));
        },
        // ---------------------分页查询功能----------------------
        nextPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet < this.pageAll){
                    this.pageSet ++;
                    if(this.noImg == 0){
                        this.getBankList();
                    }else{
                        this.getBankListni();
                    }
                }
            },500);
        },
        previousPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet > 1){
                    this.pageSet --;
                    if(this.noImg == 0){
                        this.getBankList();
                    }else{
                        this.getBankListni();
                    }
                }
            },500);
        },
        firstPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet !== 1){
                    this.pageSet = 1;
                    if(this.noImg == 0){
                        this.getBankList();
                    }else{
                        this.getBankListni();
                    }
                }
            },500);
        },
        lastPage(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet !== this.pageAll){
                    this.pageSet = this.pageAll;
                    if(this.noImg == 0){
                        this.getBankList();
                    }else{
                        this.getBankListni();
                    }
                }
            },500);
        },
        nextPageSearch(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet < this.pageAll){
                    this.pageSet ++;
                    if(this.noImg == 0){
                        this.doSearchRequest();
                    }else{
                        this.doSearchRequestNoImg();
                    }
                }
            },500);
        },
        previousPageSearch(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet > 1){
                    this.pageSet --;
                    if(this.noImg == 0){
                        this.doSearchRequest();
                    }else{
                        this.doSearchRequestNoImg();
                    }
                }
            },500);
        },
        firstPageSearch(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet !== 1){
                    this.pageSet = 1;
                    if(this.noImg == 0){
                        this.doSearchRequest();
                    }else{
                        this.doSearchRequestNoImg();
                    }
                }
            },500);
        },
        lastPageSearch(){
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if(this.pageSet !== this.pageAll){
                    this.pageSet = this.pageAll;
                    if(this.noImg == 0){
                        this.doSearchRequest();
                    }else{
                        this.doSearchRequestNoImg();
                    }
                }
            },500);
        },

        // ---------------------------------------------------
        showAllBank(){
            clearTimeout(timerShowAll);
            timerShowAll = setTimeout(() => {
                this.noImg = 0;
                this.pageSet = 1;
                this.getBankList();
                this.nowList = 1;
                this.searchAlertShow = 0;
                this.searchContent = '';
            })
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
                if(this.noImg === 0){
                    this.doSearchRequest();
                }else if(this.noImg === 1){
                    this.doSearchRequestNoImg();
                }
            }
        },
        doSearchNoImg(){
            this.noImg = 1;
            if(this.nowList === 1){
                this.getBankListni();
            }else if(this.nowList === 2){
                this.doSearchRequestNoImg();
            }
        },
        doSearchRequest(){
            const searchType = this.searchTypeKeep
            const formDate = new FormData();
            formDate.append('searchType',searchType);
            formDate.append('searchContent',this.searchContentKeep);
            request.post('/api/manage/searchbanknum',formDate).then(res => {
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
                    request.post('/api/manage/searchbank',formDate).then(res => {
                        this.bankList = res.data.data;
                        this.nowList = 2;
                    },err => console.log(err));
                }
            },err => console.log(err));
        },
        doSearchRequestNoImg(){
            const searchType = 3 + parseInt(this.searchTypeKeep);//4,5
            // console.log(searchType);
            const formDate = new FormData();
            formDate.append('searchType',searchType);
            formDate.append('searchContent',this.searchContentKeep);
            request.post('/api/manage/searchbanknum',formDate).then(res => {
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
                    request.post('/api/manage/searchbank',formDate).then(res => {
                        this.bankList = res.data.data;
                        this.nowList = 2;
                    },err => console.log(err));
                }
            },err => console.log(err));
        },
        changeInfo(item){
            this.isNew = 0;
            this.isEdit = 1;
            this.isEditBank = item.bankId;
            this.isEditBankEntity = item;
        },
        cancleChange(){
            this.isEdit = 0;
            this.isEditBank = 0;
            this.isEditBankEntity = '';
            this.imgIsChanging = 0;
            this.imgChangeChoose = '';
        },
        newInfo(){
            this.isNew = 1;
            this.cancleChange();
        },
        showImg(){
            this.imgChangeChoose = 1;
            this.imgIsChanging = 1;
            this.$nextTick(() => {
                const img = this.$refs['newImg'];
                const file = this.$refs['imgSelect'];
                const f = new FileReader();
                f.onload = (event) => {
                    img.src = event.target.result;
                }
                f.readAsDataURL(file.files[0]);
            })
        },
        showImgReset(){
            this.imgChangeChoose = 2;
            this.imgIsChanging = 1;
            this.$nextTick(() => {
                const img = this.$refs['newImg'];
                img.src = this.bankDefaultImg;
            })
        },
        imgChangeCancleInner(){
            this.imgIsChanging = 0;
            this.isShowDom = false;
            this.$nextTick(() => {
                this.isShowDom = true;
            })
        },
        imgSave(){
            const formData = new FormData();
            formData.append('bankId',this.isEditBankEntity.bankId);
            formData.append('bankCode',this.isEditBankEntity.bankCode);
            if(this.imgChangeChoose === 1){
                // console.log(this.$refs.imgSelect.files[0]);
                formData.append('file',this.$refs.imgSelect.files[0]);
            }else{
                // console.log('重置为默认');
            }
            // 更新成功后，关闭此窗口，重载列表数据
            request.post('/api/manage/bankimgset',formData).then(res => {
                if(res.data === 1){
                    this.reloadAfterImgChange();
                    this.cancleChange();
                }else{
                    console.log('未知错误');
                }
                
            },err => console.log(err));
            
        },
        reloadAfterImgChange(){
            // 更新完成后，根据nowList和noImg重载银行列表，关闭此窗口
            if(this.nowList === 1){
                if(this.noImg === 0){
                    this.getBankList();
                }else if(this.noImg === 1){
                    this.getBankListni();
                }else{
                    this.showAllBank();
                }
            }else if(this.nowList === 2){
                if(this.noImg === 0){
                    this.doSearchRequest();
                }else if(this.noImg === 1){
                    this.doSearchRequestNoImg();
                }else{
                    this.showAllBank();
                }
            }else{
                this.showAllBank();
            }
        },
    },
    mounted() {
        this.changeNavHL(4);
        this.getManagerInfo();
        this.getBankList();
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
.bank-manage{
    margin-top: 40px;
    margin-left: 20px;
}
.page-title{
    display: flex;
    justify-content: space-between;
    margin-right: 100px;
}
.bank-add{
    cursor: pointer;
}
.bank-add:hover{
    color: rgb(90, 193, 253);
}
.bank-add:active{
    opacity: .6;
}
.bank-action{
    display: flex;
}
.caozuo-area{
    position: relative;
    margin-top: 10px;
    margin-left: 15px;
    width: 220px;
    height: 510px;
    border: 1px solid #999;
}
.caozuo-area > p{
    margin-left: 10px;
    font-weight: lighter;
}
.bank-change-name{
    margin-top: 10px;
}
.bank-change-code{
    font-size: 14px;
}
.bank-change-img{
    margin-top: 10px;
    font-size: 12px;
}
.img-area img{
    display: block;
    margin: 0 auto;
    width: 100px;
    height: 100px;
    object-fit: cover;
}
.img-change-option{
    width: 120px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
}
.close-change,
.img-change-option > span,
.a-upload{
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
.a-upload  input {
    position: absolute;
    right: 0;
    top: 0;
    opacity: 0;
    filter: alpha(opacity=0);
    cursor: pointer
}
.close-change:hover,
.img-change-option > span:hover,
.a-upload:hover {
    color: #444;
    background: #eee;
    border-color: #ccc;
    text-decoration: none
}
.close-change{
    position: absolute;
    bottom: 10px;
    right: 20px;
    color: #007bff65;
}
.arrow{
    height: 40px;
    line-height: 40px;
    font-size: 20px;
    text-align: center;
    color: #999;
    margin-bottom: 10px;
}
.caozuo-area-title{
    width: 100%;
    height: 30px;
    background-color: #2d3f50;
}
.caozuo-area-title span{
    line-height: 30px;
    margin-left: 10px;
    color: #999;
}
.bank-list{
    display: inline-block;
    border-top: 1px solid #999;
    margin-top: 10px;
}
.bank-list > li{
    display: flex;
    border-bottom: 1px solid #999;
    border-right: 1px solid #999;
}
.bank-list > li:first-child{
    height: 30px;
    line-height: 28px;
    text-align: center;
    background-color: #2d3f50;
    color: #aaa;
    font-weight: lighter;
}
.list-body{
    height: 48px;
    line-height: 46px;
}
.bank-list > li > div{
    border-left: 1px solid #999;
}
.bank-list > li > div:nth-child(1){
    width: 40px;
}
.bank-list > li > div:nth-child(2){
    width: 120px;
}
.bank-list > li > div:nth-child(3){
    width: 280px;
}
.bank-list > li > div:nth-child(4){
    width: 50px;
}
.bank-list > li > div:nth-child(5){
    width: 60px;
}
.bankId,
.action{
    text-align: center;
}
.bankCode,
.bankName{
    padding-left: 10px;
    font-size: 14px;
}
.bankImg img{
    display: block;
    margin: 0 auto;
    margin-top: 3px;
    width: 40px;
    height: 40px;
    object-fit: cover;
}

.page{
    margin-right: 240px;
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
.action > span{
    cursor: pointer;
}
.action > span:hover{
    text-decoration: underline;
}
</style>