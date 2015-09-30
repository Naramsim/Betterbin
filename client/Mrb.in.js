PastesLinks = new Mongo.Collection("pastesLinks"); //connection to Group Collection //Do NOT declare as var, it will override the server one
// counter starts at 0
Session.setDefault('counter', 0);

Template.body.events({
  "submit .new-paste": function (event) {
    // Grab paste's text from text field
    var newPaste = event.target.paste.value;
    // Check that text field is not blank before adding paste
    if (newPaste !== '') {
        Meteor.call("addPaste", newPaste); //call server-side method addPaste
    }
    // Clear the text field for next entry
    event.target.paste.value = "";
    // Prevent default form submit
    return false;
  }
});