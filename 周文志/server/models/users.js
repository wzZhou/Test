var mongoose =require('mongoose')
var Schema =mongoose.Schema;

var usersSchema = new Schema({
	userId:String,
	password:String,
	userName:String,
	telmail:String,
	orderLists:Array,
	cartLists:[
		{
			goodsId:String,
			goodsChName:String,
			goodsColor:String,
			goodsPrice:String,
			goodsImg:String,
			goodsBuyNum:String,
			checked:String
		}
	],
	addressLists:[
    	{
      		addressId: String,
      		userName: String,
      		addressName: String,
      		postId: Number,
      		tel: Number,
      		isDefault: Boolean
    	}
  	],
  	userInfoList:{
		tel:String,
		mail:String,
		userNames:String,
		userInfoId:String	
	},
	userNames:String
});

module.exports =mongoose.model('User',usersSchema,'users');