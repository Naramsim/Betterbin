uploadBlob = function(action) {
	//action-> 0 : new paste
	//action-> 1 : new save from other paste
	var blob = editor.getValue();
	var titlePaste;
	var langPaste;
	var key = "";
	if(!action){ //new paste
		Session.set("isSave", false);
		titlePaste = document.getElementById('pasteName').value;
		langPaste = document.getElementById('selectLanguage');
		langPaste = langPaste.options[langPaste.selectedIndex].value;
	}else{ //new save form other paste
		Session.set("isSave", true);
		titlePaste = document.getElementById('pasteName').childNodes[0].nextSibling.data;
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
		Meteor.call("addPaste", blob, titlePaste, langPaste, getCookie("auth"), Session.get("isPasteEncrypted"), Session.get("isFork"), Session.get("pasteName"), Session.get("isSave"), function (err, response) {
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
}

updateBlob = function() {
	console.log( Session.get("pasteId"));
	var blob = editor.getValue();
	//var titlePaste = document.getElementById('pasteName').childNodes[0].nextSibling.data;
	Meteor.call("updatePaste", blob, Session.get("pasteTitle"), Session.get("pasteId"), Session.get("auth"), function(err, response){
		if(err) {alert(err);}
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
		window.location.href = siteName + "/pastes/" + pasteName;
	}else {
		window.location.href = siteName + "/pastes/" + pasteName + "/" + key;
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
	if (evtobj.ctrlKey && evtobj.keyCode == 37) {slideout.open();}
	if (evtobj.ctrlKey && evtobj.keyCode == 39) {slideout.close();}
	if (evtobj.ctrlKey && evtobj.keyCode == 40) {downloadBlob(Session.get("pasteTitle"), Session.get("pasteText"));}
};

savePaste = function () {
	if( Session.get("userPastesIds").indexOf(Session.get("pasteId")) > -1 ) {
		if(Session.get("pasteText") !== editor.getValue() ) {//need to update paste
			updateBlob();
		}
	}
}