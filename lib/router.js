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
		getPaste(params);
		console.log("This is a paste");
	}
});


FlowRouter.notFound = {
	action: function() {
		console.log("You are lost");
	}
};


