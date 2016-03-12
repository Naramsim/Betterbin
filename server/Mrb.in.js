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

//Restivus API
// var Api = new Restivus({
// 	version: "v1",
//     useDefaultAuth: true,
//     prettyJson: true,
//     defaultHeaders: {
//       'Content-Type': 'application/json'
//     },
//     apiPath: 'aoe2/'
//   });	
var Strategies = new Mongo.Collection("strategies");
// Api.addCollection(my);
// Api.addRoute('articles', {
//     get: function () {
//     	console.log("HH")
//       return true
//     }
//   });
// console.log("HI")

//CollectionAPI
// var Strategies = new Mongo.Collection("strategies");
// Strategies.insert({"b":1});
Meteor.startup(function(){
	collectionApi = new CollectionAPI({
      authToken: undefined,              // Require this string to be passed in on each request
      apiPath: 'aoe2',          // API path prefix
      standAlone: true,                 // Run as a stand-alone HTTP(S) server
      allowCORS: true,                  // Allow CORS (Cross-Origin Resource Sharing)
      sslEnabled: false,                 // Disable/Enable SSL (stand-alone only)
      listenPort: 3005,                  // Port to listen to (stand-alone only)
      listenHost: undefined,
      timeOut: 120000
    });

    // Add the collection Players to the API "/players" path
    collectionApi.addCollection(Strategies, 'strategies', {
      // All values listed below are default
      authToken: undefined,                   // Require this string to be passed in on each request.
      authenticate: undefined, // function(token, method, requestMetadata) {return true/false}; More details can found in [Authenticate Function](#Authenticate-Function).
      methods: ['POST','GET','PUT','DELETE'],  // Allow creating, reading, updating, and deleting
      before: {  // This methods, if defined, will be called before the POST/GET/PUT/DELETE actions are performed on the collection.
                 // If the function returns false the action will be canceled, if you return true the action will take place.
        POST: function(obj, requestMetadata, returnObject) {console.log("SDSp");return true;},
        GET: undefined,//function(objs, requestMetadata, returnObject) {console.log("SDSg")},
        PUT: undefined,//function(obj, newValues, requestMetadata, returnObject) {console.log("SDSpu")},
        DELETE: undefined//function(obj, requestMetadata, returnObject) {console.log("SDSd")}
      },
      after: {  // This methods, if defined, will be called after the POST/GET/PUT/DELETE actions are performed on the collection.
                // Generally, you don't need this, unless you have global variable to reflect data inside collection.
                // The function doesn't need return value.
        POST: undefined,//function() {console.log("After POST");},
        GET: undefined,//function() {console.log("After GET");},
        PUT: undefined,     // function() {console.log("After PUT");},
        DELETE: undefined   // function() {console.log("After DELETE");},
      }
    });

    // Starts the API server
    collectionApi.start(); //Call: curl -v -H "Content-Type: application/json" http://localhost:3005/api/pastesLinks -d "{\"title\": \"John Smith\"}"
});

