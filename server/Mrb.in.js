var fs = Npm.require('fs');
var path = Npm.require( 'path' );
var config = JSON.parse(Assets.getText("path.json"));

if (config["which"] == "server") {
	var __ROOT_APP_PATH__ = fs.realpathSync(config["pathAdjustment"]);
}else if (config["which"] == "local") {
	var __ROOT_APP_PATH__ = fs.realpathSync(config["pathAdjustmentTest"]);
}

var pastesPath = path.join(__ROOT_APP_PATH__, "/pastes/");
console.log("pastes are saved in: " + pastesPath);
var s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789£$&^"; //allowed char for paste's name
var pastesNameLenght = 7;
var PastesLinks = new Mongo.Collection("pastesLinks"); //connection to Group Collection //var=> not sharable


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
	addPaste: function (blob, title, lang, author) {
		var pasteInfo = [];
		var pasteName = Array(pastesNameLenght).join().split(',').map(function() { return s.charAt(Math.floor(Math.random() * s.length)); }).join('');
		var filePath = path.join(pastesPath, pasteName + ".txt");
		var buffer = new Buffer( blob );
		fs.writeFileSync( filePath, buffer);
		PastesLinks.insert({
			link: filePath,
			title: title,
			name: pasteName,
			createdAt: new Date(),
			owner: author,
			language: lang,
			ip: this.connection.clientAddress
		});
		pasteInfo.push(pasteName);
		return pasteInfo;
	},
	getPaste: function (pasteName) {
		try{
			var pasteInfo = {}; //EJSON to return to the client
			pasteName = pasteName.replace(/\.\./g,"").replace(/\//g,"").replace(/ /g,"").replace(/\n/g,"").replace(/\v/g,"").replace(/\f/g,""); //sanitize
			pasteName = pasteName.trunc(pastesNameLenght); //truncation
			pastePath = path.join(pastesPath, pasteName + ".txt")
			pasteInfo.text = fs.readFileSync(pastePath , 'utf8'); //Assets read from /private/
			pasteInfoFromDb = PastesLinks.findOne({name: ""+pasteName});
			pasteInfo.title = pasteInfoFromDb.title;
			pasteInfo.lang = pasteInfoFromDb.language;
			return pasteInfo;
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
	}
});
