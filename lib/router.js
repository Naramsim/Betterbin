FlowRouter.route('/pastes/:pasteName', {
    name: 'pastes',
    action: function(params) {
        console.log("This is my paste:", params.pasteName);
        Meteor.call('getPaste', params.pasteName, function(err,response){
	        console.log(response);
	    });
    }
});