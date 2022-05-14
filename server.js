//IMPORTING MODULES
require('dotenv').config();
require('./config/db');
const express = require('express');
const path = require('path')
const fs = require('fs');
const app = express();
const PORT = process.env.PORT;
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const http = require('http');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const methodOverride = require('method-override');
const grid = require('gridfs-stream');
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);

// LOAD MESSAGE MODEL
const Message = require('./models/Message');

// SOCKET.IO 
io.on('connection', (socket) => {  
  socket.on('chat message', (msg, sender, sentOn, avatar) => {
    io.emit('chat message', msg, sender, sentOn, avatar);
    
    const newMessage = new Message({
      sender : sender,
      message : msg,
      sentOn : sentOn ,
      senderAvatar : avatar
    })
    newMessage
    .save()
    .then((message) => {
      // console.log(message)
    })
    });
    socket.on('typing', (data)=>{
      if(data.typing==true)
         io.emit('display', data)
      else
         io.emit('display', data)
    })
    
    
})

// LOAD USER MODEL
const User = require('./models/User');


// UTIL
const { isObject } = require('util');

// PASSPORT CONFIG FILE IMPORT
require('./config/passport')(passport);

// INITIALIZING APP ENGINE
app.set('view engine', 'ejs');

// EXPRESS BODYPARSER
app.use(express.urlencoded({extended : true}));
app.use(express.json());

// CONNECT-FLASH
app.use(flash());


// USING METHOD OVERRIDE
app.use(methodOverride('_method'))

// STATIC FOLDER
app.use(express.static(path.join(__dirname, '/public')));

// EXPRESS SESSIONS
app.use(session({
    secret : 'savyTechnologies1515',
    resave : true,
    saveUninitialized : true,
    cookie: {
      secure: false,
      maxAge: 604800000 // VALID FOR 7 DAYS
  }
}))

// PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

// GLOBAL VARIABLES
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });

// ROUTES
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use('/articles', require('./routes/articles'));

// LISTENING APP
server.listen(process.env.PORT|| 5500 , console.log(`SERVER AT ${PORT}`));
