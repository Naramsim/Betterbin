import { Meteor } from 'meteor/meteor';

if(Meteor.isServer){
    sanitizePath = function(path) {
        return path.replace(/[\.\\\/\n\v\f]/g,"");
    }
}
