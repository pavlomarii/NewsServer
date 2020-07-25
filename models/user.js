// Modules needed. 
// PassportLocalMongoose: add fields "username" and "password" automatical.
// Needed for Token Authorization.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

// Schema of USER.
var User = new Schema({

    // Firstname and lastname as additional field of user.
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },

    // FacebookId need for OAuth2 Token Facebook Authorization.
    facebookId: String,

    // Boolean to check if user is an admin.
    admin: {
        type: Boolean,
        required: true,
        default: false
    }
});

// Adding fields "username" and "password", needed for correct Authorization.
User.plugin(passportLocalMongoose);

// Export model User. Mongoose makes model in plural automatical.
module.exports = mongoose.model('User', User);