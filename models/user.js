const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const userSchema = mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    loginTime: {
        type: String
    },
    id: {
        type: String
    }
});

const User = module.exports = mongoose.model('User', userSchema);
