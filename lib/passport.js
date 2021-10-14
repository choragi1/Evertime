const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user')
const moment = require('moment')
const Counter = require('../models/counter')
const GoogleStrategy = require( 'passport-google-oauth20' ).Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

require('dotenv').config()



// 로그인 인증 관련 미들웨어
passport.use(
  new LocalStrategy(
    {
      usernameField: "user_id", // 클라이언트가 제출한 아이디가 어디 적혀있는지 (input name)
      passwordField: "user_pw", // 클라이언트가 제출한 비밀번호가 어디 적혀있는지 (input name)
      session: true, //세션 정보 저장할래?
      passReqToCallback: false, // 아이디, 비밀번호 이외의 다른 정보 검사가 필요한지
    },
    function (input_id, input_pw, done) {
      User.findOne({ id: input_id }, function (err, result) {
        if (err) return done(err);
        if (!result)
          return done(null, false, { message: "존재하지 않는 아이디입니다." });
        bcrypt.compare(input_pw, result.pw, (err, result2) => {
          if (result2) {
            return done(null, result);
          } else {
            return done(null, false, { message: "비밀번호가 틀렸습니다." });
          }
        });
      });
    })
);

passport.serializeUser(function (user, done) {
    done(null, user.id)
  });
  
// 세션에 저장된 데이터를 기준으로 해서 필요한 정보를 조회할 때 사용
passport.deserializeUser(function (id, done) {
  User.findOne({ id: id }, function (err, result) {
    done(null, result)
  })
})

// 구글 로그인
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      User.findOne({ googleId: profile.id }, (err, user) => {
        if (user) {
          return done(err,user)
        }else{
          let date = moment().format("YYYY-MM-DD");
          Counter.findOne({ name: "member" }, (err, count) => {
            Counter.updateOne({ name : "member"}, {$inc : {total:1}})
            let total = count.total;
            User.create(
              {
                _id: total + 1,
                id: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                nickname: profile.displayName,
                joinDate: date,
                googleId: profile.id,
              },
              (error, result) => {
                console.log(`결과 : ${result}`)
                return done(err, result);
              })
            })
          }}
      )}
  ))


// 카카오 로그인
passport.use('kakao', new KakaoStrategy({
  clientID: process.env.KAKAO_REST_API_KEY,
  callbackURL: '/auth/kakao/callback',
}, async (accessToken, refreshToken, profile, done) => {
  User.findOne({ kakaoId: profile.id }, (err, user) => {
    if (user) {
      return done(err,user)
    }else{
      let date = moment().format("YYYY-MM-DD");
      Counter.findOne({ name: "member" }, (err, count) => {
        Counter.updateOne({ name : "member"}, {$inc : {total:1}})
        let total = count.total;
        User.create(
          {
            _id: total + 1,
            id: profile.id,
            name: profile.username,
            nickname: profile.username,
            joinDate: date,
            kakaoId: profile.id,
          },
          (error, result) => {
            console.log(`결과 : ${result}`)
            return done(err, result);
          })
        })
      }}
  )}
))


// 페이스북 로그인
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_SECRET_CODE,
  callbackURL: '/auth/facebook/callback',
  passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => {
  User.findOne({ facebookId: profile.id }, (err, user) => {
    if (user) {
      return done(err,user)
    }else{
      let date = moment().format("YYYY-MM-DD");
      Counter.findOne({ name: "member" }, (err, count) => {
        Counter.updateOne({ name : "member"}, {$inc : {total:1}})
        let total = count.total;
        User.create(
          {
            _id: total + 1,
            id: profile.id,
            name: profile.displayName,
            nickname: profile.displayName,
            joinDate: date,
            facebookId: profile.id,
          },
          (error, result) => {
            console.log(`결과 : ${result}`)
            return done(err, result);
          })
        })
      }}
  )



  })
)








  module.exports = passport