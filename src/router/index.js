// 引入路由
import VueRouter from "vue-router";

// 引入组件
import Layout from '../layout/Layout';
import Login from '../pages/Login';
import UserInfo from '../pages/UserInfo';
import TradeRecord from '../pages/TradeRecord';
import MyFinancing from '../pages/MyFinancing';
import UserInfoDetail from '../pages/UserInfoDetail';
import UserInfoCard from '../pages/UserInfoCard';
import UserInfoCardDetail from '../pages/UserInfoCardDetail';
import UserInfoCardAdd from '../pages/UserInfoCardAdd';
import UserInfoPocketMoney from '../pages/UserInfoPocketMoney';
import Register from '../pages/Register';
import MyFinancingHold from '../pages/MyFinancingHold';
import MyFinanceUpd from '../pages/MyFinanceUpd';
import MyFinanceDetail from '../pages/MyFinanceDetail';
import MyFinanceAdd from '../pages/MyFinanceAdd';
import MyFinanceAddCall from '../pages/MyFinanceAddCall';
import MyFinanceAddSelf from '../pages/MyFinanceAddSelf';
import UserInfoRecordRe from '../pages/UserInfoRecordRe';
import ManagerLayout from '../layout/ManagerLayout';
import ManagerLogin from '../pages/ManagerLogin';
import Manager from '../pages/Manager';
import Manager1Info from '../pages/Manager1Info';
import Manager2Junior from '../pages/Manager2Junior';
import Manager2JuniorAdd from '../pages/Manager2JuniorAdd';
import Manager3User from '../pages/Manager3User';
import Manager4Bank from '../pages/Manager4Bank';
import Manager5Fund from '../pages/Manager5Fund';
import Manager6Record from '../pages/Manager6Record';
import RegisterVerify from '../pages/RegisterVerify';

// import RegisterGood from '../pages/RegisterGood';

import request from '../utils/request'
const router = new VueRouter({
    mode:'history',
    routes:[
        // {
        //     name:'registergood',
        //     path:'/registers',
        //     component: RegisterGood,
        // },
        {
            name:'main',
            path:'/',
            component: Layout,
            meta:{nowPage:0},
            redirect:'/myfinance',
            beforeEnter:(to,from,next)=>{
                if(localStorage.getItem('user')){
                    next();
                }else{
                    router.push('/login');
                }
            },
            children:[
                // 个人信息
                {
                    path:'user',
                    component: UserInfo,
                    props:{nowPage:3},
                    redirect:'user/detail',
                    children:[
                        {
                            name:'userDetail',
                            path:'detail',
                            component: UserInfoDetail,
                            props:{nowPageS:31},
                        },
                        {
                            name:'userCards',
                            path:'card',
                            component: UserInfoCard,
                            props:{nowPageS:32},
                        },
                        {
                            name:'userCardsDetail',
                            path:'cardDetail',
                            component: UserInfoCardDetail,
                            // props:{nowPageS:32},
                            props($router){
                                return {
                                    nowPageS:32,
                                    cardId:$router.params.cardId,
                                    userId:$router.params.userId,
                                }
                            },
                        },
                        {
                            name:'userCardAdd',
                            path:'addcard',
                            component: UserInfoCardAdd,
                            props($router){
                                return {
                                    nowPageS: 32,
                                    cardsNum: $router.params.cardsNum,
                                    allMoney: $router.params.allMoney,
                                }
                            }
                        },
                        {
                            name:'userPocketMoney',
                            path:'userPocketMoney',
                            component:UserInfoPocketMoney,
                            props:{
                                nowPageS:33,
                            },
                        },
                        {
                            name:'userInfoRecordRe',
                            path:'recycle',
                            component:UserInfoRecordRe,
                            props:{
                                nowPageS:34,
                            },
                        }
                    ],
                },
                // 交易记录
                {
                    path:'record',
                    component: TradeRecord,
                    props:{nowPage:2}
                },
                // 我的理财
                {
                    name:'myfinance',
                    path:'myfinance',
                    component: MyFinancing,
                    props:{nowPage:1},
                    redirect:'myfinance/hold',
                    children:[
                        {
                            path:'hold',
                            name:'myfinanceHold',
                            component: MyFinancingHold,
                        },
                        {
                            path:'holdupdate',
                            name:'myfinanceUpd',
                            component: MyFinanceUpd,
                            props($router){
                                return {
                                    fund: $router.params.fund,
                                }
                            }
                        },
                        {
                            path:'holddetail',
                            name:'myfinanceDetail',
                            component: MyFinanceDetail,
                            props($router){
                                return {
                                    fund: $router.params.fund,
                                }
                            },
                        },
                        {
                            path:'holdadd',
                            name:'myfinanceAdd',
                            component: MyFinanceAdd,
                        },
                        {
                            path:'holdaddcall',
                            name:'myfinanceAddCall',
                            component: MyFinanceAddCall, 
                            props($router){
                                return{
                                    fund: $router.params.fund,
                                    fundHold: $router.params.fundHave,
                                }
                            }   
                        },
                        {
                            path:'holdaddself',
                            name:'myfinanceAddSelf',
                            component: MyFinanceAddSelf,
                            props($router){
                                return{
                                    allFund: $router.params.allFund,
                                    fundHold: $router.params.fundHave,
                                }
                            }
                        }
                    ],
                }
            ]
        },
        // 登录
        {
            name:'login',
            path:'/login',
            component: Login,
        },
        // 注册
        {
            name:'registerVerify',
            path:'/registercode',
            component: RegisterVerify,
            props($router){
                return{
                    registerInfo: $router.params.registerInfo,
                }
            }
        },
        {
            name:'register',
            path:'/register',
            component: Register,
        },
        // 管理员
        {
            name:'manager',
            path:'/manager',
            component: ManagerLayout,
            redirect:'manager/main',
            children:[
                {
                    name:'managerLogin',
                    path:'mlogin',
                    component: ManagerLogin,
                },
                {
                    name:'managerMain',
                    path:'main',
                    component: Manager,
                    beforeEnter:(to,from,next)=>{
                        if(localStorage.getItem('admin')){
                            next();
                        }else{
                            router.push('/manager/mlogin');
                        }
                    },
                    redirect:'main/info',
                    children:[
                        {
                            path:'info',
                            name:'adminInfo',
                            component:Manager1Info,
                        },
                        {
                            path:'junior',
                            name:'adminJunior',
                            component:Manager2Junior,
                        },
                        {
                            path:'junioradd',
                            name:'adminJuniorAdd',
                            component:Manager2JuniorAdd,
                            props($router){
                                return {
                                    manager:$router.params.manager,
                                }
                            }
                        },
                        {
                            path:'user',
                            name:'adminUser',
                            component:Manager3User,
                        },
                        {
                            path:'bank',
                            name:'adminBank',
                            component:Manager4Bank,
                        },
                        {
                            path:'fund',
                            name:'adminFund',
                            component:Manager5Fund,
                        },
                        // {
                        //     path:'record',
                        //     name:'adminRecord',
                        //     component:Manager6Record,
                        // }
                    ],
                }
            ]
        }
    ]
})

router.beforeEach((to,from,next) => {
    // console.log(to);
    // console.log(from);
    next();
    if(localStorage.getItem('user') || localStorage.getItem('admin')){
        next();
        if(localStorage.getItem('user')){
            const verifyInfo = localStorage.getItem('user');
            const id = verifyInfo.split("-")[0];
            const code = verifyInfo.split("-")[1];
            const formData = new FormData();
            formData.append("id",id);
            formData.append("code",code);
            request.post('/api/user/codeonly',formData).then(res => {
                if(res.data == 1){
                    next();
                }else{
                    localStorage.clear('user');
                    alert("账号在其它地方被登录");
                    router.push('/login');
                }
            },err => {
                localStorage.clear('user');
                console.log(err);
                alert("账号在其它地方被登录");
                router.push('/login');
            });
        }
    }else{
        localStorage.clear('user');
        if(from.path !== '/'){
            if(to.path === '/register'){
                router.push('/register')
            }else if(to.path === '/manager/main'){
                router.push('/manager/main');
            }else if(to.path === '/registercode'){
                router.push('/registercode');
            }else{
                router.push('/login')
            }
        }
    }
})

export default router