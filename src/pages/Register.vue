<template>
    <div class="register">
        <div class="title">
            <img src="/systitle.jpg">
        </div>
        <div class="content">
            <ul>
                <li>
                    <div class="input-title">
                        <i class="fas fa-user-alt"></i>
                        <span>账号</span>
                    </div>
                    <div>
                        <input type="text" ref="account" maxlength="16" @keydown="accountCheck" @keyup="accountCheck" autocomplete="off">
                    </div>
                </li>
                <li>
                    <div class="input-title">
                        <i class="fas fa-address-card"></i>
                        <span>用户名</span>
                    </div>
                    <div>
                        <input type="text" ref="nickName" maxlength="18" @keydown="nickNameCheck" @keyup="nickNameCheck" autocomplete="off">
                    </div>
                </li>
                <li>
                    <div class="input-title">
                        <i class="fas fa-mobile"></i>
                        <span>手机号</span>
                    </div>
                    <div>
                        <input type="text" ref="phone" maxlength="11" @keydown="phoneCheck" @keyup="phoneComplete" autocomplete="off">
                    </div>
                </li>
            </ul>
            <ul v-if="basicInfoDone">
                <li>
                    <div class="input-title">
                        <i class="fas fa-lock"></i>
                        <span>输入密码</span>
                    </div>
                    <div>
                        <input type="password" ref="passwordNew" maxlength="16" @keydown="passwordNewCheck" @keyup="passwordNewCheck" autocomplete="off">
                    </div>
                </li>
                <li>
                    <div class="input-title">
                        <i class="fas fa-lock"></i>
                        <span>确认密码</span>
                    </div>
                    <div>
                        <input type="password" ref="passwordCfm" maxlength="16" @keydown="passwordCfmCheck" @keyup="passwordCfmCheck" autocomplete="off">
                    </div>
                </li>
            </ul>
            <div class="next" v-show="submitPermit === 1">
                <div class="next-button">
                    <span @click="registerSubmit">下一步</span>
                </div>
            </div>
            <div style="text-align:center;margin-top:10px;font-size:14px;">
                <span class="back" @click="backToLogin">返回</span>
            </div>
        </div>
        <!-- 确定注册及返回信息 -->
        <div v-show="alterWindow === 1" class="alter-background" @click.self="cancle">
            <div class="alter-content">
                <div class="alert-top">
                    <span>Confirm</span>
                    <span style="font-size:26px;" @click="cancle">×</span>
                </div>
                <div class="alter-words">
                    <div class="alter-img">
                        <img src="/img/Warning.png" alt="">
                    </div>
                    <h3 v-if="nameSet === 1">确定注册此账号吗？</h3>
                    <h3 v-if="nameSet === 0" style="color:red">用户名暂未填写，确定注册此账号吗？</h3>
                </div>
                <!-- <h3 v-show="nameSet === 1 && imgIsChanging == 1">确定注册此账号吗？</h3> -->
                <!-- <h3 v-show="nameSet === 0 && imgIsChanging === 1" style="color:red">用户名暂未填写，确定注册此账号吗？</h3> -->
                <!-- <h3 v-show="nameSet === 1 && imgIsChanging === 0" style="color:red">头像暂未设置，确定注册此账号吗？</h3>
                <h3 v-show="nameSet === 0 && imgIsChanging === 0" style="color:red">用户名及头像暂未设置，确定注册此账号吗？</h3> -->
                <ul v-if="isSubmitting == 0">
                    <li @click="confirmAdd">确定</li>
                    <li @click="cancle" style="background-color: #f85e5e; color:#fff; border:none">取消</li>
                </ul>
                <ul  v-if="isSubmitting == 1">
                    <li>正在提交...</li>
                </ul>
            </div>
        </div>
        <div v-show="alterWindow === 2" class="alter-background">
            <div class="alter-content">
                <div class="alert-top">
                    <span>Confirm</span>
                    <span style="font-size:26px;" @click="cancle">×</span>
                </div>
                <div class="alter-words">
                    <div class="alter-img">
                        <img src="/img/Warning.png" alt="">
                    </div>
                    <h3 v-show="HTTPResponse === 4" style="color:red">账号已存在,请重新填写</h3>
                    <h3 v-show="HTTPResponse === 5" style="color:red">手机号已被注册</h3>
                    <h3 v-show="HTTPResponse === 6" style="color:red">当前账号或手机号不可注册</h3>
                    <h3 v-show="HTTPResponse === 999" style="color:red">未知错误</h3>
                    <h3 v-show="HTTPResponse === 1">注册成功，{{countDown}}秒后进入登录界面</h3>
                </div>
                <ul v-show="HTTPResponse === 4 || HTTPResponse === 999 || HTTPResponse === 5 || HTTPResponse === 6">
                    <li @click="cancle">取消</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
// 用来检验账号的正则，4-16位字母数字下划线
const accountPattern = /^[a-zA-Z0-9_]{4,16}$/;
// 密码正则(6-16位字母数字.@)
const passwordPattern = /^[a-zA-Z0-9.@]{6,16}$/
import request from '../utils/request';
export default {
    name:'Register',
    data(){
        return {
            //正在提交
            isSubmitting:0,
            imgIsChanging: 0,
            /**
             * 第一轮填写数据
             */
            account:'',
            nick_name:null,
            phone:'',
            // 设置完成
            basicInfoDone: 0,

            /**
             * 第二轮填写数据，准备提交的密码(由新密码和确认密码步骤完成后得来)
             */
            password:'',
            // 可以提交
            submitPermit:0,

            // 确定提交弹窗标识
            alterWindow:0,

            // 用户名、头像是否设置标识
            nameSet:0,
            // avatarSet:0,//imgIsChanging

            // 请求返回标识
            HTTPResponse:0,

            // 倒计时
            countDown:2,
            timer:null,
            isShowDom: true,
        }
    },
    methods:{
        backToLogin(){
            this.$router.replace({
                name:'login',
            })
        },
        showImg(){
            this.$nextTick(() => {
                this.imgIsChanging = 1;
                const img = this.$refs.userImg;
                const file = this.$refs.imgSelect;
                const f = new FileReader();
                f.onload = (event) => {
                    img.src = event.target.result;
                }
                f.readAsDataURL(file.files[0]);
            })
        },
        imgCancel(){
            // 强制刷新重置DOM
            this.isShowDom = false;
            this.$nextTick(() => {
                this.isShowDom = true;
            })
            this.$refs.userImg.src = '';
            this.$refs.imgSelect.outerHTML = this.$refs.imgSelect.outerHTML;
            this.imgIsChanging = 0;
        },
        accountCheck(e){
            let accountSet = this.$refs['account'].value;
            if(e.keyCode !== 8){
                // 去空格和特殊字符
                accountSet = accountSet.replace(/[^\d\w]/g,'');
                this.$refs['account'].value = accountSet;
            }
            if(accountPattern.test(accountSet)){
                this.account = accountSet;
            }else{
                this.account = '';
            }
        },
        nickNameCheck(e){
            let unameSet = this.$refs['nickName'].value;
            if(e.keyCode !== 8){
                // 去空格
                unameSet = unameSet.replace(/[\s]/g,'');
                this.$refs['nickName'].value = unameSet;
            }
            if(unameSet){
                this.nick_name = unameSet;
                this.nameSet = 1;
            }else{
                this.nick_name = '';
                this.nameSet = 0;
            }
        },
        phoneCheck(e){
            let phoneSet = this.$refs['phone'].value;
            if(e.keyCode !== 8){
                // 不是数字输入不了
                phoneSet = phoneSet.replace(/[^\d]/g,'');
                this.$refs['phone'].value = phoneSet;
            }
        },
        phoneComplete(e){
            let phoneSet = this.$refs['phone'].value;
            if(e.keyCode !== 8){
                // 不是数字输入不了
                phoneSet = phoneSet.replace(/[^\d]/g,'');
                this.$refs['phone'].value = phoneSet;
            }
            if(phoneSet.length === 11){
                this.phone = phoneSet;
            }else{
                this.phone = '';
            }
        },
        passwordNewCheck(e){
            let passwordNewSet = this.$refs['passwordNew'].value;
            if(e.keyCode !== 8){
                // /^[a-zA-Z0-9.@]{6,16}$/
                passwordNewSet = passwordNewSet.replace(/[^\w\.\@]/g,'');
                this.$refs['passwordNew'].value = passwordNewSet;
            }
            // console.log('$$$');
            if(passwordPattern.test(passwordNewSet) && this.$refs['passwordCfm'].value === passwordNewSet){
                this.password = passwordNewSet;
            }else{
                this.password = '';
            }
        },
        passwordCfmCheck(e){
            let passwordCfmSet = this.$refs['passwordCfm'].value;
            if(e.keyCode !== 8){
                passwordCfmSet = passwordCfmSet.replace(/[^\w\.\@]/g,'');
                this.$refs['passwordCfm'].value = passwordCfmSet;
            }
            // console.log('@@@');
            if(passwordPattern.test(this.$refs['passwordNew'].value) && this.$refs['passwordNew'].value === passwordCfmSet){
                this.password = passwordCfmSet;
            }else{
                this.password = '';
            }
        },
        registerSubmit(){
            // console.log('account',this.account);
            // console.log('nick_name',this.nick_name);
            // console.log('phone',this.phone);
            // console.log('password',this.password);
            // console.log('用户名是否设置',this.nameSet);
            // console.log('头像是否设置',this.imgIsChanging);
            // // 选择了图片再取消，这个files仍然可以获取到之前选择的图片，所以还是要根据imgIsChanging来
            // console.log(this.$refs['imgSelect'].files);
            this.alterWindow = 1;
        },
        confirmAdd(){
            this.isSubmitting = 1;
            const formData = new FormData();
            formData.append('account',this.account);
            formData.append('nick_name',this.nick_name);
            formData.append('phone',this.phone);
            formData.append('password',this.password);
            // console.log(formData);
            /*
            if(this.imgIsChanging === 1){
                // console.log('@@@',this.$refs['imgSelect'].files[0]);
                formData.append('file',this.$refs['imgSelect'].files[0]);
            };*/
            request.post('/api/cards/registeradd',formData).then(res => {
                this.alterWindow = 2;
                // console.log(res.data);
                this.HTTPResponse = res.data;
                if(res.data === 1){
                    let registerInfo = {};
                    registerInfo.account = this.account;
                    registerInfo.nick_name = this.nick_name;
                    registerInfo.phone = this.phone;
                    registerInfo.password = this.password;
                    this.$router.replace({
                        name:'registerVerify',
                        params:{
                            registerInfo:registerInfo,
                        }
                    })
                    /*
                    this.timer = setInterval(() => {
                        // console.log(this.countDown);
                        if(this.countDown === 0){
                            this.timer && this.clearTimer();
                            this.$router.push({
                                name:'login',
                            })
                        }else{
                            this.loading();
                        }
                    },1000);
                    */
                }
            },err => console.log(err.message));
        },
        // 启动定时器
        loading(){
            this.countDown -= 1;
        },
        clearTimer(){
            clearInterval(this.timer);
            this.timer = null;
        },
        cancle(){
            this.alterWindow = 0;
            this.isSubmitting = 0;
        },
        clearUserInfo(){
            localStorage.removeItem('user');
            this.$store.commit('cleraUserInfo');
            this.$store.commit('clearAllMoneyAndAllProfit');
        }
    },
    watch:{
        // 只要账号和手机号都满足要求填好了就可以输入密码了
        account:{
            // immediate:true,
            handler(newValue){
                // console.log(newValue);
                // console.log(this.account);
                if(accountPattern.test(newValue) && this.phone.length === 11){
                    this.basicInfoDone = 1;
                }else{
                    this.basicInfoDone = 0;
                    this.submitPermit = 0;
                }
            }
        },
        phone:{
            // immediate:true,
            handler(newValue){
                // console.log(newValue);
                // console.log(this.phone);
                if(newValue.length === 11 && accountPattern.test(this.account)){
                    this.basicInfoDone = 1;
                }else{
                    this.basicInfoDone = 0;
                    this.submitPermit = 0;
                }
            }
        },
        password:{
            handler(newValue){
                if(passwordPattern.test(newValue)){
                    this.submitPermit = 1;
                }else{
                    this.submitPermit = 0;
                }
            }
        }
    },
    mounted(){
        this.clearUserInfo();
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
.test{
    color: #ff3d3d;
}
</style>