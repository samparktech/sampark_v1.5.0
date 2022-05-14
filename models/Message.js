const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender : {
        type: String
    },
    message : {
        type : String
    },
    sentOn : {
        type : String
    },
    senderAvatar : {
        type : String,
        default : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlPmW6UykU1R4VReV149k-Li3janmIk0ZCNg&usqp=CAU'    }
});

const Message = mongoose.model('Messages', MessageSchema);

module.exports = Message;