var fs = Npm.require('fs');
var path = Npm.require( 'path' );
var __ROOT_APP_PATH__ = fs.realpathSync('../../../../..'); //current path
var pastesPath = path.join(__ROOT_APP_PATH__,"private/pastes");
var s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789£$&^"; //allowed char for paste's name

if(!fs.existsSync(pastesPath)){
	fs.mkdirSync(pastesPath, 0766, function(err){
		if(err){ 
			console.log(err);
			response.send("ERROR! Can't make the directory! \n");    // echo the result back
		}
	});
}	
var PastesLinks = new Mongo.Collection("pastesLinks"); //connection to Group Collection //var=> not sharable

Meteor.methods({ //called by Clients
	addPaste: function (blob, title) {
		var pasteName = Array(7).join().split(',').map(function() { return s.charAt(Math.floor(Math.random() * s.length)); }).join('');
		var filePath = path.join(pastesPath, pasteName + ".txt");
		var buffer = new Buffer( blob );
		fs.writeFileSync( filePath, buffer );
		PastesLinks.insert({
			link: filePath,
			title: title,
			createdAt: new Date(),
			owner: Meteor.uuid(),
			ip: this.connection.clientAddress
		});
	},
	getPaste: function (pasteName) {
		var paste = Assets.getText("pastes/" + pasteName + ".txt"); //Assets read from /private/
		return paste;
	}
});