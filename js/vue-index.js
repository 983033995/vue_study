new Vue({
    el : "#app",
    data : {                            //基础数据配置
        produceList : [],               //初始商品数据
        amountMoney : 0,                //初始选购商品总金额
        totalProduct : 0,               //初始选购商品总数
        checkAll : false,
        storeCheckAll : [],
        removeCurGoods : [],            //当前要删除的商品
        removeGoodsStore : [],          //当前要删除的商品的店铺信息
        removeStoreName : "",
        delTip : false,                 //控制删除商品时的提示内容的显示
        cancelTip : false               //控制删除商品时的提示内容的隐藏
    },
    filters : {                         //过滤器

    },
    mounted : function(){               //页面加载完毕后执行的事件
        this.$nextTick(function(){
            this.initialData();
        })
    },
    methods : {                         //js方法
        initialData : function(){       //加载商品列表信息
            this.$http.get("js/list.json").then((res) => {
                let data = res.body;
                this.produceList = data;
                // console.log(this.produceList);                
            })
        },
        choseOne : function(list,k,name){      //单选和取消单选(list:当前商品所属门店下的所有商品信息，K:当前商品信息的键值,name:当前商品的门店名字)
            if(typeof list[k].checked == 'undefined'){         //判断对象中是否存在checked
                Vue.set(list[k],"checked",true);               //如果不存在checked则在当前对象中全局注册一个checked
            }else{
                list[k].checked = !list[k].checked;
                this.storeCheckAll[name] = false;              //当前门店下的商品只要有一个没被选中那么当前门店的全选按钮就要取消选中
                this.checkAll = false;
            }
            var n = 0;
            var l = list.length;                                //当前门店下的商品数量               
            list.forEach(function(vo,ko){
                if(vo.checked == true){                         //当前门店下的商品每选中一个则n的数值加1
                    n++;
                }
            });
            if(n == l){                                         //如果当前门店下所有的商品都被选了则门店的全选按钮被选中
                this.storeCheckAll[name] = true;
            }
            this.backwardOption();
            this.amount();
        },
        amount : function(){        //商品总额
            var _this = this;
            this.amountMoney = 0;   //清零金额重算
            this.totalProduct = 0;   //清零数量重算
            for(var i in this.produceList){     //对于复杂的多重json要用for循环去到其中的键名才能使用foreach遍历，此处的i为json对象中第一层的键名
                this.produceList[i].forEach(function(v,k){
                    if(v.checked == true){      //选中的商品才用累加金额
                        _this.amountMoney += parseInt(v.productPrice)*parseInt(v.produceNum);
                        _this.totalProduct += parseInt(v.produceNum);
                    }
                });
            }
        },
        changeNum : function(list,type){        //增加或者减少商品数量
            if(type > 0){                       //加商品数量
                list.produceNum++;
            }else{
                if(list.produceNum <= 1){       //商品数量不能小于1
                    list.produceNum = 1;
                }else{
                    list.produceNum--;
                }
            }
            this.amount();
        },
        storeCheck : function(name){            //门店所有商品全选
            var _this = this;
            var index = this.produceList[name];         //当前店铺的所有商品数据
            if(this.storeCheckAll[name] == 'undefined' || this.storeCheckAll[name] == undefined){       //如果当前选择的店铺还未选中过，则添加一个数组到storeCheckAll中
                Vue.set(_this.storeCheckAll,name,true);
                index.forEach(function(v,k){
                    Vue.set(v,"checked",true);
                })
            }else if(this.storeCheckAll[name] == true){
                _this.storeCheckAll[name] = false;
                index.forEach(function(v,k){
                    Vue.set(v,"checked",false);
                })                
            }else if(this.storeCheckAll[name] == false){
               _this.storeCheckAll[name] = true;
                index.forEach(function(v,k){
                    Vue.set(v,"checked",true);
                })              
            }
            this.backwardOption();
            this.amount();
        },
        allCheck : function(){              //选中所有的商品
            var _this = this;
            if(this.checkAll == false){
                _this.checkAll = true; 
                for(var i in this.produceList){    
                    this.produceList[i].forEach(function(v,k){
                        if(v.checked == 'undefined' || v.checked == undefined){
                            Vue.set(v,"checked",true);
                        }else{
                            v.checked = true;
                        }
                    });
                    if(this.storeCheckAll[i] == 'undefined' || this.storeCheckAll[i] == undefined){
                        Vue.set(this.storeCheckAll,i,true);
                    }else{
                        this.storeCheckAll[i] = true;
                    }
                }    
            }else{
                _this.checkAll = false; 
                for(var i in this.produceList){    
                    this.produceList[i].forEach(function(v,k){
                        if(v.checked == 'undefined' || v.checked == undefined){
                            Vue.set(v,"checked",false);
                        }else{
                            v.checked = false;
                        }
                    });
                    if(this.storeCheckAll[i] == 'undefined' || this.storeCheckAll[i] == undefined){
                        Vue.set(this.storeCheckAll,i,false);
                    }else{
                        this.storeCheckAll[i] = false;
                    }
                }
            }
            this.amount();
        },
        backwardOption : function(){                            //反向验证商品是否被全选
            var s = 0;
            for(var i in this.produceList){
                s++;
            }
            var s_l = 0;
            for(var i in this.storeCheckAll){
                if(this.storeCheckAll[i] == true){
                    s_l++;     
                }                         
            }
            if(s == s_l){                                         //如果当前门店下所有的商品都被选了则门店的全选按钮被选中
                this.checkAll = true;
            }else{
                this.checkAll = false;
            }            
        },
        removeGoods : function(list,item,storeName){                               //点击移除商品
            this.removeCurGoods = list;
            this.removeGoodsStore = item;
            this.removeStoreName = storeName;
            this.cancelTip = false;
            this.delTip = true;
        },
        cacelRemoveGoods : function(){                              //点击关闭和取消
            this.removeCurGoods = [];
            this.removeGoodsStore = [];
            this.removeStoreName = "";
            this.delTip = false;
            this.cancelTip = true;
        },
        sureRemoveGoods : function(){
            if(this.removeGoodsStore.length == 1){
                for(var i in this.produceList){
                    if(i == this.removeStoreName){
                        delete this.produceList[i];
                    }
                }
            }else{
                var index = this.removeGoodsStore.indexOf(this.removeCurGoods);
                this.removeGoodsStore.splice(index,1);
            }
            this.cacelRemoveGoods();
            this.amount();
        }
    }
})