//Collections

PastesLinks = new Mongo.Collection("pastesLinks"); //connection to Group Collection //Do NOT declare as var, it will override the server one

//Events

Template.header.events({
	"click #submitPaste": function (event) {
	// Grab paste's text from text field
	var blob = editor.getValue(); 
	var titlePaste = document.getElementById('pasteName').value;
	// Check that text field is not blank before adding paste
	if (blob !== '' && titlePaste !== '') {
		Meteor.call("addPaste", blob, titlePaste, function (err, response) {
			if (err) {console.log(err);}
			//document.getElementById('submitPaste').classList.add("ready");
			NProgress.configure({ easing: 'ease', speed: 500 });
			NProgress.start();
			NProgress.inc();
			setTimeout(function(){
				NProgress.done();
				takeMeToPaste(response[0]); //redirect user
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
	}
});

//Helpers

Template.registerHelper("homePage", function() {return Session.get("isHome");});

Template.registerHelper("homePaste", function() {return Session.get("isPaste");});

Template.paste.helpers({
	predic : function() {return Session.get("pasteText");}
});

Template.header.helpers({
	title : function() {return Session.get("pasteTitle");},
	pasteName : function() {return Session.get("pasteName");},
	pasteUrl : function() {return window.location.href;}
});

Template.body.helpers({
	homeRaw : function() {return Session.get("isRaw");}
});

Template.raw.helpers({
	rawText : function() {return Session.get("pasteText");}
});

//Startup

Meteor.startup(function() {
	$('pre code').each(function(i, block) {
		setTimeout(function(){
			hljs.highlightBlock(block);
		},500);
	});
	new Clipboard('.copyPasteUrl');
});
