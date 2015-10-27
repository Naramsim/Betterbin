function getPastes(params) {
	Meteor.call('getPaste', params.pasteName, function(err,response){
		if (err) {console.log(err); return 1;}
		if (response === 1) { 
			Session.set('pasteText', "No paste found");}
		else {
			Session.set('pasteText', response.text);
			Session.set('pasteTitle', response.title);
			Session.set('pasteLang', response.lang);
			Session.set('isPasteEncrypted', response.isEncry);
			Session.set('numbersOfViews', response.numbersOfViews);
			editor.setShowPrintMargin(false);
			editor.getSession().setMode("ace/mode/" + Session.get("pasteLang"));
			if(Session.get("pasteKey") !== undefined) {
				Session.set("pasteText",  sjcl.decrypt( Session.get("pasteKey"), Session.get("pasteText") ));
			}else if(Session.get("isPasteEncrypted") && Session.get("pasteKey") === undefined ){
				Session.set("pasteText", "Add the key to the URL")
				Session.set("pasteLang","You need a key to view this paste");
			}
			editor.setValue(Session.get("pasteText"));
		}
	});
}

FlowRouter.route('/', {
	name: 'home',
	action: function() {
		Session.set('isHome', true);
		Session.set('isPaste', false);
		Session.set('isFork', false);
		console.log("This is the home");
	}
});

FlowRouter.route('/pastes/:pasteName/:key?', {
	name: 'pastes',
	action: function(params) {
		Session.set('isPaste', true);
		Session.set('isHome', false);
		Session.set("pasteName", params.pasteName);
		Session.set('pasteKey', params.key);
		getPastes(params);
	}
});

FlowRouter.route('/pastes/:pasteName/raw', {
	name: 'raw',
	action: function(params) {
		console.log("This is your raw paste name:", params.pasteName);
		Session.set('isRaw', true);
		Session.set("pasteName", params.pasteName);
		getPastes(params);
	}
});

FlowRouter.notFound = {
	action: function() {
		console.log("You are LOST");
	}
};


