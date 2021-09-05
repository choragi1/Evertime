const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
// 현재 express 특정 버전 이후로는 express에 bodyParser가 자동 내장되어있어 사용되지 않는 코드입니다.
// var bodyParser = require('body-parser');
app.use(express.urlencoded({ extended: true }));
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
    // 클라이언트에게 전송 완료 메세지를 출력한 후
    res.send('전송완료');
    // 콘솔에 사용자가 <body>태그 안의 user_id, user_pw , ... 등으로 전송한 파라미터들을 출력한다.
    console.log(req.body.user_id,req.body.user_pw,req.body.user_name,req.body.user_email);
    // DB에 'counter'테이블에 접속하여, '총회원수' name을 가진 row를 찾고, totalMember column에 기록되어있는 값을 출력
    db.collection('counter').findOne({name : '총회원수'}, function(err,result){
        console.log(result.totalMember);
        var totalMember = result.totalMember;
    
        // DB내 'userinfo' 테이블에 접속하여 파라미터로 받아온 해당 정보를을 기록한다.
        db.collection('userinfo').insertOne( { _id : totalMember + 1,아이디 : req.body.user_id, 비밀번호 : req.body.user_pw, 이름 : req.body.user_name , 이메일 : req.body.user_email} , function(){
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
    res.send('게시물 등록 완료되었습니다.');
    console.log(req.body.post_title,req.body.post_content)
    db.collection('counter').findOne({name : '총게시글수'}, function(err,result){
      console.log(result.totalPosts);
      var totalPosts = result.totalPosts;

      db.collection('post').insertOne({_id : totalPosts + 1, 글제목 : req.body.post_title, 글내용 : req.body.post_content}, function(){
        console.log('게시글 등록완료');
        db.collection('counter').updateOne({name:'총게시글수'},{$inc : {totalPosts:1}},function(err,result){
          if(err){return console.log(err)}
        })
      })
    })
  })


  app.post('/updatepost/:postno', function(req,res){
    console.log(req.body.post_title,req.body.post_content)
      var postno = req.params.postno;
      db.collection('post').updateOne({_id : parseInt(req.params.postno) },{'$set':{글제목 : req.body.post_title, 글내용 : req.body.post_content}}, function(err,result){
        console.log('게시글 수정완료\n','수정 후 : '+result);
          if(err){return console.log(err)}
      })
      res.redirect('/detail/'+postno)
    })


  // 업데이트포스트/포스트넘버로 접속하면 해당 포스트넘버를 _id로 가진 DB를 findOne해서
  // result를 가져오고, result.글제목과 result.글내용을 updateOne하고
  // 게시글 등록완료와 글번호, 글제목, 글내용을 콘솔로그로 찍는다.

// detail/어쩌구로 get 요청을 하면, function의 동작을 수행 (URL의 파라미터)
app.get('/detail/:postno',function(req,res){
  db.collection('post').findOne({_id : parseInt(req.params.postno)}, function(err,result){
    console.log(result);
    //data : 게시글의 이름, result : 게시글 전체 내용
    res.render('detail.ejs',{post: result})
  })
})



//   /list로 get 요청으로 접속하면
//   실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌
app.post('/memberlist',(req,res)=>{
    res.send()
})


app.get('/board', (req, res) => {
  db.collection('post').find().toArray(function(err,result){
    console.log(result);
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

app.get('/post', (req, res) => {
 res.render('post.ejs')
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