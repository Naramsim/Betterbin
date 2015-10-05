PastesLinks = new Mongo.Collection("pastesLinks"); //connection to Group Collection //Do NOT declare as var, it will override the server one

Template.body.events({
	"submit .new-paste": function (event) {
	// Grab paste's text from text field
	var newPaste = event.target.paste.value;
	var titlePaste = event.target.title.value;
	// Check that text field is not blank before adding paste
	if (newPaste !== '' && titlePaste !== '') {
		Meteor.call("addPaste", newPaste, titlePaste); //call server-side method addPaste
	}
	// Clear the text field for next entry
	// event.target.paste.value = "";
	// Prevent default form submit
	return false;
	}
});

Template.paste.helpers({
	predic : function() {return Session.get("pasteText");}
});

Template.header.helpers({
	title : function() {return Session.get("pasteTitle");},
	pasteName : function() {return Session.get("pasteName");}
});

Template.body.helpers({
	homePage : function() {return Session.get("isHome");},
	homePaste : function() {return Session.get("isPaste");},
	homeRaw : function() {return Session.get("isRaw");}
});

Template.raw.helpers({
	rawText : function() {return Session.get("pasteText")}
});

Meteor.startup(function() {
	$('pre code').each(function(i, block) {
		setTimeout(function(){
			hljs.highlightBlock(block);
		},500);
	});
});
