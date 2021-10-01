const express = require('express');
const router = express.Router();


require('dotenv').config()

// DB설정
const MongoClient = require('mongodb').MongoClient;
var db;
MongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, function (err, client) {
  if (err) {return console.log(err)}
  // todoapp이라는 db로 연결
  db = client.db('todoapp');
})

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
    // console.log(req.user) // deserializeUser 에서 찾았던 DB정보임.
    res.render('mypage.ejs', { userinfo: req.user })
})

//로그인 확인(로그인했니?)
function isLogin(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.send("<script>alert('로그인 후 이용해주세요.');location.href = document.referrer;</script>");
    }
}

module.exports=router;