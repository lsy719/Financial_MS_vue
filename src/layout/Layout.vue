<template>
    <div>
        <Header/>
        <Header2/>
        <router-view></router-view>
        <Footer/>
    </div>
</template>

<script>
import Footer from '../components/Footer.vue'
import Header from '../components/Header.vue'
import Header2 from '../components/Header2.vue'
import request from '../utils/request'
export default {
    name:'Layout',
    components:{Header,Header2, Footer},
    beforeCreate(){
        if(localStorage.getItem('user')){
            const verifyInfo = localStorage.getItem('user');
            const id = verifyInfo.split("-")[0];
            const code = verifyInfo.split("-")[1];
            const formData = new FormData();
            formData.append("id",id);
            formData.append("code",code);
            request.post('/api/user/code',formData).then(res => {
                if(res.data.code === '0'){
                    // this.$store.commit('setUserInfo',res.data.data)
                    this.$store.dispatch('reloadUserInfo',res.data.data.id);
                    this.$store.dispatch('userCardsNum',res.data.data.id);

                    // const userProof = res.data.data;
                    // request.post('/api/user/proof',userProof).then(res => {
                    //     if(res.data.code === '0'){
                    //         // console.log('验证完成');
                    //         this.$store.commit('setUserInfo',res.data.data)
                    //         this.$store.dispatch('reloadUserInfo',res.data.data.id);
                    //         this.$store.dispatch('userCardsNum',res.data.data.id);
                    //     }else{
                    //         this.$router.push("/login");
                    //         alert('账户不存在');
                    //     }
                    // },err => {
                    //     console.log(err.message);
                    //     this.$router.push("/login");
                    // })
                }else{
                    this.$router.push("/login");
                    localStorage.clear("user");
                }
            },err => {
                console.log(err);
                this.$router.push("/login");
                localStorage.clear("user");
            });
        }else{
            this.$router.push("/login");
            localStorage.clear("user");
        }
    },
}
</script>

<style scoped>

</style>