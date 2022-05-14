const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    title: {
        type : String
    },
    post : {
        type : String
    },
    createdAt:{
        type: Date,
        default: new Date()
    },
    postedBy:{
        type: String
    },
    comments : {
        type : [{commentedBy : String, commentMsg : String, avatarImage : String}],
    },
    likes : {
        type : [{likedBy : String}],
        
    },
    dislikes : {
        type : [{dislikedBy : String}]
    },
    articleImage : {
        type : String,
        required : false,
        unique : false
    },
    dataType:{
        type : String
    },
    avatarImage : {
        type : String,
        default : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlPmW6UykU1R4VReV149k-Li3janmIk0ZCNg&usqp=CAU'    } 
});

const Article = mongoose.model('Articles', ArticleSchema);

module.exports = Article;