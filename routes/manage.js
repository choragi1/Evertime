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

//관리자 페이지
router.get('/admin', isAdmin, function (req, res) {
    res.render('admin.ejs');
  })

//회원 관리
router.get('/member', isAdmin, (req, res) => {

    db.collection('userinfo').find().toArray(function (err, result) {
        res.render('memberlist.ejs', { userinfo: result });

    });
});


//자유게시판 관리
router.get('/freeboard', isAdmin, (req, res) => {

    db.collection('post').find().sort({ "_id": -1 }).toArray(function (err, result) {
        console.log(result);
        res.render('postlist.ejs', { post: result });
    });
});


//질답게시판 관리
router.get('/qnaboard', isAdmin, (req, res) => {

    db.collection('qnapost').find().sort({ "_id": -1 }).toArray(function (err, result) {
        console.log(result);
        res.render('qnapostlist.ejs', { qnapost: result });
    });
});

//관리자 로그인 확인(관리자세요?)
function isAdmin(req, res, next) {
    if (req.user != null) {
        db.collection('userinfo').findOne({ id: req.user.id }, function (err, result) {
            if (result.auth === 'admin') {
                next()
            } else {
                res.send("<script>alert('관리자 권한이 없습니다.');location.href = document.referrer;</script>")
            }
        })
    } else {
        res.send("<script>alert('관리자 권한이 없습니다.');location.href = document.referrer;</script>")
    }
}

module.exports=router;