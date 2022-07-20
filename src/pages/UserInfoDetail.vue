<template>
    <div class="user-detail">
        <div v-if="isShowDom" class="user-img">
            <img :src="userInfo.img_url" ref="userImg">
            <a href="javascript:;" class="a-upload" v-show="imgIsChanging === 0">
                点击上传图像
                <input class="selectImg" type="file" accept="image/*" ref="imgSelect" @change="showImg()">
            </a>
            <div class="img-change-button" v-show="imgIsChanging === 1">
                <span @click="imgCancel" style="background-color:#ff3d3d">取消</span>
                <span @click="imgSave">保存</span>
            </div>
        </div>
        <div class="user-details">
            <ul class="user-details-list">
                <li>
                    <ul>
                        <li class="info-title">账号</li>
                        <li class="info-content">{{userInfo.account}}</li>
                        <li class="info-action">
                            <!-- <span @click="changeAccount">更改</span> -->
                        </li>
                    </ul>
                </li>
                <li>
                    <ul>
                        <li class="info-title">用户名</li>
                        <li class="info-content">{{userInfo.nick_name}}</li>
                        <li class="info-action"><span @click="changeNickName">更改</span></li>
                    </ul>
                </li>
                <li>
                    <ul>
                        <li class="info-title">手机</li>
                        <li class="info-content">{{userInfo.phone}}</li>
                        <li class="info-action"><span @click="changePhone">更改</span></li>
                    </ul>
                </li>
                <li>
                    <ul>
                        <li class="info-title">登陆密码</li>
                        <li class="info-content">登陆系统时需要输入的密码</li>
                        <li class="info-action"><span @click="changePassword">重置</span></li>
                    </ul>
                </li>
                <li>
                    <ul>
                        <li class="info-title">银行卡</li>
                        <li class="info-content">已绑定<span style="text-decoration: underline;color:#007aff">{{cardsNum}}</span>张银行卡</li>
                        <li class="info-action"><span @click="showMyCards">管理</span></li>
                    </ul>
                </li>
            </ul>
        </div>
        <!-- 修改账号弹窗 -->
        <div :style="dialogHiddenAC" class="infoChange" @click.self="cancleAC">
            <div class="infoChange-input infoChange-input-AC">
                <h3>修改账号</h3>
                <label :for="`refs['ac']`">输入新账号:</label>
                <input ref="ac" name="account" v-model="accountChange" autocomplete="off">
                <span ref="acCheck" style="display:none">未知问题</span>
                <template v-if="ACisSubmit == 0">
                    <ul>
                        <li @click="saveAC">确定</li>
                        <li style="background-color: #f35d2f;" @click="cancleAC">取消</li>
                    </ul>
                </template>
                <template v-if="ACisSubmit == 1">
                    <ul>
                        <li>正在提交...</li>
                    </ul>
                </template>
            </div>
        </div>
        <!-- 修改用户名弹窗 -->
        <div :style="dialogHiddenNN" class="infoChange" @click.self="cancleNN">
            <div class="infoChange-input infoChange-input-NN">
                <h3>修改用户名</h3>
                <label :for="`refs['nn']`">输入新用户名:</label>
                <input ref="nn" name="nickName" v-model="nickNameChange" autocomplete="off">
                <span ref="nnCheck" style="display:none">未知问题</span>
                <template v-if="NNisSubmit == 0">
                    <ul>
                        <li @click="saveNN">确定</li>
                        <li style="background-color: #f35d2f;" @click="cancleNN">取消</li>
                    </ul>
                </template>
                <template v-if="NNisSubmit == 1">
                    <ul>
                        <li>正在提交...</li>
                    </ul>
                </template>
            </div>
        </div>
        <!-- 修改手机号弹窗 -->
        <div :style="dialogHiddenP" class="infoChange">
            <div class="infoChange-input infoChange-input-PN">
                <h3>修改手机号</h3>
                <template v-if="checkMark !== 1">
                    <template v-if="isSubmit !== 2">
                        <label :for="`refs['pn']`">输入新手机号:</label>
                        <input ref="pn" name="phone" v-model="phoneChange" autocomplete="off" maxlength="11">
                        <span ref="pnCheck" v-if="isSubmit !== 2" style="display:none">未知问题</span>
                    </template>
                    <template v-if="isSubmit == 2">
                        <label>输入验证码:</label>
                        <input type="text" maxlength="6" v-model="validCode" autocomplete="off" ref="phoneCode" @keyup="validCodeChange">
                        <p style="color:gray;display:inline;margin-left:10px" v-if="countDown > 0 && isSubmit == 2">重新发送({{countDown}})</p>
                        <p style="color:#007aff;cursor: pointer;display:inline;margin-left:10px" class="reFasong" v-if="countDown == 0 && isSubmit == 2" @click="reSendCode">重新发送</p>
                    </template>
                    <h4 v-if="checkMark == 4" style="text-align:center;color:red">验证码错误！</h4>
                    <h4 v-if="checkMark == 3" style="text-align:center;">验证码已发送,5分钟内有效</h4>
                    <h4 v-if="checkMark == 1" style="text-align:center;">手机号修改成功！</h4>
                    <button v-if="isSubmit == 2" style="position:absolute;" @click="showValidCode">查看验证码</button>
                    <ul>
                        <li v-if="isSubmit == 1">正在提交</li>
                        <li v-if="isSubmit == 0" @click="saveP">下一步</li>
                        <li v-if="isSubmit == 2" @click="validCodeCheck">确认</li>
                        <li v-if="isSubmit == 0 || isSubmit == 2" style="background-color: #f35d2f;" @click="cancleP">取消</li>
                    </ul>
                </template>
                <template v-if="checkMark == 1">
                    <h4 v-if="checkMark == 1" style="text-align:center;">手机号修改成功！</h4>
                    <ul>
                        <li @click="cancleP">确认</li>
                    </ul>
                </template>
            </div>
        </div>
        <!-- 修改密码弹窗 -->
        <div :style="dialogHiddenPW" class="infoChange" @click.self="canclePW">
            <div class="infoChange-input infoChange-input-PW" style="height: 320px;width:560px">
                <h3>修改密码</h3>
                <!-- 输入旧密码 -->
                <label :for="`refs['pwOld']`">输入旧密码:</label>
                <input type="password" ref="pwOld" name="passwordOld" v-model="passwordOld" autocomplete="off">
                <span ref="pwCheckOld" style="display:none">未知问题</span>
                <!-- 输入新密码 -->
                <label :for="`refs['pwNew']`">输入新密码:</label>
                <input type="password" ref="pwNew" name="passwordOld" v-model="passwordNew" autocomplete="off" @keyup="newPwCheck">
                <span ref="pwCheckNew" style="display:none">未知问题</span>
                <!-- 确认新密码 -->
                <label :for="`refs['pwCfm']`">确认新密码:</label>
                <input type="password" ref="pwCfm" name="passwordCfm" v-model="passwordCfm" autocomplete="off" @keyup="cfmPwCheck">
                <span ref="pwCheckCfm" style="display:none">未知问题</span>
                <ul>
                    <li ref="submitPw" @click="savePW" style="display:none">确定</li>
                    <li style="background-color: #f35d2f;" @click="canclePW">取消</li>
                </ul>
                <span ref="changePwSuccess" style="display:none">密码重置成功，请重新登录</span>
            </div>
        </div>
    </div>
</template>

<script>
let timer;
import request from '../utils/request';
export default {
    name:'UserInfoDetail',
    props:['nowPageS'],//31
    data(){
        return {
            userInfo:{},
            cardsNum:0,
            imgIsChanging:0,
            imgButtons:{
                hide:true,
            },
            dialogHiddenAC:{
                display:'none',
            },
            dialogHiddenNN:{
                display:'none',
            },
            dialogHiddenP:{
                display:'none',
            },
            dialogHiddenPW:{
                display:'none',
            },
            accountChange:'',
            nickNameChange:'',
            phoneChange:'',
            phoneChangeCfm:'',
            passwordOld:'',
            passwordNew:'',
            passwordCfm:'',
            isShowDom:true,

            //正在提交
            isSubmit:0,
            validCode:'',
            countDown:60,
            checkMark:0,//4.验证码错误

            ACisSubmit:0,
            NNisSubmit:0,
        }
    },
    methods:{
        showImg(){
            this.imgIsChanging = 1;
            // console.log(this.$refs.userimg,this.$refs.imgSelect);//就是两个dom
            const img = this.$refs.userImg;
            const file = this.$refs.imgSelect;
            const f = new FileReader();

            // 控制图片大小、格式
            // 将onload挂在到f上作为监听函数
            f.onload = (event) => {
                // console.log(event.target.result);
                img.src = event.target.result;
            }
            // 此步同时触发onload
            f.readAsDataURL(file.files[0]);
            // console.log(file.files[0]);
            // 开始修改头像后，出现取消和保存按钮，标记
        },
        imgCancel(){
            // 强制刷新重置DOM
            this.isShowDom = false;
            this.$nextTick(() => {
                this.isShowDom = true;
            })
            this.imgIsChanging = 0;
            this.$refs.userImg.src = this.userInfo.img_url;
        },
        imgSave(){
            const formData = new FormData();
            formData.append('id',this.userInfo.id);
            formData.append('file',this.$refs.imgSelect.files[0]);
            // console.log(this.$refs.imgSelect.files[0]);
            request.post("/api/user/change_img",formData).then(res => {
                if(res.data.code === '0'){
                    this.imgIsChanging = 0;
                    this.$store.dispatch('reloadUserInfo',this.userInfo.id);
                    // alert('更新成功');
                }else{
                    alert('更新失败',res);
                }
            },err => {
                console.log('更新失败',err.message);
            })

        },
        // 更改账号
        changeAccount(){
            this.$refs['acCheck'].style.display = 'none';
            this.dialogHiddenAC = '';
            this.$nextTick(() => {
                this.$refs['ac'].focus();
            })
        },
        saveAC(){
            if(this.accountChange == this.userInfo.account){
                return;
            }
            this.ACisSubmit = 1;
            if(this.accountChange != ''){
                this.$refs['acCheck'].style.display = 'none';
                if(this.accountChange == this.userInfo.account){
                    // console.log(1234)
                }else{
                    const resultac = this.$store.dispatch('changeUserAccount',this.accountChange);
                    resultac.then(res1=>{
                        // 为什么是先输出这个，再执行vuex里面的？
                        // console.log(res);
                        if(res1 === 4){
                            this.$refs['acCheck'].style.display = 'inline';//什么时候恢复？
                            this.$refs['acCheck'].innerText = '必须是4-16位数字和字母';
                            this.$refs['acCheck'].style.color = 'red';
                            this.ACisSubmit = 0;
                        }
                        if(res1 === 1){
                            const formData = new FormData();
                            formData.append('id',this.userInfo.id);
                            formData.append('account',this.accountChange);
                            request.post('/api/user/updacc',formData).then(res => {
                                // console.log(res.data);
                                if(res.data === 555){
                                    // 用户名已存在
                                    this.$refs['acCheck'].style.display = 'inline';
                                    this.$refs['acCheck'].style.color = 'red';
                                    this.$refs['acCheck'].innerText = '账号已存在';
                                    this.ACisSubmit = 0;
                                }else if(res.data === 1){
                                    // console.log('更新成功',res.data);
                                    this.$store.dispatch('reloadUserInfo',this.userInfo.id);
                                    this.$refs['acCheck'].style.color = 'green';
                                    this.$refs['acCheck'].innerText = '修改成功，点击空白处退出';
                                    this.$refs['acCheck'].style.display = 'inline';
                                    this.ACisSubmit = 0;
                                }else{
                                    console.log('未知错误');
                                    this.ACisSubmit = 0;
                                }
                            },err => {
                                console.log(err.message);
                                this.ACisSubmit = 0;
                            })
                        }
                    },err1 => {
                        console.log(err1.message);
                        this.ACisSubmit = 0;
                    })
                }
            }else{
                alert('不能为空');
                this.ACisSubmit = 0;
            }
        },
        cancleAC(){
            this.dialogHiddenAC = {display:'none'};
            this.accountChange = this.userInfo.account;
            this.$refs['acCheck'].style.display = 'none';
            this.ACisSubmit = 0;
        },
        // 更改用户名
        changeNickName(){
            this.dialogHiddenNN = '';
            this.$refs['nnCheck'].style.display = 'none';
            this.$nextTick(() => {
                this.$refs['nn'].focus();
            })
        },
        saveNN(){
            if(this.nickNameChange == this.userInfo.nick_name){
                return;
            }
            this.NNisSubmit = 1;
            if(this.nickNameChange !== ''){
                this.$refs['nnCheck'].style.display = 'none';
                const resultnn = this.$store.dispatch('changeUserName',this.nickNameChange);
                resultnn.then(res => {
                    // console.log(res);
                    if(res === 1){
                        // console.log('格式正确');
                        const formData = new FormData();
                        formData.append('id',this.userInfo.id);
                        formData.append('newName',this.nickNameChange);
                        request.post('/api/user/updnn',formData).then(res => {
                            if(res.data === 1){
                                this.$refs['nnCheck'].style.color = 'green';
                                this.$refs['nnCheck'].innerText = '修改成功，点击空白处退出';
                                this.$refs['nnCheck'].style.display = 'inline';
                                this.$store.dispatch('reloadUserInfo',this.userInfo.id);
                                this.NNisSubmit = 0;
                            }else{  
                                console.log("未知错误");
                                this.NNisSubmit = 0;
                            }
                        },err => console.log(err.message));
                    }else if(res === 4){
                        console.log('格式不符');
                        this.$refs['nnCheck'].style.display = 'inline';//什么时候恢复？
                        this.$refs['nnCheck'].style.color = 'red';
                        this.$refs['nnCheck'].innerText = '1-18位长度';
                        this.NNisSubmit = 0;
                    }else{
                        console.log('未知错误');
                        this.NNisSubmit = 0;
                    }
                },err => console.log(err.message));
            }else{
                alert('不能为空！');
                this.NNisSubmit = 0;
            }
        },
        cancleNN(){
            this.dialogHiddenNN = {display:'none'};
            this.nickNameChange = '';
            this.$refs['nnCheck'].style.display = 'none';
            this.NNisSubmit = 0;
        },

        // 更改手机
        changePhone(){
            this.dialogHiddenP = '';
            this.$refs['pnCheck'].style.display = 'none';
            this.$nextTick(() => {
                this.$refs['pn'].focus();
            })
        },
        showValidCode(){
            const formData = new FormData();
            formData.append('phone',this.phoneChangeCfm);
            request.post('/api/user/simcodeget',formData).then(res => {
                console.log('验证码'+res.data);
            },err => console.log(err));
        },
        validCodeCheck(){
            if(this.validCode.length < 6){
                this.checkMark = 4;
            }else{// 到了6位
                let code = this.$refs['phoneCode'].value;
                code = code.replace(/[^\d]/g,'');
                if(code.length < 6){
                    this.checkMark = 4;
                }else{
                    const formData = new FormData();
                    formData.append('id',this.userInfo.id);
                    formData.append('code',this.validCode);
                    formData.append('phone',this.phoneChangeCfm);
                    request.post('/api/user/checkcode',formData).then(res => {
                        if(res.data == 4){
                            this.checkMark = 4;
                        }else if(res.data == 1){
                            this.checkMark = 1;
                            this.$store.dispatch('reloadUserInfo',this.userInfo.id);
                        }else{
                            console.log('未知错误');
                        }
                    })
                }
            }
        },
        reSendCode(){
            this.validCode = '';
            const formData = new FormData();
            formData.append('phone',this.changePhone);
            request.post('/api/user/resend',formData).then(res => {
                this.checkMark = 3;
                this.countDown = 60
                timer = setInterval(() => {
                    if(this.countDown == 0){
                        clearInterval(timer);
                    }else{
                        this.countDown -= 1;
                    }
                },1000);
                this.$nextTick(() => {
                    this.$refs['phoneCode'].focus();
                });
            },err => console.log(err));
        },
        validCodeChange(){ //input onkeyup事件
            this.checkMark = 0;
        },
        saveP(){
            if(this.phoneChange !== ''){
                if(this.phoneChange == this.userInfo.phone){

                }else{
                    this.$refs['pnCheck'].style.display = 'none';
                    const resultpn = this.$store.dispatch('changePhone',this.phoneChange);
                    resultpn.then(res => {
                        // console.log(res);
                        if(res === 1){
                            this.isSubmit = 1;
                            this.phoneChangeCfm = this.phoneChange;
                            // console.log('格式正确');
                            const formData = new FormData();
                            formData.append('id',this.userInfo.id);
                            formData.append('phone',this.phoneChange);
                            formData.append('oldPhone',this.userInfo.phone);
                            request.post('/api/user/updp',formData).then(res => {
                                if(res.data === 1){
                                    this.isSubmit = 2;
                                    timer = setInterval(() => {
                                        if(this.countDown == 0){
                                            clearInterval(timer);
                                        }else{
                                            this.countDown -= 1;
                                        }
                                    },1000);
                                    this.$nextTick(() => {
                                        this.$refs['phoneCode'].focus();
                                    });
                                }else if(res.data === -43){
                                    //重复手机号
                                    this.$refs['pnCheck'].style.display = 'inline';//什么时候恢复？
                                    this.$refs['pnCheck'].style.color = 'red';
                                    this.$refs['pnCheck'].innerText = '手机号已被绑定';
                                    this.isSubmit = 0;
                                }else if(res.data === -44){
                                    //3天之内不能注册，redis关了就没了（持久化做一下？？）
                                    this.$refs['pnCheck'].style.display = 'inline';//什么时候恢复？
                                    this.$refs['pnCheck'].style.color = 'red';
                                    this.$refs['pnCheck'].innerText = '三日内不可连续更换手机号';
                                    this.isSubmit = 0;
                                }else{  
                                    console.log("未知错误");
                                    this.isSubmit = 0;
                                }
                            },err => console.log(err.message));
                        }else if(res === 4){
                            // console.log('格式不符');
                            this.$refs['pnCheck'].style.display = 'inline';//什么时候恢复？
                            this.$refs['pnCheck'].style.color = 'red';
                            this.$refs['pnCheck'].innerText = '格式不符';
                        }else{
                            console.log('未知错误');
                        }
                    },err => console.log(err.message));
                }
                
            }else{
                alert('不能为空！');
            }
        },
        cancleP(){
            this.dialogHiddenP = {display:'none'};
            this.phoneChange = '';
            this.phoneChangeCfm = '';
            if(this.$refs['pnCheck']){
                this.$refs['pnCheck'].style.display = 'none';
            }
            this.isSubmit = 0;
            clearInterval(timer);
            this.countDown = 60;
            this.validCode = '';
            this.checkMark = 0;
        },

        // 更改密码
        changePassword(){
            this.passwordOld = '';
            this.passwordNew = '';
            this.passwordCfm = '';
            this.$refs['pwCheckOld'].style.display = 'none';
            this.$refs['pwCheckNew'].style.display = 'none';
            this.$refs['pwCheckCfm'].style.display = 'none';
            this.$refs['submitPw'].style.display = 'none';
            this.$refs['changePwSuccess'].style.display = 'none';
            this.dialogHiddenPW = '';
            this.$nextTick(() => {
                this.$refs['pwOld'].focus();
            })
        },
        newPwCheck(){
            // console.log('@');
            // 如果写了确认密码再回来改这个就给你把确认密码删了
            this.passwordCfm = '';
            this.$refs['submitPw'].style.display = 'none';
            const resultpw = this.$store.dispatch('changePassword',this.passwordNew);
            resultpw.then(res=>{
                if(res === 4){
                    this.$refs['pwCheckNew'].style.color = 'red';
                    this.$refs['pwCheckNew'].innerText = '必须是6-16位大小写字母或数字或.或@';
                    this.$refs['pwCheckNew'].style.display = 'inline';
                    this.$refs['pwCheckCfm'].style.display = 'none';
                    this.$refs['submitPw'].style.display = 'none';
                }else if(res === 1){
                    this.$refs['pwCheckNew'].style.color = 'green';
                    this.$refs['pwCheckNew'].innerHTML = '<i class="fas fa-check"></i>';
                    this.$refs['pwCheckNew'].style.display = 'inline';
                    this.$refs['submitPw'].style.display = 'block';
                }
            })
        },
        cfmPwCheck(){
            const resultpwCfm = this.$store.dispatch('changePassword',this.passwordNew);
            resultpwCfm.then(res => {
                if(res === 1){
                    if(this.passwordNew === this.passwordCfm){
                        this.$refs['pwCheckCfm'].style.color = 'green';
                        this.$refs['pwCheckCfm'].innerHTML = '<i class="fas fa-check"></i>';
                        this.$refs['pwCheckCfm'].style.display = 'inline';
                        this.$refs['submitPw'].style.display = 'block';
                    }else{
                        this.$refs['pwCheckCfm'].style.color = 'red';
                        this.$refs['pwCheckCfm'].innerText = '两次密码不一致';
                        this.$refs['pwCheckCfm'].style.display = 'inline';
                        this.$refs['submitPw'].style.display = 'none';
                    }
                }
            })
        },
        savePW(){
            if(this.passwordOld){
                this.$refs['pwCheckOld'].style.display = 'none';
                const formData = new FormData();
                formData.append('id',this.userInfo.id);
                formData.append('passwordOld',this.passwordOld);
                formData.append('passwordNew',this.passwordNew);
                request.post('/api/user/updpw',formData).then(res => {
                    if(res.data === 1){
                        // 修改成功
                        // console.log("修改成功");
                        this.$store.dispatch('reloadUserInfo',this.userInfo.id);
                        this.$refs['pwCheckOld'].style.display = 'inline';
                        this.$refs['pwCheckOld'].style.color = 'green';
                        this.$refs['pwCheckOld'].innerHTML = '<i class="fas fa-check"></i>';
                        this.$refs['changePwSuccess'].style.display = 'inline';
                        this.$refs['changePwSuccess'].style.color = 'green';
                        setTimeout(()=>{
                            this.$store.dispatch('quitToLogin');
                        },3000)
                    }else if(res.data === 4){
                        // 旧密码错误
                        // console.log('旧密码错误');
                        this.$refs['pwCheckOld'].style.display = 'inline';
                        this.$refs['pwCheckOld'].style.color = 'red';
                        this.$refs['pwCheckOld'].innerText = '密码错误';
                    }else{  
                        console.log("未知错误")
                    }
                },err => console.log(err.message));
            }else{
                this.$refs['pwCheckOld'].style.display = 'inline';
                this.$refs['pwCheckOld'].style.color = 'red';
                this.$refs['pwCheckOld'].innerText = '不能为空';
            }
        },
        canclePW(){
            this.dialogHiddenPW = {display:'none'};
        },

        showMyCards(){
            this.$router.push({
                name:'userCards',
            })
        }
    },
    mounted(){
        this.$store.commit('changePageS',this.nowPageS);
        this.userInfo = this.$store.state.userInfo;
        // this.accountChange = JSON.parse(localStorage.getItem("user")).account; // 当时为什么要这么写？
        this.accountChange = this.userInfo.account;
        // 还是放到Layout组件mounted中，让其它同级组件不用调了
        // this.$store.dispatch('userCardsNum',JSON.parse(localStorage.getItem("user")).id);
        this.cardsNum = this.$store.state.cardsNum;
        
        // 别试了，都是{__ob__: Observer}
        // console.log(this.$store.state.userInfo);
        // console.log(this.userInfo);
        // 0
        // console.log(this.$store.state.cardsNum);
    },
    computed:{
        getUserInfo(){
            // console.log(this.$store.state.userInfo)
            return this.$store.state.userInfo;
        },
        getUserCardsNum(){
            // console.log(this.$store.state.cardsNum);//输出2次
            return this.$store.state.cardsNum;
        }
    },
    watch:{
        getUserInfo(newValue){
            this.userInfo = newValue;
        },
        // 由于reloadUser加了一步获取用户绑定银行卡数量，只是往对象中新加了一个值，需要开启升读监视
        // 跟深度监视没有关系！！！！！！！！！
        // getUserInfo:{
        //     deep:true,
        //     handler(newValue){
        //         this.userInfo = newValue;
        //     }
        // },
        getUserCardsNum(newValue){
            this.cardsNum = newValue;
        },
        imgIsChanging(newValue){
            if(newValue){
                this.imgButtons.hide = false;
            }else{
                this.imgButtons.hide = true;
            }
        },
    },
    beforeDestroy(){
        clearInterval(timer);
    }
}
</script>

<style scoped>
.user-detail{
    height: 100%;
    background-color: #fff;
}
.user-details ul{
    list-style: none;
}
.user-img{
    display: flex;
    padding: 20px;
    justify-content: space-around;
}
.user-img img{
    display: block;
    margin: 0 auto;
    width: 80px;
    height: 80px;
    object-fit: cover;
}
.hide{
    display: none;
}
.user-details-list li ul{
    display: flex;
    justify-content: space-between;
    padding: 0 16px;
}
.info-title{
    width: 120px;
    font-size: 14px;
}
.info-content{
    width: 200px;
    font-size: 12px;
    color: #999;
}
.info-action{
    width: 80px;
    text-align: right;
}
.info-action span{
    font-size: 14px;
    color: #007aff;
    cursor: pointer;
}
.info-action span:hover{
    text-decoration: underline;
}
.info-card-action{
    padding: 0;
}
.info-card-action li{
    font-size: 14px;
    color: #007aff;
    cursor: pointer;
}
.user-details-list li{
    height: 80px;
    line-height: 80px;
    border-bottom: 1px solid #EEE;
}
.infoChange{
    /* display: none; */
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    top:0px;
    left: 0px;
}
.infoChange-input{
    position: absolute;
    top: 200px;
    left: 50%;
    transform: translateX(-50%);
    width: 500px;
    height: 200px;
    border-radius: 5px;
    background-color: white;
}
.infoChange-input > h3{
    text-align: center;
    margin: 10px 0;
}
.infoChange-input > label,
.infoChange-input > input{
    height: 30px;
    margin-left: 50px;
    outline: 0;
}
.infoChange-input > span{
    margin-left: 10px;
}
.infoChange-input > label{
    display: block;
    line-height: 30px;
}
.infoChange-input > input{
    margin-bottom: 10px;
    border-left: 1px solid #000;
    padding-left: 10px;
}
.infoChange-input span{
    color: red;
}
.infoChange-input-AC ul li,
.infoChange-input-NN ul li,
.infoChange-input-PN ul li,
.infoChange-input-PW ul li{
    float: left;
    font-size: 14px;
    cursor: pointer;
    margin: 0 5px;
}
.infoChange-input > ul{
    display: flex;
    justify-content: space-between;
    margin: 20px 100px;
}
.infoChange-input > ul li{
    cursor: pointer;
    display: inline-block;
    color: #fff;
    height: 30px;
    width: 100px;
    text-align: center;
    line-height: 26px;
    background-color: #007aff;
    border-radius: 5px;
    border: 2px solid #007bff1f;
}
.cancle-button{
    background-color: #f35d2f;
}
.infoChange-input > ul li:hover{
    opacity: 0.8;
}
.infoChange-input > ul li:active{
    opacity: 0.5;
}
.a-upload{
    width: 100px;
    height: 30px;
    line-height: 30px;
    position: relative;
    cursor: pointer;
    text-align: center;
    top: 20px;
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

.a-upload:hover {
    color: #444;
    background: #eee;
    border-color: #ccc;
    text-decoration: none
}
.img-change-button > span{
    margin-top: 30px;
    display: inline-block;
    height: 20px;
    width: 50px;
    font-size: 12px;
    line-height: 16px;
    text-align: center;
    background-color: #2f8ef5;
    color: #fff;
    border: 2px solid #2f8ff565;
    margin-left: 10px;
    cursor: pointer;
}
.img-change-button > span:hover{
    opacity: 0.8;
}
.img-change-button > span:active{
    opacity: 0.5;
}
.reFasong:hover{
    text-decoration: underline;
}
</style>