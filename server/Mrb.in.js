var fs = Npm.require('fs');
var path = Npm.require( 'path' );
var config = JSON.parse(Assets.getText("path.json"));

if (config.which == "server") {
	var __ROOT_APP_PATH__ = fs.realpathSync(config.pathAdjustment);
}else if (config.which == "local") {
	var __ROOT_APP_PATH__ = fs.realpathSync(config.pathAdjustmentTest);
}

var pastesPath = path.join(__ROOT_APP_PATH__, "/pastes/");
console.log("pastes are saved in: " + pastesPath);
var s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789£$&^"; //allowed char for paste's name
var pastesNameLenght = 7;
var PastesLinks = new Mongo.Collection("pastesLinks"); //connection to Group Collection //var=> not sharable
var BookMarks = new Mongo.Collection("bookamrks");

if(!fs.existsSync(pastesPath)){
	fs.mkdirSync(pastesPath, 0766, function(err){
		if(err){ 
			console.log(err);
			response.send("ERROR! Can't make the directory! \n");    // echo the result back
		}
	});
}

String.prototype.trunc = String.prototype.trunc ||
	function(n){
		return this.length>n ? this.substr(0,n) : this;
	};

Meteor.methods({ //called by Clients
	addPaste: function (blob, title, lang, author, isEncrypted, isForked, forkedForm, isBookmarked) {
		try{
			var pasteInfo = [];
			if(isBookmarked != true) {isBookmarked = false;}
			var pasteName = Array(pastesNameLenght).join().split(',').map(function() { return s.charAt(Math.floor(Math.random() * s.length)); }).join('');
			var filePath = path.join(pastesPath, pasteName + ".txt");
			var buffer = new Buffer( blob );
			fs.writeFileSync( filePath, buffer);
			if(forkedForm === undefined) {forkedForm = "none"} //Check...
			PastesLinks.insert({
				link: filePath,
				title: title,
				name: pasteName, //the name of the txt(random)
				createdAt: new Date(),
				owner: author,
				language: lang,
				ip: this.connection.clientAddress,
				isEncry: isEncrypted,
				isFork: isForked,
				originalPaste: forkedForm,
				isBookmark: isBookmarked,
				timesViewed: 1
			});
			pasteInfo.push(pasteName);
			return pasteInfo;
		}catch(e){
			console.log(e);
		}
	},
	addBookmark : function (pasteUrl, pasteTitle, auth) {
		try{
			BookMarks.insert({
				bookmarkLink: pasteUrl,
				bookmarkTitle: pasteTitle,
				createdAt: new Date(),
				owner: auth
			});
		}catch(e){
			console.log(e);
		}
	},
	updatePaste: function (blob, title, pasteId, author) {
		try{
			var pasteToUpdate = PastesLinks.findOne({title: title, _id: pasteId, owner:author}).link;
			if(pasteToUpdate){
				var buffer = new Buffer( blob );
				fs.writeFileSync( pasteToUpdate, buffer);
			}
		}catch(e){
			console.log(e);
		}
	},
	deletePaste: function (pasteId, author) {
		try{
			var pasteToRename = PastesLinks.findOne({_id: pasteId, owner:author}).link; //i will rename it, not deleting
			if(pasteToRename){
				PastesLinks.remove({_id: pasteId, owner:author});
				fs.rename(pasteToRename, pasteToRename + ".R", function(err){
					if ( err ) console.log('ERROR: ' + err);
				});
			}
		}catch(e){
			console.log(e);
		}
	},
	deleteBookmark: function (bookmarkId, author) {
		try{
			BookMarks.remove({_id: bookmarkId, owner:author});
		}catch(e){
			console.log(e);
		}
	},
	getPaste: function (pasteName) {
		try{
			var pasteInfo = {}; //EJSON to return to the client
			pasteName = pasteName.replace(/\.\./g,"").replace(/\//g,"").replace(/ /g,"").replace(/\n/g,"").replace(/\v/g,"").replace(/\f/g,""); //sanitize
			pasteName = pasteName.trunc(pastesNameLenght); //truncation
			pastePath = path.join(pastesPath, pasteName + ".txt");
			pasteInfo.text = fs.readFileSync(pastePath , 'utf8'); //Assets read from /private/
			PastesLinks.update({name: ""+pasteName}, {$inc: {timesViewed: 1} });
			pasteInfoFromDb = PastesLinks.findOne({name: ""+pasteName});
			pasteInfo.title = pasteInfoFromDb.title;
			pasteInfo.lang = pasteInfoFromDb.language;
			pasteInfo.isEncry = pasteInfoFromDb.isEncry;
			pasteInfo.isFork = pasteInfoFromDb.isFork;
			pasteInfo.isBookmark = pasteInfoFromDb.isBookmark;
			pasteInfo._id = pasteInfoFromDb._id;
			pasteInfo.numbersOfViews = pasteInfoFromDb.timesViewed;
			return pasteInfo; //I send only public infos
		}catch(e){
			console.log(e);
			return 1;
		}
	},
	getUserPastes: function (userName) {
		try{
			var userPastes = {};
			userPastes.userPastes = PastesLinks.find({owner: userName}).fetch();
			return userPastes;
		}catch(e){
			console.log(e);
			return 1;
		}
	},
	getUserBookmarks: function (userName) {
		try{
			var userBookmarks = {};
			userBookmarks.userBookmarks = BookMarks.find({owner: userName}).fetch();
			return userBookmarks;
		}catch(e){
			console.log(e);
			return 1;
		}
	}
});


var Strategies = new Mongo.Collection("strategies");


//CollectionAPI
// var Strategies = new Mongo.Collection("strategies");
// Strategies.insert({"b":1});
var re = new RegExp("^Str@(.*)[\r\n]*^Civ:?\s?(.*)[\r\n]*^Map:?\s?(.*)[\r\n]*Name:?\s?(.*)[\r\n]*Author:?\s?(.*)[\r\n]*^Icon:\s?(.*)", "m");

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

Meteor.startup(function(){
	// collectionApi = new CollectionAPI({
 //      authToken: undefined,              // Require this string to be passed in on each request
 //      apiPath: 'aoe2',          // API path prefix
 //      standAlone: false,                 // Run as a stand-alone HTTP(S) server
 //      allowCORS: true,                  // Allow CORS (Cross-Origin Resource Sharing)
 //      sslEnabled: false,                 // Disable/Enable SSL (stand-alone only)
 //      listenPort: 3000,                  // Port to listen to (stand-alone only)
 //      listenHost: undefined,
 //      timeOut: 12000
 //    });

 //    // Add the collection Players to the API "/players" path
 //    collectionApi.addCollection(Strategies, 'strategies', {
 //      // All values listed below are default
 //      authToken: undefined,                   // Require this string to be passed in on each request.
 //      authenticate: undefined, // function(token, method, requestMetadata) {return true/false}; More details can found in [Authenticate Function](#Authenticate-Function).
 //      methods: ['POST','GET'],  // Allow creating, reading, updating, and deleting
 //      before: {  // This methods, if defined, will be called before the POST/GET/PUT/DELETE actions are performed on the collection.
 //                 // If the function returns false the action will be canceled, if you return true the action will take place.
 //        POST: function(obj, requestMetadata, returnObject) {
 //        	if(obj.hasOwnProperty('content')){
 //        		var match = [];
 //        		match = re.exec(obj.content);
 //        		if(match !== null ){
	// 				obj.civ = match[2];
	// 				obj.map = match[3];
	// 				obj.title_declared = match[4];
	// 				obj.author = match[5];
	// 				obj.version = match[1];
	// 				obj.icon = match[6];
 //        			obj.created = new Date().valueOf();
 //        			obj.stars = 0;
 //        			obj.views = 0;
 //        			obj.downloaded = 0;
 //        			return true;
 //        		}else{
 //        			returnObject.statusCode = 406;
 //        			returnObject.body = {error: 'Invalid Strategy pattern'};
 //        			return false;
 //        		}
 //        	}else{
 //        		returnObject.statusCode = 500;
 //        		returnObject.body = {error: 'Generic error, haxor?'};
 //        		return false;
 //        	}
 //        },
 //        GET: function(objs, requestMetadata, returnObject) {
 //        	if((requestMetadata.query).hasOwnProperty("last")){ //to get last N elements
 //        		objs.sort(function(a, b) {return -a.created + b.created});
 //        		objs.splice(+requestMetadata.query.last);
 //        	}
 //        	objs.forEach(function(elem){
 //    			Strategies.update({_id:elem._id}, {$inc: {views: 1}});
 //    		});
 //        	return true;
 //        },
 //        PUT: undefined,//function(obj, newValues, requestMetadata, returnObject) {console.log("SDSpu")},
 //        DELETE: undefined//function(obj, requestMetadata, returnObject) {console.log("SDSd")}
 //      },
 //      after: {  // This methods, if defined, will be called after the POST/GET/PUT/DELETE actions are performed on the collection.
 //                // Generally, you don't need this, unless you have global variable to reflect data inside collection.
 //                // The function doesn't need return value.
 //        POST: undefined,//function() {console.log("After POST");},
 //        GET: undefined,//function() {console.log("After GET");},
 //        PUT: undefined,     // function() {console.log("After PUT");},
 //        DELETE: undefined   // function() {console.log("After DELETE");},
 //      }
 //    });

    // Starts the API server
    //collectionApi.start(); //Call: curl -v -H "Content-Type: application/json" http://localhost:3005/api/pastesLinks -d "{\"title\": \"John Smith\"}"

    //Restivus API
	var Api = new Restivus({
	    useDefaultAuth: true,
	    prettyJson: true,
	    apiPath: 'aoe/'
	  });	
	Api.addRoute('last/:end/:start', { // http://localhost:3000/aoe/last/10/0
		get: function () {
			var start = this.urlParams.start;
			var end = this.urlParams.end;
			if(start && end){
				check(+end, Match.Integer);
				check(+start, Match.Integer);
				console.log("get last");
				var data = Strategies.find().fetch();
				data.sort(function(a, b) {return -a.created + b.created});
	    		data = data.slice(+start,+end);
	    		return data;
	    	}
		}
	});
	Api.addRoute('starred/:end/:start', { // http://localhost:3000/aoe/last/10/0
		get: function () {
			var start = this.urlParams.start;
			var end = this.urlParams.end;
			if(start && end){
				check(+end, Match.Integer);
				check(+start, Match.Integer);
				console.log("get starred");
				var data = Strategies.find().fetch();
				data.sort(function(a, b) {return -a.stars + b.stars});
	    		data = data.slice(+start,+end);
	    		return data;
			}
		}
	});
	Api.addRoute('downloaded/:end/:start', { // http://localhost:3000/aoe/last/10/0
		get: function () {
			var start = this.urlParams.start;
			var end = this.urlParams.end;
			if(start && end){
				check(+end, Match.Integer);
				check(+start, Match.Integer);
				console.log("get downloaded");
				var data = Strategies.find().fetch();
				data.sort(function(a, b) {return -a.downloaded + b.downloaded});
	    		data = data.slice(+start,+end);
	    		return data;
			}
		}
	});
	Api.addRoute('stars/', { // http://localhost:3000/aoe/stars/55yM48hSF5ci7Qft6
							 // curl -X POST -H "Content-Type: application/json; charset=UTF-8" http://localhost:3000/aoe/stars -d {"id":"55yM48hSF5ci7Qft6"} 
	    post: function () {
	    	var id = this.bodyParams.id;
	    	console.log(id);
			check(id, String);
			id = escapeRegExp(id);
	    	console.log("starred");
	    	Strategies.update(id, {$inc: {stars: 1}});
	    	var b = !!Strategies.findOne(id);
	      	return b;
	    }
	  });
	Api.addRoute('download/', {
		post: function () {
			var id = this.bodyParams.id;
			check(id, String);
			id = escapeRegExp(id);
			console.log("downloaded");
			Strategies.update(id, {$inc: {downloaded: 1}});
	    	var b = !!Strategies.findOne(id);
	      	return b;
		}
	});
	Api.addRoute('delete/', {
		post: function () {
			var id = this.bodyParams.id;
			var author = this.bodyParams.xdab;
			check(id, String);
			check(author, String);
			id = escapeRegExp(id);
			author = escapeRegExp(author);
			console.log("deleted");
			Strategies.remove({_id: id, xdab: author});
	    	var b = !Strategies.findOne(id);
	      	return b;
		}
	});
	Api.addRoute('search/', {
		post: function () {
			var match = this.bodyParams.match;
			check(match, String);
			match = escapeRegExp(match);
			var re = new RegExp('.*'+match+'.*','i');
	    	var b = Strategies.find({'soup': re}).fetch();
	      	return b;
		}
	});
	Api.addCollection(Strategies, {
		endpoints: { 
			post: {  
				action: function () { //curl -v -H "Content-Type: application/json" http://localhost:3000/aoe/strategies -d '{"name":"Fast Castle","content":"Str@v1\nCiv: any\nMap: any\nName: Fast Castle \nAuthor: Naramsim\nIcon: castle\n\n- 6 on food [sheep]\n- 3 on wood [lumber]\n    + A R\n- house near boar [house]\n    + A Q\n- loom [tc]\n- boar [boar]\n- next vil on wood [lumber]\n- next vil on boar building a house [house]\n    + A Q\n- when out of boars berries and two farms [mill]\n    + A W, A A\n- click feudal with 21 vils [tc]\n    + H\n- take two on berries and switch them to gold [gold]\n    + A E\n- swich one on berries and palisade [palisade]\n    + S A\n- switch two on berries to a new lumbercamp [lumber]\n    + A R\n- when feudal no upgrades [tc]\n- one vil build blacksmith and market afterward [market]\n    + A S, A D\n- click when 800Food and 200Gold [tc]"}'
					var obj = this.bodyParams;
					if(obj.hasOwnProperty('content') && obj.hasOwnProperty('xdab')){
						var match = [];
						match = obj.content.match(re);
						if(match !== null ){
							obj.civ = match[2].trim().substring(0,15);
							obj.map = match[3].trim().substring(0,15);
							obj.title_declared = match[4].trim().substring(0,15);
							obj.author = match[5].trim().substring(0,15);
							obj.version = match[1].trim().substring(0,2);
							obj.icon = match[6].trim().substring(0,15);
							obj.created = new Date().valueOf();
							obj.stars = 0;
							obj.views = 0;
							obj.downloaded = 0;
							obj.soup = obj.civ + " " + obj.map + " " + obj.title_declared + " " + obj.author + " " + obj.version;
							check(obj.civ, String);
							check(obj.map, String);
							check(obj.title_declared, String);
							check(obj.author, String);
							check(obj.version, String);
							check(obj.icon, String);
							Strategies.insert(obj);
							return {
					          statusCode: 200,
					          body: {status: 'Success', message: 'GG'}
					        };
						}else{
							return {
					          statusCode: 409,
					          body: {status: 'Invalid', message: 'Check the pattern'}
					        };
						}
					}else{
						return {
				          statusCode: 409,
				          body: {status: 'Invalid', message: 'Are you crafting?'}
				        };
					}
				}
			},
			put: {
				action: function(){
					return "PUT";
				}
			},
			delete: {
				action: function(){
					return false;
				}
			}
		}
	});
	console.log("Restivus has been started");
});

