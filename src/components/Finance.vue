<template>
    <li class="single-fond">
        <ul class="single-fond-list">
            <li class="holdName">
                <span ref="fName"> 
                    {{fund.finance.financeName}}
                </span>
            </li>
            <li class="holdMoney">{{allProfit}}</li>
            <li ref="holdP" class="holdProfit" v-if="fund.financeState.length > 0">
                {{fund.financeState[0].thenState}}
                <!-- {{holdProfit}} -->
                <br>
                {{returnRate}}
            </li>
            <li style="color:red" class="holdProfit" v-if="fund.financeState.length === 0">
                0
                <br>
                {{returnRate}}
            </li>
            <li class="holdAction">
                <span @click="toFinanceDetail">详情</span><br>
                <span @click="toUpd">更新</span>
            </li>
        </ul>
    </li>
</template>

<script>
export default {
    name:'Finance',
    props:['fund'],
    computed:{
        // 当项总金额，baseMoney+最新一天的updMoney
        allProfit(){
            if(this.fund.financeState){
                if(this.fund.financeState.length > 0){
                    return this.formatNum(parseFloat(this.fund.baseMoney + this.fund.financeState[0].thenState).toFixed(2));
                }else{
                    return this.formatNum(parseFloat(this.fund.baseMoney).toFixed(2));
                }
            }else{
                return this.formatNum(parseFloat(this.fund.baseMoney).toFixed(2));
            }
            
        },
        // 持有收益
        holdProfit(){
            if(this.fund.financeState){
                return this.formatNum(this.fund.financeState[0].thenState.toFixed(2));
            }else{
                return 0.00
            }
            
        },
        // 收益率
        returnRate(){
            if(this.fund.financeState){
                if(this.fund.financeState.length > 0){
                    let thisRate = this.fund.financeState[0].thenState / this.fund.baseMoney
                    thisRate = parseFloat(thisRate * 100).toFixed(2) + '%';
                    return thisRate;
                }else{
                    return '0.00%'
                }
            }else{
                return '0.00%'
            }
            
        },
    },
    methods:{
        // 格式化数字，给数字加逗号
        formatNum(str) {
            let newStr = "";
            let count = 0;
            let isMinus = 0;//是负数码 1是 0不是
            // 当数字是负数
            if(str.indexOf("-") !== -1){
                str = str.slice(1,);
                isMinus = 1;
            }
            
            // 当数字是整数
            if(str.indexOf(".") === -1) {
                for(var i = str.length - 1; i >= 0; i--){
                    if(count % 3 === 0 && count !== 0) {
                        newStr = str.charAt(i) + "," + newStr;
                    }else{
                        newStr = str.charAt(i) + newStr;
                    }
                    count++;
                }
                str = newStr ; //自动补小数点后两位
                if(isMinus === 1){
                    return '-' + str;
                }else{
                    return str;
                }
            }
            // 当数字带有小数
            else{
                for(var i = str.indexOf(".") - 1; i >= 0; i--){
                    if(count % 3 === 0 && count !== 0){
                        newStr = str.charAt(i) + "," + newStr;
                    }else{
                        newStr = str.charAt(i) + newStr; //逐个字符相接起来
                    }
                    count++;
                }
                str = newStr + (str + "00").substr((str + "00").indexOf("."), 3);
                if(isMinus === 1){
                    return '-' + str;
                }else{
                    return str;
                }
            }
        },
        toUpd(){
            this.$router.push({
                name:'myfinanceUpd',
                params:{
                    fund:JSON.parse(JSON.stringify(this.fund)),
                }
            })
        },
        toFinanceDetail(){
            this.$router.push({
                name:'myfinanceDetail',
                params:{
                    fund:JSON.parse(JSON.stringify(this.fund)),
                }
            })
        }
    },
    created(){

    },
    mounted(){
        // console.log(this.fund.finance.financeName.length);
        if(this.fund.finance.financeName.length >= 14 ){
            // console.log(this.fund.finance.financeName.substr(0,12));
            this.$refs['fName'].innerText = this.fund.finance.financeName.substr(0,14) + ' ...'
        };
        if(this.fund.financeState.length > 0){
            if(this.fund.financeState[0].thenState > 0){
                this.$refs['holdP'].style.color = 'red'
            }else{
                this.$refs['holdP'].style.color = 'green'
            }
        }
    }
}
</script>

<style scoped>
.single-fond{
    margin-top: 10px;
    height: 50px;
}
.single-fond-list{
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    margin-left: 6px;
}
.holdName{
    width: 240px;
}
.holdName span{
    display: inline-block;
    margin-top: 5px;
    width: 120px;
    height: 40px;
    font-size: 14px;
    text-overflow: ellipsis;
}
.holdMoney{
    line-height: 40px;
}
.holdMoney,
.holdProfit,
.holdAction{
    width: 120px;
}
.holdAction span{
    color: #007aff;
    cursor: pointer;
}
.holdAction span:hover{
    color: #70b5ff;
    text-decoration: underline;
}
.class{
    color: #033505;
}
</style>