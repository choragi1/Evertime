const express = require('express');
const router = express.Router();
const User = require('../models/user')
const bcrypt = require("bcrypt");




//마이페이지 회원정보 수정
router.get('/info', isLogin, function (req, res) {
    res.render('myinfo.ejs', { userinfo: req.user })
})

//마이페이지 비밀번호 변경
router.get('/password', isLogin, function (req, res) {
    res.render('mypassword.ejs', { userinfo: req.user })
})

//마이페이지 비밀번호 변경
router.get('/withdraw', isLogin, function (req, res) {
    res.render('mywithdraw.ejs', { userinfo: req.user })
})

// 기타 라우팅 없는 페이지 => 메인 페이지
router.get('/*', (req,res)=>{
    res.redirect('/')
})




//로그인 확인(로그인했니?)
function isLogin(req, res, next) {
    if (req.user) {
      next();
    } else {
      res.send(
        "<script>alert('로그인 후 이용해주세요.');location.href = '/';</script>"
      );
    }
  }

module.exports=router;