# 毕业设计-Financial-MS（Management System）

## 2022/02/21

### vue

安装vue脚手架（已全局安装，控制台可用），创建项目 vue create financial-ms

新建：

```
src/
    layout/Layout.vue:用来存放大体布局
    router/index.js：用来设置路由
    utils/request.js：用来配置插件
    pages/：用来存放路由页面
    components：用来存放功能组件
vue.config.js:
	设置page的入口，关闭语法检查，配置代理服务器等
```

vue2.x版本路由安装什么版本？3版本

package.json dependences 写好 "vue-router": "^3.0.1"

npm install vue-router 

在Layout.vue中写点简单内容，在App.vue中引入，启动测试

设置路由，<br>将默认路径：（/），指向Layout

设置端口为5006，

public下创建css文件夹，创建global.css，用来设置全局样式，在index.html中引入

向后端提交数据的准备，配置代理服务器，配置request.js(安装axios)

### springboot

创建springboot项目

配置好端口号（5005）与数据库连接（在application.properties中），<br>启动测试，浏览器进入此端口，404则成功

在项目文件夹下创建img文件夹，用来以后存放上传进来的图片

### mysql

创建数据库financial_ms，更改好字符集为utf8mb4，排序规则utf8mb4_unicode_ci

创建user表，添加一个测试字段



## 页面编写

Header组件

引入图标字体

Login组件<br>



## 后台编写

创建user实体类，

写好mapper->service->controller流程

## 登陆功能：

前台获取input数据，axios发送给后台，后台返回验证信息和登陆信息

vue项目下public中创建img文件夹，放入默认图片，路径直接写``/img/mr.png``即可

完善下拉框

编写Header2组件

编写userInfo组件，个人信息，可在此修改个人信息、绑定银行卡

实现菜单：我的理财/交易记录/个人信息对于当前打开高亮，由路由props传来当前显示组件的标记，修改header2组件里的标记，header2组件根据这个标记来使其高亮<br>使用vuex

暂时放弃用vuex，用:style赋值实现，这样如果是用下拉框进入这些路由就不行了，还有就是刚登陆，默认是到我的理财界面，也不写。

可以使用beforeUpdate钩子！！！！，

解决：使用computed和watch配合可实现随时侦听vuex中数据变化！！！！！



图片参照springbootdemo来做，数据库存的就是请求地址，比如服务器是localhost:8080，图片路径为/upfile/123.jpg，那么访问localhost:8080/upfile/123.jpg即可获取该图片，<br>那vue前端怎么获取呢？<br>设置了代理服务器，src为图片链接应该就可以了<br>图片链接应该包含服务器地址



## 2022/02/23大坑

header、header1和三个路由组件都相互独立，需要操纵和依靠一个同样的数据，使用vuex没毛病。

问题所在：怎么让header1在页面更新时获取到更新完的数据？（注意这里更具路由只是更新了三个我的组件，header1组件不会更新，在其中调用mounted，或增添一个属性去调用beforeUpdate都没根本解决问题）。

所以真正问题是，要怎么在本组件数据都不更新的情况下侦听vuex中state里的数据？

通过computed和watch配合即可实现。一开始mounted也要绑定数据

```javascript
computed:{
    listenNowPage(){
    	return this.$store.state.nowPage;
    }
},
watch:{
    listenNowPage(newValue){
    	console.log(newValue);
    }
},
mounted(){
	this.userInfo = this.$store.state.userInfo;
},
```

这样不管谁哪个页面引起的state数据变化都能侦听到，（在此组件挂载时）

## 2022/02/24

业务逻辑修改，登陆后，仅将id、账号、密码存在localStorage中的user中，进行路由跳转（登陆为/login），跳转至/，即Layout组件，在Layout组件中，除了验证localStorage中有无user，还要根据其中id、账号、密码，返回给后端再做一次查询，这次把返回的用户完整信息存在自身data中，同时也算一次验证，这次不符合同样编程路由回登陆页面。<br>尝试beforeCreate钩子里做验证，created钩子获取数据。

二次账户信息验证（以后要放在所有组件的beforeCreate中？）

通过全局事件总线emit将mounted中获取的用户信息发布。由于emit传的是一个对象，

当一个组件被定义，data必须声明为返回一个初始数据对象的函数，因为组件可能被用来创建多个实例。如果data仍然是一个纯粹的对象，则所有的实例将共享引用同一个数据对象！通过提供data函数，每次创建一个新实例后，我们能够调用data函数，从而返回初始数据的一个权限副本数据对象。

如果需要，可以通过将vm.$data传入JSON.parse(JSON.stringify(...))得到深拷贝的原始数据对象。



算了，干脆就把用户数据放在vuex里

Layout组件beforeCreate验证成功后直接将用户信息放入vux，其它组件要直接去vuex里找，



退出登陆后刷新页面，由于是在Layout组件beforeCreate里给vuex改数据，第一次登陆进去不起作用（数据不显示），看样子是header组件获取到的是空数据。获取太早？看控制台登陆后马上就有userInfo了，那就也用computed结合watch去获取

问题：如果是登陆后的用户向模仿其它用户怎么办？登陆后，修改localStorage，不刷新页面，跳转，这样看到的也只是自己的信息。

退出登陆记得清除vuex中的userInfo和localStorag



编写userInfo的子路由，基本信息和银行卡页面，路由默认重定向到基本信息，

同样对于这两个子组件也要靠路由来传递一个标记值使得页面菜单高亮nowPageS

## {__ob__: Observer}新理解

其实只要是组件data中的对象数据，直接输出那个对象，都是这样，这就是vue给我们做数据劫持的表现，这些数据是不能够枚举的，只有是非要赋值，或者控制台输出就深拷贝一下，向前面以为的那样每从vuex拿数据都做深拷贝没必要

更新图片功能

object-fit: cover;样式保证图片缩放覆盖不变形

更新数据，需要往后台传id，request.post('/api/user/loaduser',value)，这样后台接收不到参数，需控制台查看payload，确实挺奇怪，可能是springboot有什么要求，那就继续用formData。（要有键值对？）

## 待做：控制图片大小、格式

统一样式：

```html
display: block;
    margin: 0 auto;
    width: 80px;
    height: 80px;
    object-fit: cover;
```



修改账号、用户名、密码

弹窗方法：设置一个div，displayflex，宽高100%，设置一定透明度，这样就把整个页面盖住了；在这个div中再去定义输入框和一些按钮；为这个div绑定click事件，并使用self后缀，这样可以写一些点击空白出的事件，比如点击空白就是取消弹窗等等。

点击修改==>vuexactions==>前端正则验证==>服务端查重==>返回成功结果；1：成功，4：前端问题（格式不对），504：无该用户，505：账号已存在；

vuex中用参数接收dispatch，收到的是一个promise对象。（需要then来用）

发送id给服务端，先查询，（就不用查询是否存在此用户了，肯定存在）除此用户之外是否还存在此账号？，是就返回555，否就进行修改，直接返回1，该接口方法类型就是Int

存在异步问题，所以请求服务端放到vc来算了，还是要reloadUserInfo和更新localStorage

修改密码要求重新登陆，之前header组件那个退出登陆的方法移到vuex里面，在此方便复用。在vuex里使用router要引入，引入时注意路径

注意setTimeout和setInterval区别。

## 至此个人信息修改部分完成，样式之后再补

## 2022/3/2开始银行卡绑定和解绑部分

## 通过卡号获取银行类型和银行卡类型

用户银行卡表、银行名称简写图片表、银行卡备注提示表

https://github.com/navyxie/bankcardinfo

npm install bankcardinfo

```javascript
var BIN = require('bankcardinfo');
//callback 方式调用
BIN.getBankBin('6227003320240034988',function(err,data){
	if(!err){
		//todo 
		{
			bankName:"中国工商银行",
			bankCode:"ICBC",
			cardType:"DC",
			cardTypeName:"储蓄卡"
		}
	}
})
// promise 方式调用, 2.0.0 及以上版本支持
BIN.getBankBin('6227003320240034988')
	.then(function (data) {

	})
	.catch(function (err) {

	})
```

对于浏览器总报warning说我没有catch，可以暂时先禁用掉

右键 Hide message from bluebird.js



预先存点图片

图标直接去iconfont下载

https://www.iconfont.cn/search/index?searchType=icon&q=%E4%B8%AD%E5%9B%BD%E4%BA%A4%E9%80%9A%E9%93%B6%E8%A1%8C&fromCollection=-1

http://localhost:5005/bankimg/ + 图片名

获取用户绑定卡的数量，一样得用watch和computed，获取vuex中得值，还是{__ob__: Observer}问题

就是说，从vuex中获取数据，目前还是只能用watch和computed保证刷新页面也有数据，而且mounted中也必须要用，不然正常跳转页面就不行了，

一个bug，修改账号，第一次点进去输入框还会显示原账号，但点出去再点进来就没了，在cancleAC函数中，把accountChange赋为空了。

UserInfoCard组件编写



## 银行卡号规则

13-19位，前6位为发卡标识，最后一位为校验码，中间为个人码

校验码是用来校验银行卡的正确与否，

| 第一行 | 序号                     | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8    | 9    | 10   | 11   | 12   | 13   | 14   | 15   | 16   | 17   | 18   |
| ------ | ------------------------ | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 第二行 | 银行卡号                 | 6    | 2    | 3    | 0    | 9    | 0    | 1    | 8    | 0    | 4    | 0    | 9    | 0    | 2    | 4    | 8    | 8    | 9    |
| 第三行 | 奇数位乘以2，偶数位不变  | 12   | 2    | 6    | 0    | 18   | 0    | 2    | 8    | 0    | 4    | 0    | 9    | 0    | 2    | 8    | 8    | 16   | 9    |
| 第四行 | 将第三行各数相加         | 104  |      |      |      |      |      |      |      |      |      |      |      |      |      |      |      |      |      |
| 第五行 | 将第四行的数除以10求余数 | 4    |      |      |      |      |      |      |      |      |      |      |      |      |      |      |      |      |      |
| 第六行 | 用10-余数就得到了校验码  | 6    |      |      |      |      |      |      |      |      |      |      |      |      |      |      |      |      |      |
| 第七行 |                          |      |      |      |      |      |      |      |      |      |      |      |      |      |      |      |      |      |      |



个人码的位数依赖于银行卡的整体位数，总位数-7

## MyBatis 中实体类的属性名与表中的字段名不一致

https://blog.csdn.net/meism5/article/details/108837402

创建usercards、bank实体类，并关联起来，创建CardNote实体类。

在UserMapper.xml写map关联usercards和bank，但是并不是靠两者主键关联的，能否这么写？

JS小数加减乘除精度问题，utils中创建一个JS文件，包含对应方法来处理加减乘除（未实现）

暂时用toFixed和parseInt来处理

reduce用法注意

银行颜色选择？编写一个bankcolor.js里面有对应银行的颜色参数，取出来即可



## bug1：

进入我的银行卡页面，这时，点击header2的我的了理财或交易记录，跳转后，点击header中的银行卡，即跳转至我的银行卡页面，但是aside高亮在基本信息。

原因，UserInfo（父组件）没有接收nowPageS，但其中是监视着vuex中的nowPages的，而且UserInfoCard mounted里面改了vuex里的NowPages。

```
https://www.jianshu.com/p/b14435965cc2
vue子组件和父组件加载顺序
父created -> 子created -> 子mounted -> 父mounted
```



就是说在非UserInfo界面从header点击银行卡进入我的银行卡页面，

父created阶段vuex中nowPages为31，UserInfo中nowPageS为31；

子created阶段vuex中nowPages为31，自身（从路由props收到的）nowPageS为32；

子mounted阶段vuex中nowPages被换成32，自身为32

父mounted阶段vuex中nowPages为32，但自身还是为31，此时父组件mounted完成0

分析：在父created阶段和mounted阶段之间（应该），computed已经算出来vuex中的nowPageS为32了，之后监视的从vuex获取的nowPageS一直就是32（没有变化，不执行handler），所以userInfo自身nowPageS一直是31不变，watch中又是监视vuex中的nowPageS，但是是依据自身nowPages来调整高亮的，<br>修改方法：①immediate true，②或者依据newValue来设置高亮<br>②不行，因为就不会执行handler。

## bug2:

由于机会同样的原因，bankCardNote收不到父组件BankCard的cardNotes。

因为BankCard获取cardNotes是在mounted里面进行的，渲染BankCardNote是依据cardNotes的遍历，所以子组件都mounted完了，父才开始mounted，初步更改将获取cardNote放入userInfoCard的created里，暂时不需要watch。

vue渲染时对象里面的对象的属性提示undefined，开发者工具报错，但是页面正常显示

https://www.cnblogs.com/qiu-Ann/p/13667599.html

验证银行卡号码的方法

## mounted经常获取不到data

请求在created中，是异步给data初始化的。要不把请求放在mounted中，要不用watch

输入新money上传后端前也要parseFloat(money.toFixed(2));

## 输入金额格式

newMoney = parseFloat(newMoney).toFixed(2);

格式化数组，让余额总是显示两位小数，在created里面this.card.cardMoney = this.card.cardMoney.toFixed(2);

## replace、slice不改变原字符串！

前端给后端传空字符串，后端接收用 .length() == 0 表示

cardsNum怎么得来的来着？？？

## 关于逻辑运算符

```
||:
 只要“||”前面为false,不管“||”后面是true还是false，都返回“||”后面的值。

 只要“||”前面为true,不管“||”后面是true还是false，都返回“||”前面的值。
 
&&:
 只要“&&”前面是false，无论“&&”后面是true还是false，结果都将返“&&”前面的值;

 只要“&&”前面是true，无论“&&”后面是true还是false，结果都将返“&&”后面的值;
```

input清空已选择的文件

this.$refs.imgSelect.outerHTML = this.$refs.imgSelect.outerHTML;

v-if是渲不渲染，v-show是渲染了显不显示，这里比如我按顺序直到输入完密码，我再回去把用户名或者手机号改的不符合要求，密码框提交按钮消失，然后再该回去符合要求，密码框出来，之前输入的密码也还在，但提交按钮没了（密码是符合要求的）。所以还是改成v-if让它重新去渲染。<br>谁输完密码都可以提交了还回去改东西，就给我重新输入密码



## 带文件的请求，注解必须是@RequestMapping

传到后端的null，【估计】后端也是作为字符串接收，要用"null"，传到后端的空字符串，用length == 0来判断



## 在写一遍，从vuex获取数据注意

```javascript
mounted(){//保证页面刷新数据还在
        this.userInfo = this.$store.state.userInfo;
        this.$store.commit('changePage',this.nowPage);
    },
    
// 保证路由切换数据还在
computed:{
        getUserInfo(){
            // console.log(this.$store.state.userInfo)
            return this.$store.state.userInfo;
        },
    },
    watch:{
        getUserInfo(newValue){
            this.userInfo = newValue;
        },
    },  
```

创建基金表、用户持有表、涨跌记录表

## Vuex给state中的对象新添加属性

https://blog.csdn.net/u010234868/article/details/120657244

在index中用Vue.set去给它添加 Vue.set(state.obj, 'name', name);

## 引入echarts

npm install echarts --save

import * as echarts from 'echarts';

## 关于vue 引入 echarts获取不到DOM节点的问题

需要用nextTick，且该DOM节点必须有宽高

## 创建（初始化）之前需要销毁echarts

否则会警告

charts1和charts2必须要为全局变量！！在export default外let即可

if(charts2 !== null && charts2 !=='' && charts2 !== undefined){

​        charts2.dispose();

}

## bug修改（关于基金更新）

可以预料到，在MyFinanceUpd中修改基金信息后，要想其父组件关联数据也发生变化，

①更新后vuex需要reload两个数组，全部个人基金和待更新<br>②MyFinancing中监视（watch结合computed）vuex中的那两个数据。<br>③MyFinancing中计算属性allMoney和allProfit中的步骤单独封装到methods中的函数里<br>④MyFinancing中计算属性allMoney和allProfit要写全get和set，便于watch时同时对其进行修改。

千万别这么改！！！！！！！！！！！！！！

直接爆炸（死循环了）

①allMoney、allProfit提前定义到data里，<br>②不用computed来计算出这两个了，mounted里面请求返回后直接赋值并也存入vuex<br>③计算方法也写到vuex中，更新基金包括后面买入卖出时都记得更新这两个<br>④那hold组件里面的这两个也可以优化了，不用重新计算了<br>连带着的setUserFondHoldsEach、setuserFondUpdWaitEach、formatNum、formatDate、getAllMoney、getProfit方法都要放进vuex里

到时候每次更新、买入、卖出基金reloadUserFundHold（通过一个方法dispatch）

更新当前组件数据，参照MyFinanceUpd组件 reloadFundInfo方法<br>前提是props的fund要先转存到data里，刷新就滚出去（created控制），这样更新之后其实prop的fund没变，但页面保证有变化，切出去下次进来就好办了。

别在dispatch里的方法中写返回值，只会返回promise

需要设置一个中间量，每次都去改这个中间量

## 400问题

多半参数类型错误，名称错误，后端以实体类作为接口的话，需要传齐所有参数。传date类型直接new Date()，此项目要改也只是改当天的。



## 用户头像设置时显示bug分析

存在问题：

用户详情页:①选择好图片 ==》预览显示，出现确定和取消按钮；==》点击确定按钮，上传 ；点击取消，显示原图。这时选择文件旁边还是之前选择的文件。②当再次选择文件，不会出现预览图。

注册页有问题②，问题①通过this.$refs.imgSelect.outerHTML = this.$refs.imgSelect.outerHTML;解决

尝试：v-if让页面重新去加载dom

```html
<div v-if="isShowDom">
    
</div>
...
<script>
    data(){
        return {
            isShowDom:true
        }
    }
	this.isShowDom = false;
            this.$nextTick(() => {
                this.isShowDom = true;
            })
</script>
```



## select option的value类型

只能是string，如果:value让它为一个对象，那只会是[object Object]



## 余额转入转出

1.转出 （changeMoneyType）16

​	1-1转出到其它 （changeMoneySD）0

​	1-2转出到银行卡（changeMoneySD）1

2.转入（changeMoneyType） 11

​	2-1从其它转入（changeMoneySD）0

​	2-2从银行卡转入（changeMoneySD）1

### 二次确认框显示

【actionMoney               】操作金额：this.$refs['pMoneyW'].value

【actionAfterMoney        】操作后金额：this.pocketMoney ± this.$refs['pMoneyW'].value

【DestSrc                       】去向/来源：cardName、其它

【actionAfterCardMoney】操作后卡内余额：cardMoney ± this.$refs['pMoneyW'].value

【DestSrcKey】去向/来源的银行卡号

操作时间

16-0 转出金额、转出后余额

16-1 转出金额、转出后余额、转出到？、转出后银行卡内余额

11-0 转入金额、转入后余额

11-1 转入金额、转入后余额、从？转入、转入后银行卡内余额



### 两种请求

有银行卡和无银行卡

无银行卡：根据userId更新user表余额

有银行卡：①根据userId更新user表余额 => 返回成功 => ②根据cardId更新银行卡余额

​				①失败，直接退出，②成功，退出；②失败，再次进行①，把余额该回去

成功记录状态：

## 关于基金查询优化

查询基金时，加入条件（baseMoney > 0）,等于0意为着该项已被用户全部卖出，交易记录查找时依然能找到，也不影响之后再次买入

添加基金时最低买入金额也设置为不低于100。

以后添加时，后端要先查一下是不是已经有了

## 关于银行卡优化

### 方案一 ×

银行卡表增添state字段，表示银行卡状态，1为在用，0为已解绑，用户解绑后，cardMoney不用变，就做为解绑时金额；

添加银行卡时后端新增操作，“查询该银行卡是否已经绑定”这里，

```
select COUNT(*) from usercards
where userId = #{userId} and cardKey = #{cardKey}
```

改为

```
select COUNT(*) from usercards
where userId = #{userId} and cardKey = #{cardKey} and state = 1
```

如果不存在，还要进行下一步验证

```
select select COUNT(*) from usercards
where userId = #{userId} and cardKey = #{cardKey} and state = 0
```

如果返回1，则进行更新，将此数据的state改为1，余额改为新添加时的余额

这样还是不行，这代表着，查询解绑记录时，如果解绑后又添加了，那就查不到记录了

### 方案二

创建一个银行卡解绑记录表，记录解绑后的userId、卡号、银行名、解绑时金额、时间。解绑操作在原来的usercards表直接进行删除，原操作都不变

还是用这个方法

数组展开（包括嵌套数组）

arr.join(',').split(','); 

删除的卡再绑定还可能再删除，所以往解绑记录表里添加数据时也要查重，如果重复，就修改金额与日期、还有agoId也要记得改！！

不行不行，不能改，有agoId这个东西在，余额基金要是从当时那个已经删除的卡获取的信息，改了就找不到了，

解绑再添加，就继续往里面加，

## 交易记录

交易记录，就显示主体的操作，只有按主体分类查询时，或者余额和银行卡明细时，才显示主体和客体的关联

```
1-1:添加一张银行卡：
存入：
	用户ID、银行卡名、银行卡号、初始金额、时间、【银行卡-添加】
1-2:解绑一张银行卡
存入：
	用户ID、银行卡名、银行卡号、解绑时金额、时间、【银行卡-解绑】
1-3:银行卡转入
存入：
	用户ID、银行卡名、银行卡号、转入金额、时间、【银行卡-转入】
1-4:银行卡转出
存入：
	用户ID、银行卡名、银行卡号、转出金额、时间、【银行卡-转出】


2-3-0:余额从其它转入：
存入：
	用户ID、转入金额、时间、【余额-转入-其它】
2-3-1:余额从银行卡转入：
存入：
	用户ID、银行卡名、银行卡号、转入金额、时间、【余额-转入-银行卡】
2-4-0:余额从其它转出：
存入：
	用户ID、转出金额、时间、【余额-转出-其它】
2-4-1:余额转出到银行卡：
存入：
	用户ID、银行卡名、银行卡号、转出金额、时间、【余额-转出-银行卡】
	
	
3-1-0:基金添加其它：
存入：
	用户ID、基金名、基金代码、初始金额、时间、【基金-添加-其它】
	
3-1-1:基金添加银行卡：
存入：
	用户ID、基金名、基金代码、银行卡名、银行卡号、初始金额、时间、【基金-添加-银行卡】
3-1-2:基金添加余额：
存入：
	用户ID、基金名、基金代码、初始金额、时间、【基金-添加-余额】

3-2-0:基金全部卖出到其它：
存入：
	用户ID、基金名、基金代码、卖出金额、时间、【基金-全部卖出-其它】
3-2-1:基金全部卖出到银行卡：
存入：
	用户ID、基金名、基金代码、银行卡名、银行卡号、卖出金额、时间、【基金-全部卖出-银行卡】
3-2-2:基金全部卖出到余额：
存入：
	用户ID、基金名、基金代码、卖出金额、时间、【基金-全部卖出-余额】
	
3-3-0:基金买入其它：
存入：
	用户ID、基金名、基金代码、买入金额、时间、【基金-买入-其它】
3-3-1:基金买入银行卡：
存入：
	用户ID、基金名、基金代码、银行卡名、银行卡号、买入金额、时间、【基金-买入-银行卡】
3-3-2:基金买入余额：
存入：
	用户ID、基金名、基金代码、买入金额、时间、【基金-买入-余额】

3-4-0:基金卖出到其它：
存入：
	用户ID、基金名、基金代码、卖出金额、时间、【基金-卖出-其它】
3-4-1:基金卖出到银行卡：
存入：
	用户ID、基金名、基金代码、银行卡名、银行卡号、卖出金额、时间、【基金-卖出-银行卡】	
3-4-2:基金卖出到余额：
存入：
	用户ID、基金名、基金代码、卖出金额、时间、【基金-卖出-余额】

```

关于明细、和按主体分类查询部分

主-谓-宾 模式

主和宾一一对应

```
主、宾：
0.其它
1.银行卡（userCard-id）
2.余额
3.基金（userHold-id）

谓
1.添加（卡、基金）
2.解绑（卡）、全部卖出（基金）
3.转入（卡、余额）、买入（基金）
4.转出（卡、余额）、卖出（基金）

数据模型：（外键可以为空！）
交易明细表 transaction
id 					主键
userId				（外键）

mainMark			主标记（外键）
mainContentId		主对象id （其它、余额没有）

vmark				谓标记（外键）

objMark				宾标记（外键）（银行卡为主时 没有）
objContentId		宾对象id （其它、余额、银行卡为主时 没有）

MoneyResult			结果金额（余额特供）银行卡是银行的事情，到时候基金操作跟余额有关的都能在前端算出来	

date				时间
moneyAmount			金额

transactionMainObj主宾类表
id（上表外键） 主键
name：其它、银行卡、余额、基金

transactionVerb谓类表
id（上表外键） 主键
name: 添加、解绑/全部卖出、转入/买入、转出/卖出
```



例如：

### 余额明细与记录操作

```
查出
2-3-0	余额从其它转入
2-4-0	余额从其它转出
2-3-1	余额从银行卡转入
2-4-1	余额从银行卡转入

3-1-2 	基金添加时使用的是余额
3-2-2 	基金全部卖出时钱到了余额
3-3-2 	基金买入时使用的是余额
3-4-2 	基金卖出时钱到了余额

1、
select * from transaction
where userId = #{userId} and mainMark = #{mainMark}
同时连接谓类表查出操作类型名、连接主宾类表查出宾类型名

查出后遍历数组根据宾类，如果为银行卡（按主是查不到基金类型的，从余额这操作不到基金），查出对应信息

前端获得：
id、
userId、
（mainMark、name[余额]）[transactionMainObj]、
（vmark、name[转入 | 转出]）[transactionVerb]、
（objMark、name[其它 | 银行卡]）[transactionMainObj]、
objContentId、
MoneyResult、
date、
moneyAmount

遍历数据：如果objMark为银行卡，objContentId应该不为空的，因为操作时是根据现有的银行卡来选择转入转出的。根据此id查出银行卡名和卡号就够了，如果该卡已经解除绑定怎么办？
查卡信息时，是又发了一个请求给后台，后台先查usercards表，如果没有，就去查解绑记录表。

得到targetName、targetKey，放到此时遍历到的obj里
根据转入（+）、转出（-），设置显示金额符号

2、
select * from transaction
where userId = #{userId} and objMark = #{objMark}
同时连接谓类表查出操作类型名、连接userhold（连接finance查出该条基金名和代码）表查出基金信息

后端查到后遍历数据，将（mainMark、content）、mainContentId和（objMark、content）、objContentId的值进行调换

前端收到
id、
userId、
（mainMark、name[余额]）[transactionMainObj]、
（vmark、name[买入 | 卖出]）[transactionVerb]、
（objMark、name[基金]）[transactionMainObj]、
objContentId、
MoneyResult、
date、
moneyAmount

遍历数据：如果objMark为基金，objContentId应该不为空，根据此Id查询出基金名、基金代码
得到targetName、targetKey，放到此时遍历到的obj里
根据买入（-）、卖出（+），设置显示金额符号
```



余额操作时怎么添加记录

```
2-3-0	余额从其它转入
2-4-0	余额从其它转出
2-3-1	余额从银行卡转入
2-4-1	余额从银行卡转入

向数据库添加（其它）
userId				当前userId
mainMark			约定好的，余额为 2
vmark			    约定好的，转入为 3， 转出为 4
objMark				约定好的，其它为 0
MoneyResult			转入/转出后余额
date				new Date()
moneyAmount			操作金额

向数据库添加（银行）
userId				当前userId
mainMark			约定好的，余额为 2
vmark			    约定好的，转入为 3， 转出为 4
objMark				约定好的，银行卡为1
objContentId		 选择的银行卡id cardId
MoneyResult			转入/转出后余额
date				new Date()
moneyAmount			操作金额
```





### 银行卡明细与记录操作

```
1-1			银行卡添加
1-2			银行卡解绑
1-3			银行卡转入
1-4			银行卡转出

2-3-1		余额转入时用得是银行卡
2-4-1		余额转出时到了银行卡

3-1-1		基金添加时用的是银行卡
3-2-1		基金全部卖出时到了银行卡
3-3-1		基金买入时用的是银行卡
3-4-1		基金卖出时到了银行卡

1、
select * from transaction
where userId = #{userId} and mainContentId = #{mainContentId}
前端收到
id、
userId、
（mainMark、name[银行卡]）[transactionMainObj]、
（vmark、name[转入 | 转出]）[transactionVerb]、
date、
moneyAmount
根据转入（+），转出（-），显示金额符号

2、
select * from transaction
where userId = #{userId} and objContentId = #{objContentId}

后端查到后遍历数据，将（mainMark、content）、mainContentId和（objMark、content）、objContentId的值进行调换

前端收到
id、
userId、
（mainMark、content[银行卡]）[transactionMainObj]、
（vmark、content[转入 | 转出]）[transactionVerb]、
（objMark、content[余额]）[transactionMainObj]、
date、
MoneyResult、
moneyAmount
根据转入（-），转出（+），显示金额符号

3、（和2其实是一样的）
select * from transaction
where userId = #{userId} and objContentId = #{objContentId}
后端查到后遍历数据，将（mainMark、content）、mainContentId和（objMark、content）、objContentId的值进行调换

前端收到
id、
userId、
（mainMark、content[银行卡]）[transactionMainObj]、
（vmark、content[买入 | 卖出]）[transactionVerb]、
（objMark、content[基金]）[transactionMainObj]、
objContentId、
date、
moneyAmount

遍历数据：如果objMark为基金，objContentId应该不为空，根据此Id查询出基金名、基金代码
得到targetName、targetKey，放到此时遍历到的obj里
根据买入（-）、卖出（+），设置显示金额符号

因为是点击进入某一张卡，就显示那一张卡的记录，所以总览里面显示，更具objContentId查信息时，要查两个表，前一个表没有就查解绑记录表
```



银行卡操作添加记录

```
1-1			银行卡添加
1-2			银行卡解绑
1-3			银行卡转入
1-4			银行卡转出

向数据库添加
userId				当前userId
mainMark			约定好的，银行卡为 1
mainContentId		当前银行卡 cardId 添加银行卡之后还要发请求得到此银行卡的id
vmark			    约定好的，添加为1， 解绑为2，转入为 3， 转出为 4
date				new Date()
moneyAmount			操作金额

如果是解绑，还需要向解绑记录表中添加 userId、卡名、卡号、解绑时金额、日期

```



### 基金明细与记录操作

```
对个体（单项基金）
3-1-0	基金添加其它
3-3-0	基金买入其它
3-4-0	基金卖出其它

3-1-1	基金添加余额
3-3-1	基金买入余额	
3-4-1	基金卖出余额

3-1-2	基金添加银行卡
3-3-2	基金买入银行卡
3-4-2	基金卖出银行卡

1、
select * from transaction
where userId = #{userId} and mainContentId = #{mainContentId}

前端收到
id、
userId、
（mainMark、content[基金]）[transactionMainObj]、
（vmark、content[买入 | 卖出 | 添加]）[transactionVerb]、
（objMark、content[其它]）[transactionMainObj]、
objContentId、
date、
moneyAmount

2、多了个操作后余额
select * from transaction
where userId = #{userId} and mainContentId = #{mainContentId}

前端收到
id、
userId、
（mainMark、content[基金]）[transactionMainObj]、
（vmark、content[买入 | 卖出 | 添加]）[transactionVerb]、
（objMark、content[余额]）[transactionMainObj]、
MoneyResult、
date、
moneyAmount

3、银行卡来去
select * from transaction
where userId = #{userId} and mainContentId = #{mainContentId}

前端收到
id、
userId、
（mainMark、content[基金]）[transactionMainObj]、
（vmark、content[买入 | 卖出 | 添加]）[transactionVerb]、
（objMark、content[银行卡]）[transactionMainObj]、
objContentId、
date、
moneyAmount
遍历数据：如果objMark为银行卡，objContentId应该不为空，根据此Id查询出银行卡名、银行卡号（查不到再去ysercardsunbind里查）
得到targetName、targetKey，放到此时遍历到的obj里

```

基金操作添加记录

```
对个体（单项基金）
3-1-0	基金添加其它
3-3-0	基金买入其它
3-4-0	基金卖出其它

3-1-1	基金添加余额
3-3-1	基金买入余额	
3-4-1	基金卖出余额

3-1-2	基金添加银行卡
3-3-2	基金买入银行卡
3-4-2	基金卖出银行卡

向数据库添加（其它）
userId				当前userId
mainMark			约定好的，基金为 3
mainContentId		当前基金，用户持有Id
vmark			    约定好的，添加为 1， 全部卖出为 2， 买入为 3， 卖出为 4
objMark				约定好的，其它为 0
date				new Date()
moneyAmount			操作金额

向数据库添加（余额）
userId				当前userId
mainMark			约定好的，基金为 3
mainContentId		当前基金，用户持有Id
vmark			    约定好的，添加为 1， 全部卖出为 2， 买入为 3， 卖出为 4
objMark				约定好的，余额为 2
MoneyResult			转入/转出后余额
date				new Date()
moneyAmount			操作金额

向数据库添加（银行卡）
userId				当前userId
mainMark			约定好的，基金为 3
mainContentId		当前基金，用户持有Id
vmark			    约定好的，添加为 1， 全部卖出为 2， 买入为 3， 卖出为 4
objMark				约定好的，银行卡为 1
objContentId		 选择的银行卡id cardId
date				new Date()
moneyAmount			操作金额
```

### 中间大模块交易记录总览

```
select * from transaction
where userId = #{userId}

前端收到
id、
userId、
（mainMark、content[银行卡 | 余额 | 基金]）[transactionMainObj]、
mainContentId、
（vmark、content[添加 | 解绑/全部卖出 | 买入/转入 | 卖出/转出]）[transactionVerb]、
（objMark、content[其它 | 银行卡 | 余额 | 基金]）[transactionMainObj]、
objContentId、
MoneyResult、
date、
moneyAmount

遍历数据：如果mainMark为　银行卡 ||　基金　，根据mainContentId，查询出基金/银行卡名， 基金代码/银行卡号，得到mainName、mainKey放入此时遍历到的obj里；
如果objMark为 银行卡 || 基金 ，根据objContentId，查询出基金/银行卡名， 基金代码/银行卡号，得到targetName、targetKey放入此时遍历到的obj里；

分类查询 银行卡、余额、基金，
filter(主体为 银行卡 | 余额 | 基金)，

按交易类型查询
filter(类型为 添加 | 解绑/全部卖出 | 买入/转入 | 卖出/转出)

双重查询，连续filter即可
```

## 注意，其它标记为4

## 交易记录工作安排

```
1.创建交易记录表transaction
2.创建主/宾类型表transactionMainObj
3.创建谓语类型表transactionVerb
4.创建实体类
5.关联实体类

6.银行卡添加、解绑、转入、转出的交易记录添加；
7.余额的银行卡转入、银行卡转出、其它转入、其它转入的交易记录添加

8.基金详情页买入、卖出、全部卖出页面和功能
9.基金添加页面和功能

10.基金添加、全部卖出、买入、卖出的交易记录添加，基金详情页明细

11.余额交易记录明细
12.银行卡交易记录明细

13.中间交易记录页面和功能

1-7.预计周二完成（3.22）√
8-10.预计周五前完成(3.25)
11-12.预计周六前完成(3.26)
13.预计周日前完成(3.27)

后续工作：
1.后台管理页面（用户管理：用户个人资料，可修改其头像、用户名，显示持有基金、绑定银行卡数量，可冻结用户）、银行图标管理）（3.29）
2.页面布局、样式优化（尤其登录、注册页）（3.30）
3.验证码登录、注册（3.31）
4.手机号注册（考虑）
5.redis后台缓存技术（考虑）

```

## 基金详情页面

我不想刷新就滚出去了，进来之前先往vuex里存当前浏览的基金，老方法，computed、watch伺候。

不能clear，因为刷新整个页面包括父组件都销毁一次了，当前详情基金只有一次获取机会：就是点进来那一下，没办法，只有刷新滚出去了

基金全部卖出：将baseMoney设置为0，以后要是这支基金再买，就要判断了，初始日期如果在最后一次更新之后，就不要那些数据，

所以，查询financeState时，要添加判断条件，iniDate要 < updDate, 那又有问题，今天更新完，全部卖出，又在今天添加这条基金，又在当天更新，那么还好，是能够取到全部卖出之前的最后一条收益记录的，这个更新就是把它改了。但是要是不更新，那当天添加的没更新，就会显示卖出前最后一次的收益情况。

太复杂了，算了直接删除该基金所有记录得了，就找记录最少的做测试

## 基金卖出明确

单次卖出怎么算？，只能够输入卖出比例，按100%计算，basemoney和持有金额各减去这要卖出的百分之多少。

选到了100%就变成了全部卖出。

最高95%，要么卖95%，要么就100%。

只能输入整数。

买入直接往baseMoney加钱就行。

### 每次哪些数据要更新？

```
关键是此页面展示数据，其它页面过去自动会重新请求。
但是大父组件呢？上面的总金额总收益，1能解决，因为大父组件本身是watch+computed从vuex中监视获取的（但是仅仅是获取，谁操作谁就要去更新）。
MyFinancingHold组件呢？包括余额、银行卡，没关系，和这个页面是同级的，跳出会重新请求加载
那本组件要用的余额和银行卡呢？
1.整个fundHold，直接调vuex reloadUserFundHold即可。
2.银行卡，重新调本身method：getMyBankCards请求一下即可
3.余额，vuex reloadUserInfo，并重新赋值this.pocketMoney = this.$store.state.userInfo.pocketMoney;
4.本身基金数据，包括fundInfo和financeState，参照MyFinanceUpd的reloadFundInfo方法。包括了重新绘制图表。
5.profit、profitRate、lastprofit，和mounted里的争对收益正负对dom的颜色改变（changeNumColor），可以整合到一个方法里

```

### 更新具体操作

```
1.全部卖出
选择方式
其它、余额、银行卡
其它：
	request将此条基金baseMoney置0，删除其全部financeState，
	vuex reloadUserFundHold
	添加交易记录
	返回首页
余额：
	request将此条基金baseMoney置0，删除其全部financeState，
	将余额与当前总金额相加，修改余额
	vuex reloadUserFundHold
	vuex reloadUserInfo
	添加交易记录
	返回首页
银行卡：
	request将此条基金baseMoney置0，删除其全部financeState，
	将余额与当前银行卡余额相加，修改银行卡余额
	vuex reloadUserFundHold
	添加交易记录
	返回首页
------------------------------------------------
2.卖出（部分）
不超过比例的90%或95%
选择方式
其它、余额、银行卡
其它
	算出卖出比例的baseMoney和最新的thenState，如果没有financeState，只算baseMoney
	算出两者总和，或单前者
	算出剩下部分的baseMoney和thenState，request更新之（就是最新的thenState，更新就行，没有就不更新）
	vuex reloadUserFundHold
	本身method reloadFundInfo(里面又套了一个请求再次一步更新state，所以reloadNum和changeNumColor放在reloadFundInfo中了)，
	（本身method reloadNum
	本身method changeNumColor）
	添加交易记录

余额
	算出卖出比例的baseMoney和最新的thenState，如果没有financeState，只算baseMoney
	算出两者总和，或单前者
	算出剩下部分的baseMoney和thenState，request更新之（就是最新的thenState，更新就行，没有就不更新）
	总和与余额相加，修改余额
	vuex reloadUserFundHold
	vuex reloadUserInfo
	本身method reloadUserMoney
	本身method reloadFundInfo
	（本身method reloadNum
	本身method changeNumColor）
	添加交易记录
	
银行卡
	算出卖出比例的baseMoney和最新的thenState，如果没有financeState，只算baseMoney
	算出两者总和，或单前者
	算出剩下部分的baseMoney和thenState，request更新之（就是最新的thenState，更新就行，没有就不更新）
	总和与选择银行卡余额相加，修改银行卡余额
	vuex reloadUserFundHold
	本身method getMyBankCards
	本身method reloadFundInfo
	（本身method reloadNum
	本身method changeNumColor）
	添加交易记录
	
------------------------------------------------
3.买入
选择方式
其它、余额、银行卡
其它：
	输入买入金额，不超过1万？10万？
	输入金额与当前baseMoney相加，修改baseMoney
	vuex reloadUserFundHold
	本身method reloadFundInfo
	（本身method reloadNum
	本身method changeNumColor）
	添加交易记录
	
余额：
	输入买入金额，不超过1万？10万？键入键出事件，超过余额就全部
	余额减去输入金额，修改余额
	输入金额与当前baseMoney相加，修改baseMoney
	vuex reloadUserFundHold
	vuex reloadUserInfo
	本身method reloadUserMoney
	本身method reloadFundInfo
	（本身method reloadNum
	本身method changeNumColor）
	添加交易记录

银行卡
	输入买入金额，不超过1万？10万？键入键出事件，超过银行卡余额就全部
	银行卡余额减去输入金额，修改银行卡余额
	输入金额与当前baseMoney相加，修改baseMoney
	vuex reloadUserFundHold
	本身method getMyBankCards
	本身method reloadFundInfo
	（本身method reloadNum
	本身method changeNumColor）
	添加交易记录
	
------------------------------------------------
	
	每次请求返回成功内（根据情况）
	vuex reloadUserFundHold
	vuex reloadUserInfo
	本身method getMyBankCards
	本身method reloadUserMoney
	本身method reloadFundInfo
	本身method reloadNum
	本身method changeNumColor
```

## 下拉框注意

需要添加onchange事件，变化时需要清空下方input框内容，否则，换一张卡余额比之前的卡少就G

## 基金接口

```
https://way.jd.com/smyt/MUTUAL_FUND_INFO?appkey=da39dce4f8aa52155677ed8cd23a6470&fund_id=000584

da39dce4f8aa52155677ed8cd23a6470
每天免费请求30次
```

## 防抖

```javascript
clearTimeout(timer);
// 已全局定义timer
timer = setTimeout(() => {
	this.searchFundHold(fundCode);
},500);
```

## 日期选择插件

https://edisdev.github.io/vue-datepicker-ui/installation.html

## 如果最后一页只剩一条记录

删除那条记录后应该回到“前一页”

```javascript
if(this.pageAll < this.pageSet){
	this.pageSet = this.pageAll;
}
```

# 后台管理模块

管理模块登录界面。

简单实现，左边导航列表，右边显示内容。

分为 账户资料、管理员、用户、银行图表管理、基金收录管理

管理员就两种，最高级管理员和管理员（最高级管理员能够添加或禁用普通管理员，即导航菜单上多了管理员一栏）

## 账户资料

修改自身账号（普通管理员不可修改自身账号）、密码

请求成功后 10秒后关闭（10秒后才能再次修改）

设置定时器，可能10秒内，切到其它页面，在切回来点修改还是能够马上进行修改

为避免此，点修前前判断timer要为空

## 管理员

仅最高级管理员显示，分页列表显示普通管理员列表、状态操作

前端随机数生成

https://blog.csdn.net/Thekingyu/article/details/98639383

## 用户

分页列表显示用户列表、状态操作

## 银行图标管理

显示bank表的银行名称、简称和图片、修改图片操作

只能修改图标

原因：修改代码会乱套，由用户使用过程中添加

## 基金收录管理

分类列表显示已收录基金，以及操作（修改和删除），同样可以根据开头字母、输入基金代码名称查询，

查看用户提交申请表，进行添加操作



input onchange事件触发条件

一、当input捕获到焦点后，系统储存当前值

 二、当input焦点离开后，判断当前值与之前存储的值是否不等，如果为true则触发onchange事件。

所以不能用onchange事件来限制输入

# 项目部署

后端springboot

https://blog.csdn.net/wjie8023/article/details/120500797

## Linux安装mysql

https://www.cnblogs.com/jj123/p/15740668.html

报错百度就好了

往redis存数据要序列化，不然只能存String进去

## 模糊删除key方法

```
String holdfundChooseKey = "holdFundToChoose-";
Set<String> keys = redisTemplate.keys(holdfundChooseKey + "*");
redisTemplate.delete(keys);
```

## Redis字符串存实体类的方法

List序列化直接存取就行

对于单个实体类实例对象

```java
redisTemplate.opsForValue().set(userInfoKey,JSON.toJSON(res),60*60*24*3, TimeUnit.SECONDS);
User userInfo = JSON.parseObject(redisTemplate.opsForValue().get(userInfoKey).toString(),User.class);
```



