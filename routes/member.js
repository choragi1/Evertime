const express = require("express");
const router = express.Router();
const User = require('../models/user')
const Counter = require('../models/counter')
//날짜 관련 라이브러리인 moment 사용
const moment = require("moment");

const bcrypt = require("bcrypt");

require("dotenv").config();



//회원가입
router.post("/add", function (req, res) {
  let reg_id = /^[a-z0-9]{5,12}$/;
  let reg_pw = /(?=.*\d)(?=.*[a-zA-ZS]).{8,}/;
  let reg_nick = /^([a-zA-Z0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣]).{2,10}$/;
  let reg_name = /^([a-zA-Z0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣]).{2,10}$/;
  let reg_email =
    /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;

  let userID = req.body.userID;
  let userPW = req.body.userPW;
  let userNick = req.body.userNick;
  let userName = req.body.userName;
  let userEmail = req.body.userEmail;

  if (
    (userID == null) |
    (userPW == null) |
    (userName == null) |
    (userEmail == null) |
    (userID.length == 0) |
    (userPW.length == 0) |
    (userNick.length == 0) |
    (userName.length == 0) |
    (userEmail.length == 0)
  ) {
    res.send("필수정보를 입력해주세요");
  } else if (!reg_id.test(userID)) {
    res.send("아이디는 6~12자리 내의 영문,숫자 조합만 가능합니다.");
  } else if (!reg_pw.test(userPW)) {
    res.send("비밀번호는 문자,숫자를 1개 이상 포함한 8자리 이상만 가능합니다.");
  } else if (!reg_nick.test(userNick)) {
    res.send("닉네임은 2~10자리 내의 한글,영문만 사용가능합니다.");
  } else if (!reg_name.test(userName)) {
    res.send("이름은 2~10자리 내의 한글,영문만 사용가능합니다.");
  } else if (!reg_email.test(userEmail)) {
    res.send("이메일 양식을 확인해주세요.");
  } else {
    var uploadtime = moment().format("YYYY-MM-DD");
    Counter.findOne(
      { name: "member" },
      function (err, result) {
        console.log(result.total);
        var total = result.total;
        bcrypt.hash(userPW, 10, (err, hash) => {
          User.findOne({ id: userID }, (err, result) => {
            if (result == null) {
              User.create(
                {
                  _id: total + 1,
                  id: userID,
                  pw: hash,
                  name: userName,
                  email: userEmail,
                  nickname: userNick,
                  joinDate: uploadtime,
                  auth: "normal",
                },
                function (err, result) {
                  console.log("회원정보 저장완료");
                  console.log(userID, userPW, userName, userEmail);
                  Counter.updateOne(
                    { name: "member" },
                    { $inc: { total: 1, current : 1 } },
                    function (err, result) {
                      if (err) {
                        return console.log(err);
                      }
                      res.send("회원가입에 성공했습니다.");
                    }
                  );
                }
              );
            } else {
              res.send("중복된 아이디입니다.");
            }
          });
        });
      }
    );
  }
});

// 회원정보 수정
router.put("/edit", function (req, res) {
  let reg_pw = /(?=.*\d)(?=.*[a-zA-ZS]).{8,}/;
  let reg_nick = /^([a-zA-Z0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣]).{1,10}$/;
  let reg_name = /^([a-zA-Z0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣]).{1,10}$/;
  let reg_email = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;

  let userPW = req.body.userPW;
  let userNick = req.body.userNick;
  let userName = req.body.userName;
  let userEmail = req.body.userEmail;
  let userNo = parseInt(req.body.userNo);
  
  User.findOne({ _id: userNo }, (err, user) => {
    bcrypt.compare(userPW, user.pw, (err, result) => {
      if (result!=true) {
        res.send('비밀번호가 틀렸습니다.');
      } else if ((userNick == null) | (userName == null) | (userEmail == null) | (userNick.length == 0) | (userName.length == 0) | (userEmail.length == 0)) {
    res.send("필수정보를 입력해주세요");
  } else if (!reg_pw.test(userPW)) {
    res.send("비밀번호는 문자,숫자를 1개 이상 포함한 8자리 이상만 가능합니다.");
  } else if (!reg_nick.test(userNick)) {
    res.send("닉네임은 2~10자리 내의 한글,영문만 사용가능합니다.");
  } else if (!reg_name.test(userName)) {
    res.send("이름은 2~10자리 내의 한글,영문만 사용가능합니다.");
  } else if (!reg_email.test(userEmail)) {
    res.send("이메일 양식을 확인해주세요.");
  } else {
    bcrypt.hash(userPW, 10, (err, hash) => {
      User.updateOne(
        { _id: userNo },
        {
          $set: {
            name: userName,
            email: userEmail,
            nickname: userNick,
          },
        },
        function (err, result) {
          User.findOne({ _id: userNo }, (err, user) => {
            if (err) {
              return console.log(err);
            }
            console.log(`${user.id}님 회원정보 수정이 완료되었습니다.`);
            res.send(`${user.id}님 회원정보 수정이 완료되었습니다.`);
        })
    })
})
}}
)}
)}
)
          

//회원 삭제(회원 탈퇴)
router.delete("/del", (req, res) => {
  //삭제되는 회원번호 출력
  console.log("삭제회원번호:", req.body);
  //데이터 전송으로 문자열로 자동 형변환된 데이터를 정수로 변환
  req.body._id = parseInt(req.body._id);
  //DB연동(userinfo 테이블)하여 클릭한 회원 정보를 삭제 후 콘솔에 회원정보 삭제 완료 메세지 출력
  User.deleteOne(req.body, function (err, result) {
    console.log("회원정보 삭제 완료");
    //DB 내에 있는 현재 회원숫자 정보에 -1
    User.updateOne(
      { name: "member" },
      { $inc: { current: -1 } },
      function (err, result) {
        if (err) {
          return console.log(err);
        }
      }
    );
    //응답코드 200(정상)을 전송해주시고 연결 성공 메세지도 같이 보내주세요
    res.send("탈퇴 처리 되었습니다.");
  });
});

module.exports = router;
