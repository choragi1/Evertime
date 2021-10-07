const express = require('express');
const router = express.Router();


require('dotenv').config()

// 메인페이지(index)
router.get('/', (req, res) => {
    // console.log(req.session.passport)
    res.render('index.ejs')
});

// 소개 페이지
router.get('/intro', (req, res) => {
    res.render('introduce.ejs');
});

//회원가입
router.get('/signup', (req, res) => {
    res.render('signup.ejs');
});



//마이페이지
router.get('/mypage', isLogin, function (req, res) {
    res.render('mypage.ejs', { userinfo: req.user })
})

//로그인 확인(로그인했니?)
function isLogin(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.send("로그인 후 이용해주세요.");
    }
}

module.exports=router;