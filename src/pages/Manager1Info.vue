<template>
    <div class="manager-info">
        <p class="account">
            账号：{{managerInfo.account}}
        </p>
        <ul class="time">
            <li>创建：{{managerInfo.createTime}}</li>
            <li>|</li>
            <li>最后一次更新：{{managerInfo.lastUpdTime}}</li>
        </ul>
        <p class="authority">
            权限：<span v-if="managerInfo.adminLv === 99">最高</span><span v-if="managerInfo.adminLv === 1">普通</span>
        </p>
        <div class="password">
            密码：
            <span class="log">管理员登陆系统时需要的密码</span>
            <span class="edit" v-if="changePw === 0" @click="changePassword">修改</span>
        </div>
        <div class="password-change" v-if="changePw === 1">
            <ul>
                <li>
                    输入旧密码：<input ref="pwOld" type="password" maxlength="16" autocomplete="off" @keyup="oldPwInput">
                </li>
                <li>
                    输入新密码：<input ref="pwNew" type="password" maxlength="16" autocomplete="off" @keyup="newPwInput">
                    <span v-if="pwNewValid === 1" style="color:green;margin-left:10px;font-weight:bold">√</span>
                </li>
                <li>
                    确认新密码：<input ref="pwCfm" type="password" maxlength="16" autocomplete="off" @keyup="newPwCfmInput">
                    <span v-if="pwCfmValid === 1" style="color:green;margin-left:10px;font-weight:bold">√</span>
                </li>
                <li v-if="submitValid !== 0 && submitValid !== 99 " style="color:red;font-size:14px">
                    <span v-if="submitValid === 1">两次密码输入不一致</span>
                    <span v-if="submitValid === 2">密码错误</span>
                </li>
                <li class="button" v-if="submitValid !== 99">
                    <span @click="confirmChange">确认</span>
                    <span @click="cancleChange">取消</span>
                </li>
                <li v-if="submitValid === 99">
                    修改成功，{{countDown}}秒后窗口关闭
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
let timer = '';
import request from '../utils/request';
export default {
    name:'Manager1Info',
    data(){
        return {
            managerInfo:'',
            changePw:0,
            pwOld:'',
            pwNew:'',
            // 输入新密码的合法性
            pwNewValid:0,
            // 输入确认密码的合法性
            pwCfmValid:0,
            // 密码设置信息 1.不一致 2.错误 99.成功，进入倒计时
            submitValid:0,
            countDown:10,
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
        changePassword(){
            if(timer === ''){
                this.changePw = 1;
                this.$nextTick(() => {
                    this.$refs['pwOld'].focus();
                })
            }
        },
        oldPwInput(){
            this.pwOld = this.$refs['pwOld'].value;
            if(this.pwOld !== ''){
                this.submitValid = 0;
            }
        },
        newPwInput(){
            let pw = this.$refs['pwNew'].value;
            pw = pw.replace(/[^\w\.\@]/g,'');
            this.$refs['pwNew'].value = pw;
            if(pw.length >= 6){
                this.pwNewValid = 1;
                if(pw === this.$refs['pwCfm'].value){
                    this.pwCfmValid = 1;
                }else{
                    this.pwCfmValid = 0;
                }
            }else{
                this.pwNewValid = 0;
                this.pwCfmValid = 0;
            }
        },
        newPwCfmInput(){
            let pw = this.$refs['pwCfm'].value;
            pw = pw.replace(/[^\w\.\@]/g,'');
            this.$refs['pwCfm'].value = pw;
            if(pw.length >= 6){
                if(pw === this.$refs['pwNew'].value){
                    this.pwCfmValid = 1;
                    this.submitValid = 0;
                }else{
                    this.pwCfmValid = 0;
                }
            }else{
                this.pwCfmValid = 0;
            }
        },
        confirmChange(){
            if(this.pwOld === ''){
                this.submitValid = 2;
                return;
            }
            if(this.pwNewValid + this.pwCfmValid === 2){
                this.pwNew = this.$refs['pwNew'].value;
                if(this.pwOld !== this.pwNew){
                    const formData = new FormData();
                    formData.append('pwOld',this.pwOld);
                    formData.append('pwNew',this.pwNew);
                    formData.append('id',this.managerInfo.id);
                    request.post('/api/manage/changepw',formData).then(res => {
                        if(res.data === 1){
                            this.submitValid = 99;
                            this.refreshAdminData();
                            this.changeSuccess();
                        }else{
                            this.submitValid = 2;
                        }
                    },err => console.log(err));
                }else{
                    this.submitValid = 99;
                    this.changeSuccess();
                }
                // 请求成功后
                // this.submitValid = 99;
                // this.changeSuccess();
            }else{
                this.submitValid = 1;
            }
        },
        changeSuccess(){
            this.submitValid = 99;
            timer = setInterval(() => {
                this.countDown --;
                if(this.countDown === 0 ){
                    clearInterval(timer);
                    this.countDown = 10;
                    this.cancleChange();
                    timer = '';
                }
            },1000)
        },
        refreshAdminData(){
            let manager = {};
            manager.id = this.managerInfo.id;
            manager.account = this.managerInfo.account;
            manager.password = this.pwNew;
            localStorage.setItem("admin",JSON.stringify(manager));
            this.getManagerInfo();
        },
        cancleChange(){
            this.changePw = 0;
            this.pwNewValid = 0;
            this.pwCfmValid = 0;
            this.submitValid = 0;
            this.pwOld = '';
            this.pwNew = '';
        }
    },
    mounted(){
        this.getManagerInfo();
        this.changeNavHL(1);
    },
    beforeDestroy(){

    },
}
</script>

<style scoped>
.manager-info{
    margin-top: 50px;
    margin-left: 20px;
}
.time{
    margin-top: 5px;
    display: flex;
    font-size: 12px;
}
.time > li{
    margin-right: 10px;
    color: #999;
}
.authority,
.password{
    margin-top: 10px;
}
.password > .log{ 
    color: #999;
    font-size: 12px;
    margin-right: 20px;
}
.password > .edit{
    text-decoration: underline;
    cursor: pointer;
}
.password > .edit:hover{
    opacity: .6;
}
.password-change{
    display: inline-block;
    margin-top: 10px;
    padding: 10px 10px;
    border: 1px solid #555;
    border-radius: 10px;
}
.password-change li{
    height: 40px;
    width: 330px;
    line-height: 40px;
}
.password-change input{
    height: 30px;
    width: 200px;
    outline: 0px;
}
.button > span{
    margin: 0 10px;
    cursor: pointer;
}
.button > span:hover{
    opacity: .6;
}
</style>