var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
require('./../util/util')
var Users = require('../models/users');

//连接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/Ysl');

mongoose.connection.on("connected", function () {
  console.log("MongoDB1 connected success.")
});

mongoose.connection.on("error", function () {
  console.log("MongoDB1 connected fail.")
});

mongoose.connection.on("disconnected", function () {
  console.log("MongoDB1 connected disconnected.")
});


//登录接口
router.post("/login",function(req,res,next){
	var param={
		telmail:req.body.telmail,
		password:req.body.password
	}
	Users.findOne(param,function(err,doc){
		if (err) {
			res.json({
				status:"1",
				msg:err.message
			});
		}else{
			if(doc){
				res.cookie("userId",doc.userId,{
					path:"/",
					maxAge:1000*60*60
				});

				res.cookie("telmail",doc.telmail,{
					path:"/",
					maxAge:1000*60*60
				});
				res.json({
					status:"0",
					msg:"",
					result:{
						telmail:doc.telmail
					}
				})
			}
		}
	})
})


//登出接口
router.post("/logout",function(req,res,next){
	res.cookie("userId","",{
		path:"/",
		maxAge:-1
	});
	res.cookie("telmail","",{
		path:"/",
		maxAge:-1
	});
	res.json({
		status:"0",
		msg:"",
		result:""
	})

})

//检查是否登录
router.get("/checkLogin",function(req,res,next){
	if(req.cookies.userId){
		res.json({
			status:"0",
			msg:"",
			result:req.cookies.telmail	
		});
	}else{
		res.json({
			status:"1",
			msg:"未登录",
			result:''
		});
	}
})

//查看有几个商品
router.get("/getCartCount",function(req,res,next){
	if(req.cookies && req.cookies.userId){
		var userId =req.cookies.userId;
		Users.findOne({userId:userId},function(err,doc){
			if(err){
				res.json({
					status:'1',
					msg:err.message,
					result:''
				});
			}else{
				var cartLists =doc.cartLists;
				let cartCount = 0;
				cartLists.map(function(item){
					cartCount+=parseFloat(item.goodsBuyNum);
				})
				res.json({
					status:'0',
					msg:'',
					result:cartCount
				})
			}
		});
	}else{
		res.json({
      		status:"0",
      		msg:"当前用户不存在"
    	});
	}
})

//检查邮箱
router.get("/checktelmail",function(req,res,next){
	console.log(req.query.telmail);
	var param ={
		'telmail' :req.query.telmail
	}
	Users.findOne(param,(err,doc)=>{
		if(err){
			throw err;
		}else{
			console.log(doc);
			//当找到的为空时
			if(doc == null){
				res.json({
					status:'0',
					msg:'用户名可以注册'	
				})
				return;
			}
			//当存在doc时
			if(doc){
				res.json({
					status:'2',
					msg:'用户名存在'	
				})
			}else{
				res.json({
					status:'3',
					msg: '用户找不到'	
				})
			}
		}
	})

});

/*注册*/
router.post('/register',function(req,res,next){
	console.log(req.body);
	//获取注册表格中的email和密码
	var telmail = req.body.telmail;
	var password = req.body.password;
	var userName =req.body.userName;
	var userId = Math.floor(Math.random()*100000);
	console.log(userId)
	var users = new Users({
		"userId" : userId,
	    "userName" : userName,
	    "password" : password,
	    "telmail" : telmail
	})
	console.log(users);
	users.save((err,doc)=>{
		console.log(1);
		if(err){
			res.json({
				status:'1',
				msg: err.message	
			})
		}else{
			if(doc){
				res.json({
					status:'0',
					msg:'注册成功'	
				})
			}		
		}
	})
})


//查询当前用户的购物车数据
router.get('/cartLists',function(req,res,next){
	var userId =req.cookies.userId;
	Users.findOne({userId:userId},function(err,doc){
		if(err){
			res.json({
				status:'1',
				msg: err.message,
				result:''
			});
		}else{
			if(doc){
				res.json({
					status:'0',
					msg: '',
					result:doc.cartLists
				})
			}
		}
	})
})

//商品删除
router.post("/delCart",function(req,res,next){
	var userId = req.cookies.userId,
      goodsId = req.body.goodsId;

    Users.update({
    	userId:userId
    },{
    	$pull:{
    		'cartLists':{
    			'goodsId':goodsId
    		}
    	}
    },function(err,doc){
    	if(err){
    		res.json({
    			status:'1',
    			msg:err.message,
    			result:''
    		});
    	}else{
    		res.json({
    			status:'0',
    			msg:'',
    			result:'suc'
    		});
    	}
    });
});

//修改商品数量
router.post("/cartEdit", function (req,res,next) {
  var userId = req.cookies.userId,
      goodsId = req.body.goodsId,
      goodsBuyNum = req.body.goodsBuyNum,
      checked = req.body.checked;
  Users.update({"userId":userId,"cartLists.goodsId":goodsId},{
    "cartLists.$.goodsBuyNum":goodsBuyNum,
    "cartLists.$.checked":checked,
  }, function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      });
    }
  })
});

//购物车的修改
// router.post("/editCheckAll",function(req,res,next){
// 	var userId = req.cookies.userId,
// 	checkAll =req.body.checkAll;

// 	Users.findOne({userId:userId},function(err,user){
// 		if(err){
//       		res.json({
//         		status:'1',
//         		msg:err.message,
//         		result:''
//       		});
//     	}else{
//     		if(user){
//     			user.cartLists.forEach((items)=>{
//     				items.checked =checkAll;
//     			})
//     			user.save(function(err1,doc){
//     				if(err1){
//     					res.json({
//         					status:'1',
//         					msg:err1.message,
//         					result:''
//       					});
//     				}else{
//     					res.json({
//         					status:'0',
//         					msg:'',
//         					result:'suc'
//       					});
//     				}
//     			})
//     		}
      		
//     	}
// 	})
// })


//查询用户地址接口
router.get('/addressLists',function(req,res,next){
	var userId = req.cookies.userId;
	Users.findOne({userId:userId},(err,doc)=>{
		if(err){
			res.json({
				status:"1",
				msg:err.message,
				result:""
			})
		}else{
			if(doc){
				res.json({
					status:"0",
					msg:"",
					result:doc.addressLists
				})
			}
		}
	})
})

//创建新的地址
// router.post('/addAddress',function(req,res,next){
// 	console.log(req.body);
// 	//获取注册表格中的email和密码
// 	var userName= req.body.userName;
// 	var postId = req.body.postId;
// 	var addressName =req.body.addressName;
// 	var tel =req.body.tel;
// 	var addressId = Math.floor(Math.random()*100000);
// 	console.log(addressId);
// 	var users = new Users({
// 		addressId: addressId,
//       	userName: userName,
//       	addressName: addressName,
//       	postId: postId,
//       	tel: tel
// 	})
// 	console.log(users);
// 	users.save((err,doc)=>{
// 		console.log(1);
// 		if(err){
// 			res.json({
// 				status:'1',
// 				msg: err.message	
// 			})
// 		}else{
// 			if(doc){
// 				res.json({
// 					status:'0',
// 					msg:'添加成功'	
// 				})
// 			}		
// 		}
// 	})
// })

//创建新的地址
router.post('/addAddress',(req,res,next)=>{
	//获取用户ID
	var userId = req.cookies.userId;
	//定义创建Id编号：
	var addressId = Math.floor(Math.random()*100000);

	//获取新的地址
	var newAddress = {	 
		addressName: req.body.addressName,	
		tel: req.body.tel,
        postId: req.body.postId,
        userName: req.body.userName,
        addressId:addressId,
        checked:false
	}
	//判断用户是否登录
	//用户已经登录
	if(userId){
		Users.findOne({'userId': userId},(err,userDoc)=>{
			if(err){
				throw err
			}else{
				if(userDoc == null){
					res.json({
						status:'0',
						msg:'找不到用户'
					})
				}
			//找到用户
			//用户地址列表内没有内容
			if(userDoc.addressLists.length <= 0){
				console.log('找到用户',userDoc);
				console.log('用户地址为空')
					userDoc.addressLists.push(newAddress)
						userDoc.save((err,doc)=>{
							if(err){
								throw err
							}else{
								if(doc){
									res.json({
										status:'0',
										msg:'添加地址成功'
							})
									
						}
					}
				})
			}
			//用户地址列表内有内容
			else{
					//两个对象之间的比较
					var isUnique = true;
					//如果输入的对象重复
					userDoc.addressLists.forEach((item)=>{
						if(JSON.stringify(item) == JSON.stringify(newAddress)){
							isUnique = false;
							res.json({
								status:'0',
								msg:'重复地址'
							})
						}
					})
					//如果输入的对象不重复
					if(isUnique){
						userDoc.addressLists.push(newAddress)
						userDoc.save((err,doc)=>{
							if(err){
								throw err
							}else{
								if(doc){
									res.json({
										status:'0',
										msg:'添加地址成功'
									})
								}
							}
						})
					}
				}
			}
		})
	}
	//用户未登录
	else{
		res.json({
			status:'1',
			msg:'用户未登录'
		})
	}

})


//删除地址
router.post("/delAddress",function(req,res,next){
	var userId =req.cookies.userId,
	addressId =req.body.addressId;
	console.log(addressId);
	Users.update({
		userId:userId
	},{
		$pull:{
			'addressLists':{
				'addressId':addressId
			}
		}
	},function(err,doc){
		if(err){
			res.json({
				status:"1",
				msg:err.message,
				result:""
			});
		}else{
			res.json({
				status:"0",
				msg:""
			})		
		}
	})
});


//设置默认地址接口
router.post("/setDefault", function (req,res,next) {
  var userId = req.cookies.userId,
      addressId = req.body.addressId;
  if(!addressId){
    res.json({
      status:'1003',
      msg:'addressId is null',
      result:''
    });
  }else{
    Users.findOne({userId:userId}, function (err,doc) {
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        });
      }else{
        var addressLists = doc.addressLists;
        addressLists.forEach((item)=>{
          if(item.addressId ==addressId){
             item.isDefault = true;
          }else{
            item.isDefault = false;
          }
        });

        doc.save(function (err1,doc1) {
          if(err){
            res.json({
              status:'1',
              msg:err.message,
              result:''
            });
          }else{
              res.json({
                status:'0',
                msg:'',
                result:''
              });
          }
        })
      }
    });
  }
});

//提交订单,生成订单号及信息
router.post("/payMent", function (req,res,next) {
  	var userId = req.cookies.userId,
    	addressId = req.body.addressId,
    	orderTotal = req.body.orderTotal;
  	Users.findOne({userId:userId}, function (err,doc) {
     	if(err){
        	res.json({
            	status:"1",
            	msg:err.message,
            	result:''
        	});
     	}else{
       		var address = '',goodsList = [];
       		//获取当前用户的地址信息
       		console.log(addressId)
       		doc.addressLists.forEach((item)=>{
          		if(item.addressId==addressId){
          			console.log('是否修改')
            		address = item;
            		console.log(item);

          		}
       		})
       		console.log('adress是',address);
       		//获取用户购物车的购买商品
       		doc.cartLists.filter((item)=>{
         		if(item.checked=='1'){
           			goodsList.push(item);
         		}
       		});

       		var platform = '622';
       		var r1 = Math.floor(Math.random()*10);
       		var r2 = Math.floor(Math.random()*10);

       		var sysDate = new Date().Format('yyyyMMddhhmmss');
       		var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
       		var orderId = platform+r1+sysDate+r2;
       		var order = {
          		orderId:orderId,
          		orderTotal:orderTotal,
          		addressInfo:address,
          		goodsList:goodsList,
          		orderStatus:'1',
          		createDate:createDate
       		};

       		doc.orderLists.push(order);

       		console.log(order);
       		doc.save(function (err1,doc1) {
          		if(err1){
            		res.json({
              			status:"1",
              			msg:err.message,
              			result:''
            		});
          		}else{
            		res.json({
              			status:"0",
              			msg:'',
              			result:{
                			orderId:order.orderId,
                			orderTotal:order.orderTotal
              			}
            		});
          		}
       		});
     	}
  	})
});

//根据订单Id查询订单信息
router.get("/orderDetail", function (req,res,next) {
  	var userId = req.cookies.userId,orderId = req.param("orderId");
  	Users.findOne({userId:userId}, function (err,userInfo) {
     	if(err){
          	res.json({
             	status:'1',
             	msg:err.message,
             	result:''
          	});
      	}else{
         	var orderLists = userInfo.orderLists;
         	if(orderLists.length>0){
           		var orderTotal = 0;
           		orderLists.forEach((item)=>{
              		if(item.orderId == orderId){
                		orderTotal = item.orderTotal;
              		}
           		});
           		if(orderTotal>0){
             		res.json({
               			status:'0',
              			msg:'',
               			result:{
                 			orderId:orderId,
                 			orderTotal:orderTotal
               			}
             		})
           		}else{
             		res.json({
               			status:'120002',
               			msg:'无此订单',
               			result:''
             		});
           		}
        	}else{
           		res.json({
             		status:'120001',
             		msg:'当前用户未创建订单',
             		result:''
           		});
        	}
    	}
  	})
});

//个人信息
//查询用户个人信息接口
router.get('/userList',function(req,res,next){
	var userId = req.cookies.userId;
	Users.findOne({userId:userId},(err,doc)=>{
		if(err){
			res.json({
				status:"1",
				msg:err.message,
				result:""
			})
		}else{
			if(doc){
				res.json({
					status:"0",
					msg:"",
					result:doc
				})
			}
		}
	})
})
//创建个人信息
router.post('/userInfo',(req,res,next)=>{
	//获取用户ID
	var userId = req.cookies.userId;
	//定义创建Id编号：
	var userInfoId = userId;

	//获取新的地址
	var userInfo = {	 
		tel: req.body.tel,	
		mail: req.body.mail,
        userNames: req.body.userNames,
        userInfoId:userInfoId,
	}
	//判断用户是否登录
	//用户已经登录
	if(userId){
		Users.findOne({'userId': userId},(err,userDoc)=>{
			if(err){
				throw err
			}else{
				if(userDoc == null){
					res.json({
						status:'0',
						msg:'找不到用户'
					})
				}
			//找到用户
			//userInfo.tel&&userInfo.mail&&userInfo.userNames&&userInfo.userInfoId
			if(userInfo){
				console.log('找到用户',userDoc);
						userDoc.userInfoList=userInfo;
						userDoc.save((err,doc)=>{
							if(err){
								console.log(1111111)
								throw err
							}else{
								if(doc){
									console.log(2222+doc)
									res.json({
										status:'0',
										msg:'成功'
							})
									
						}
					}
				})
			}

			}
		})
	}
	//用户未登录
	else{
		res.json({
			status:'1',
			msg:'用户未登录'
		})
	}

})
//修改密码接口
router.post('/updatePassword',function(req,res,next){
	var userId = req.cookies.userId;
	var oldPassword=req.body.oldPassword;
	var newPassword=req.body.newPassword;
	var confirmPassword=req.body.confirmPassword;
	Users.findOne({userId:userId},(err,userDoc)=>{
		if(err){
			res.json({
				status:"1",
				msg:err.message,
				result:""
			})
		}else{
			if (userDoc.password===oldPassword&&newPassword===confirmPassword) {
				userDoc.password=newPassword;
				userDoc.save((err,doc)=>{
					if(doc){
						res.json({
							status:"0",
							msg:"",
							result:doc
						})
					}	
				})			
			}
		}
	})
})
//删除地址接口
router.post('/removeRess',function(req,res,next){
	var userId = req.cookies.userId;
	var index=req.body.index;
	Users.findOne({userId:userId},(err,userDoc)=>{
		if(err){
			res.json({
				status:"1",
				msg:err.message,
				result:""
			})
		}else{
			userDoc.addressLists.splice(index,1);
			userDoc.save((err,doc)=>{
				if(doc){
					res.json({
						status:"0",
						msg:"",
						result:doc.addressLists
					})
				}
			})
		}
	})
})
//修改地址接口
router.post('/modifyRess',function(req,res,next){
	var userId = req.cookies.userId;
	var userName=req.body.userName;
	var postId=req.body.postId;
	var addressName=req.body.addressName;
	var tel=req.body.tel;
	var index=req.body.index;
	Users.findOne({userId:userId},(err,userDoc)=>{
		if(err){
			res.json({
				status:"1",
				msg:err.message,
				result:""
			})
		}else{
			userDoc.addressLists[index].userName=userName;
			userDoc.addressLists[index].postId=postId;
			userDoc.addressLists[index].addressName=addressName;
			userDoc.addressLists[index].tel=tel;
			userDoc.save((err,doc)=>{
				if(doc){
					res.json({
						status:"0",
						msg:"",
						result:doc.addressLists
					})
				}
			})
		}
	})
})
module.exports = router;
