<template>
    <div class="login">
        <div class="title">
            <img src="/systitle.jpg">
        </div>
        <div class="content">
            <div class="left-img">
                <img src="/loginleft.jpg">
            </div>
            <div class="right-input">
                <div class="base-info">
                    <div class="user-account">
                        <i class="fas fa-user-alt"></i>
                        <span>|</span>
                        <input type="text" maxlength="16" placeholder="账号" name="account" v-model="form.account" required ref="account">
                    </div>
                </div>
                <div class="base-info">
                    <div class="user-password">
                        <i class="fas fa-lock"></i>
                        <span>|</span>
                        <input type="password" maxlength="16" placeholder="密码" name="password" v-model="form.password" required>
                    </div>
                </div>
                <div class="base-info valid">
                    <div class="user-valid">
                        <input type="text" maxlength="4" placeholder="验证码" name="password" v-model="validCodeInput" required autocomplete="off">
                    </div>
                    <ValidCode @input="createValidCode"/>
                </div>
                <div class="base-info">
                    <div class="login-button" @click="login">
                        <span>登录</span>
                    </div>
                </div>
                <div class="base-info" style="text-align:center;margin-top:10px;font-size:14px;">
                    <span class="register" @click="register">前往注册</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import request from '../utils/request';
import ValidCode from '../components/ValidCode.vue'
export default {
    name:'Login',
    components:{ValidCode},
    data() {
        return {
            form:{},
            imgSrc:require('../assets/images/loginbgp.png'),
            validCode:'',
            validCodeInput:'',
        }
    },
    methods: {
        createValidCode(data) {
            this.validCode = data;
        },
        login(){
            if(this.form.account && this.form.password){
                if(this.validCodeInput.toUpperCase() === this.validCode.toUpperCase()){
                    request.post("/api/user/login",this.form).then(res => {
                        if(res.data.code === '0'){
                            /*
                            let userProof = {};
                            userProof.id = res.data.data.id;
                            userProof.account = res.data.data.account;
                            userProof.password = res.data.data.password;
                            // console.log(userProof);
                            localStorage.setItem("user",JSON.stringify(userProof));
                            this.$router.push("/");//finance
                            */
                            // console.log(res.data.data);
                            localStorage.setItem("user",res.data.data);
                            this.$router.push("/");//finance
                        }else{
                            // console.log('登陆失败',res)
                            alert('用户名或密码错误！');
                        }
                    },err => {
                        console.log(err.message);
                    });
                }else{
                    alert("验证码错误");
                }
            }else{
                alert('输入用户名和密码');
            }
        },
        register(){
            this.$router.push({
                name:'register',
            })
        },
        clearUserInfo(){
            localStorage.removeItem('user');
            this.$store.commit('cleraUserInfo');
            this.$store.commit('clearAllMoneyAndAllProfit');
        }
    },
    mounted() {
        // console.log(this.publicPath);
        // console.log(JSON.stringify(this.$store.state.userInfo));//如果是{}，就是空对象
        this.clearUserInfo();
        this.$nextTick(() => {
            this.$refs['account'].focus();
        })
    },
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
    display: flex;
    justify-content: center;
}
.left-img{
    height: 450px;
    width: 550px;
    padding-top: 30px;
}
.left-img img{
    display: block;
    margin: 0 auto;
    object-fit: cover;
    width: 500px;
}
.right-input{
    height: 450px;
    width: 350px;
    background-color: rgba(200, 207, 219, 0.8);
    border-radius: 10px;
    padding-top: 80px;
}
.base-info{
    margin: 0 auto;
    width: 282px;
}
.user-account,
.user-password,
.user-valid,
.login-button{
    height: 40px;
    width: 280px;
    border: 1px solid #999;
    border-radius: 5px;
    line-height: 38px;
    padding: 0 auto;
}
.user-password{
    margin-top: 30px;
}
.user-account > i,
.user-password > i{
    margin-left: 10px;
    height: 100%;
    width: 30px;
    font-size: 24px;
    text-align: center;
    display: inline-block;
    color: #315c8d;
}
.user-account > span,
.user-password > span{
    display: inline-block;
    font-size: 24px;
    font-weight: lighter;
    height: 100%;
    width: 20px;
    text-align: center;
    color: #315c8d;
}
.user-account > input,
.user-password > input,
.user-valid > input{
    height: 100%;
    outline: 0px;
    border: none;
    background-color: transparent;
    width: 200px;
    font-size: 20px;
    color: #555;
}
.user-valid{
    width: 160px;
    padding-left: 15px;
    display: flex;
}
.user-valid > input{
    display: inline-block;
    width: 100px;
}
.valid{
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
}
.login-button{
    margin-top: 30px;
    cursor: pointer;
    background-color: #315c8d;
    text-align: center;
}
.login-button > span{
    text-align: center;
    color: #fff;
    margin-left: 10px;
    letter-spacing: 10px;
}
.login-button:hover{
    background-color: #315c8dcb;
}
.login-button:active{
    background-color: #315c8d91;
}
.register:hover{
    cursor:pointer;
    text-decoration: underline;
}
.register:active{
    color: #555;
}
</style>