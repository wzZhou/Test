var mongoose =require('mongoose')
var Schema =mongoose.Schema;

var goodsSchema = new Schema({
	goodsId:String,
	goodsEnName:String,
	goodsChName:String,
	goodsStar:Number,
	changeColor:Array,
	goodsType:String,
	goodsImg:String,
	goodsKind:String,
	goodsDes:String,
	goodsBigName:String,
	goodsDetailImg:Array,
	goodsBuyNum:String,
	checked:String
});

module.exports =mongoose.model('Good',goodsSchema,'goods');