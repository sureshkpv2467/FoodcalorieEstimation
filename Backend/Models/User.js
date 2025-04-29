const mongoose = require('mongoose');

console.log('Initializing User model...');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    height: {
        type: Number
        // required: true
    },
    occupation: {
        type: String
        // required: true
    },
    country: {
        type: String
        // required: true
    },
    healthProblems: {
        type: String,
        default: ''
    },
    profilePhoto: {
        type: String,
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { collection: 'users' }); // Explicitly set collection name

console.log('User schema defined');

const User = mongoose.model('User', UserSchema);

console.log('User model created');

module.exports = User; 