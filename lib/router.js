FlowRouter.route('/', {
	name: 'home',
	action: function() {
		console.log("This is the home");
	}
});

FlowRouter.route('/pastes/:pasteName', {
	name: 'pastes',
	action: function(params) {
		console.log("This is my paste:", params.pasteName);
		Meteor.call('getPaste', params.pasteName, function(err,response){
			if (err) {console.log(err);}
			Session.set('pasteText', response);
		});
	}
});