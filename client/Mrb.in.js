//Collections

PastesLinks = new Mongo.Collection("pastesLinks"); //connection to Group Collection //Do NOT declare as var, it will override the server one

//Events

Template.header.events({
	"click #submitPaste": function (event) {
	// Grab paste's text from text field
	var blob = editor.getValue(); 
	var titlePaste = document.getElementById('pasteName').value;
	var langPaste = document.getElementById('selectLanguage');
	var key = "";
	langPaste = langPaste.options[langPaste.selectedIndex].value;
	// Check that text field is not blank before adding paste
	if (blob !== '' && titlePaste !== '') {
		if(Session.get("isPasteEncrypted") === true){
			var s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
			key = Array(6).join().split(',').map(function() { return s.charAt(Math.floor(Math.random() * s.length)); }).join('');
			blob = sjcl.encrypt(key, blob);
		}
		Meteor.call("addPaste", blob, titlePaste, langPaste, getCookie("auth"), Session.get("isPasteEncrypted"), function (err, response) {
			if (err) {console.log(err);}
			document.getElementById("tools").classList.add("hideSlow");
			//document.getElementById('submitPaste').classList.add("ready");
			NProgress.configure({ easing: 'ease', speed: 500 });
			NProgress.start();
			NProgress.inc();
			setTimeout(function(){
				NProgress.done();
				takeMeToPaste(response[0], key); //redirect user
			},2000);
		}); //call server-side method addPaste
	}
	// Clear the text field for next entry
	// event.target.paste.value = "";
	// Prevent default form submit
	return false;
	}
});

Template.header.events({
	"click .new-download": function (event) {	
		downloadBlob(Session.get("pasteTitle"), Session.get("pasteText"));
	},
	"click .new-fork": function (event) {	
		Session.set("isHome",true);
		Session.set("isPaste",false);
		document.getElementsByClassName("tooltip")[0].classList.remove("show");
	},
	"click .copyPasteUrl": function (event) {
		startToast(2000, "Adress has been copied to the clipboard", "Go and paste");
	},
	"change #selectLanguage": function (event) {
		editor.getSession().setMode("ace/mode/" + event.target.value);
	},
	"click #tools": function (event) {
		slideout.toggle();
		document.getElementsByClassName("tooltip")[0].classList.remove("show");
	},
	"click #encryptPaste": function (event) {
		if(Session.get("isPasteEncrypted") === false){
			Session.set("isPasteEncrypted", true);
			document.getElementById("encryptPaste").classList.add("button-success");
		}else {
			Session.set("isPasteEncrypted", false);
			document.getElementById("encryptPaste").classList.remove("button-success");
		}
	}
});

//Helpers

Template.registerHelper("homePage", function() {return Session.get("isHome");});

Template.registerHelper("homePaste", function() {return Session.get("isPaste");});

Template.registerHelper("siteName", function() {return Session.get("siteName");});

Template.header.helpers({
	title : function() {return Session.get("pasteTitle");},
	pasteName : function() {return Session.get("pasteName");},
	pasteUrl : function() {return window.location.href;},
	lang : function () {return Session.get("pasteLang");}
});

Template.body.helpers({
	homeRaw : function() {return Session.get("isRaw");}
});

Template.raw.helpers({
	rawText : function() {return Session.get("pasteText");}
});

Template.slideout.helpers({
	userPastesLoaded : function () {return Session.get("userPastesLoaded");},
	userPastes : function () {return Session.get("userPastes").userPastes;},
	name : function () {return this.name;},
	title : function () {return this.title;},
	lang : function () {return this.lang;}
});

Template.slideout.events ({
	"click .pure-menu-link": function (event) {
		slideout.close();
	}
});

//Startup

Meteor.startup(function() {
	siteName = "//" + window.location.host;
	Session.set("userPastesLoaded", false);
	Session.set("isPasteEncrypted", false);
	Session.set("siteName", siteName);
	new Clipboard('.copyPasteUrl');

	if(getCookie("auth") !== undefined){
		console.log("Logged - Do not clear cookies");
	}else{
		console.log("Logging in ..");
		setCookie();
	}
	Session.set("auth", getCookie("auth"));
	document.onkeydown = KeyPress;
	$("textarea").keydown(function(e){
		KeyPress(e);
	});
	Meteor.call("getUserPastes", Session.get("auth"), function (err, response){
		if(err) {console.log(err);}
		if(response === 1) {
			console.log("A server error has occurred");
		}else{
			Session.set("userPastesLoaded", true);
			Session.set("userPastes", response);
		}
	});


	/*Tracker.autorun(function() {
		FlowRouter.watchPathChange();
		var currentContext = FlowRouter.current();
		console.log(currentContext);
		//if(currentContext.route.name == "pastes") {Session.set("isHome", false);}
		//if(currentContext.route.name == "home") {Session.set("isPaste", false);}
	});*/
});
