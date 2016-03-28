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
			key = Array(6).join().split(',').map(function() { return s.charAt(Math.floor(Math.random() * s.length)); }).join('');
			blob = sjcl.encrypt(key, blob);
		}
		Meteor.call("addPaste", blob, titlePaste, langPaste, getCookie("auth"), 
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
}

updateBlob = function() {
	console.log( Session.get("pasteId"));
	var blob = editor.getValue();
	//var titlePaste = document.getElementById('pasteName').childNodes[0].nextSibling.data;
	Meteor.call("updatePaste", blob, Session.get("pasteTitle"), Session.get("pasteId"), Session.get("auth"), function(err, response){
		if(err) {alert(err);}
	});
}

bookmarkPaste = function() {
	if(!Session.get("isBookmarked")){
		Meteor.call("addBookmark", Session.get("pasteName"), Session.get("pasteTitle"), Session.get("auth"), function (err, response){
			if(err) {console.log(err);}
			loadUserBookmarks();
		});
	}
}

deletePaste = function(pasteId) {
	Meteor.call("deletePaste", pasteId, Session.get("auth"), function(err,response){
		if(err) {console.log(err);}
		else {Notify.startToast(2000, "This paste has been deleted", "Deleted");}
		loadUserPastes();
		if(Session.get("pasteId") === pasteId) {document.location.reload(false);}
	});
}

deleteBookmark = function(bookmarkId) {
	Meteor.call("deleteBookmark", bookmarkId, Session.get("auth"), function(err,response){
		if(err) {console.log(err);}
		else {Notify.startToast(2000, "This bookmark has been deleted", "Deleted");}
		loadUserBookmarks();
	});
}

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
			};
			Session.set("userPastesIds", userPastesIds);
		}
	});
}

loadUserBookmarks = function() {
	Meteor.call("getUserBookmarks", Session.get("auth"), function (err, response){
		if(err) {console.log(err);}
		if(response === 1) {
			console.log("A server error has occurred");
		}else{
			Session.set("userBookmarks", response);
			var userBookmarksLinks = [];
			for (var i = response.userBookmarks.length - 1; i >= 0; i--) {
				userBookmarksLinks.push(response.userBookmarks[i].bookmarkLink);
			};
			Session.set("userBookmarksLinks", userBookmarksLinks);
		}
	});
}

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
	if (key === ""){
		window.location.href = Session.get("siteName") + "/pastes/" + pasteName;
	}else {
		window.location.href = Session.get("siteName") + "/pastes/" + pasteName + "/" + key;
	}
};

getCookie = function(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length === 2) {return parts.pop().split(";").shift();}
};

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
}

initEditor = function () {
	var range;
	editor.getSession().setUseWrapMode(true);
	editor.moveCursorTo(0,0);
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
}

startReadWriteTracker = function () {
	Tracker.autorun(function () {
		if(Session.get("userPastesIds").indexOf(Session.get("pasteId"))>-1 || Session.get("isFork")){
			editor.setReadOnly(0);
		}else {editor.setReadOnly(1);}
	});
}