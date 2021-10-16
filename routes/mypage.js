const express = require('express');
const router = express.Router();
const User = require('../models/user')
const bcrypt = require("bcrypt");
const multer = require('multer');
const moment = require('moment');
const path = require('path');
const date = moment().format("YYMMDD_HHmm");



//마이페이지 회원정보 수정
router.get('/info', isLogin, function (req, res) {
  res.render('myinfo.ejs', { user: req.user })
})

// 기타 라우팅 없는 페이지 => 메인 페이지
router.get('/*', (req,res)=>{
  res.redirect('/')
})


//diskStorage 일반 하드(저장공간)에 저장해주세요~
var storage = multer.diskStorage({
  destination : (req,file,cb) => {
    cb(null, './public/userimage/')
  },
  filename : (req, file, cb) => {
    cb(null, date+"_"+file.originalname)
  }
});

//파일 업로드 관련
var upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return callback(new Error("PNG, JPG만 업로드하세요"));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 3,
  },
});



// 사진 업로드
router.post('/upload', upload.single('file'), (req,res) => {
  let userno = parseInt(req.user._id);
  let filepath = `/public/userimage/${date}_${req.file.originalname}`;
  console.log(`유저 번호 : ${userno}`)
  console.log(`파일 경로 : ${filepath}`)
  User.updateOne({_id : userno},
    {
      $set : {
        img : filepath
      }},
      (err,result) => {
        res.send("<script>alert('수정되었습니다.');location.href = document.referrer;</script>")
      }
      )
});

//로그인 확인(로그인했니?)
function isLogin(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send(
      "<script>alert('로그인 후 이용해주세요.');location.href = '/';</script>"
      );
    }
  }
  
  module.exports=router;