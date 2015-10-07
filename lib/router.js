function getPastes(params) {
	Meteor.call('getPaste', params.pasteName, function(err,response){
		if (err) {console.log(err); return 1;}
		if (response[0] == 1) { 
			Session.set('pasteText', "No paste found");}
		else {
			Session.set('pasteText', response[0]);
			Session.set('pasteTitle', response[1]);}
	});
}

FlowRouter.route('/', {
	name: 'home',
	action: function() {
		Session.set('isHome', true);
		console.log("This is the home");
	}
});

FlowRouter.route('/pastes/:pasteName', {
	name: 'pastes',
	action: function(params) {
		console.log("This is your paste name:", params.pasteName);
		Session.set('isPaste', true);
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
