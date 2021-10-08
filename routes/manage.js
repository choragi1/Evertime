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
router.get('/freeboard/:page', isAdmin, (req, res) => {
    let page = parseInt(req.params.page);
    // 한 페이지에 보여줄 게시물 수
    let countPost = 5
    // 한 페이지에 보여줄 페이지 수
    let countPage = 5
    Post.find({}).sort({"_id":-1}).skip(countPost * (page - 1)).limit(countPost).exec((err,result)=>{
      Post.count({}, (err, count) => {
        // 전체 게시글 수
        let totalPost = count;
        // 총 페이지 수
        let totalPage = Math.floor(totalPost / countPost);
        // 페이지 수 관련 로직
        (totalPost % countPost) > 0
          ? totalPage++
          : null
        // 페이지 시작 번호
        let startPage = Math.floor((page-1) / countPage) * countPage +1
        let endPage = startPage + countPage - 1;
        if (page>0 & page <= totalPage ) {
          res.render('postlist.ejs', { post: result, totalPost: totalPost, page: page, totalPage: totalPage, countPage: countPage, count: count, startPage : startPage, endPage : endPage });
        } else if(page > totalPage){
          res.redirect(`/manage/freeboard/${totalPage}`)
        } else {
          res.redirect('/manage/freeboard/1')
        }
      })
    });
  })

// 자유게시판 게시글 삭제
router.delete('/post', isAdmin, (req,res) => {
    let postno = req.body._id;
    Post.findOneAndDelete({"_id":postno},(err,result)=>{
        res.send('삭제되었습니다.')})        
})


//질답게시판 관리
router.get('/qnaboard/:page', isAdmin, (req, res) => {
    let page = parseInt(req.params.page);
    // 한 페이지에 보여줄 게시물 수
    let countPost = 5
    // 한 페이지에 보여줄 페이지 수
    let countPage = 5
    QnaPost.find({}).sort({"_id":-1}).skip(countPost * (page - 1)).limit(countPost).exec((err,result)=>{
      QnaPost.count({}, (err, count) => {
        // 전체 게시글 수
        let totalPost = count;
        // 총 페이지 수
        let totalPage = Math.floor(totalPost / countPost);
        // 페이지 수 관련 로직
        (totalPost % countPost) > 0
          ? totalPage++
          : null
        // 페이지 시작 번호
        let startPage = Math.floor((page-1) / countPage) * countPage +1
        let endPage = startPage + countPage - 1;
        if (page>0 & page <= totalPage ) {
          res.render('qnapostlist.ejs', { qnapost: result, totalPost: totalPost, page: page, totalPage: totalPage, countPage: countPage, count: count, startPage : startPage, endPage : endPage });
        } else if(page > totalPage){
          res.redirect(`/manage/qnaboard/${totalPage}`)
        } else {
          res.redirect('/manage/qnaboard/1')
        }
      })
    });
  })

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