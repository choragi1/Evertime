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
    const maxPost = 3;
    const viewPage = page-2
      db.collection('qnapost').find().limit(maxPost).skip(maxPost*(page-1)).sort({ "_id": -1 }).toArray(function (err, result) {
        db.collection('qnapost').count({},(err,count)=>{
            let pagenum = Math.ceil(count / maxPost);
            const maxPage = pagenum<5 ? pagenum : 5;
            res.render('qnaboard.ejs', { post: result, pagenum : pagenum, page:page, maxPage : maxPage, count:count, viewPage : viewPage});
        })
        
      });
    });


// 질답게시판 게시글 상세페이지 GET
router.get('/detail/:postno', function (req, res) {
    var postno = parseInt(req.params.postno);
    db.collection('qnapost').updateOne({ _id: postno }, { $inc: { viewcounts: 1 } }, function (err, result) {
        db.collection('qnapost').findOne({ _id: postno }, function (err, result) {
            db.collection('qnacomments').find({ parent: postno }).sort({ "date": -1 }).toArray(function (err, result2) {
                if (result == null) {
                    res.render('error404.ejs');
                } else {
                    res.render('qnadetail.ejs', { qnapost: result, qnapost2: result2 });
                }
            })
        })
    })
})


//질답게시판 검색 (미구현상태)




//질답게시판 게시글 작성 페이지 GET 요청
router.get('/write', isLogin, (req, res) => {
    res.render('qnapost.ejs', { user: req.user });
});




// 질답게시판 게시글 쓰기
router.post('/post', function (req, res) {
    let uploadtime = moment().format("YYYY-MM-DD hh:mm");
    let title = req.body.title;
    let content = req.body.content;
    let id = req.body.id;
    console.log(req.body.title, req.body.content)
    db.collection('counter').findOne({ name: 'totalqnaposts' }, function (err, result) {
      let totalPosts = result.totalPosts;
      db.collection('qnapost').insertOne({ _id: totalPosts + 1, post_title: title, post_content: content, date: uploadtime, writer: id, viewcounts: 0, recommend: 0, commentcnt: 0, likeusers : []}, function (err, result2) {
        console.log('게시글 등록완료');
        db.collection('counter').updateOne({ name: 'totalqnaposts' }, { $inc: { totalPosts: 1 } }, function () {
          if (err) { return console.log(err) }
          res.send('등록되었습니다.')
        })
      })
    })
  })


// 질답게시판 댓글 작성
router.post('/comment', isLogin, function (req, res) {
    var postid = parseInt(req.body.postid);
    var uploadtime = moment().format("YYYY-MM-DD HH:mm");
    db.collection('counter').findOne({ name: "totalqnacomments" }, (err, count) => {
        let commentNum = parseInt(count.currentcomments);
        db.collection('counter').updateOne({ name: "totalqnacomments" }, { $inc: { currentcomments: 1 } }, () => {
            db.collection('qnacomments').insertOne({ _id: commentNum + 1, comment: req.body.comment, parent: postid, date: uploadtime, writer: req.user.id }, function (err, result) {
                db.collection('qnapost').updateOne({ _id: postid }, { $inc: { commentcnt: 1 } }, (err, result) => {
                    console.log(`질답게시판 ${postid}번 게시글에 댓글이 작성되었습니다.`)
                    res.send('등록되었습니다.')
                })
            })
        })
    })
})


  // 자유게시판 댓글 수정
  router.put('/comment', (req,res)=>{
    let commentid = parseInt(req.body._id);
    let writer = req.body.writer;
    let comment = req.body.comment
    if(req.user===undefined){
      res.send('로그인 후 이용 가능합니다.')
    }else if(req.user.id === writer){
      db.collection('qnacomments').findOne({_id:commentid},(err,result)=>{
        db.collection('qnacomments').updateOne({_id : commentid},{$set:{comment:comment}},(err,result2)=>{
            let parent = result.parent;
            console.log(`질답게시판 ${parent}번 게시글에서 ${writer}님이 댓글을 수정하셨습니다.`)
            res.send('수정되었습니다.')
          })
        })    
    }else{
      res.send('수정 권한이 없습니다.')
    }
  })





// 질답게시판 댓글 삭제
router.delete('/comment', (req, res) => {
    let commentid = parseInt(req.body._id);
    let writer = req.body.writer;
    if (req.user === undefined) {
        res.send('로그인 후 이용 가능합니다.')
    } else if (req.user.id === writer) {
        db.collection('qnacomments').findOne({ _id: commentid }, (err, result) => {
            db.collection('qnacomments').deleteOne({ _id: commentid }, (err, result2) => {
                let parent = result.parent;
                db.collection('qnapost').updateOne({ _id: parent }, { $inc: { commentcnt: -1 } }, (err, result3) => {
                    db.collection('counter').updateOne({ name: "totalqnacomments" }, { $inc: { currentcomments: -1 } }, (err, result4) => {
                        console.log(`자유게시판 ${parent}번 게시글에서 ${writer}님이 댓글을 삭제하셨습니다.`)
                        res.send('삭제되었습니다.')
                    })
                })
            })
        })
    } else {
        res.send('작성자만 삭제 가능합니다.')
    }
})



// 질답게시판 추천 (ID당 한명씩만 가능)
router.post('/detail/like', function (req, res) {
    if (req.user != null) {
        var postid = parseInt(req.body._id);
        var userid = req.user.id
        console.log(postid)
        db.collection('qnapost').findOne({ _id: postid }, (err, result) => {
            if (result.likeusers.includes(userid)) {
                res.send("이미 추천한 게시글입니다.")
            } else {
                db.collection('qnapost').updateMany({ _id: postid }, { $inc: { recommend: 1 }, $push: { likeusers: userid } })
                console.log(`질답게시판 ${postid}번 게시글이 추천되었습니다. 추천한 User : ${userid}`)
                res.send("추천하였습니다.")
            }
        })
    } else {
        res.send("로그인 후 가능합니다.")
    }
})



//질답게시판(qna) 게시글 수정 페이지 POST 요청
router.post('/edit', isLogin, function (req, res) {
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
router.put('/edit', function (req, res) {
    db.collection('qnapost').updateOne({ _id: parseInt(req.body.id) }, { $set: { post_title: req.body.post_title, post_content: req.body.post_content } }, function () {
        console.log('게시글 수정 완료')
        res.redirect('/qna/board/1');
    });
});

//질답게시판 게시글 삭제(DELETE)
router.delete('/del', isLogin, (req, res) => {
    console.log(req.user, req.body.writer)
    var postno = parseInt(req.body._id)
    if (req.user.id == req.body.writer) {
        db.collection('qnapost').deleteOne({ _id: postno, writer: req.user.id }, (err, result) => {
            db.collection('counter').updateOne({ name: 'totalposts' }, { $inc: { currentPosts: -1 } }, function () {
                if (err) { return console.log(err) }
                console.log("질답게시판 " + postno + "번 게시글 삭제 완료")
                res.send('삭제되었습니다.')
            })
        })
    } else {
        res.send("작성자만 삭제 가능합니다.")
    }
})

//로그인 확인(로그인했니?)
function isLogin(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.send("<script>alert('로그인 후 이용해주세요.');location.href = document.referrer;</script>");
    }
}

module.exports = router;