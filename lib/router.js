function getPastes(params) {
	Meteor.call('getPaste', params.pasteName, function(err,response){
		if (err) {console.log(err); return 1;}
		if (response === 1) { 
			Session.set('pasteText', "No paste found");}
		else {
			Session.set('pasteText', response.text);
			Session.set('pasteTitle', response.title);
			Session.set('pasteLang', response.lang);
			editor.setShowPrintMargin(false);
			editor.getSession().setMode("ace/mode/" + Session.get("pasteLang"));
			editor.setValue(Session.get("pasteText"));
		}
	});
}

FlowRouter.route('/', {
	name: 'home',
	action: function() {
		Session.set('isHome', true);
		Session.set('isPaste', false);
		console.log("This is the home");
	}
});

FlowRouter.route('/pastes/:pasteName', {
	name: 'pastes',
	action: function(params) {
		Session.set('isPaste', true);
		Session.set('isHome', false);
		Session.set("pasteName", params.pasteName);
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


