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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({secret : '비밀코드',resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine','ejs');

// public 폴더에 path 지정
app.use('/public', express.static('public'));

var db;
MongoClient.connect('mongodb+srv://root:adminuser@cluster0.83hv2.mongodb.net/todoapp?retryWrites=true&w=majority', { useUnifiedTopology: true } ,function (err, client) {
  if (err){
    return console.log(err)
  } 
  // todoapp이라는 db로 연결
  db = client.db('todoapp');
 

  app.listen(3000, function () {
    console.log('listening on 3000')
  });
});


//회원가입
  app.post('/member/add', function(req, res){
    var uploadtime = moment().format("YYYY-MM-DD");
    console.log(req.body.user_id,req.body.user_pw,req.body.user_name,req.body.user_email);
    db.collection('counter').findOne({name : 'member'}, function(err,result){
        console.log(result.totalMember);
        var totalMember = result.totalMember;
    
        db.collection('userinfo').insertOne( { _id : totalMember + 1,id : req.body.user_id, pw : req.body.user_pw, name : req.body.user_name , email : req.body.user_email, joinDate : uploadtime} , function(){
            console.log('회원정보 저장완료');
            db.collection('counter').updateOne({name:'member'},{$inc : {totalMember:1}},function(err,result){
                if(err){return console.log(err)}
                res.redirect('/');
            })
    });
    });
  });

  // 자유게시판 게시글 쓰기
  app.post('/post/free', function(req,res){
    var uploadtime = moment().format("YYYY-DD-MM hh:mm");
    console.log(req.body.post_title,req.body.post_content)
    db.collection('counter').findOne({name : 'totalfreeposts'}, function(err,result){
      console.log(result.totalPosts);
      var totalPosts = result.totalPosts;

      db.collection('post').insertOne({_id : totalPosts + 1, post_title : req.body.post_title, post_content : req.body.post_content, date : uploadtime}, function(err,result2){
        console.log('게시글 등록완료');
        db.collection('counter').updateOne({name:'totalfreeposts'},{$inc : {totalPosts:1}},function(){
          if(err){return console.log(err)}
          res.redirect("/board/free")
        })
      })
    })
  })

  // 질답게시판 게시글 쓰기
  app.post('/post/qna', function(req,res){
    var uploadtime = moment().format("YYYY-DD-MM hh:mm");
    console.log(req.body.post_title,req.body.post_content)
    db.collection('counter').findOne({name : 'totalqnaposts'}, function(err,result){
      console.log(result.totalPosts);
      var totalPosts = result.totalPosts;

      db.collection('qnapost').insertOne({_id : totalPosts + 1, post_title : req.body.post_title, post_content : req.body.post_content, date : uploadtime}, function(err,result2){
        console.log('게시글 등록완료');
        db.collection('counter').updateOne({name:'totalqnaposts'},{$inc : {totalPosts:1}},function(){
          if(err){return console.log(err)}
          res.redirect("/board/qna")
        })
      })
    })
  })
 


// 자유게시판 GET
app.get('/board/free', (req, res) => {
  db.collection('post').find().sort( {"_id": -1 } ).toArray(function(err,result){
    res.render('freeboard.ejs', {post: result, user:req.user});
});
});

// 자유게시판 게시글 상세페이지 GET
app.get('/detail/free/:postno', function (req, res) {
  var postno = req.params.postno;
  db.collection('post').updateOne({ _id: parseInt(postno) }, { $inc : { viewcounts: 1 } }, function (err, result) {
    db.collection('post').findOne({ _id: parseInt(postno) }, function (err, result) {
      db.collection('freeco')
        if (result == null) {
          res.render('error404.ejs');
        } else {
          res.render('detailfree.ejs', { post: result });
        }
      })
    })
  })

// 자유게시판 댓글 작성 
app.post('/detail/free/regcomm',function(req,res){
  var postid = parseInt(req.body.postid);
  var uploadtime = moment().format("YYYY-DD-MM hh:mm");
  db.collection('freecomments').insertOne({comment : req.body.comment ,parent : postid, date : uploadtime },function(err,result){
    console.log("자유게시판 "+postid+"번 게시글에 댓글이 작성되었습니다.")
    res.redirect("/detail/free/"+postid)
  })
})

// 자유게시판 추천
app.post('detail/free/like',function(req,res){
  var postid = parseInt(req.body.postid);
  db.collection('post').updateOne({_id : postid},{$inc:{recommend : 1}})
  console.log("자유게시판 "+postid+"번 게시글이 추천되었습니다.")
})
  
  //질답게시판 게시판 GET 요청시
  app.get('/board/qna', (req, res) => {
    db.collection('qnapost').find().sort( {"_id": -1 } ).toArray(function(err,result){
      res.render('qnaboard.ejs', {post: result} );
  });
  });

// 질답게시판 게시글 상세페이지 GET
  app.get('/detail/qna/:postno', function (req, res) {
    var postno = req.params.postno;
    db.collection('qnapost').updateOne({ _id: parseInt(postno) }, { $inc: { viewcounts: 1 } }, function (err, result) {
      db.collection('qnapost').findOne({ _id: parseInt(postno) }, function (err, result) {
          if (result == null) {
            res.render('error404.ejs');
          } else {
            res.render('qnadetail.ejs', { qnapost: result });
          }
        })
      })
    })



  //게시판 게시글 수정
  app.put('/edit/free', function(req, res){
    db.collection('post').updateOne( {_id : parseInt(req.body.id) }, {$set : { post_title : req.body.post_title , post_content : req.body.post_content }}, function(){
      console.log('게시글 수정 완료')
      res.redirect('/board/free');
    });
  });

  //질답게시판(QnA) 게시글 수정
  app.put('/edit/qna', function(req, res){
    db.collection('qnapost').updateOne( {_id : parseInt(req.body.id) }, {$set : { post_title : req.body.post_title , post_content : req.body.post_content }}, function(){
      console.log('게시글 수정 완료')
      res.redirect('/board/qna');
    });
  });









//mondoDB에서 데이터를 찾은 것은 result에 저장. edit.ejs로 데이터 전송 => edit.ejs에서 해당 result를 활용 가능 
app.get('/edit/free/:postno',function(req,res){

  //post 테이블로 db연동. 테이블 내에 url 뒤의 게시글넘버와 DB 내 _id가 동일한 것을 찾아 조회
  db.collection('post').findOne({_id:parseInt(req.params.postno)},function(err,result){
      db.collection('counter').findOne({name : 'totalfreeposts'}, function(err,result2){
      if(req.params.postno>result2.totalPosts){
        res.render('error404.ejs');    
    }else{
    res.render('editfree.ejs',{post: result});}
  })

})})

//질답게시판(qna) 게시글 수정 (GET요청)
app.get('/edit/qna/:postno',function(req,res){

  //post 테이블로 db연동. 테이블 내에 url 뒤의 게시글넘버와 DB 내 _id가 동일한 것을 찾아 조회
  db.collection('qnapost').findOne({_id:parseInt(req.params.postno)},function(err,result){
      db.collection('counter').findOne({name : 'totalqnaposts'}, function(err,result2){
      if(req.params.postno>result2.totalPosts){
        res.render('error404.ejs');    
    }else{
    res.render('editqna.ejs',{post: result});}
  })

})})

// 메인페이지(index)
app.get('/', (req, res) => {
  res.render('index.ejs')
});

// 소개 페이지
app.get('/intro', (req, res) => {
  res.render('introduce.ejs');
 });

// **********************************************************************
//게시글 작성 (자유게시판)
app.get('/post', isLogin ,function(req, res){
  console.log(req.body)
  // db.collection('userinfo').findOne(req.body)
 res.render('post.ejs',{user:req.user});
});
// **********************************************************************

//게시글 작성 (질답게시판)
app.get('/qna/write', (req, res) => {
  res.render('qnapost.ejs');
 });

  // 로그인 인증 관련 미들웨어
  passport.use(new LocalStrategy({
    usernameField: 'user_id', // 클라이언트가 제출한 아이디가 어디 적혀있는지 (input name)
    passwordField: 'user_pw', // 클라이언트가 제출한 비밀번호가 어디 적혀있는지 (input name)
    session: true,  //세션 정보 저장할래?
    passReqToCallback: false, // 아이디, 비밀번호 이외의 다른 정보 검사가 필요한지
  }, function (input_id, input_pw, done) {
    // console.log(input_id, input_pw);
    db.collection('userinfo').findOne({ id: input_id }, function (err, result) {
      if (err) return done(err)

      if (!result) return done(null, false, { message: '존재하지 않는 아이디입니다.' })
      if (input_pw == result.pw) {
        return done(null, result)
      } else {
        return done(null, false, { message: '비밀번호가 틀렸습니다.' })
      }
    })
  }));


  // 로그인 성공시, 유저의 정보를 시리얼라이즈 해서 user.id라는 정보로 세션을 만들어서 저장함
  passport.serializeUser(function(user,done){
    done(null, user.id)
  });
  
  
  // 이 세션 데이터를 가진 사람을 DB에서 찾아주세요. (마이페이지 접속시)
  passport.deserializeUser(function(id,done){
    db.collection('userinfo').findOne({id: id},function(err,result){
      done(null, result)
    })
    
  })





//로그인
app.get('/login',function(req,res){
  res.render('login.ejs');
})

//로그인 post (관리자 로그인 확인)
app.post('/login', passport.authenticate('local', {failureRedirect : '/fail'}), function(req, res){
  if(req.user.id=='choragi'&&req.user.pw=='eoals1592'){
    res.redirect('/admin')
  }else{
  res.redirect('/')
  }
});

//로그인 실패시
app.get('/fail',function(req,res){
  res.render('loginerr.ejs');
})


//회원가입
app.get('/signup', (req, res) => {
    res.render('signup.ejs');
  });



//마이페이지
app.get('/mypage',isLogin,function(req,res){
  // console.log(req.user) // deserializeUser 에서 찾았던 DB정보임.
  res.render('mypage.ejs', { userinfo: req.user })
})




//관리자 페이지
app.get('/admin',isAdmin,function(req,res){
  res.render('admin.ejs');
})


//회원 관리
app.get('/manage/member',isAdmin, (req,res) => {
    
    db.collection('userinfo').find().toArray(function(err,result){
        console.log(result);
        res.render('memberlist.ejs', {userinfo: result} );
    
    });
});


//자유게시판 관리
app.get('/manage/freeboard',isAdmin, (req,res) => {
    
  db.collection('post').find().sort( {"_id": -1 } ).toArray(function(err,result){
      console.log(result);
      res.render('postlist.ejs', {post: result} );
  });
});


//질답게시판 관리
app.get('/manage/qnaboard',isAdmin, (req,res) => {
    
  db.collection('qnapost').find().sort( {"_id": -1 } ).toArray(function(err,result){
      console.log(result);
      res.render('qnapostlist.ejs', {qnapost: result} );
  });
});


//회원 삭제(회원 탈퇴)
app.delete('/member/del', (req,res) => {
  //삭제되는 회원번호 출력
  console.log('삭제회원번호:',req.body);
  //데이터 전송으로 문자열로 자동 형변환된 데이터를 정수로 변환
  req.body._id = parseInt(req.body._id);
  //DB연동(userinfo 테이블)하여 클릭한 회원 정보를 삭제 후 콘솔에 회원정보 삭제 완료 메세지 출력
  db.collection('userinfo').deleteOne(req.body,function(err,result){
    console.log('회원정보 삭제 완료')
  //DB 내에 있는 현재 회원숫자 정보에 -1
  db.collection('userinfo').updateOne({name:'member'},{$inc : {currentMember:-1}},function(err,result){
    if(err){return console.log(err)}
})
    //응답코드 200(정상)을 전송해주시고 연결 성공 메세지도 같이 보내주세요
    res.status(200).send({message : '연결에 성공했습니다.'});
  })
});


app.get('/free/del/:postno', (req, res) => {
  var postno = req.params.postno;
  console.log('삭제 게시글번호:'+postno);
  db.collection('post').deleteOne({_id : parseInt(postno)},function (err, result) {
    db.collection('counter').updateOne({ name: 'totalqnaposts' }, { $inc: { currentPosts: -1 } }, function () {
      if (err) { return console.log(err) }
      console.log("자유게시판 "+postno+"번 게시글 삭제 완료")
      res.redirect('/board/free')
    })
  })
  });



//질답게시판(qna) 게시글 삭제
app.get('/qna/del/:postno', (req, res) => {
var postno = req.params.postno;
console.log('삭제게시글번호:'+postno);
db.collection('qnapost').deleteOne({_id : parseInt(postno)},function (err, result) {
  db.collection('counter').updateOne({ name: 'totalqnaposts' }, { $inc: { currentPosts: -1 } }, function () {
    if (err) { return console.log(err) }
    console.log("질답게시판 "+postno+"번 게시글 삭제 완료")
    res.redirect('/board/qna')
  })
})
});







//로그인 확인(로그인했니?)
function isLogin(req,res,next){
  if (req.user){
    next()
  } else {
    res.render('mypageerr.ejs');
  }
}

//관리자 로그인 확인(관리자세요?)
function isAdmin(req,res,next){
  if(req.user.id=='choragi'){
    next()
  } else {
    res.render('mypageerr.ejs')
  }
}

// function isOwner(req,res,next){
//   if(req.user.id==)
// }





  // 수정해야함 (마이페이지 회원정보 수정)
  // app.get('/updatemem',function(req,res){
  //   db.collection('userinfo').findOne({_id:parseInt(req.body.id_key)},function(err,result){
  //       db.collection('counter').findOne({name : 'totalfreeposts'}, function(err,result2){
  //     res.render('editfree.ejs',{post: result})}
  //   )
  
  // })})

app.post('/mem/edit', function (req, res) {
  console.log(req.body.keyid)
  db.collection('userinfo').updateOne({ _id: parseInt(req.body.keyid) }, { $set: { id: req.body.user_id, pw: req.body.user_pw, name: req.body.user_name, email: req.body.user_email } }, function (err, result) {
    if (err) { return console.log(err) }
    console.log(req.body.user_id + "님 회원정보 수정이 완료되었습니다.")
    res.redirect('/')
  })
})


  // // 회원정보 수정
  // app.put('/updatemem', function(req, res){
  //   db.collection('userinfo').updateOne( {_id : parseInt(req.body.id) }, {'$set' : { id : req.body.user_id , pw : req.body.user_pw, name : req.body.user_name, email : req.body.user_email}}, function(){
  //     console.log('멤버정보 수정 완료')
  //     res.redirect('/mypage');
  //   });
  // });

  