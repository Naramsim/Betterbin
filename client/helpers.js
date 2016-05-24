//Templates

Template.registerHelper("homePage", function() {return Session.get("isHome");});

Template.registerHelper("homePaste", function() {return Session.get("isPaste");});

Template.registerHelper("homeEmbed", function() {return Session.get("isEmbed");});

Template.registerHelper("siteName", function() {return Session.get("siteName");});

Template.header.events({
	"click #submitPaste": function (event) {
		uploadBlob(0);
		return false;
	},
	"click .new-embed": function (event) {
		Session.set("iframeHeight", editor.session.getLength() * 14 + 48 + 22);
		showEmbedDialog();
	},
	"click .new-download": function (event) {	
		downloadBlob(Session.get("pasteTitle"), Session.get("pasteText"));
	},
	"click .new-fork": function (event) {
		Session.set("isHome", true);
		Session.set("isPaste", false);
		Session.set("isFork", true);
		Session.set("isPasteEncrypted", false);
		Session.set("isPasteHided", false);
		document.getElementsByClassName("tooltip")[0].classList.remove("show");
		setTimeout(function(){
			document.getElementById("pasteName").focus();
		document.getElementById("selectLanguage").value = Session.get("pasteLang");
		},300);
	},
	"click .new-bookmark": function (event) {
		if(!BookMarks.find({bookmarkLink: Session.get("pasteName")}).fetch().length){
			bookmarkPaste();
			Notify.startToast(2000, "Click Manage to view the saved paste", "Saved");
		}else{
			Notify.startToast(2000, "This paste is already in your files", "OPS..");
		}
	},
	"click .copyPasteUrl": function (event) {
		Notify.startToast(2000, "Adress has been copied to the clipboard", "Go and paste");
	},
	"change #selectLanguage": function (event) {
		var lang = checkFramework(event.target.value);
		editor.getSession().setMode("ace/mode/" + lang);
		setLocalLang(event.target.value);
	},
	"click #tools": function (event) {
		slideout.toggle();
		document.getElementsByClassName("tooltip")[0].classList.remove("show");
	},
	"click #encryptPaste": function (event) {
		if(Session.get("isPasteEncrypted") === false){
			Session.set("isPasteEncrypted", true);
			Session.set("isPasteHided", true);
			document.getElementById("encryptPaste").classList.add("button-success");
			document.getElementById("hidePaste").classList.add("button-success");
		}else {
			Session.set("isPasteEncrypted", false);
			document.getElementById("encryptPaste").classList.remove("button-success");
		}
	},
	"click #hidePaste": function (event) {
		if(Session.get("isPasteHided") === false){
			Session.set("isPasteHided", true);
			document.getElementById("hidePaste").classList.add("button-success");
		}else{
			Session.set("isPasteHided", false);
			document.getElementById("hidePaste").classList.remove("button-success");
		}
	}
});

Template.header.helpers({
	title: function() {return Session.get("pasteTitle");},
	pasteName: function() {return Session.get("pasteName");},
	pasteUrl: function() {return window.location.href;},
	isFork: function () {return Session.get("isForked");}
});

Template.userpastes.helpers({
	userPastesLoaded: function () {return Session.get("userPastesLoaded");},
	userPastes: function () {return Session.get("userPastes").userPastes;},
	hasImgOrVect: function (){
							var tthis = this;
							var lang = Session.get("langList").filter(function(f){
								return f.name === tthis.language 
							})[0];
							if(!!lang){
								return lang.icon !== "null" || lang.vect !== "null";
							}else {return false;}
	},
	langImg: function () {
							var tthis = this;
							var icon = Session.get("langList").filter(function(f){
								return f.name === tthis.language
							})[0].icon;
							return icon !== "null" ? icon : false;
	},
	langVect: function () {
							var tthis = this;
							var vect = Session.get("langList").filter(function(f){
								return f.name === tthis.language
							})[0].vect;
							return vect !== "null" ? vect : false;
	},
	forkedFrom: function () {return this.originalPaste;},
	pasteUrl: function () {return window.location.host + "/pastes/" + this.name;},
	encryptionKey: function () {
		if (localStorage.getItem(this.name) !== null) {
			return localStorage.getItem(this.name);
		} else {return "";}
	},
	userBookmarks: function () {return BookMarks.find();}
});

Template.userpastes.events ({
	"click .pure-menu-link": function (event) {
		slideout.close();
	},
	"click .copyPasteUrl": function (event) {
		Notify.startToast(2000, "Adress has been copied to the clipboard", "Go and paste it");
	},
	"click .delete-paste": function (event) {
		deletePaste(event.toElement.attributes["data-attr"].nodeValue);
	},
	"click .delete-bookmark": function (event) {
		deleteBookmark(event.toElement.attributes["data-attr"].nodeValue);
	}
});

Template.footer.helpers({
	lang: function () {return Session.get("pasteLang");},
	cursor: function () {var b = Session.get("cursorPosition"); b.row++; return b;},
	length: function () {return Session.get("length");},
	rangeLength: function () {return Session.get("rangeLength");},
	selectionRowRange: function () {var b = Session.get("selectionRowRange"); return ++b;},
	selectionIsMoreThanOneLine: function () {return (Session.get("selectionRowRange")>0);},
	latestPastes: function () {
		return PastesLinks.find({}, {limit: 4, sort: {createdAt: -1}}).fetch();
	}
});

Template.languages.helpers({
	langListReady: function() {return Session.get("langListReady");},
	langList: function() {return Session.get("langList");}
	//lastLang: function() {return Session.get("lastLang") === this.name}
});

Template.languages.onRendered(function(){
	setTimeout(function(){
		if(Session.get("lastLang") !== null){
			document.getElementById("selectLanguage").value = Session.get("lastLang");
		}
	},300);
});

Template.embed.helpers({
	pasteTitle: function() {return Session.get("pasteTitle");},
	pasteText: function() {return Session.get("pasteText");},
	pasteLang: function() {return Session.get("pasteLang");},
	pasteName: function() {return Session.get("pasteName");},
	hasImgOrVect: function (){
							var lang = Session.get("langList").filter(function(f){
								return f.name === Session.get("pasteLang"); 
							})[0];
							if(!!lang){
								return lang.icon !== "null" || lang.vect !== "null";
							}else {return false;}
	},
	langImg: function () {
							var icon = Session.get("langList").filter(function(f){
								return f.name === Session.get("pasteLang");
							})[0].icon;
							return icon !== "null" ? icon : false;
	},
	langVect: function () {
							var vect = Session.get("langList").filter(function(f){
								return f.name === Session.get("pasteLang");
							})[0].vect;
							return vect !== "null" ? vect : false;
	},
});

Template.embedDialog.helpers({
	pasteName: function() {return Session.get("pasteName");},
	iframeHeight: function() {return Session.get("iframeHeight");}
});

Template.embedDialog.events({
	"click .iframeCopy": function (event) {
		Notify.startToast(2000, "Iframe has been copied to the clipboard", "Go and paste");
	},
	"click .embedDialogOverlay": function (event) {
		hideEmbedDialog();
	}
});