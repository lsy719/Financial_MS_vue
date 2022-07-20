<template>
    <div class="admin-add">
        <div class="page-title">
            <p>系统管理员添加</p>
            <p class="manager-back" @click="backManagermian"><i class="fas fa-reply">返回</i></p>
        </div>
        <ul class="add-area">
            <li>
                <div>
                    设置账号
                </div>
                <div>
                    <input ref="accountSet" type="text" maxlength="16" @keyup="accountWrite">
                </div>
            </li>
            <li>
                <div>
                    设置密码
                </div>
                <div>
                    <input ref="pwSet" type="text" maxlength="16" @keyup="newPwInput">
                </div>
            </li>
            <li>
                <div>
                    确认密码
                </div>
                <div>
                    <input ref="pwCfmSet" type="text" maxlength="16" @keyup="newPwCfmInput">
                </div>
            </li>
        </ul>
        <div class="message">
            <p v-if="submitValid === 1">账号需要6位以上</p>
            <p v-if="submitValid === 2">账号已存在</p>
            <p v-if="submitValid === 3">密码设置错误</p>
            <p v-if="submitValid === 99">添加成功</p>
        </div>
        <div v-if="submitValid !== 99" class="submit">
            <span @click="addCfm">确定</span>
            <span @click="resetInfo">重置</span>
        </div>
        <div v-if="submitValid === 98" class="submit" style="border:none">
            <p>数据提交中...</p>
        </div>
        <div v-if="submitValid === 99" class="submit" style="border:none">
            <p>{{countDown}}秒后返回</p>
        </div>
        <div class="rerandom" @click="resetAcc">
            <span><i class="fas fa-dice"></i>重新随机</span>
        </div>
        <div class="pwValid">
            <div>
                <span v-if="pwNewValid === 1">√</span>
            </div>
            <div>
                <span v-if="pwCfmValid === 1">√</span>
            </div>
        </div>
    </div>
</template>

<script>
let timer = '';
import request from '../utils/request';
import uuid from '../utils/uuid';
export default {
    name:'Manager2JuniorAdd',
    props:['manager'],
    data(){
        return {
            managerInfo:'',
            account:'',
            pwNew:'',
            pwCfm:'',
            // 账号设置信息 1.不能为空 2.已存在 3.密码设置错误 99.成功，进入倒计时
            submitValid:0,
            // 输入新密码的合法性
            pwNewValid:0,
            // 输入确认密码的合法性
            pwCfmValid:0,
            countDown: 5,
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
                    }
                }else{
                    this.backTOLogin();
                }
            },err => console.log(err));
        },
        backManagermian(){
            this.$router.push({
                name:'adminJunior',
            })
        },
        resetAcc(){
            this.$nextTick(() => {
                this.account = uuid.uuid(8);
                this.$refs['accountSet'].value = this.account;
                this.$refs['pwSet'].focus();
            })
        },
        resetInfo(){
            this.pwNew = '';
            this.pwCfm = '';
            this.$refs['pwSet'].value = '';
            this.$refs['pwCfmSet'].value = '';
            this.pwNewValid = 0;
            this.pwCfmValid = 0;
            this.submitValid = 0;
            this.resetAcc();
        },
        accountWrite(){
            this.account = this.$refs['accountSet'].value;
            if(this.account.length >= 6){
                this.submitValid = 0;
            }else{
                this.submitValid = 1;
            }
        },
        newPwInput(){
            let pw = this.$refs['pwSet'].value;
            pw = pw.replace(/[^\w\.\@]/g,'');
            this.$refs['pwSet'].value = pw;
            if(pw.length >= 6){
                this.pwNewValid = 1;
                if(pw === this.$refs['pwCfmSet'].value){
                    this.pwCfmValid = 1;
                }else{
                    this.pwCfmValid = 0;
                }
            }else{
                this.pwNewValid = 0;
                this.pwCfmValid = 0;
            }
            if(this.pwNewValid + this.pwCfmValid === 2){
                this.submitValid = 0;
            }
        },
        newPwCfmInput(){
            let pw = this.$refs['pwCfmSet'].value;
            pw = pw.replace(/[^\w\.\@]/g,'');
            this.$refs['pwCfmSet'].value = pw;
            if(pw.length >= 6){
                if(pw === this.$refs['pwSet'].value){
                    this.pwCfmValid = 1;
                    this.submitValid = 0;
                }else{
                    this.pwCfmValid = 0;
                }
            }else{
                this.pwCfmValid = 0;
            }
            if(this.pwNewValid + this.pwCfmValid === 2){
                this.submitValid = 0;
            }
        },
        addCfm(){
            if(this.account.length < 6){
                this.submitValid = 1;
                return;
            }
            if(this.pwNewValid + this.pwCfmValid !== 2){
                this.submitValid = 3;
                return;
            }else{
                this.submitValid = 98;
                const formData = new FormData();
                formData.append('account',this.account);
                formData.append('password',this.$refs['pwCfmSet'].value);
                formData.append('createTime',this.createTime());
                request.post('/api/manage/adminadd',formData).then(res => {
                    if(res.data === 2){
                        this.submitValid = 2;
                    }else if(res.data === 1){
                        // 成功
                        this.submitValid = 99;
                        this.addSuccess();
                    }else{
                        console.log('未知错误');
                    }
                },err => console.log(err));
            }
        },
        createTime(){
            const date = new Date();
            const dash = '-'
            const year = date.getFullYear();
            let month = date.getMonth()+1;
            let day = date.getDate();
            let h = date.getHours();
            let m = date.getMinutes();
            let s = date.getSeconds();
            if(month >= 1 && month <=9){
                month = '0' + month;
            }
            if(day >= 1 && day <= 9){
                day = '0' + day;
            }
            if(h >= 0 && h <= 9 ){
                h = '0' + h
            }
            if(m >= 0 && m <= 9 ){
                m = '0' + m
            }
            if(s >= 0 && s <= 9 ){
                s = '0' + s
            }
            const currentTime = year + dash + month + dash + day + ' ' + h + ':' + m + ':' + s;
            return currentTime;
        },
        addSuccess(){
            this.submitValid = 99;
            timer = setInterval(() => {
                this.countDown --;
                if(this.countDown === 0 ){
                    clearInterval(timer);
                    this.countDown = 5;
                    timer = '';
                    this.backManagermian();
                }
            },1000)
        },
    },
    mounted(){
        if(this.manager){
            if(this.manager.adminLv === 99){
                this.managerInfo = this.manager;
            }
        }else{
            this.getManagerInfo();
        }
        this.changeNavHL(2);
        this.resetAcc();
        // console.log(uuid.uuid(8)) 
    },
}
</script>

<style scoped>
input{
    outline: 0px;
    height: 30px;
    background-color: transparent;
    border: none;
}
.admin-add{
    position: relative;
    margin-top: 40px;
    margin-left: 20px;
}
.page-title{
    display: flex;
    justify-content: space-between;
    margin-right: 100px;
}
.manager-back{
    cursor: pointer;
}
.manager-back:hover{
    color: rgb(80, 126, 65);
}
.manager-back:active{
    opacity: .6;
}
.add-area{
    display: inline-block;
    border-top: 1px solid #999;
    margin-top: 10px;
}
.add-area li{
    height: 48px;
    line-height: 46px;
    display: flex;
    border-bottom: 1px solid #999;
    border-left: 1px solid #999;
}
.add-area li div{
    border-right: 1px solid #999;
}
.add-area li div:first-child{
    padding: 0 10px;
    background-color: rgb(45, 63, 80);
    color: #aaa;
    font-weight: lighter;
}
.add-area li div:last-child{
    padding: 0 20px;
}
.submit{
    display: flex;
    margin-top: 10px;
    height: 30px;
    line-height: 30px;
    width: 100px;
    border: 1px solid #999;
}
.submit > span{
    display: inline-block;
    width: 50%;
    text-align: center;
    line-height: 28px;
    cursor: pointer;
}
.submit > span:first-child{
    background-color: rgb(45, 63, 80);
    color: #aaa;
}
.submit > span:first-child:hover{
    opacity: 0.8;
}
.submit > span:last-child:hover{
    background-color: #f5f5f5;
}
.rerandom{
    position: absolute;
    left: 320px;
    top: 45px;
    cursor: pointer;
    color: #999;
}
.rerandom:hover{
    color: rgb(49, 49, 49);
}
.rerandom:active{
    color: #777;
}
.message{
    margin-top: 10px;
}
.pwValid{
    position: absolute;
    left: 320px;
    top: 80px;
}
.pwValid div{
    height: 48px;
}
.pwValid span{
    line-height: 48px;
    display: block;
    color:green;
    font-weight:bold;
}
</style>