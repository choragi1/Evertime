const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user')

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

  module.exports = passport