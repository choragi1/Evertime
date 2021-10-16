const express = require('express');
const app = express();
require('dotenv').config()
const moment = require("moment");

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