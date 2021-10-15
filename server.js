const express = require('express');
const app = express();
require('dotenv').config()

const mongoose = require('./lib/db')

// 로그 수집을 위한 morgan 라이브러리 사용
// const morgan = require('morgan');

//method-override 라이브러리 사용
const methodOverride = require('method-override');

// 로그인 관련 미들웨어
const passport = require('./lib/passport')
const session = require('express-session');
const bcrypt = require('bcrypt');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({ secret: 'choragi', resave: false, saveUninitialized: false, cookie: { maxAge: 60 * 60 * 1000 } }));
app.use(passport.initialize());
app.use(passport.session());
// app.use(morgan("tiny"));

// 라우터 설정

const freeRouter = require('./routes/free')
const qnaRouter = require('./routes/qna')
const memberRouter = require('./routes/member')
const authRouter = require('./routes/auth')
const manageRouter = require('./routes/manage')
const indexRouter = require('./routes/index')
const mypageRouter = require('./routes/mypage')

// http로 요청시 https로 자동 변환
// app.use((req,res,next)=>{
//   if(!req.secure){
//     res.redirect("https://evertime-326013.du.r.appspot.com/"+req.url);
//   }else{
//     next();
//   }
// })

app.enable("trust proxy");

app.use('/free', freeRouter );
app.use('/qna', qnaRouter );
app.use('/member', memberRouter );
app.use('/auth', authRouter );
app.use('/manage', manageRouter );
app.use('/', indexRouter );
app.use('/mypage', mypageRouter );

// public 폴더에 path 지정
app.use('/public', express.static('public'));

// View 페이지 path 지정
app.set('views', './routes/views');

// view engine ejs로 설정
app.set('view engine', 'ejs');

app.listen(process.env.PORT, function () {
  console.log(`listening on ${process.env.PORT}`)
});





//미사용 코드(파일업로드)

// app.get('/upload',(req,res) => {
//   res.render('upload.ejs');
// })


// //파일 업로드, 저장을 위한 multer 라이브러리
// const multer = require('multer');

// //memoryStorage RAM에 저장해주세요~ (휘발성 O)
// // var storage = multer.memoryStorage({})

// //diskStorage 일반 하드(저장공간)에 저장해주세요~
// var uploadtime = moment().format("YYMMDD_hhmmss");
// var storage = multer.diskStorage({
//   destination : (req,file,cb) => {
//     cb(null, './public/userimage')
//   },
//   filename : (req, file, cb) => {
//     cb(null, uploadtime+"_"+file.originalname)
//   }
// });




// //파일 업로드 관련
// var path = require('path');
// var upload = multer({
//                       storage : storage,
//                       fileFilter: (req,file,callback)=>{
//                       var ext = path.extname(file.originalname);
//                       if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
//                         return callback(new Error('PNG, JPG만 업로드하세요'))
//                         }
//                         callback(null, true)
//                     },
//                     limits:{
//                         fileSize: 1024 * 1024 * 2
//                     }
//                 });


// app.post('/upload', upload.single('file'), (req,res) => {
//   res.send("<script>alert('파일을 업로드 했습니다.');location.href = document.referrer;</script>")
// });