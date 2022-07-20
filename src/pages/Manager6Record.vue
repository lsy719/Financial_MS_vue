<template>
    <div>
        管理员操作记录：最高管理员看到全部，普通管理员看到自己的
        时间：
        三大类：用户、银行、基金（最高管理员还能看到自己对管理员的异动）
        零、对于自身：密码修改
        一、对于用户：用户名重置、账号冻结、解封
        二、对于银行：添加（内容）、修改（内容）
        三、对于基金：添加（内容）、修改（内容）
    </div>
</template>

<script>
export default {
    name:'Manager6Record',
    data(){
        return {

        }
    },
    methods:{
        changeNavHL(page){
            this.$bus.$emit('changeNowPage',page);
        },
    },
    mounted(){
        this.changeNavHL(6);
    }
}
</script>

<style>

</style>