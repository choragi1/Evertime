const express = require('express');
const router = express.Router();
const User = require('../models/user')
const Post = require('../models/post')
const QnaPost = require('../models/qnapost')

require('dotenv').config()



//관리자 페이지
router.get('/admin', isAdmin, function (req, res) {
    res.render('admin.ejs');
  })

//회원 관리
router.get('/member', isAdmin, (req, res) => {

    User.find().exec(function (err, result) {
        res.render('memberlist.ejs', { userinfo: result });

    });
});


//자유게시판 관리
router.get('/freeboard', isAdmin, (req, res) => {

    Post.find().sort({ "_id": -1 }).exec(function (err, result) {
        res.render('postlist.ejs', { post: result });
    });
});

// 자유게시판 게시글 삭제
router.delete('/post', isAdmin, (req,res) => {
    let postno = req.body._id;
    Post.findOneAndDelete({"_id":postno},(err,result)=>{
        res.send('삭제되었습니다.')})        
})


//질답게시판 관리
router.get('/qnaboard', isAdmin, (req, res) => {

    QnaPost.find().sort({ "_id": -1 }).exec(function (err, result) {
        res.render('qnapostlist.ejs', { qnapost: result });
    });
});

// 질답게시판 게시글 삭제
router.delete('/qnapost', isAdmin, (req,res) => {
    let postno = req.body._id;
    QnaPost.findOneAndDelete({"_id":postno},(err,result)=>{
        res.send('삭제되었습니다.')})        
})

//관리자 로그인 확인(관리자세요?)
function isAdmin(req, res, next) {
    if (req.user != null) {
        User.findOne({ id: req.user.id }, function (err, result) {
            if (result.auth === 'admin') {
                next()
            } else {
                res.send("<script>alert('관리자 권한이 없습니다.');location.href = '/'</script>")
            }
        })
    } else {
        res.send("<script>alert('관리자 권한이 없습니다.');location.href = '/'</script>")
    }
}

module.exports=router;