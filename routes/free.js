const express = require('express');
const router = express.Router();


//날짜 관련 라이브러리인 moment 사용
const moment = require('moment');


require('dotenv').config()

// DB설정
const MongoClient = require('mongodb').MongoClient;
var db;
MongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, function (err, client) {
  if (err) {return console.log(err)}
  // todoapp이라는 db로 연결
  db = client.db('todoapp');
})


// 자유게시판 페이지 GET 요청
router.get('/board/:page', (req, res) => {
  let page = parseInt(req.params.page);
  const maxPost = 1;
  const viewPage = page-2
    db.collection('post').find().limit(maxPost).skip(maxPost*(page-1)).sort({ "_id": -1 }).toArray(function (err, result) {
      db.collection('post').count({},(err,count)=>{
        let pagenum = Math.ceil(count / maxPost);
        const maxPage = pagenum<5 ? count : 5;
        res.render('freeboard.ejs', { post: result, pagenum : pagenum, page:page, maxPage : maxPage, count:count, viewPage : viewPage});
      })
      
    });
  });
  
  
  
  
  //자유게시판 검색기능
  router.get('/search', (req, res) => {
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
  router.get('/write', isLogin, function (req, res) {
    console.log(req.body)
    res.render('freepost.ejs', { user: req.user });
  });
  
  
  // 자유게시판 게시글 쓰기
  router.post('/post', function (req, res) {
    let uploadtime = moment().format("YYYY-MM-DD hh:mm");
    let title = req.body.title;
    let content = req.body.content;
    let id = req.body.id;
    console.log(req.body.title, req.body.content)
    db.collection('counter').findOne({ name: 'totalfreeposts' }, function (err, result) {
      let totalPosts = result.totalPosts;
      db.collection('post').insertOne({ _id: totalPosts + 1, post_title: title, post_content: content, date: uploadtime, writer: id, viewcounts: 0, recommend: 0, commentcnt: 0, likeusers : []}, function (err, result2) {
        console.log('게시글 등록완료');
        db.collection('counter').updateOne({ name: 'totalfreeposts' }, { $inc: { totalPosts: 1 } }, function () {
          if (err) { return console.log(err) }
          res.send('등록되었습니다.')
        })
      })
    })
  })
  
  
  
  
  
  // 자유게시판 게시글 상세페이지 GET
  router.get('/detail/:postno', function (req, res) {
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
  router.post('/edit', isLogin, function (req, res) {
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
  router.put('/edit', function (req, res) {
    db.collection('post').updateOne({ _id: parseInt(req.body.id) }, { $set: { post_title: req.body.post_title, post_content: req.body.post_content } }, function () {
      console.log('게시글 수정 완료')
      res.redirect('/free/board/1');
    });
  });
  
  //자유게시판 게시글 삭제(DELETE)
  router.delete('/del', (req, res) => {
    if(req.user!=undefined){
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
  }}else{
    res.send("작성자만 삭제 가능합니다.")
  }
  })
  
  
  
  // 자유게시판 댓글 작성
  router.post('/comment' ,function (req, res) {
    if(req.user!=undefined){
    var postid = parseInt(req.body.postid);
    var uploadtime = moment().format("YYYY-MM-DD HH:mm");
    db.collection('counter').findOne({name : "totalfreecomments"},(err,count)=>{
      let commentNum = parseInt(count.currentcomments);
      db.collection('counter').updateOne({name : "totalfreecomments"},{$inc:{currentcomments : 1}},()=>{
        db.collection('freecomments').insertOne({ _id : commentNum+1 ,comment: req.body.comment, parent: postid, date: uploadtime, writer: req.user.id }, function (err, result) {
          db.collection('post').updateOne({_id : postid}, {$inc : {commentcnt : 1}},(err,result)=>{
          console.log(`자유게시판 ${postid}번 게시글에 댓글이 작성되었습니다.`)
          res.send('등록되었습니다.')
        })
        })
      })
    })
  }else{
    res.send('로그인 후 작성 가능합니다.')
  }
  })

  // 자유게시판 댓글 수정
  router.put('/comment', (req,res)=>{
    let commentid = parseInt(req.body._id);
    let writer = req.body.writer;
    let comment = req.body.comment
    if(req.user===undefined){
      res.send('로그인 후 이용 가능합니다.')
    }else if(req.user.id === writer){
      db.collection('freecomments').findOne({_id:commentid},(err,result)=>{
        db.collection('freecomments').updateOne({_id : commentid},{$set:{comment:comment}},(err,result2)=>{
            let parent = result.parent;
            console.log(`자유게시판 ${parent}번 게시글에서 ${writer}님이 댓글을 수정하셨습니다.`)
            res.send('수정되었습니다.')
          })
        })    
    }else{
      res.send('수정 권한이 없습니다.')
    }
  })
  
  
  // 자유게시판 댓글 삭제
  router.delete('/comment', (req,res)=>{
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
      res.send('삭제 권한이 없습니다.')
    }
  })
  
  
  // 자유게시판 추천 (ID당 한명씩만 가능)
  router.post('/detail/like', function (req, res) {
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

  //로그인 확인(로그인했니?)
function isLogin(req, res, next) {
    if (req.user) {
      next()
    } else {
      res.send("로그인 후 이용해주세요.");
    }
  }
  
  module.exports=router;