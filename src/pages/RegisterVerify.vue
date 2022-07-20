<template>
    <div class="register" v-if="registerInfo">
        <div class="title">
            <img src="/systitle.jpg">
        </div>
        <div class="content">
            <div>
                <p class="message">一条验证码已发往手机号：{{registerInfo.phone}},<br>5分钟之内有效，请勿刷新页面</p>
            </div>
            <div class="code-input">
                <label>输入验证码：</label>
                <input type="text" maxlength="6" ref="verifyCode" v-model="verifyCode" @keyup="codeInput">
                <span class="cannot" v-if="reSendValidCode > 0">重新发送({{reSendValidCode}})</span>
                <span class="can" v-if="reSendValidCode == 0" @click="reCreateValidCode">重新发送</span>
            </div>
            <div class="next">
                <div class="next-button">
                    <span @click="submitFinal">确认</span>
                </div>
            </div>
            <div style="text-align:center;margin-top:10px;font-size:14px;">
                <span class="back" @click="backToRegister">取消</span>
            </div>
            <div style="margin-top:50px;text-align:center">
                <button @click="getVerifyCode">查看验证码</button>
            </div>
        </div>
        <div v-show="alertMark != 0" class="alter-background">
            <div class="alter-content">
                <div class="alert-top">
                    <span>Confirm</span>
                    <span style="font-size:26px;" @click="cancle" v-if="alertMark !== 1 && alertMark !== -1">×</span>
                </div>
                <div class="alter-words">
                    <div class="alter-img">
                        <img src="/img/Warning.png" alt="">
                    </div>
                    <h3 v-if="alertMark === -1">正在验证...</h3>
                    <h3 v-if="alertMark === 2" style="color:red">请输入6位验证码</h3>
                    <h3 v-if="alertMark === 5" style="color:red">验证码错误</h3>
                    <h3 v-if="alertMark === 7">验证码已发送！</h3>
                    <h3 v-if="alertMark === 1">注册成功，{{countDown}}秒后进入登录界面</h3>
                </div>
                <ul v-if="alertMark !== 1 && alertMark !== -1">
                    <li @click="cancle">确认</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
let timer;
let timer2;
let timerCodeResend;
import request from '../utils/request';
export default {
    name:'RegisterVerify',
    props:['registerInfo'],
    data(){
        return{
            verifyCode:'',
            alertMark:0,
            countDown:3,
            reSendValidCode:60,
        }
    },
    methods:{
        //获得验证码（模拟手机收到验证码）
        getVerifyCode(){
            const formData = new FormData();
            formData.append('phone',this.registerInfo.phone);
            request.post("/api/cards/simcodeget",formData).then(res => {
                console.log("验证码:" + res.data);
            },err => console.log(err));
        },
        backToRegister(){
            this.nowRegisteInfoDone();
            this.$router.replace({
                name:'register',
            })
        },
        nowRegisteInfoDone(){
            if(this.registerInfo){
                const formData = new FormData();
                formData.append('account',this.registerInfo.account);
                formData.append('phone',this.registerInfo.phone);
                request.post('/api/cards/registeDone',formData).then(res => {
                    // if(res.data = 0){
                    //     this.backToRegister();
                    // }
                },err => console.log(err));
            }
        },
        codeInput(){
            let code = this.$refs['verifyCode'].value;
            code = code.replace(/[^\d]/g,'');
            this.$refs['verifyCode'].value = code;
        },
        submitFinal(){
            this.alertMark = -1;
            if(this.verifyCode.length == 6){
                const formData = new FormData();
                const formData2 = new FormData();
                formData.append('account',this.registerInfo.account);
                formData.append('nick_name',this.registerInfo.nick_name);
                formData.append('phone',this.registerInfo.phone);
                formData.append('password',this.registerInfo.password);
                formData.append('verifyCode',this.verifyCode);
                request.post('/api/cards/verifyfin',formData).then(res => {
                    if(res.data == 1){
                        timer2 = setInterval(() => {
                            // 成功
                            this.alertMark = 1;
                            formData2.append('phone',this.registerInfo.phone);
                            request.post('/api/cards/clearcode',formData2).then(res => {},err => console.log(err));
                            this.nowRegisteInfoDone();
                            if(this.countDown === 0){
                                clearInterval(timer2);
                                this.$router.replace({
                                    name:'login',
                                })
                            }else{
                                this.countDown -= 1;
                            }
                        },1000);
                    }else if(res.data == 555){
                        //验证码错误
                        this.alertMark = 5;
                    }else{
                        console.log("未知错误");
                    }
                },err => console.log(err));
            }else{
                //验证码不对
                this.alertMark = 2;
            }
        },
        cancle(){
            this.alertMark = 0;
        },
        reCreateValidCodeGo(){
            timerCodeResend = setInterval(() => {
                if(this.reSendValidCode === 0){
                    clearInterval(timerCodeResend);
                }else{
                    this.reSendValidCode -= 1;
                }
            },1000);
        },
        reCreateValidCode(){
            const formData = new FormData();
            formData.append('phone',this.registerInfo.phone);
            request.post('/api/cards/resend',formData).then(res => {
                this.alertMark = 7;
                this.reSendValidCode = 60;
                this.quitPage();
                this.reCreateValidCodeGo();
            },err => console.log(err));
        },
        quitPage(){
            clearTimeout(timer)
            timer = setTimeout(() => {
                this.nowRegisteInfoDone();
                this.backToRegister();
            },60*5*1000);
        }
    },
    
    mounted(){
        if(this.registerInfo == undefined){
            this.backToRegister();
            // 刷新数据，registerInfo为undefined，自然传给后端没有那个key
            // this.nowRegisteInfoDone();
        }
        this.reCreateValidCodeGo();
        this.quitPage();
    },
    beforeDestroy(){
        // 没用
        // this.nowRegisteInfoDone();
        clearTimeout(timer);
        clearInterval(timer2);
        clearInterval(timerCodeResend);
    }
}
</script>

<style scoped>
.title{
    height: 100px;
    width: 550px;
    padding-top: 40px;
    margin: 40px auto;
}
.title img{
    display: block;
    margin: 0 auto;
    object-fit: cover;
}
.content{
    height: 400px;
    width: 550px;
    margin: 0 auto;
    background-color: rgba(200, 207, 219, 0.8);
    border-radius: 10px;
    /* BFC作用 */
    overflow: hidden;
}
.content > ul{
    width: 360px;
    margin: 40px auto;
    border: 1px solid #999;
    border-bottom: none;
    border-radius: 5px;
    margin-bottom: 10px;
}
.content > ul > li{
    display: flex;
    justify-content: space-between;
    height: 40px;
    border-bottom: 1px solid #999;
    line-height: 38px;

}
.content > ul > li input{
    height: 100%;
    outline: 0px;
    border: none;
    background-color: transparent;
    width: 200px;
    font-size: 20px;
    color: #555;
}
.input-title{
    width: 150px;
    border-right: 1px solid #999;
    color: #5e5e5e;
}
.input-title i{
    display: inline-block;
    width: 40px;
    text-align: center;
}
.next{
    width: 360px;
    margin: 20px auto;
    text-align: center;
    height: 40px;
    line-height: 40px;
    cursor: pointer;
    background-color: #315c8d;
    border-radius: 5px;
}
.next-button > span{
    color: #fff;
    margin-left: 10px;
    letter-spacing: 10px;
}
.next:hover{
    opacity: 0.9;
}
.next:active{
    opacity: 0.7;
}
.back:hover{
    cursor:pointer;
    text-decoration: underline;
}
.back:active{
    color: #555;
}
.message,
.code-input{
    width: 360px;
    margin: 30px auto;
    font-size: 14px;
}
.code-input > input{
    height: 40px;
    outline: 0px;
    font-size: 24px;
    padding-left: 10px;
    width: 120px;
}
.code-input > span{
    margin-left: 10px;
    font-size: 12px;
    user-select: none;
}
.code-input > .cannot{
    color: #888;
}
.code-input > .can{
    cursor: pointer;
}
.code-input > .can:hover{
    text-decoration: underline;
}
.code-input > .can:active{
    color: #555;
}

.alter-background{
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, .5);
    top: 0;
    left: 0;
}
.alter-content{
    position: absolute;
    top: 200px;
    left: 50%;
    transform: translateX(-50%);
    width: 500px;
    height: 230px;
    border-radius: 5px;
    background-color: white;
}
.alert-top{
    width: 100%;
    height: 30px;
    background-color: #999;
    border-radius: 5px 5px 0 0;
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
}
.alert-top span{
    display: inline-block;
    line-height: 30px;
    font-size: 14px;
    color: #fff;
}
.alert-top span:nth-child(2){
    cursor: pointer;
    user-select: none;
}
.alert-top span:nth-child(2):hover{
    color: #eee;
}
.alert-top span:nth-child(2):active{
    color: #ccc;
}
.alter-words{
    display: flex;
}
.alter-words h3{
    margin: 0 20px;
    margin-top: 25px;
}
.alter-words .alter-img{
    width: 100px;
    height: 100px;
    /* border: 1px solid #999; */
    margin-top: 20px;
    margin-left: 30px;
}
.alter-img img{
    width: 100px;
    height: 100px;
}
.alter-content ul{
    margin-top: 25px;
    display: flex;
    justify-content: right;
    gap: 50px;
    margin-right: 50px;
}
.alter-content ul li {
    cursor: pointer;
    display: inline-block;
    border: 2px solid #999;
    border-radius: 5px;
    padding: 5px 15px;
    
}
.alter-content ul li:hover{
    opacity: 0.8;
}
</style>