<template>
    <li ref="content" class="card-item">
        <div class="card-item-content">
            <div class="card-item-content-left">
                <div class="img-frame">
                    <img id="bankLogo" :src="card.bank.bankImg" alt="">
                </div>
            </div>
            <div class="card-item-content-middle">
                <p>{{cardNameShow}}</p>
                <span @click="showCardDetail">查看详情</span>
            </div>
            <div class="card-item-content-right">
                <p>****&nbsp;{{cardKeyLite}}</p>
                <span v-show="!hasNote" @click="showNotes">备注银行卡&nbsp;<i class="fas fa-tag"></i></span>
                <span v-show="hasNote" @click="showNotes">{{card.cardNote}}</span>
            </div>
        </div>
        <div class="take-notes"  v-if="isNote">
            <ul class="take-notes-list">
                <BankCardNote
                    v-for="note in cardNotes" :key="note.cardNoteId"
                    :note = "note"
                />
            </ul>
            <div class="take-notes-action">
                <input type="text" :value="noteOn" maxlength="6" placeholder="最多输入6个字" ref="inputNote">
                <span @click="saveNote">确认</span>
                <span @click="closeNotes" style="background-color:#318d38">取消</span>
            </div>
        </div>
    </li>
</template>

<script>
import bankColor from '../utils/bankcolor';
import BankCardNote from '../components/BankCardNote.vue'
import request from '../utils/request';
const bkc = bankColor.bankSubjectColor;
export default {
    components: { BankCardNote },
    name:'BankCard',
    props:['card','cardNotes'],
    data(){
        return {
            hasNote:0,
            thisBankColor:'',
            nowNote:0,
            isNote:0,
            noteOn:'',
            cardNameShow:'',
        }
    },
    created(){
        // this.nowNote = 0;
        // console.log(this.card.cardName);
        // console.log(this.card.cardName.length);
        // console.log(this.card.cardName.slice(-3));
        if(this.card.cardName.length > 14){
            this.cardNameShow = this.card.cardName.slice(0,6)+ '···' +this.card.cardName.slice(-3);
        }else{
            this.cardNameShow = this.card.cardName;
        }
    },
    computed:{
        cardKeyLite(){
            return this.card.cardKey.slice(-4);
        },
        getCardNoteNow(){
            return this.$store.state.cardIsNote;
        }
    },
    watch:{
        thisBankColor:{
            handler(newValue){
                if(this.thisBankColor !== ''){
                    this.$refs['content'].style.backgroundColor = newValue + 'cc';
                }
            }
        },
        getCardNoteNow:{
            immediate:true,
            handler(newValue){
                this.nowNote = newValue;
                if(this.nowNote === this.card.cardId){
                    this.isNote = 1;
                }else{
                    this.isNote = 0;
                }
                // console.log(this.isNote);
            }
        }
    },
    methods:{
        /******************************************* */
        showNotes(){
            if(this.isNote == 0){
                this.noteOn = '';
                this.$store.commit('setCardIsNote',this.card.cardId);
                this.$nextTick(function(){
                    this.$refs.inputNote.focus();
                });
            }else{
                this.noteOn = '';
                this.$store.commit('setCardIsNote',0);
            }
        },
        closeNotes(){
            this.$store.commit('setCardIsNote',0);
            this.noteOn = '';
            this.isNote = 0;
        },
        writeOnNote(note){
            this.noteOn = note;
        },
        /******************************************** */
        saveNote(){
            // console.log(this.$refs['inputNote'].value)
            if(this.$refs['inputNote'].value !== ''){//应该可以为空
                // console.log(this.$refs['inputNote'].value);
                this.noteOn = this.$refs['inputNote'].value;
                this.hasNote = 1;
            }else{
                // console.log('不能为空');
                this.noteOn = '';
                this.hasNote = 0;
            }
            const formData = new FormData();
            formData.append('cardId',this.card.cardId);
            formData.append('userId',this.card.userId);
            formData.append('cardNote',this.noteOn);
            request.post('/api/cards/modNote',formData).then(res => {
                if(res.data === 1){
                    // console.log('修改成功');
                    // 修改完成，首先关闭输入框
                    this.closeNotes();
                    // 然后刷新数据
                    this.$bus.$emit('reloadCards');
                }else{
                    console.log('修改失败');
                }
            },err => console.log(err.message));
        },
        showCardDetail(){
            this.$router.push({
                name:'userCardsDetail',
                params:{
                    cardId:this.card.cardId,
                    userId:this.card.userId,
                }
            })
        },
        
    },
    mounted(){
        // console.log(this.card.cardKey.slice(-4));
        this.hasNote = this.card.cardNote ? 1 : 0;
        Object.keys(bkc).forEach(key => {
            if(this.card.bank.bankCode === key){
                this.thisBankColor = bkc[key];
            }
        });
        this.$bus.$on('writeOnNote',this.writeOnNote);
        if(this.thisBankColor === ''){
            this.$refs['content'].style.backgroundColor = '#f19d9d'
        };
        this.$store.commit('changePageS',this.nowPageS);
    },
    beforeDestroy(){
        this.$bus.$off('writeOnNote');
    }
}
</script>

<style scoped>
.card-item{
    margin: 5px auto;
    border: 2px solid #999;
    border-radius: 8px 8px 0 0;
    width: 600px;
    /* height: 120px; */
}
.card-item-content{
    height: 100px;
    width: 560px;
    margin: 10px auto;
    display: flex;
    
}
.card-item-content-left,
.card-item-content-middle,
.card-item-content-right{
    height: 90px;
    position: relative;
    top:50%;
    transform: translateY(-50%);
}
.card-item-content-left{
    width: 100px;
}
.img-frame{
    width: 80px;
    height: 80px;
    background-color: rgb(255, 255, 255);
    border-radius: 50%;
    overflow: hidden;
}
.img-frame img{
    display: block;
    position: relative;
    top:50%;
    transform: translateY(-50%);
    margin: 0 auto;
    width: 90%;
    height: 90%;
}
.card-item-content-middle{
    width: 320px;
}
.card-item-content-middle p{
    margin-top: 15px;
    height: 30px;
    line-height: 30px;
    font-size: 20px;
    font-weight: bold;
}
.card-item-content-middle span{
    font-size: 14px;
    display: inline-block;
    margin-top: 5px;
    cursor: pointer;
}
.card-item-content-middle span:hover{
    text-decoration: underline;
}
.card-item-content-right{
    position: relative;
    width: 140px;
}
.card-item-content-right p{
    margin-top: 20px;
    font-weight: bold;
    font-size: 20px;
}
.card-item-content-right span{
    position: absolute;
    right: 40px;
    height: 20px;
    line-height: 20px;
    padding: 0 5px;
    color: rgb(46, 46, 46);
    background-color: rgba(255, 255, 255, .3);
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
}
.card-item-content-right span:hover{
    color: rgb(0, 0, 0);
}
.take-notes{
    width: 100%;
    height: 80px;
    background-color: aliceblue;
    display: flex;
}
.take-notes-list{
    height: 100%;
    width: calc(100% - 200px);
    background-color: rgba(185, 185, 185, 0.308);
    display: flex;
    flex-flow: row wrap;
}
.take-notes-action{
    height: 100%;
    width: 200px;
    background-color: rgba(185, 185, 185, 0.308);
}
.take-notes-action > input{
    margin-top: 10px;
    height: 25px;
    display: block;
}
.take-notes-action > span{
    display: inline-block;
    height: 20px;
    width: 50px;
    line-height: 16px;
    font-size: 12px;
    text-align: center;
    background-color: #2f8ef5;
    color: #fff;
    border: 2px solid #2f8ff565;
    cursor: pointer;
    margin-top: 10px;
    margin-right: 20px;
}
.take-notes-action > span:hover{
    opacity: 0.8;
}
.take-notes-action > span:active{
    opacity: 0.5;
}
.test{
    background-color: rgb(241, 157, 157);
    color: #f19d9d;
}
</style>