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
		var lastURL = Session.get("lastHref");
		Session.set("lastHref", FlowRouter.current().context.path);
		if(!FlowRouter.current().context.hash || Session.get("lastHref") !== lastURL){
			getPaste(params);
		}
		
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


