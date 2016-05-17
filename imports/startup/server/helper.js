import { Meteor } from 'meteor/meteor';
import { vars } from '/imports/startup/server/vars.js';
var fs = Npm.require('fs');
var path = Npm.require('path');

if(Meteor.isServer){
    sanitizePath = function(path) {
        return path.replace(/[\.\\\/\n\v\f]/g,"");
    };

    createPasteDir = function() {
    	try{
	    	if(!fs.existsSync(vars.pastesPath)){
				fs.mkdirSync(vars.pastesPath, 0766, function(err){
					if(err){ 
						console.log(err);
					}
				});
			}
		}catch(e){console.log(e);}
    };

    trunc = function(string, n) {
		return string.length>n ? string.substr(0,n) : string;
	};

	generateRandomString = function () {
		return Array(vars.pastesNameLenght).join().split(',').map(function() { return vars.allowedChars.charAt(Math.floor(Math.random() * vars.allowedChars.length)); }).join('');
	}

	escapeRegExp = function(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}
}
