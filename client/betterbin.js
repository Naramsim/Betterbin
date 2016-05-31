//Collections

//Do NOT declare as var, it will override the server one
PastesLinks = new Mongo.Collection("pastesLinks");
BookMarks = new Mongo.Collection("bookMarks");

//Startup
Meteor.startup(function() {
	var siteName = "//" + window.location.host;
	Session.set("userPastesLoaded", false);
	Session.set("langListReady", false);
	Session.set("isPasteEncrypted", false);
	Session.set("isPasteHided", false);
	Session.set("isFork", false);
	Session.set("siteName", siteName);
	new Clipboard('.copyPasteUrl');
	new Clipboard('.new-embed');
	new Clipboard('.iframeCopy');
	notifyToast = new Toast();
	notifyToast.stayOnFor(2100);
	Session.set("auth", login());
	document.onkeydown = KeyPress;
	$("textarea").keydown(function(e){
		KeyPress(e);
	});

	loadUserPastes();
	loadLangs();

	Meteor.subscribe("pastesLinks");
	Meteor.subscribe("bookMarks", Session.get("auth"));

	document.querySelector('.ace_editor').addEventListener('click', function() {
		if(slideout.isOpen()){
			slideout.close();
		}
		if(megaSlideout.isOpen()){
			megaSlideout.close();
		}
	});
});

// UNLOAD
window.onbeforeunload = function() {
	savePaste()
    if (Session.get("isHome") && editor.getValue()) {
        var confirmationMessage = 'It looks like you have started a new paste.'
                                + 'If you leave before saving, your paste will be lost.';
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    }else{
    	return undefined;
    }
};
