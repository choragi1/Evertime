const express = require('express');
const router = express.Router();


require('dotenv').config()

// 메인페이지(index)
router.get('/', (req, res) => {
    res.render('index.ejs', {user : req.user})
});

// 소개 페이지
router.get('/intro', (req, res) => {
    res.render('introduce.ejs', {user : req.user});
});

//회원가입
router.get('/signup', (req, res) => {
    res.render('signup.ejs', {user : req.user});
});



//로그인 확인(로그인했니?)
function isLogin(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.send("로그인 후 이용해주세요.");
    }
}

module.exports=router;