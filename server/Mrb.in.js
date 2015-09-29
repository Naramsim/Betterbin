Groups = new Mongo.Collection("groups"); //connection to Group Collection
Meteor.publish("groups", function () { 
	return Groups.find(); // everything
});

Meteor.methods({ //called by Clients
	addGroup: function (name) {
		Groups.insert({
			name: name,
			createdAt: new Date(),
			owner: Meteor.uuid(),
			checked: false
		});
	}
});

Meteor.startup(function () {
	// code to run on server at startup
});