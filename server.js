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
const session = require('express-session');
// const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const saltRounds = 10;

require('dotenv').config()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({ secret: '!%(@byebye!%(@', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

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
// app.use(cookieParser());

app.set('view engine', 'ejs');

// public 폴더에 path 지정
app.use('/public', express.static('public'));

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


//인증정보 저장(네이게이션바 로딩완료시)
app.get('/getauth', (req,res) => {
  res.send(req.user)
})


//회원가입
app.post('/member/add', function (req, res) {
  let reg_id = /^[a-z0-9]{4,20}$/;
  let reg_pw = /(?=.*\d)(?=.*[a-zA-ZS]).{8,}/;
  let reg_name = /^[가-힣a-zA-Z]+$/;
  let reg_email = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;

  let user_id = req.body.user_id;
  let user_pw = req.body.user_pw;
  let user_name = req.body.user_name;
  let user_email = req.body.user_email;

  if (user_id == null | user_pw == null | user_name == null | user_email == null | user_id.length == 0 | user_pw.length == 0 | user_name.length == 0 | user_email.length == 0) {
    res.send("<script>alert('필수정보를 입력해주세요');location.href = document.referrer;</script>")
  } else if (!reg_id.test(user_id)) {
    res.send("<script>alert('아이디는 4~20자리 이상의 영문,숫자 조합만 가능합니다.');location.href = document.referrer;</script>")
  } else if (!reg_pw.test(user_pw)) {
    res.send("<script>alert('비밀번호는 문자,숫자를 1개 이상 포함한 8자리 이상만 가능합니다.');location.href = document.referrer;</script>")
  } else if (!reg_name.test(user_name)) {
    res.send("<script>alert('이름은 한글,영문만 가능합니다.');location.href = document.referrer;</script>")
  } else if (!reg_email.test(user_email)) {
    res.send("<script>alert('이메일 양식을 확인해주세요.');location.href = document.referrer;</script>")
  } else {
    var uploadtime = moment().format("YYYY-MM-DD");
    db.collection('counter').findOne({ name: 'member' }, function (err, result) {
      console.log(result.totalMember);
      var totalMember = result.totalMember;
      bcrypt.hash(user_pw, 10, (err,hash) => {
      db.collection('userinfo').findOne({ id: user_id }, (err, result) => {
        if(result==null){
          db.collection('userinfo').insertOne({ _id: totalMember + 1, id: user_id, pw: hash, name: user_name, email: user_email, joinDate: uploadtime, auth: "normal" }, function (err, result) {
            console.log('회원정보 저장완료');
            console.log(user_id, user_pw, user_name, user_email);
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


// 회원가입 중복 아이디 검사
app.post('/check/id',(req,res) => {
  let checkId = req.body.id

  if(checkId==null | checkId==''){
    res.send("아이디를 입력해주세요!")
}else{

  db.collection('userinfo').findOne({id : checkId},(err,result)=>{
    if(result!=null){
      console.log(`중복된 아이디 확인 요청 : ${checkId}`)
      res.send("이미 존재하는 아이디입니다.")
    }else{

      res.send("사용 가능한 아이디입니다.")
    }
  }) 
}
})




// 자유게시판 페이지 GET 요청
app.get('/free/board/:page', (req, res) => {
  var page = req.params.page;
  let num = 8;

  db.collection('post').find().limit(8).skip(num*(page-1)).sort({ "_id": -1 }).toArray(function (err, result) {
    db.collection('post').count({},(err,result2)=>{
      let pagenum = Math.ceil(result2/num);
      res.render('freeboard.ejs', { post: result, pagenum : pagenum, page:page});
    })
    
  });
});




//자유게시판 검색기능
app.get('/search', (req, res) => {
  var searchcondition = [
    {
      $search: {
        index: 'titleSearch',
        text: {
          query: req.query.value,
          path: ['post_title', 'post_content']
        }
      }
    },
    { $sort: { _id: -1 } },
    { $limit: 100 }
  ]
  db.collection('post').aggregate(searchcondition).toArray((err, result) => {
    console.log(result)
    res.render('freesearch.ejs', { post: result })
  })
})

//자유게시판 게시글 작성 페이지 GET 요청
app.get('/free/write', isLogin, function (req, res) {
  console.log(req.body)
  res.render('freepost.ejs', { user: req.user });
});


// 자유게시판 게시글 쓰기
app.post('/free/post', function (req, res) {
  var uploadtime = moment().format("YYYY-MM-DD hh:mm");
  console.log(req.body.post_title, req.body.post_content)
  db.collection('counter').findOne({ name: 'totalfreeposts' }, function (err, result) {
    console.log(result.totalPosts);
    var totalPosts = result.totalPosts;
    console.log(req.body.user_id)
    db.collection('post').insertOne({ _id: totalPosts + 1, post_title: req.body.post_title, post_content: req.body.post_content, date: uploadtime, writer: req.body.user_id, viewcounts: 0, recommend: 0, commentcnt: 0, likeusers : []}, function (err, result2) {
      console.log('게시글 등록완료');
      db.collection('counter').updateOne({ name: 'totalfreeposts' }, { $inc: { totalPosts: 1 } }, function () {
        if (err) { return console.log(err) }
        res.redirect("/free/board/1")
      })
    })
  })
})





// 자유게시판 게시글 상세페이지 GET
app.get('/free/detail/:postno', function (req, res) {
  var postno = parseInt(req.params.postno);
  db.collection('post').updateOne({ _id: postno }, { $inc: { viewcounts: 1 } }, function (err, result) {
    db.collection('post').findOne({ _id: postno }, function (err, result) {
      db.collection('freecomments').find({parent : postno}).sort({ "date": -1 }).toArray(function (err, result2) {
        if (result == null) {
          res.render('error404.ejs');
        } else {
          res.render('freedetail.ejs', { post: result, post2 : result2});
        }
      })
    })
  })
})


//자유게시판 게시글수정 페이지 POST 요청
app.post('/free/edit', isLogin, function (req, res) {
  console.log('자유게시판 글수정 POST 요청', '게시글번호 : ' + req.user._id)
  if (req.user.id == req.body.writer) {
    db.collection('post').findOne({ _id: parseInt(req.body._id) }, (err, result) => {
      res.render('freeedit.ejs', { post: result })
    })
  } else {
    res.send("<script>alert('수정 권한이 없습니다.');location.href = document.referrer;</script>")
  }
})

//자유게시판 게시글 수정 PUT 요청
app.put('/free/edit', function (req, res) {
  db.collection('post').updateOne({ _id: parseInt(req.body.id) }, { $set: { post_title: req.body.post_title, post_content: req.body.post_content } }, function () {
    console.log('게시글 수정 완료')
    res.redirect('/free/board/1');
  });
});

//자유게시판 게시글 삭제(DELETE)
app.delete('/free/del', isLogin, (req, res) => {
  console.log(req.user,req.body.writer)
  var postno = parseInt(req.body._id)
  if (req.user.id == req.body.writer) {
  db.collection('post').deleteOne({ _id: postno , writer: req.user.id }, (err, result) => {
    db.collection('counter').updateOne({ name: 'totalposts' }, { $inc: { currentPosts: -1 } }, function () {
      if (err) { return console.log(err) }
      console.log("자유게시판 " + postno + "번 게시글 삭제 완료")
      res.send('삭제되었습니다.')
    })
  })
}else{
  res.send("작성자만 삭제 가능합니다.")
}
})



// 자유게시판 댓글 작성
app.post('/free/comment', isLogin ,function (req, res) {
  var postid = parseInt(req.body.postid);
  var uploadtime = moment().format("YYYY-MM-DD HH:mm");
  db.collection('counter').findOne({name : "totalfreecomments"},(err,count)=>{
    let commentNum = parseInt(count.currentcomments);
    db.collection('counter').updateOne({name : "totalfreecomments"},{$inc:{currentcomments : 1}},()=>{
      db.collection('freecomments').insertOne({ _id : commentNum+1 ,comment: req.body.comment, parent: postid, date: uploadtime, writer: req.user.id }, function (err, result) {
        db.collection('post').updateOne({_id : postid}, {$inc : {commentcnt : 1}},(err,result)=>{
        console.log(`자유게시판 ${postid}번 게시글에 댓글이 작성되었습니다.`)
        res.redirect(`/free/detail/${postid}`)
      })
      })
    })
  })
})


// 자유게시판 댓글 삭제
app.delete('/free/comment', (req,res)=>{
  let commentid = parseInt(req.body._id);
  let writer = req.body.writer;
  if(req.user===undefined){
    res.send('로그인 후 이용 가능합니다.')
  }else if(req.user.id === writer){
    db.collection('freecomments').findOne({_id:commentid},(err,result)=>{
      db.collection('freecomments').deleteOne({_id : commentid},(err,result2)=>{
        let parent = result.parent;
      db.collection('post').updateOne({_id:parent},{$inc:{commentcnt : -1}}, (err,result3) =>{
        db.collection('counter').updateOne({name:"totalfreecomments"},{$inc:{currentcomments:-1}},(err,result4)=>{
          console.log(`자유게시판 ${parent}번 게시글에서 ${writer}님이 댓글을 삭제하셨습니다.`)
          res.send('삭제되었습니다.')
        })
      })
    })
})      
  }else{
    res.send('작성자만 삭제 가능합니다.')
  }
})


// 자유게시판 추천 (ID당 한명씩만 가능)
app.post('/free/detail/like', function (req, res) {
  if (req.user != null) {
    var postid = parseInt(req.body._id);
    var userid = req.user.id
    console.log(postid)
    db.collection('post').findOne({ _id: postid }, (err, result) => {
      if (result.likeusers.includes(userid)) {
        res.send("이미 추천한 게시글입니다.")
      } else {
        db.collection('post').updateMany({ _id: postid }, { $inc: { recommend: 1 }, $push: { likeusers: userid } })
        console.log(`자유게시판 "${postid}번 게시글이 추천되었습니다. 추천한 User : ${userid}`)
        res.send("추천하였습니다.")
      }
    })
  } else {
    res.send("로그인 후 가능합니다.")
  }
})


// 질답게시판 페이지 GET 요청
app.get('/qna/board/:page', (req, res) => {
  var page = req.params.page;
  let num = 8;

  db.collection('qnapost').find().limit(8).skip(num*(page-1)).sort({ "_id": -1 }).toArray(function (err, result) {
    db.collection('qnapost').count({},(err,result2)=>{
      let pagenum = Math.ceil(result2/num);
      res.render('qnaboard.ejs', { post: result, pagenum : pagenum, page:page});
    })  
  });
});


// 질답게시판 게시글 상세페이지 GET
app.get('/qna/detail/:postno', function (req, res) {
  var postno = parseInt(req.params.postno);
  db.collection('qnapost').updateOne({ _id: postno }, { $inc: { viewcounts: 1 } }, function (err, result) {
    db.collection('qnapost').findOne({ _id: postno }, function (err, result) {
      db.collection('qnacomments').find({parent : postno}).sort({ "date": -1 }).toArray(function (err, result2) {
        if (result == null) {
          res.render('error404.ejs');
        } else {
          res.render('qnadetail.ejs', { qnapost: result, qnapost2 : result2});
        }
      })
    })
  })
})


//질답게시판 검색 (미구현상태)




//질답게시판 게시글 작성 페이지 GET 요청
app.get('/qna/write', isLogin, (req, res) => {
  res.render('qnapost.ejs', { user: req.user });
});




// 질답게시판 게시글 쓰기
app.post('/qna/post', function (req, res) {
  var uploadtime = moment().format("YYYY-MM-DD hh:mm");
  console.log(req.body.post_title, req.body.post_content)
  db.collection('counter').findOne({ name: 'totalqnaposts' }, function (err, result) {
    console.log(result.totalPosts);
    var totalPosts = result.totalPosts;

    db.collection('qnapost').insertOne({ _id: totalPosts + 1, post_title: req.body.post_title, post_content: req.body.post_content, date: uploadtime, writer: req.body.user_id, viewcounts: 0, recommend: 0, commentcnt: 0, likeusers : []}, function (err, result2) {
      console.log('게시글 등록완료');
      db.collection('counter').updateOne({ name: 'totalqnaposts' }, { $inc: { totalPosts: 1 } }, function () {
        if (err) { return console.log(err) }
        res.redirect("/qna/board/1")
      })
    })
  })
})


// 질답게시판 댓글 작성
app.post('/qna/comment', isLogin ,function (req, res) {
  var postid = parseInt(req.body.postid);
  var uploadtime = moment().format("YYYY-MM-DD HH:mm");
  db.collection('counter').findOne({name : "totalqnacomments"},(err,count)=>{
    let commentNum = parseInt(count.currentcomments);
    db.collection('counter').updateOne({name : "totalqnacomments"},{$inc:{currentcomments : 1}},()=>{
      db.collection('qnacomments').insertOne({ _id : commentNum+1 ,comment: req.body.comment, parent: postid, date: uploadtime, writer: req.user.id }, function (err, result) {
        db.collection('qnapost').updateOne({_id : postid}, {$inc : {commentcnt : 1}},(err,result)=>{
        console.log(`질답게시판 ${postid}번 게시글에 댓글이 작성되었습니다.`)
        res.redirect(`/qna/detail/${postid}`)
      })
      })
    })
  })
})

// 질답게시판 댓글 삭제
app.delete('/qna/comment', (req,res)=>{
  let commentid = parseInt(req.body._id);
  let writer = req.body.writer;
  if(req.user===undefined){
    res.send('로그인 후 이용 가능합니다.')
  }else if(req.user.id === writer){
    db.collection('qnacomments').findOne({_id:commentid},(err,result)=>{
      db.collection('qnacomments').deleteOne({_id : commentid},(err,result2)=>{
        let parent = result.parent;
      db.collection('post').updateOne({_id:parent},{$inc:{commentcnt : -1}}, (err,result3) =>{
        db.collection('counter').updateOne({name:"totalqnacomments"},{$inc:{currentcomments:-1}},(err,result4)=>{
          console.log(`자유게시판 ${parent}번 게시글에서 ${writer}님이 댓글을 삭제하셨습니다.`)
          res.send('삭제되었습니다.')
        })
      })
    })
})      
  }else{
    res.send('작성자만 삭제 가능합니다.')
  }
})



// 질답게시판 추천 (ID당 한명씩만 가능)
app.post('/qna/detail/like', function (req, res) {
  if (req.user != null) {
    var postid = parseInt(req.body._id);
    var userid = req.user.id
    console.log(postid)
    db.collection('qnapost').findOne({ _id: postid }, (err, result) => {
      if (result.likeusers.includes(userid)) {
        res.send("이미 추천한 게시글입니다.")
      } else {
        db.collection('qnapost').updateMany({ _id: postid }, { $inc: { recommend: 1 } , $push: { likeusers: userid } })
        console.log(`질답게시판 ${postid}번 게시글이 추천되었습니다. 추천한 User : ${userid}`)
        res.send("추천하였습니다.")
      }
    })
  } else {
    res.send("로그인 후 가능합니다.")
  }
})



//질답게시판(qna) 게시글 수정 페이지 POST 요청
app.post('/qna/edit', isLogin, function (req, res) {
  console.log('QnA게시판 글수정 POST 요청', '게시글번호 : ' + req.user._id)
  if (req.user.id == req.body.writer) {
    db.collection('qnapost').findOne({ _id: parseInt(req.body._id) }, (err, result) => {
      res.render('qnaedit.ejs', { qnapost: result })
    })
  } else {
    res.send("<script>alert('수정 권한이 없습니다.');location.href = document.referrer;</script>")
  }
})

//질답게시판(QnA) 게시글 수정 PUT 요청
app.put('/qna/edit', function (req, res) {
  db.collection('qnapost').updateOne({ _id: parseInt(req.body.id) }, { $set: { post_title: req.body.post_title, post_content: req.body.post_content } }, function () {
    console.log('게시글 수정 완료')
    res.redirect('/qna/board/1');
  });
});

//질답게시판 게시글 삭제(DELETE)
app.delete('/qna/del', isLogin, (req, res) => {
  console.log(req.user,req.body.writer)
  var postno = parseInt(req.body._id)
  if (req.user.id == req.body.writer) {
  db.collection('qnapost').deleteOne({ _id: postno , writer: req.user.id }, (err, result) => {
    db.collection('counter').updateOne({ name: 'totalposts' }, { $inc: { currentPosts: -1 } }, function () {
      if (err) { return console.log(err) }
      console.log("질답게시판 " + postno + "번 게시글 삭제 완료")
      res.send('삭제되었습니다.')
    })
  })
}else{
  res.send("작성자만 삭제 가능합니다.")
}
})





// 메인페이지(index)
app.get('/', (req, res) => {
  // console.log(req.session.passport)
  res.render('index.ejs')
});

// 소개 페이지
app.get('/intro', (req, res) => {
  res.render('introduce.ejs');
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


//로그인 post (관리자 로그인 확인)
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/fail' }), function (req, res) {
  db.collection('userinfo').findOne({id : req.user.id},(err,result)=>{
    if(err){return console.log(err)}
    if(result.auth=='admin'){
      res.send("<script>alert('관리자 로그인에 성공했습니다.');location.href = document.referrer;</script>")  
    } else {
      res.send("<script>location.href = document.referrer;</script>")  
    }
  })
});

//로그인 실패시
app.get('/fail', function (req, res) {
  res.send("<script>alert('로그인에 실패했습니다');location.href = document.referrer;</script>")  
})

app.get('/logout', (req,res)=>{
  req.session.destroy((err,res)=>{
    if(err){return err} 
  })
    res.send("<script>alert('로그아웃 되었습니다.');location.href = document.referrer;</script>")
})


//회원가입
app.get('/signup', (req, res) => {
  res.render('signup.ejs');
});



//마이페이지
app.get('/mypage', isLogin, function (req, res) {
  // console.log(req.user) // deserializeUser 에서 찾았던 DB정보임.
  res.render('mypage.ejs', { userinfo: req.user })
})




//관리자 페이지
app.get('/admin', isAdmin, function (req, res) {
  res.render('admin.ejs');
})


//회원 관리
app.get('/manage/member', isAdmin, (req, res) => {

  db.collection('userinfo').find().toArray(function (err, result) {
    res.render('memberlist.ejs', { userinfo: result });

  });
});


//자유게시판 관리
app.get('/manage/freeboard', isAdmin, (req, res) => {

  db.collection('post').find().sort({ "_id": -1 }).toArray(function (err, result) {
    console.log(result);
    res.render('postlist.ejs', { post: result });
  });
});


//질답게시판 관리
app.get('/manage/qnaboard', isAdmin, (req, res) => {

  db.collection('qnapost').find().sort({ "_id": -1 }).toArray(function (err, result) {
    console.log(result);
    res.render('qnapostlist.ejs', { qnapost: result });
  });
});


//회원 삭제(회원 탈퇴)
app.delete('/member/del', (req, res) => {
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



//로그인 확인(로그인했니?)
function isLogin(req, res, next) {
  if (req.user) {
    next()
  } else {
    res.send("<script>alert('로그인 후 이용해주세요.');location.href = document.referrer;</script>");
  }
}

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


// 회원정보 수정
app.put('/mem/edit', function (req, res) {
  console.log(req.body.keyid)
  db.collection('userinfo').updateOne({ _id: parseInt(req.body.keyid) }, { $set: { id: req.body.user_id, pw: req.body.user_pw, name: req.body.user_name, email: req.body.user_email } }, function (err, result) {
    if (err) { return console.log(err) }
    console.log(req.body.user_id + "님 회원정보 수정이 완료되었습니다.")
    res.redirect('/')
  })
})

app.get('/upload',(req,res) => {
  res.render('upload.ejs');
})


//파일 업로드, 저장을 위한 multer 라이브러리
const multer = require('multer');

//memoryStorage RAM에 저장해주세요~ (휘발성 O)
// var storage = multer.memoryStorage({})

//diskStorage 일반 하드(저장공간)에 저장해주세요~
var uploadtime = moment().format("YYMMDD_hhmmss");
var storage = multer.diskStorage({
  destination : (req,file,cb) => {
    cb(null, './public/userimage')
  },
  filename : (req, file, cb) => {
    cb(null, uploadtime+"_"+file.originalname)
  }
});




//파일 업로드 관련
var path = require('path');
var upload = multer({
                      storage : storage,
                      fileFilter: (req,file,callback)=>{
                      var ext = path.extname(file.originalname);
                      if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
                        return callback(new Error('PNG, JPG만 업로드하세요'))
                        }
                        callback(null, true)
                    },
                    limits:{
                        fileSize: 1024 * 1024 * 2
                    }
                });


app.post('/upload', upload.single('file'), (req,res) => {
  res.send("<script>alert('파일을 업로드 했습니다.');location.href = document.referrer;</script>")
});