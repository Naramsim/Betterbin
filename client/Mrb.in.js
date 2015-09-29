Groups = new Mongo.Collection("groups"); //connects to Groups collections
Meteor.subscribe("groups"); //listen for changes
// counter starts at 0
Session.setDefault('counter', 0);

Template.body.events({
  "submit .new-group": function (event) {
    // Grab group name from text field
    var newGroup = event.target.group.value;
    // Check that text field is not blank before adding group
    if (newGroup !== '') {
        Meteor.call("addGroup", newGroup); //call server-side method addGroup
    }
    // Clear the text field for next entry
    event.target.group.value = "";
    // Prevent default form submit
    return false;
  }
});