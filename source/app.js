// Author : rainygirl : rainygirl.com
// Thanks to : Mr. Kim Jae Jin & Dojisa. Kim Moon Soo
// License : GPL

var express = require('express');
var mongo = require('mongodb');
var twitter = require('ntwitter');
var credentials = require('./credentials.js');

var twit = function(){
	return new twitter({
		consumer_key: credentials.consumer_key,
		consumer_secret: credentials.consumer_secret,
		access_token_key: credentials.access_token_key,
		access_token_secret: credentials.access_token_secret
	});
}

var app = module.exports = express.createServer();

process.on('uncaughtException', function(err) {
	console.log(err);
});

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.set('view options', { layout: false });
	app.set('root', __dirname)

	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});

var DBconn=function(){ return new mongo.Db('coroke_db', new mongo.Server('localhost',27017,{}),{}); }

var streamTwitter=function(){
	var t=twit();
	var dbStream=DBconn();
	console.log('stream call');
	t.getHomeTimeline({count:200},function(err,datas){
		if(datas==null)  {console.log('stream null'); return;}
		console.log('stream got '+datas.length+' items');
		dbStream.open(function(){
			dbStream.collection('albaTwitter',function(err,collectionTwitter){
				for(var i=datas.length-1;i>=0;i--) {
					collectionTwitter.find({idstr:datas[i].id_str.toString()},{},function(err,cursor){
						var tweet=datas[i];
						cursor.toArray(function(err,existitems) {
							if(existitems != null && existitems.length>0) return;
							var now=new Date(tweet.created_at);
							collectionTwitter.insert({account:tweet.user.screen_name,idstr:tweet.id_str.toString(),text:tweet.text,created_at:now,hour:now.getHours(),day:now.getDay()},function(err,ditem){
								console.log('added : '+ ditem[0].idstr+'/'+ditem[0].account+'/'+ditem[0].text);
							});
						});
						if (i==0) dbStream.close();
					});
				}
			});
		});	
	});
	setTimeout(function(){streamTwitter();},120000);
}

var ALBAroot = function(req,res) {
	db=DBconn();
	db.open(function(){
		db.collection('albaKeyword',function(err,collection){
			collection.find({},{},function(err,cursor){
				cursor.toArray(function(err,keywords){
						if (keywords == null) keywords=[];
						res.render('alba',{'keywords':keywords});
						res.end();
						db.close();
						return ;
				});
			});
		});
	});
}

var ALBAgetKeyword = function(req,res) {
	db=DBconn();
	db.open(function(){
		db.collection('albaAccount',function(err,collection){
			collection.find({'keyword':req.query.keyword},{},function(err,cursor){
				cursor.toArray(function(err,accounts) {
					ors=[];
					for(var i=accounts.length-1;i>=0;i--) {
						ors.push({account:accounts[i].account})
					}
					db.collection('albaTwitter',function(err,collectionTwitter){
						collectionTwitter.find({$or:ors},{},{sort:{idstr:-1}},function(err,cursor) {
							cursor.toArray(function(err,tweets) {
								res.send(JSON.stringify({tweets:tweets,accounts:accounts}));
								res.end();
								db.close();
							});
						});
					});
				});
			});
		});
	});
}

var ALBApostKeyword = function(req,res) {
	db=DBconn();
	db.open(function(){
		db.collection('albaKeyword',function(err,collection){
			collection.find({'keyword':req.body.keyword},{},function(err,cursor){
				cursor.toArray(function(err,keywords){
					if(keywords.length==0) {
						collection.insert({'keyword':req.body.keyword},function(){
							res.send(JSON.stringify({'result':'ok'}));
							db.close();
						});
					} else {
						res.send(JSON.stringify({'result':'error'}));
						db.close();
					}
				});
			});
		});
	});
}

var ALBApostAccount = function(req,res) {
	db=DBconn();
	db.open(function(){
		db.collection('albaAccount',function(err,collectionAccount){
			var account=req.body.account.replace('http://','').replace('https://','').replace('twitter.com','').replace('/','').replace('!','').replace('#','').replace('@','');
			collectionAccount.find({keyword:req.body.keyword,account:account},{},function(err,cursor) {
				cursor.toArray(function(err,accounts){
					if(accounts.length!=0) {
						res.send(JSON.stringify({'result':'error','error_type':'exist','data':accounts}));
						db.close();
					}
					db.collection('albaTwitter',function(err,collectionTwitter){
						var account=req.body.account.replace('http://','').replace('https://','').replace('twitter.com','').replace('/','').replace('!','').replace('#','').replace('@','');
						var t=twit();
						t.createFriendship(account,{},function(err,dat){
							t.getUserTimeline({user_id:dat.id}, function(err, data) {
								var cnt=data.length;
								if(cnt==0) {
									res.send(JSON.stringify({'result':'error','error_type':'exist','errorposition':2,'data':data}));
									db.close();
								}
								collectionAccount.insert({'keyword':req.body.keyword,'account':account,'id_str':dat.id,'description':dat.description,'nickname':dat.screen_name},function(){
									for (var i=0;i<cnt;i++) {
										collectionTwitter.insert({'account':account,'idstr':data[i].id_str.toString(),'text':data[i].text,'created_at':new Date(data[i].created_at)});
									}
									res.send(JSON.stringify({'result':'ok','tweets':data,'nickname':dat.screen_name}));
									db.close();
								});
							});
						});
					});
				});
			});
		});
	});
	return;
}

app.get('/', ALBAroot);
app.post('/', ALBAroot);
app.post('/alba/keyword', ALBApostKeyword);
app.post('/alba/account', ALBApostAccount);
app.get('/alba/keyword', ALBAgetKeyword);

streamTwitter();
app.listen(8124);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

