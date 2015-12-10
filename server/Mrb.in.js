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
