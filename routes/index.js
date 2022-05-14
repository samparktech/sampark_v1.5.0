const router = require('express').Router();
const nodemailer = require('nodemailer');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Article = require('../models/Article');
const User = require('../models/User');
const sendSms = require('../config/notification');
const Message  = require('../models/Message');
const S3 = require('aws-sdk/clients/s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const fs = require('fs');

//HANDLING PROFILE AVATAR UPLOAD
const upload = multer({ dest: "uploads/userProfilePictures/" });
const s3 = new S3({
  accessKeyId : 'AKIAYN6BPLHVHFUPFBDT',
  secretAccessKey : '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',
  region : 'us-east-1'
})
const uploadFile = (file) => {

  const fileStream = fs.createReadStream(file.path);
  
  const uploadParams = {
      Bucket : 'sampark-bucket/profileAvatars',
      Body : fileStream,
      Key : file.filename,
      content_type: 'image/jpeg',
  }
   return s3.upload(uploadParams).promise()
}

//INDEX ROUTE
router.get('/', (req, res) => {
    res.render('login')
})

// DASHBOARD
router.get('/dashboard', ensureAuthenticated, (req, res) => {
 
  Article.find({}, function(err, data) {
    if(err){
      console.log(err);
    }else{
      res.render('dashboard', {
       user: req.user,
       posts : data
     })
    }
    });
});

// VIEW USER PROFILE ROUTE
router.get('/profile', ensureAuthenticated, (req, res) => {
  res.render('profile', {
    user : req.user
  });
});

// UPDATE USER PROFILE ROUTE
router.get('/updateprofile', ensureAuthenticated, (req, res) => {
  res.render('updateprofile', {
    user : req.user
  });
});


// GROUP CHAT ROUTE
router.get('/chat', ensureAuthenticated, (req, res) => {
  Message.find({}, (err, messages) => {
    if(messages){
      res.render('chat', {
        user : req.user,
        messages
      })}
      else console.log(err)
  })

});



// DELETE ACCOUNT
router.get('/deleteaccount/:userid', (req, res) => {
  const userid = req.params.userid;
  User.deleteOne({id : userid}, (err, obj)=>{
    if(err) console.log(err)
    else res.redirect('/');
  })
})

router.get('/verify',ensureAuthenticated, (req, res) => {
  res.render('verify', {
    user : req.user
  })
})

// VIEW OTHER PEOPLE ROUTE
router.get('/people', ensureAuthenticated, (req, res) => {
  User.find({}, (err, Users) => {
    if(Users){res.render('people', {Users, user : req.user})}
    else{
      res.render('noUser');
    }
  })
})

// VERIFY USER ACCOUNT
router.get('/verifyuser/:userid', ensureAuthenticated , (req, res) => {
const userID = req.params.userid
User.findOne({username : userID}).then((user) => {
  if(user){
  const transporter = nodemailer.createTransport({
    port: 465,               
    host: "smtp.gmail.com",
       auth: {
            user: 'samparktech.inc@gmail.com',
            pass: '373ftnn5123',
         },
    secure: true,
    });

    const sixDigitOTP = Math.floor(100000 + Math.random() * 900000);

    const mailData = {
      from: 'samparktech.inc@gmail.com', 
        to: `${user.email}`,   
        subject: 'One Time Passcode for verification',
        html: `<h1>Verfication code for ${user.firstName}'s Account</h1><br><h2 align="center"><b><u>${sixDigitOTP}</u></b> is your one time 6-digit code for Verification on Sampark. Do not share it with anyone.</b></h2> `,
      };
      
      transporter.sendMail(mailData, function (err, info) {
        if(err)
          console.log(err)
        else
        console.log(info)
          res.redirect('/verify')
     });
  }
    })
  
});

router.get('/contact', ensureAuthenticated, (req, res) => {
  res.render('contact', {user : req.user});
});

router.post('/changeavatar', ensureAuthenticated, upload.single('avatar'), async (req, res) => {
  // UPLOADING ARTICLE IMAGE
  const avatarImage = req.file;
  const result = await uploadFile(avatarImage);
  const avatarImagePath = result.Location;
  User.updateOne({username : req.user.username}, {avatarImage : avatarImagePath})
  .then((user)=>{
    res.redirect('/profile');
  })
  .catch(err => console.log(err));
  Article.updateOne({postedBy : req.user.username}, {avatarImage : avatarImagePath})
  .then((article)=>{
    
  })
  .catch(err => console.log(err));
});

router.post('/changethemetodark/:userId', ensureAuthenticated, (req, res) => {
  const userID = req.params.userId;
  User.updateOne({_id : userID}, {darkMode : true})
  .then(()=>res.redirect('/dashboard'))
  .catch(err => console.log(err));
})
router.post('/changethemetolight/:userId', ensureAuthenticated, (req, res) => {
  const userID = req.params.userId;
  User.updateOne({_id : userID}, {darkMode : false})
  .then(()=>res.redirect('/dashboard'))
  .catch(err => console.log(err));
})
router.get('/:postId',(req, res) => {
  const postId = req.params.postId;
  Article.findById(postId).then((post) => {
    if (!post) res.redirect('/dashboard');
    else {
      res.render('post', {user : req.user, post })
    }
  }).catch(err => console.log(err))
});
module.exports = router;


