const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
app.use(express.urlencoded({ extended: true }));
app.set('view engine','ejs');

var db;
MongoClient.connect('mongodb+srv://root:adminuser@cluster0.83hv2.mongodb.net/todoapp?retryWrites=true&w=majority', { useUnifiedTopology: true } ,function (err, client) {
  if (err){
    return console.log(err)
  } 
  // todoapp이라는 db로 연결
  db = client.db('todoapp');
 

  app.listen(8080, function () {
    console.log('listening on 8080')
  });
});


// express를 사용해, post라는 파일에 insertOne 메서드를 통해 
  app.post('/addmember', function(req, res){
    res.send('전송완료');
    console.log(req.body.user_id,req.body.user_pw,req.body.user_name,req.body.user_email);
    db.collection('counter').findOne({name : '총회원수'}, function(err,result){
        console.log(result.totalMember);
        var totalMember = result.totalMember
    
        db.collection('userinfo').insertOne( { _id : totalMember + 1,아이디 : req.body.user_id, 비밀번호 : req.body.user_pw, 이름 : req.body.user_name , 이메일 : req.body.user_email} , function(){
            console.log('회원정보 저장완료')
            // counter 테이블에 있는 name이 총회원수인 데이터를 찾아 totalMember을 1을 더해주신 후, 만약 에러가 난다면 콘솔창에 에러를 찍어주세요.
            // set은 할당할때 사용하는 연산자, inc는 증감연산자
            db.collection('counter').updateOne({name:'총회원수'},{$inc : {totalMember:1}},function(err,result){
                if(err){return console.log(err)}
            })
    });
    
    });
  });


//   /list로 get 요청으로 접속하면
//   실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌
  app.post('/list',(req,res)=>{
      res.send()
  })


app.get('/board', (req, res) => {
  res.sendFile(__dirname + '/board.html')
});

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/signup.html')
  });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

app.get('/list', (req,res) => {
    
    db.collection('userinfo').find().toArray(function(err,result){
        console.log(result);
        res.render('list.ejs', {userinfo: result} );
    
    });
});

app.delete('/delete', (req,res) => {
    console.log(req.body);
    //데이터 전송으로 문자열로 자동 형변환된 데이터를 정수로 변환
    req.body._id = parseInt(req.body._id);
    db.collection('userinfo').deleteOne(req.body,function(err,result){
      console.log('회원정보 삭제 완료')
    })
    
});