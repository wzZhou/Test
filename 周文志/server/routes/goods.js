var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');

//连接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/Ysl');

mongoose.connection.on("connected", function () {
  console.log("MongoDB connected success.")
});

mongoose.connection.on("error", function () {
  console.log("MongoDB connected fail.")
});

mongoose.connection.on("disconnected", function () {
  console.log("MongoDB connected disconnected.")
});

router.get("/",function(req,res,next){
	var sort =req.param('sort');
	let params ={};
	let goodsModel =Goods.find(params);
	goodsModel.sort({"goodsSale":sort});

	Goods.find({},function(err,doc){
		if(err){
			res.json({
				status:"1",
				msg:err.message
			});
		}else{
			res.json({
				status:"0",
				msg:"",
				goods:{
					count:doc.length,
					goodsList:doc
				}
			})
		}
	})
});

//加入购物车
router.post("/addCart", function (req,res,next) {
  var userId = req.cookies.userId,goodsId = req.body.goodsId;
  var User = require('../models/users');
  User.findOne({userId:userId}, function (err,userDoc) {
    if(err){
        res.json({
            status:"1",
            msg:err.message
        })
    }else{
        console.log("userDoc:"+userDoc);
        if(userDoc){
          var goodsItem = '';
          userDoc.cartLists.forEach(function (item) {
              if(item.goodsId == goodsId){
                goodsItem = item;
                item.goodsBuyNum ++;
              }
          });
          if(goodsItem){
            userDoc.save(function (err2,doc2) {
              if(err2){
                res.json({
                  status:"1",
                  msg:err2.message
                })
              }else{
                res.json({
                  status:'0',
                  msg:'',
                  result:'suc'
                })
              }
            })
          }else{
            Goods.findOne({goodsId:goodsId}, function (err1,doc) {
              if(err1){
                res.json({
                  status:"1",
                  msg:err1.message
                })
              }else{
                if(doc){
                  doc.goodsBuyNum = 1;
                  doc.checked = 1;
                  userDoc.cartLists.push(doc);
                  userDoc.save(function (err2,doc2) {
                    if(err2){
                      res.json({
                        status:"1",
                        msg:err2.message
                      })
                    }else{
                      res.json({
                        status:'0',
                        msg:'',
                        result:'suc'
                      })
                    }
                  })
                }
              }
            });
          }
        }
    }
  })
});


router.get('/lists',(req,res,next)=>{
  	Goods.find({},(err,data)=>{
    	res.status(200).json(data)
  	})
})

router.get('/goodsOne',(req,res,next)=>{
  	var path=req.query;
  	Goods.findOne(path,(err,data)=>{
    	res.status(200).json(data)
  	})
})

//搜索框
router.get('/searchPa',(req,res)=>{
    var title=req.query.title;
    var reg = new RegExp(title,'i');
    console.log(title);
    Goods.find({
      $or:[
        { goodsChName: {$regex : reg} }
      ]
    }).then((data)=>{
      console.log(data);
    res.send({
      code:1,
      data:data
    })
  })
})

// router.get('/searchPa',(req,res)=>{
//     var title=req.query.title;
//     var reg = new RegExp(title,'i');
//     console.log(title);
//     Goods.find({
//       $or:[
//         { title: {$regex : reg} }
//       ]
//     },(err,doc)=>{
//       if(err){
//         throw err;
//       }else{
//         console.log(doc);
//         // if(doc){
//         //   res.send({
//         //     code:1,
//         //     data:doc
//         //   })
//         // }
//       }
//     })
// })
module.exports = router;