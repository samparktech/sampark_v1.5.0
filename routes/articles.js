const router = require('express').Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Article = require('../models/Article');
const User = require('../models/User');
const sendSms = require('../config/notification');
const S3 = require('aws-sdk/clients/s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const fs = require('fs');

const upload = multer({dest : 'uploads/articleImages/'})

const s3 = new S3({
    accessKeyId : 'AKIAYN6BPLHVHFUPFBDT',
    secretAccessKey : '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',
    region : 'us-east-1'
})

const uploadFile = (file) => {

    const fileStream = fs.createReadStream(file.path);
    
    const uploadParams = {
        Bucket : 'sampark-bucket/articleImages',
        Body : fileStream,
        Key : file.filename,
        content_type: 'image/*',
    }
     return s3.upload(uploadParams).promise()
}

router.get('/new', ensureAuthenticated, (req, res) => {
    res.render('createArticle', {
        user : req.user
    });
})
router.post('/create', upload.single('articleImage'),ensureAuthenticated, async (req, res) => {
    
    // UPLOADING ARTICLE IMAGE
    const articleImage = req.file;
    const result = await uploadFile(articleImage);
    const articleImagePath = result.Location;
    const avatarImage = req.user.avatarImage;
    // console.log(articleImagePath);
    
    let article = new Article({
        title : req.body.title,
        post : req.body.post,
        createdAt : new Date,
        postedBy : req.user.username,
        dataType : req.body.fileTypeDropdown,
        articleImage : articleImagePath,
        avatarImage : avatarImage
    })

    try{
        article = await article.save();
        res.redirect('/dashboard')
    }
    catch (e){
        console.log(e);
    }
})

router.post('/delete/:id',  (req, res) => {
    Article.findByIdAndDelete(req.params.id, function (err, done) {
        if (err){
            console.log(err)
        }
        else{
            res.redirect('/dashboard')
        }
    })
})

router.get('/:username', ensureAuthenticated, (req, res) => {
    const userID = req.params.username;
    User.findOne({ username: userID }).then((User) => {
        if (User) {
            Article.find({postedBy : userID}, (err, posts) => {
                if(posts){
                  res.render('userArticles', {posts, user : req.user, User, Article})
                }
            });
        } else {
        //   res.render("usernotfound");
        }
      });
});

router.post('/comment/:postid', ensureAuthenticated, (req, res) => {
    const postId = req.params.postid;
    const commentMsg = req.body;
    const commentBy  = req.user.username;
    const avatar = req.user.avatarImage;
    const comment = {
        commentedBy : commentBy,
        commentMsg : commentMsg.commentMsg,
        avatarImage : avatar
    }
        Article.findByIdAndUpdate(postId, {$push: {comments : comment}}, (err, done) => {
            if(done) res.redirect('/dashboard')
           else{
               console.log(err)
           }
       })
})

router.post('post', ensureAuthenticated, (req, res) => {
    
});

router.post('/comment/delete/:username/:commentId/:postId', ensureAuthenticated, (req, res) => {
    const userID = req.params.username;
    const commentID = req.params.commentId;
    const postId = req.params.postId;
    Article.findByIdAndUpdate(postId, {$pull : {comments : {commentedBy : userID,}}}, (err, done) => {
          if (done) console.log('Comment Deleted !')
          else console.log(err);
        });
})



module.exports = router;