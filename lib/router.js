FlowRouter.route('/', {
	name: 'home',
	action: function() {
		Session.set('isHome', true);
		Session.set('isPaste', false);
		Session.set('isEmbed', false);
		Session.set('isFork', false);
	}
});

FlowRouter.route('/pastes/:pasteName/:key?', {
	name: 'pastes',
	action: function(params) {
		Session.set('isPaste', true);
		Session.set('isHome', false);
		Session.set('isEmbed', false);
		Session.set("pasteName", params.pasteName);
		Session.set('pasteKey', params.key);
		getPaste(params);
		loadUserPastes();
	}
});

FlowRouter.route('/embed/paste/:pasteName', {
	name: 'embed',
	action: function(params) {
		Session.set('isHome', false);
		Session.set('isPaste', false);
		Session.set('isEmbed', true);
		getBasicPaste(params);
	}
});

FlowRouter.notFound = {
	action: function() {
		console.log("You are lost");
	}
};


