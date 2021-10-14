const express = require('express');
const router = express.Router();
const passport = require('passport');


require('dotenv').config()

const User = require('../models/user')

//인증정보 저장(네비게이션바 로딩완료시)
router.post('/getauth', (req, res) => {
    res.send(req.user)
})

// 회원가입 중복 아이디 검사
router.post('/checkid', (req, res) => {
    let checkId = req.body.id
    if (checkId == null | checkId == '') {
        res.send("아이디를 입력해주세요!")
    } else if(checkId.length>12){
        res.send("글자수를 초과하였습니다.")
    } else {

        User.findOne({ id: checkId }, (err, result) => {
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
        User.findOne({ id: req.user.id }, (err, result) => {
            if (err) { return console.log(err) }
            if (result.auth === 'admin' | result.auth === 'operator') {
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


// 구글 로그인

router.get('/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

router.get( '/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
}));

router.get("/google/success", (req,res) => {
    res.redirect('/')
})

router.get("/google/failure", (req,res) => {
    res.render("<script>alert('로그인에 실패했습니다.');location.href = document.referrer;</script>")
})

// 카카오 로그인

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('/');
});


// 페이스북 로그인

router.get('/facebook', passport.authenticate('facebook', {
    authType: 'rerequest', scope: ['public_profile', 'email']
  }));

router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) {
    res.redirect('/');
});

module.exports = router;