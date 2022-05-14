const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    firstName : {
        type : String,
        required : true,
        unique : false
    },
    lastName : {
        type : String,
        required : true,
        unique : false
    },
    email : {
        type : String,
        // required : true,
    },
    age : {
        type : Number,
        required : false,
        unique : false
    },
    phnumber : {
        type : Number,
        required : false,
    },
    country : {
        type : String,
        required : false,
        unique : false
    },
    gender:{
        type: String
    },
    password:{
        type : String,
        required : true,

    },
    createdOn : {
        type : String,
        default : new Date().toLocaleDateString()
    },
    avatarImage : {
        type : String,
        required : false,
        unique : false,
        default : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlPmW6UykU1R4VReV149k-Li3janmIk0ZCNg&usqp=CAU'
    },
    followerArray : {
        type : [{followers : String, followerAvatar : String}]
    },
    followingArray : {
        type : [{following : String}]
    },
    verified : { 
        type : Boolean
    },
    likedPosts : {
        type : [{likedPostId : String}]
    },
    darkMode : {
        type : Boolean,
        default : true
    },
    savedPosts : {
        type : [{postID : String}]
    }
});

const User = mongoose.model('users', UserSchema);

module.exports = User;