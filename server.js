const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
//method-override 라이브러리 사용
const methodOverride = require('method-override');
//날짜 관련 라이브러리인 moment 사용
const moment = require('moment');
// 로그인 관련 미들웨어
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');
const bcrypt = require('bcrypt');





require('dotenv').config()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({ secret: 'choragi', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// 라우터 설정

const freeRouter = require('./routes/free')
const qnaRouter = require('./routes/qna')
const memberRouter = require('./routes/member')
const authRouter = require('./routes/auth')
const manageRouter = require('./routes/manage')
const indexRouter = require('./routes/index')

app.use('/free', freeRouter );
app.use('/qna', qnaRouter );
app.use('/member', memberRouter );
app.use('/auth', authRouter );
app.use('/manage', manageRouter );
app.use('/', indexRouter );

// public 폴더에 path 지정
app.use('/public', express.static('public'));

// 로그인 성공시 호출되며 유저의 정보를 세션에 저장함
passport.serializeUser(function (user, done) {
  done(null, user.id)
});

// 세션에 저장된 데이터를 기준으로 해서 필요한 정보를 조회할 때 사용
passport.deserializeUser(function (id, done) {
  db.collection('userinfo').findOne({ id: id }, function (err, result) {
    done(null, result)
  })
})

app.set('views', './routes/views');
app.set('view engine', 'ejs');



var db;
MongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, function (err, client) {
  if (err) {
    return console.log(err)
  }
  // todoapp이라는 db로 연결
  db = client.db('todoapp');


  app.listen(process.env.PORT, function () {
    console.log('listening on 8080')
  });
});


// 로그인 인증 관련 미들웨어
passport.use(new LocalStrategy({
  usernameField: 'user_id', // 클라이언트가 제출한 아이디가 어디 적혀있는지 (input name)
  passwordField: 'user_pw', // 클라이언트가 제출한 비밀번호가 어디 적혀있는지 (input name)
  session: true,  //세션 정보 저장할래?
  passReqToCallback: false, // 아이디, 비밀번호 이외의 다른 정보 검사가 필요한지
}, function (input_id, input_pw, done) {
  db.collection('userinfo').findOne({ id: input_id }, function (err, result) {
    if (err) return done(err)
    if (!result) return done(null, false, { message: '존재하지 않는 아이디입니다.' })
    bcrypt.compare(input_pw,result.pw,(err,result2) => {
      if (result2) {
        return done(null, result)
      } else {
        return done(null, false, { message: '비밀번호가 틀렸습니다.' })
      }
    })
    
  })
}));









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