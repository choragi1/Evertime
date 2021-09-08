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




// 현재 express 특정 버전 이후로는 express에 bodyParser가 자동 내장되어있어 사용되지 않는 코드입니다.
// var bodyParser = require('body-parser');
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


// express를 사용해, post라는 파일에 /addmember로 접근하였을때 (회원가입 action)
  app.post('/addmember', function(req, res){
    var uploadtime = moment().format("YYYY-MM-DD");
    // 클라이언트에게 전송 완료 메세지를 출력한 후
    res.send('전송완료');
    // 콘솔에 사용자가 <body>태그 안의 user_id, user_pw , ... 등으로 전송한 파라미터들을 출력한다.
    console.log(req.body.user_id,req.body.user_pw,req.body.user_name,req.body.user_email);
    // DB에 'counter'테이블에 접속하여, '총회원수' name을 가진 row를 찾고, totalMember column에 기록되어있는 값을 출력
    db.collection('counter').findOne({name : '총회원수'}, function(err,result){
        console.log(result.totalMember);
        var totalMember = result.totalMember;
    
        // DB내 'userinfo' 테이블에 접속하여 파라미터로 받아온 해당 정보를을 기록한다.
        db.collection('userinfo').insertOne( { _id : totalMember + 1,id : req.body.user_id, pw : req.body.user_pw, name : req.body.user_name , email : req.body.user_email, joinDate : uploadtime} , function(){
            console.log('회원정보 저장완료');
            // counter 테이블에 있는 name이 총회원수인 데이터를 찾아 totalMember을 1을 더해주신 후, 만약 에러가 난다면 콘솔창에 에러를 찍어주세요.
            // set은 할당할때 사용하는 연산자, inc는 증감연산자
            // DB의 'counter' 테이블에 접속하여 '총회원수' name을 가진 row를 찾고, totalMember에 1을 더하여 수정한다.
            db.collection('counter').updateOne({name:'총회원수'},{$inc : {totalMember:1}},function(err,result){
                if(err){return console.log(err)}
            })
    });
    });
  });

  app.post('/uploadpost', function(req,res){
    var uploadtime = moment().format("YYYY-DD-MM hh:mm");
    res.send('게시물 등록 완료되었습니다.');
    console.log(req.body.post_title,req.body.post_content)
    db.collection('counter').findOne({name : '총게시글수'}, function(err,result){
      console.log(result.totalPosts);
      var totalPosts = result.totalPosts;

      db.collection('post').insertOne({_id : totalPosts + 1, 글제목 : req.body.post_title, 글내용 : req.body.post_content, 작성일 : uploadtime}, function(){
        console.log('게시글 등록완료');
        db.collection('counter').updateOne({name:'총게시글수'},{$inc : {totalPosts:1}},function(err,result){
          if(err){return console.log(err)}
        })
      })
    })
  })


  // 업데이트포스트/포스트넘버로 접속하면 해당 포스트넘버를 _id로 가진 DB를 findOne해서
  // result를 가져오고, result.글제목과 result.글내용을 updateOne하고
  // 게시글 등록완료와 글번호, 글제목, 글내용을 콘솔로그로 찍는다.

// detail/어쩌구로 get 요청을 하면, function의 동작을 수행 (URL의 파라미터)
app.get('/detail/:postno', function (req, res) {
  //post 테이블로 db연동. 테이블 내에 url 뒤의 게시글넘버와 DB 내 _id가 동일한 것을 찾아 조회
  var postno = req.params.postno;
  db.collection('post').updateOne({ _id: parseInt(postno) }, { $inc: { 조회수: 1 } }, function (err, result) {
    db.collection('post').findOne({ _id: parseInt(postno) }, function (err, result1) {
      db.collection('counter').findOne({ name: '총게시글수' }, function (err, result2) {
        if (postno > result2.totalPosts) {
          res.render('error404.ejs');
        } else {
          res.render('detail.ejs', { post: result1 });
        }
      })
    })
  })
})
  



//   /list로 get 요청으로 접속하면
//   실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌
app.post('/memberlist',(req,res)=>{
    res.send()
})


app.get('/board', (req, res) => {
  db.collection('post').find().sort( {"_id": -1 } ).toArray(function(err,result){
    res.render('board.ejs', {post: result} );
});
});




//mondoDB에서 데이터를 찾은 것은 result에 저장. edit.ejs로 데이터 전송 => edit.ejs에서 해당 result를 활용 가능 
app.get('/edit/:postno',function(req,res){

  //post 테이블로 db연동. 테이블 내에 url 뒤의 게시글넘버와 DB 내 _id가 동일한 것을 찾아 조회
  db.collection('post').findOne({_id:parseInt(req.params.postno)},function(err,result){
      db.collection('counter').findOne({name : '총게시글수'}, function(err,result2){
      if(req.params.postno>result2.totalPosts){
        res.render('error404.ejs');    
    }else{
    res.render('edit.ejs',{post: result});}
  })

})})


app.get('/introduce', (req, res) => {
  res.render('introduce.ejs');
 });

app.get('/post', (req, res) => {
 res.render('post.ejs');
});

app.get('/signup', (req, res) => {
    res.render('signup.ejs');
  });

app.get('/edit',(req,res) =>{
  res.render('edit.ejs');
});


app.get('/', (req, res) => {
  res.render('index.ejs')
});

app.get('/memberlist', (req,res) => {
    
    db.collection('userinfo').find().toArray(function(err,result){
        console.log(result);
        res.render('memberlist.ejs', {userinfo: result} );
    
    });
});

app.get('/fail',function(req,res){
  res.render('loginerr.ejs');
})

app.get('/mypage',isLogin,function(req,res){
  console.log(req.user) // deserializeUser 에서 찾았던 DB정보임.
  res.render('mypage.ejs', {사용자 : req.user});
})


function isLogin(req,res,next){
  if (req.user){
    next()
  } else {
    res.send('로그인 이후 접근해주세요.')
  }
}


app.get('/login',function(){
  res.render('login.ejs');
})

app.post('/login', passport.authenticate('local', {failureRedirect : '/fail'}), function(req, res){
  res.redirect('/')
});







  // 로그인 인증 관련 미들웨어
  passport.use(new LocalStrategy({
    usernameField: 'user_id', // 클라이언트가 제출한 아이디가 어디 적혀있는지 (input name)
    passwordField: 'user_pw', // 클라이언트가 제출한 비밀번호가 어디 적혀있는지 (input name)
    session: true,  //세션 정보 저장할래?
    passReqToCallback: false, // 아이디, 비밀번호 이외의 다른 정보 검사가 필요한지
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('userinfo').findOne({ id: 입력한아이디 }, function (err, result) {
      if (err) return done(err)

      if (!result) return done(null, false, { message: '존재하지 않는 아이디입니다.' })
      if (입력한비번 == result.pw) {
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
      done(null, {result})
    })
    
  })
  



app.delete('/delete', (req,res) => {
    //삭제되는 회원번호 출력
    console.log('삭제회원번호:',req.body);
    //데이터 전송으로 문자열로 자동 형변환된 데이터를 정수로 변환
    req.body._id = parseInt(req.body._id);
    //DB연동(userinfo 테이블)하여 클릭한 회원 정보를 삭제 후 콘솔에 회원정보 삭제 완료 메세지 출력
    db.collection('userinfo').deleteOne(req.body,function(err,result){
      console.log('회원정보 삭제 완료')
    //DB 내에 있는 현재 회원숫자 정보에 -1
    db.collection('userinfo').updateOne({name:'총회원수'},{$inc : {currentMember:-1}},function(err,result){
      if(err){return console.log(err)}
  })
      //응답코드 200(정상)을 전송해주시고 연결 성공 메세지도 같이 보내주세요
      res.status(200).send({message : '연결에 성공했습니다.'});
    })
  });


  //게시판 게시글 수정
  app.put('/edit', function(req, res){
    db.collection('post').updateOne( {_id : parseInt(req.body.id) }, {'$set' : { 글제목 : req.body.post_title , 글내용 : req.body.post_content }}, function(){
      console.log('게시글 수정 완료')
      res.redirect('/board');
    });
  });

  // POST 방식으로 처리한 게시판 게시글 수정 (위의 put 방식으로 대체)
  // app.post('/updatepost/:postno', function(req,res){
  //   console.log(req.body.post_title,req.body.post_content)
  //     var postno = req.params.postno;
  //     db.collection('post').updateOne({_id : parseInt(req.params.postno) },{'$set':{글제목 : req.body.post_title, 글내용 : req.body.post_content}}, function(err,result){
  //       console.log('게시글 수정완료\n'+'글제목 : '+req.body.post_title+'\n글내용 : '+req.body.post_content);
  //         if(err){return console.log(err)}
  //     })
  //     res.redirect('/detail/'+postno)
  //   })


  // post 로그인 구현 (위의 방식으로 대체)
  // app.post('/login', passport.authenticate(),function(req, res){
  //   var user_id = req.body.user_id;
  //   var user_pw = req.body.user_pw;
  //   console.log(req.body.user_id,req.body.user_pw);
  //   // DB에 'counter'테이블에 접속하여, '총회원수' name을 가진 row를 찾고, totalMember column에 기록되어있는 값을 출력
  //   db.collection('userinfo').findOne({id : req.body.user_id}, function(err,result){
  //     if(user_id==''){
  //       res.send("<script>alert('아이디를 입력해주세요.');</script>");
        
  //     }else if(user_pw==''){
  //       res.send("<script>alert('비밀번호를 입력해주세요.');</script>");
        
  //     }else{
  //       if(user_id!=result.id || user_pw!=result.pw){
  //         res.send("<script>alert('아이디, 비밀번호를 확인해주세요.');</script>");
        
  //       }else if(user_id=='choragi'){
  //         res.send("<script>alert('관리자 로그인에 성공했습니다.');</script>");
        
  //       }else{
  //         res.send("<script>alert('로그인했습니다!');</script>");
        
  //       }}
  //     })
  //   })