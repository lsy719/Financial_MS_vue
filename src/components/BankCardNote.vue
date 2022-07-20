<template>
    <li class="cardnote-item" @click="chooseNote">{{note.cardNote}}</li>
</template>

<script>
export default {
    name:'BankCardNote',
    props:['note'],
    methods:{
        chooseNote(){
            this.$bus.$emit('writeOnNote',this.note.cardNote);
        },
    }
}
</script>

<style scoped>
.cardnote-item{
    font-size: 14px;
    text-align: center;
    margin: 5px 5px;
    border: 1px solid #999;
    height: 25px;
    line-height: 23px;
    width: 75px;
    border-radius: 10px;
    cursor: pointer;
    background-color: #fff;
}
.cardnote-item:hover{
    background-color: #ddd;
}
</style>