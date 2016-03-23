//Collections

//PastesLinks = new Mongo.Collection("pastesLinks"); //connection to Group Collection //Do NOT declare as var, it will override the server one

//Events

Template.header.events({
	"click #submitPaste": function (event) {
	// Grab paste's text from text field
	uploadBlob(0);
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
		Session.set("isHome", true);
		Session.set("isPaste", false);
		Session.set("isFork", true);
		document.getElementsByClassName("tooltip")[0].classList.remove("show");
		setTimeout(function(){
			document.getElementById("pasteName").focus();
		document.getElementById("selectLanguage").value = Session.get("pasteLang");
		},300);
	},
	"click .new-bookmark": function (event) {
		if(Session.get("userBookmarksLinks").indexOf(Session.get("pasteName")) === -1){
			bookmarkPaste();
			Notify.startToast(2000, "Click Manage to view the saved paste", "Saved");
		}else{
			Notify.startToast(2000, "This paste is already in your files", "OPS..")
		}
	},
	"click .copyPasteUrl": function (event) {
		Notify.startToast(2000, "Adress has been copied to the clipboard", "Go and paste");
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
	lang : function () {return Session.get("pasteLang");},
	isFork : function () {return Session.get("isForked");}
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
	lang : function () {return this.lang;},
	isFork : function () {return this.isFork;},
	forkedFrom : function () {return this.originalPaste;},
	pasteUrl : function () {return window.location.host + "/pastes/" + this.name},
	_id : function () {return this._id},

	userBookmarks : function () {return Session.get("userBookmarks").userBookmarks;},
	bookmarkLink : function () {return this.bookmarkLink;},
	bookmarkTitle : function () {return this.bookmarkTitle;},
	_id : function () {return this._id}
});

Template.slideout.events ({
	"click .pure-menu-link": function (event) {
		slideout.close();
	},
	"click .copyPasteUrl": function (event) {
		Notify.startToast(2000, "Adress has been copied to the clipboard", "Go and paste");
	},
	"click .delete-paste": function (event) {
		deletePaste(event.toElement.attributes["data-attr"].nodeValue);
	},
	"click .delete-bookmark": function (event) {
		deleteBookmark(event.toElement.attributes["data-attr"].nodeValue);
	}
});

//Startup

Meteor.startup(function() {
	siteName = "//" + window.location.host;
	Session.set("userPastesLoaded", false);
	Session.set("isPasteEncrypted", false);
	Session.set("isFork", false);
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

	loadUserPastes();
	loadUserBookmarks();
	

	/*Tracker.autorun(function() {
		FlowRouter.watchPathChange();
		var currentContext = FlowRouter.current();
		console.log(currentContext);
		//if(currentContext.route.name == "pastes") {Session.set("isHome", false);}
		//if(currentContext.route.name == "home") {Session.set("isPaste", false);}
	});*/
});

window.onbeforeunload = savePaste;
