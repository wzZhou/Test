var mongoose =require('mongoose')
var Schema =mongoose.Schema;

var activitysSchema = new Schema({
	activityName:String,
	comment :String,
	stars: Array,
	topGoodsList: Array,
	bottomGoodsList: Array
});

module.exports =mongoose.model('Activity',activitysSchema,'activitys');