const express = require('express');
const router = express.Router();


//날짜 관련 라이브러리인 moment 사용
const moment = require('moment');

const bcrypt = require('bcrypt');


require('dotenv').config()

// DB설정
const MongoClient = require('mongodb').MongoClient;
var db;
MongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, function (err, client) {
  if (err) {return console.log(err)}
  // todoapp이라는 db로 연결
  db = client.db('todoapp');
})

//회원가입
router.post('/add', function (req, res) {
    let reg_id = /^[a-z0-9]{4,20}$/;
    let reg_pw = /(?=.*\d)(?=.*[a-zA-ZS]).{8,}/;
    let reg_name = /^[가-힣a-zA-Z]+$/;
    let reg_email = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;

    let userID = req.body.user_id;
    let userPW = req.body.user_pw;
    let userName = req.body.user_name;
    let userEmail = req.body.user_email;

    if (userID == null | userPW == null | userName == null | userEmail == null | userID.length == 0 | userPW.length == 0 | userName.length == 0 | userEmail.length == 0) {
        res.send("<script>alert('필수정보를 입력해주세요');location.href = document.referrer;</script>")
    } else if (!reg_id.test(userID)) {
        res.send("<script>alert('아이디는 4~20자리 이상의 영문,숫자 조합만 가능합니다.');location.href = document.referrer;</script>")
    } else if (!reg_pw.test(userPW)) {
        res.send("<script>alert('비밀번호는 문자,숫자를 1개 이상 포함한 8자리 이상만 가능합니다.');location.href = document.referrer;</script>")
    } else if (!reg_name.test(userName)) {
        res.send("<script>alert('이름은 한글,영문만 가능합니다.');location.href = document.referrer;</script>")
    } else if (!reg_email.test(userEmail)) {
        res.send("<script>alert('이메일 양식을 확인해주세요.');location.href = document.referrer;</script>")
    } else {
        var uploadtime = moment().format("YYYY-MM-DD");
        db.collection('counter').findOne({ name: 'member' }, function (err, result) {
            console.log(result.totalMember);
            var totalMember = result.totalMember;
            bcrypt.hash(userPW, 10, (err, hash) => {
                db.collection('userinfo').findOne({ id: userID }, (err, result) => {
                    if (result == null) {
                        db.collection('userinfo').insertOne({ _id: totalMember + 1, id: userID, pw: hash, name: userName, email: userEmail, joinDate: uploadtime, auth: "normal" }, function (err, result) {
                            console.log('회원정보 저장완료');
                            console.log(userID, userPW, user_name, userEmail);
                            db.collection('counter').updateOne({ name: 'member' }, { $inc: { totalMember: 1 } }, function (err, result) {
                                if (err) { return console.log(err) }
                                res.send("<script>alert('회원가입에 성공했습니다.');location.href = document.referrer;</script>")
                            })
                        });
                    } else {
                        res.send("<script>alert('중복된 아이디입니다.');location.href = document.referrer;</script>")
                    }
                }
                )
            })
        }
        )
    }
});

// 회원정보 수정
router.put('/edit', function (req, res) {
    let userID = req.body.user_id;
    let userPW = req.body.user_pw;
    let userName = req.body.user_name;
    let userEmail = req.body.user_email;
    let userNo = req.body.keyid
    bcrypt.hash(userPW, 10, (err, hash) => {
    db.collection('userinfo').updateOne({ _id: parseInt(userNo) }, { $set: {pw: hash, name: userName, email: userEmail } }, function (err, result) {
        if (err) { return console.log(err) }
        console.log(`${userNo}님 회원정보 수정이 완료되었습니다.`)
        res.redirect('/')
    })
})
})

//회원 삭제(회원 탈퇴)
router.delete('/del', (req, res) => {
    //삭제되는 회원번호 출력
    console.log('삭제회원번호:', req.body);
    //데이터 전송으로 문자열로 자동 형변환된 데이터를 정수로 변환
    req.body._id = parseInt(req.body._id);
    //DB연동(userinfo 테이블)하여 클릭한 회원 정보를 삭제 후 콘솔에 회원정보 삭제 완료 메세지 출력
    db.collection('userinfo').deleteOne(req.body, function (err, result) {
        console.log('회원정보 삭제 완료')
        //DB 내에 있는 현재 회원숫자 정보에 -1
        db.collection('userinfo').updateOne({ name: 'member' }, { $inc: { currentMember: -1 } }, function (err, result) {
            if (err) { return console.log(err) }
        })
        //응답코드 200(정상)을 전송해주시고 연결 성공 메세지도 같이 보내주세요
        res.status(200).send({ message: '연결에 성공했습니다.' });
    })
});

module.exports=router;