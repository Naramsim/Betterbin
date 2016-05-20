import NProgress from 'nprogress'

login = function() {
	if(getCookie("auth") !== undefined){
		console.log("Logged - Do not clear cookies");
		if(getLocal("auth") === null) {
			setLocalFromCookie("auth", "auth");
		}
		return getCookie("auth");
	}else{
		if(getLocal("auth") !== null){
			console.log("Logged - Do not clear LS");
			return getLocal("auth");
		}else{
			console.log("Logging in ..");
			return setLocal("auth");
		}
	}
}

getPaste = function(params) {
	Meteor.call('getPaste', params.pasteName, function(err,response){
		if (err) {console.log(err); return 1;}
		if (response === 1) { 
			Session.set('pasteText', "No paste found");}
		else {
			Session.set('pasteText', response.text);
			Session.set('pasteTitle', response.title);
			Session.set('pasteLang', response.language);
			Session.set('isPasteEncrypted', response.isEncry);
			Session.set('isForked', response.isFork);
			Session.set('isBookmarked', response.isBookmark);
			Session.set('pasteId', response._id);
			Session.set('numbersOfViews', response.numbersOfViews);
			editor.getSession().setMode("ace/mode/" + checkFramework(Session.get("pasteLang")));
			if(Session.get("pasteKey") !== undefined) {
				Session.set("pasteText",  sjcl.decrypt( Session.get("pasteKey"), Session.get("pasteText") ));
			}else if(Session.get("isPasteEncrypted") && Session.get("pasteKey") === undefined ){
				Session.set("pasteText", "Add the key to the URL");
				Session.set("pasteLang","You need a key to view this paste");
			}
			editor.setValue(Session.get("pasteText"));
			initEditor();
			startReadWriteTracker();
		}
	});
}

getBasicPaste = function(params) {
	Meteor.call('getPaste', params.pasteName, function(err,response){
		if (err) {console.log(err); return 1;}
		if (response === 1) { 
			Session.set('pasteText', "No paste found");
		} else if (response.isEncry) {
			Session.set('pasteText', "This paste is encrypted");
		} else {
			Session.set("pasteName", params.pasteName);
			Session.set('pasteText', response.text);
			Session.set('pasteTitle', response.title);
			Session.set('pasteLang', response.language);
			Session.set('isPasteEncrypted', response.isEncry);
			Session.set('isForked', response.isFork);
			Session.set('isBookmarked', response.isBookmark);
			Session.set('numbersOfViews', response.numbersOfViews);
			editor.getSession().setMode("ace/mode/" + checkFramework(Session.get("pasteLang")));
			editor.setValue(Session.get("pasteText"));
			currentLines = editor.session.getLength();
			editor.setOptions({
			    maxLines: currentLines < 37 ? currentLines : 37
			});
			editor.moveCursorTo(0,0);
		}
	});
}

uploadBlob = function(action) {
	//action-> 0 : new paste
	//action-> 1 : new bookmark from other paste
	var blob = editor.getValue();
	var titlePaste;
	var langPaste;
	var key = "";
	if(!action){ //new paste
		Session.set("isBookmark", false);
		titlePaste = document.getElementById('pasteName').value;
		langPaste = document.getElementById('selectLanguage');
		langPaste = langPaste.options[langPaste.selectedIndex].value;
	}else{ //new save form other paste
		Session.set("isBookmark", true);
		titlePaste = document.getElementById('pasteName').childNodes[4].nextSibling.data;
		langPaste = document.getElementById('pasteLang').textContent;
		langPaste = langPaste.slice(1, -1);
	}
	// Check that text field is not blank before adding paste
	if (blob !== '' && titlePaste !== '') {
		if(Session.get("isPasteEncrypted") === true){
			var s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
			key = Array(17).join().split(',').map(function() { return s.charAt(Math.floor(Math.random() * s.length)); }).join('');
			blob = sjcl.encrypt(key, blob);
		}
		Meteor.call("addPaste", blob, titlePaste, langPaste, Session.get("auth"), 
								Session.get("isPasteEncrypted"), Session.get("isFork"), 
								Session.get("pasteName"), Session.get("isBookmark"),
								Session.get("isPasteHided"), function (err, response) {
			if (err) {console.log(err);}
			document.getElementById("tools").classList.add("hideSlow");
			//document.getElementById('submitPaste').classList.add("ready");
			NProgress.configure({ easing: 'ease', speed: 500 });
			NProgress.start();
			NProgress.inc();
			setTimeout(function(){
				NProgress.done();
				localStorage.setItem(response[0], key); //store key for easy access
				takeMeToPaste(response[0], key); //redirect user
			},1000);
		}); //call server-side method addPaste
	} else {
		Notify.startToast(2000, "Either title or paste is empty", "OPS...");
	}
};

updateBlob = function() {
	var blob = editor.getValue();
	//var titlePaste = document.getElementById('pasteName').childNodes[0].nextSibling.data;
	Meteor.call("updatePaste", blob, Session.get("pasteTitle"), Session.get("pasteId"), Session.get("auth"), function(err, response){
		if(err) {alert(err);}
	});
};

bookmarkPaste = function() {
	if(!Session.get("isBookmarked")){
		Meteor.call("addBookmark", Session.get("pasteName"), Session.get("pasteTitle"), Session.get("auth"), function (err, response){
			if(err) {console.log(err);}
		});
	}
};

deletePaste = function(pasteId) {
	Meteor.call("deletePaste", pasteId, Session.get("auth"), function(err,response){
		if(err) {console.log(err);}
		else {Notify.startToast(2000, "This paste has been deleted", "Deleted");}
		loadUserPastes();
		if(Session.get("pasteId") === pasteId) {document.location.reload(false);}
	});
};

deleteBookmark = function(bookmarkId) {
	Meteor.call("deleteBookmark", bookmarkId, Session.get("auth"), function(err,response){
		if(err) {console.log(err);}
		else {Notify.startToast(2000, "This bookmark has been deleted", "Deleted");}
	});
};

loadUserPastes = function() {
	Meteor.call("getUserPastes", Session.get("auth"), function (err, response){
		if(err) {console.log(err);}
		if(response === 1) {
			console.log("A server error has occurred");
		}else{
			Session.set("userPastesLoaded", true);
			Session.set("userPastes", response);
			var userPastesIds = [];
			for (var i = response.userPastes.length - 1; i >= 0; i--) {
				userPastesIds.push(response.userPastes[i]._id);
			}
			Session.set("userPastesIds", userPastesIds);
		}
	});
};

loadLangs = function() {
	HTTP.get(Meteor.absoluteUrl("languages.json"), function(e, data) {
		Session.set("langList", data.data);
		Session.set("lastLang", localStorage.getItem("lastLang"))
		Session.set("langListReady", true);
	});
};

downloadBlob = function(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
};

takeMeToPaste = function (pasteName, key) {
	window.onbeforeunload = null
	if (key === ""){
		FlowRouter.go("/pastes/" + pasteName);
	}else {
		FlowRouter.go("/pastes/" + pasteName + "/" + key);
	}
};

getCookie = function(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length === 2) {return parts.pop().split(";").shift();}
};

getLocal = function(name) {
	return localStorage.getItem(name);
}

setLocal = function(name) {
	var s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789£$&^";
	var userName = Array(9).join().split(',').map(function() { return s.charAt(Math.floor(Math.random() * s.length)); }).join('');
	localStorage.setItem(name, userName);
	return userName;
}

setLocalLang = function(lang) {
	localStorage.setItem("lastLang", lang);
}

setLocalFromCookie = function(name, cookieValue) {
	localStorage.setItem(name, getCookie(cookieValue));
}

setCookie = function (argument) {
	var s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789£$&^";
	var userName = Array(9).join().split(',').map(function() { return s.charAt(Math.floor(Math.random() * s.length)); }).join('');
	document.cookie ='auth=' + userName + '; expires=Fri, 3 Aug 2100 20:47:11 UTC; path=/';
};

KeyPress = function (e) {
	var evtobj = window.event? event : e;
	if (evtobj.ctrlKey && evtobj.keyCode === 37) {slideout.open();}
	if (evtobj.ctrlKey && evtobj.keyCode === 39) {slideout.close();}
	if (evtobj.ctrlKey && evtobj.keyCode === 40) {downloadBlob(Session.get("pasteTitle"), Session.get("pasteText"));}
	if (evtobj.ctrlKey && evtobj.keyCode === 38) {try{uploadBlob(0);}catch(e){}}
};

savePaste = function () {
	if( Session.get("userPastesIds").indexOf(Session.get("pasteId")) > -1 ) {
		if( Session.get("pasteText") !== editor.getValue() ) {//need to update paste
			if( !Session.get("isFork") ){ //if i'm not forking one of my projects
				updateBlob();
			}
		}
	}
};

initEditor = function () {
	var range;
	editor.getSession().setUseWrapMode(true);
	var hashRow = FlowRouter.current().context.hash || 0;
	editor.gotoLine(+hashRow.slice(1),0);
	editor.selection.selectLineEnd();
	editor.setShowPrintMargin(false);
	Session.set('cursorPosition', editor.getSession().selection.getCursor());
	editor.focus();
	Session.set('length', editor.getSession().getLength());
	editor.commands.addCommand({
	    name: 'selectNext',
	    bindKey: {win: 'Ctrl-D',  mac: 'Command-D'},
	    exec: function(editor) {
	        editor.selectMore(1, false);
	    }
	});
	editor.on("change", function(e){
		Session.set('length', editor.getSession().getLength());
	});
	editor.getSession().selection.on('changeCursor', function(e) {
		Session.set('cursorPosition', editor.getSession().selection.getCursor());
	});
	editor.getSession().selection.on('changeSelection', function(e) {
		range = editor.getSession().selection.getRange();
		Session.set("selectionRowRange", range.end.row - range.start.row);
		Session.set("rangeLength", editor.getSelectedText().length);
	});
	if(Session.get("isPaste")){
		editor.on("guttermousedown", function(e){
			window.location.hash = "L" + (e.getDocumentPosition().row + 1);
		})
	}
};

startReadWriteTracker = function () {
	Tracker.autorun(function () {
		if(Session.get("userPastesIds").indexOf(Session.get("pasteId"))>-1 || Session.get("isFork")){
			editor.setReadOnly(0);
		}else {editor.setReadOnly(1);}
	});
};

openMegaSlideout = function () {
	slideout.close();
	setTimeout(function(){megaSlideout.open();},600);
};

const jsFrameworks = ["angularjs","atom","backbone","d3js","grunt","gulp","jquery","meteor","nodejs","react", "kraken"]
const phpFrameworks = ["laravel"]
const android = ["android"]
const git = ["git"]

checkFramework = function(lang) {
	if(jsFrameworks.indexOf(lang) > -1){return "javascript";}
	if(phpFrameworks.indexOf(lang) > -1){return "php";}
	if(android.indexOf(lang) > -1){return "java";}
	if(git.indexOf(lang) > -1){return "gitignore";}
	return lang;
}

showEmbedDialog = function() {
	document.getElementById("bodyContainer").classList.add("blurred");
	document.getElementsByClassName("embedDialogContainer")[0].classList.remove("dialogClose");
	document.getElementsByClassName("embedDialogContainer")[0].classList.add("dialogOpen");
}

hideEmbedDialog = function() {
	document.getElementById("bodyContainer").classList.remove("blurred");
	document.getElementsByClassName("embedDialogContainer")[0].classList.remove("dialogOpen");
	document.getElementsByClassName("embedDialogContainer")[0].classList.add("dialogClose");
	document.getElementsByClassName("embedDialogContainer")[0].addEventListener('animationend', function(){
			document.getElementsByClassName("embedDialogContainer")[0].classList.remove("dialogClose");
		}, false);
}