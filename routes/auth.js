const express = require('express');
const router = express.Router();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

//날짜 관련 라이브러리인 moment 사용
const moment = require('moment');


require('dotenv').config()

// DB설정
const MongoClient = require('mongodb').MongoClient;
var db;
MongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, function (err, client) {
  if (err) {return console.log(err)}
  // todoapp이라는 db로 연결
  db = client.db('todoapp');
})

//인증정보 저장(네이게이션바 로딩완료시)
router.get('/getauth', (req, res) => {
    res.send(req.user)
})

// 회원가입 중복 아이디 검사
router.post('/checkid', (req, res) => {
    let checkId = req.body.id

    if (checkId == null | checkId == '') {
        res.send("아이디를 입력해주세요!")
    } else {

        db.collection('userinfo').findOne({ id: checkId }, (err, result) => {
            if (result != null) {
                console.log(`중복된 아이디 확인 요청 : ${checkId}`)
                res.send("이미 존재하는 아이디입니다.")
            } else {

                res.send("사용 가능한 아이디입니다.")
            }
        })
    }
})

//로그인 post (관리자 로그인 확인)
router.post('/login',
    passport.authenticate('local', { failureRedirect: '/auth/fail' }), function (req, res) {
        db.collection('userinfo').findOne({ id: req.user.id }, (err, result) => {
            if (err) { return console.log(err) }
            if (result.auth == 'admin') {
                res.send("<script>alert('관리자 로그인에 성공했습니다.');location.href = document.referrer;</script>")
            } else {
                res.send("<script>location.href = document.referrer;</script>")
            }
        })
    });

//로그인 실패시
router.get('/fail', function (req, res) {
    res.send("<script>alert('로그인에 실패했습니다');location.href = document.referrer;</script>")
})

//로그아웃
router.get('/logout', (req, res) => {
    req.session.destroy((err, res) => {
        if (err) { return err }
    })
    res.send("<script>alert('로그아웃 되었습니다.');location.href = '/'</script>")
})


module.exports = router;