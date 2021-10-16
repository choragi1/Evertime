const express = require("express");
const router = express.Router();
const Counter = require("../models/counter");
const FreeComment = require("../models/freecomment");
const Post = require("../models/post");

//날짜 관련 라이브러리인 moment 사용
const moment = require("moment");

require("dotenv").config();

// 자유게시판 페이지 GET 요청
router.get("/board/:page", (req, res) => {
  let page = parseInt(req.params.page);
  // 한 페이지에 보여줄 게시물 수
  let countPost = 10;
  // 한 페이지에 보여줄 페이지 수
  let countPage = 5;
  Post.find({})
    .sort({ _id: -1 })
    .skip(countPost * (page - 1))
    .limit(countPost)
    .exec((err, result) => {
      Post.count({}, (err, count) => {
        // 전체 게시글 수
        let totalPost = count;
        // 총 페이지 수
        let totalPage = Math.floor(totalPost / countPost);
        // 페이지 수 관련 로직
        totalPost % countPost > 0 ? totalPage++ : null;
        // 페이지 시작 번호
        let startPage = Math.floor((page - 1) / countPage) * countPage + 1;
        let endPage = startPage + countPage - 1;

        if ((page > 0) & (page <= totalPage)) {
          res.render("freeboard.ejs", {
            post: result,
            totalPost: totalPost,
            page: page,
            totalPage: totalPage,
            countPage: countPage,
            count: count,
            startPage: startPage,
            endPage: endPage,
            user : req.user
          });
        } else if (page > totalPage) {
          res.redirect(`/free/board/${totalPage}`);
        } else {
          res.redirect("/free/board/1");
        }
      });
    });
});

//자유게시판 검색기능
router.get("/search/:page", (req, res) => {
  let query = req.query.value;
  let fullquery = `?value=${query}`
  let search = query.split('?option=')

  let page = parseInt(req.params.page);
  // 한 페이지에 보여줄 게시물 수
  let countPost = 10;
  // 한 페이지에 보여줄 페이지 수
  let countPage = 5;

  if(search[1]==='제목'){
  Post.find({
    post_title : new RegExp(search[0])
  }).sort({ _id: -1 })
  .skip(countPost * (page - 1))
  .limit(countPost)
  .exec((err,result)=>{
    Post.count({post_title : new RegExp(search[0])}, (err, count) => {
      // 전체 게시글 수
      let totalPost = count;
      // 총 페이지 수
      let totalPage = Math.floor(totalPost / countPost);
      // 페이지 수 관련 로직
      totalPost % countPost > 0 ? totalPage++ : null;
      // 페이지 시작 번호
      let startPage = Math.floor((page - 1) / countPage) * countPage + 1;
      let endPage = startPage + countPage - 1;
      if ((page > 0) & (page <= totalPage)) {
        res.render("freesearch.ejs", {
          post: result,
          totalPost: totalPost,
          page: page,
          totalPage: totalPage,
          countPage: countPage,
          count: count,
          startPage: startPage,
          endPage: endPage,
          query : fullquery,
          user : req.user
        });
      } else if (page > totalPage) {
        res.redirect(`/free/search/${totalPage}`);
      } else {
        res.redirect("/free/search/1");
      }
    });
  })
  } else if(search[1]==='내용'){
    Post.find({
      post_content : new RegExp(search[0])
    }).sort({ _id: -1 })
    .skip(countPost * (page - 1))
    .limit(countPost)
    .exec((err,result)=>{
      Post.count({post_content : new RegExp(search[0])}, (err, count) => {
        // 전체 게시글 수
        let totalPost = count;
        // 총 페이지 수
        let totalPage = Math.floor(totalPost / countPost);
        // 페이지 수 관련 로직
        totalPost % countPost > 0 ? totalPage++ : null;
        // 페이지 시작 번호
        let startPage = Math.floor((page - 1) / countPage) * countPage + 1;
        let endPage = startPage + countPage - 1;
        if ((page > 0) & (page <= totalPage)) {
          res.render("freesearch.ejs", {
            post: result,
            totalPost: totalPost,
            page: page,
            totalPage: totalPage,
            countPage: countPage,
            count: count,
            startPage: startPage,
            endPage: endPage,
            query : fullquery,
            user : req.user
          });
        } else if (page > totalPage) {
          res.redirect(`/free/search/${totalPage}`);
        } else {
          res.redirect("/free/search/1");
        }
      });
    })
  } else if(search[1]==='제목 내용'){
    Post.find({
      $or : 
      [{post_title : new RegExp(search[0])},
      {post_content : new RegExp(search[0])}]
    }).sort({ _id: -1 })
    .skip(countPost * (page - 1))
    .limit(countPost)
    .exec((err,result)=>{
      Post.count({
        $or : 
        [{post_title : new RegExp(search[0])},
        {post_content : new RegExp(search[0])}]
      }, (err, count) => {
        // 전체 게시글 수
        let totalPost = count;
        // 총 페이지 수
        let totalPage = Math.floor(totalPost / countPost);
        // 페이지 수 관련 로직
        totalPost % countPost > 0 ? totalPage++ : null;
        // 페이지 시작 번호
        let startPage = Math.floor((page - 1) / countPage) * countPage + 1;
        let endPage = startPage + countPage - 1;
        if ((page > 0) & (page <= totalPage)) {
          res.render("freesearch.ejs", {
            post: result,
            totalPost: totalPost,
            page: page,
            totalPage: totalPage,
            countPage: countPage,
            count: count,
            startPage: startPage,
            endPage: endPage,
            query : fullquery,
            user : req.user
          });
        } else if (page > totalPage) {
          res.redirect(`/free/search/${totalPage}`);
        } else {
          res.redirect("/free/search/1");
        }
      });
    })
  } else if(search[1]==='작성자'){
    Post.find({
      writer : new RegExp(search[0])
    }).sort({ _id: -1 })
    .skip(countPost * (page - 1))
    .limit(countPost)
    .exec((err,result)=>{
      Post.count({writer : new RegExp(search[0])}, (err, count) => {
        // 전체 게시글 수
        let totalPost = count;
        // 총 페이지 수
        let totalPage = Math.floor(totalPost / countPost);
        // 페이지 수 관련 로직
        totalPost % countPost > 0 ? totalPage++ : null;
        // 페이지 시작 번호
        let startPage = Math.floor((page - 1) / countPage) * countPage + 1;
        let endPage = startPage + countPage - 1;
        if ((page > 0) & (page <= totalPage)) {
          res.render("freesearch.ejs", {
            post: result,
            totalPost: totalPost,
            page: page,
            totalPage: totalPage,
            countPage: countPage,
            count: count,
            startPage: startPage,
            endPage: endPage,
            query : fullquery,
            user : req.user
          });
        } else if (page > totalPage) {
          res.redirect(`/free/search/${totalPage}`);
        } else {
          res.redirect("/free/search/1");
        }
      });
    })
}});

//자유게시판 게시글 작성 페이지 GET 요청
router.get("/write", isLogin, (req, res) => {
  res.render("freepost.ejs", { user: req.user });
});

// 자유게시판 게시글 쓰기
router.post("/post", function (req, res) {
  let uploadtime = moment().format("YYYY-MM-DD HH:mm");
  let title = req.body.title;
  let content = req.body.content;
  let id = req.body.id;
  Counter.findOne({ name: "freeposts" }, (err, result) => {
    let total = result.total;
    Post.create(
      {
        _id: total + 1,
        post_title: title,
        post_content: content,
        date: uploadtime,
        writer: id,
      },
      (err, result2) => {
        console.log("게시글 등록완료");
        Counter.updateOne(
          { name: "freeposts" },
          { $inc: { total: 1, current: 1 } },
          () => {
            if (err) {
              return console.log(err);
            }
            res.send("등록되었습니다.");
          }
        );
      }
    );
  });
});

// 자유게시판 게시글 상세페이지 GET
router.get("/detail/:postno", (req, res) => {
  let postno = parseInt(req.params.postno);
  Post.updateOne(
    { _id: postno },
    { $inc: { viewcounts: 1 } },
    (err, result) => {
      Post.findOne({ _id: postno }, (err, result) => {
        FreeComment.find({ parent: postno })
          .sort({ date: -1 })
          .exec((err, comment) => {
            if (result == null) {
              res.render("error404.ejs");
            } else {
              res.render("freedetail.ejs", {
                post: result,
                comment: comment,
                user: req.user,
              });
            }
          });
      });
    }
  );
});

//자유게시판 게시글수정 페이지 POST 요청
router.post("/edit", isLogin, (req, res) => {
  if (req.user.id == req.body.writer) {
    Post.findOne({ _id: parseInt(req.body._id) }, (err, result) => {
      res.render("freeedit.ejs", { post: result, user : req.user });
    });
  } else {
    res.send(
      "<script>alert('수정 권한이 없습니다.');location.href = document.referrer;</script>"
    );
  }
});

//자유게시판 게시글 수정 PUT 요청
router.put("/edit", (req, res) => {
  

  let title = req.body.title;
  let content = req.body.content;
  let postno = parseInt(req.body.postno)

  Post.updateOne(
    { _id: postno },
    {
      $set: {
        post_title: title,
        post_content: content,
      },
    },
    (err, result) => {
      res.send("수정되었습니다.");
    }
  );
});

//자유게시판 게시글 삭제(DELETE)
router.delete("/del", (req, res) => {
  if (req.user != undefined) {
    console.log(req.user, req.body.writer);
    let postno = parseInt(req.body._id);
    if (req.user.id == req.body.writer) {
      Post.deleteOne({ _id: postno, writer: req.user.id }, (err, result) => {
        Counter.updateOne({ name: "posts" }, { $inc: { current: -1 } }, () => {
          if (err) {
            return console.log(err);
          }
          console.log("자유게시판 " + postno + "번 게시글 삭제 완료");
          res.send("삭제되었습니다.");
        });
      });
    } else {
      res.send("작성자만 삭제 가능합니다.");
    }
  } else {
    res.send("작성자만 삭제 가능합니다.");
  }
});

// 자유게시판 댓글 작성
router.post("/comment", isLogin, (req, res) => {

  if (req.user != undefined) {
    let postid = parseInt(req.body.postid);
    let uploadtime = moment().format("YYYY-MM-DD HH:mm");
    let comment = req.body.comment
    Counter.findOne({ name: "freecomments" }, (err, count) => {
      let commentNum = parseInt(count.current);
      Counter.updateOne(
        { name: "freecomments" },
        { $inc: { total: 1, current: 1 } },
        () => {
          console.log
          FreeComment.create(
            {
              _id: commentNum + 1,
              comment: comment,
              parent: postid,
              date: uploadtime,
              writer: req.user.id,
            },
            (err, result) => {
              Post.updateOne(
                { _id: postid },
                { $inc: { commentcnt: 1 } },
                (err, result) => {
                  console.log(
                    `자유게시판 ${postid}번 게시글에 댓글이 작성되었습니다.`
                  );
                  res.send("등록되었습니다.");
                }
              );
            }
          );
        }
      );
    });
  } else {
    res.send("로그인 후 작성 가능합니다.");
  }
});

// 자유게시판 댓글 수정
router.put("/comment", (req, res) => {
  let commentid = parseInt(req.body._id);
  let writer = req.body.writer;
  let comment = req.body.comment;
  if (req.user === undefined) {
    res.send("로그인 후 이용 가능합니다.");
  } else if (req.user.id === writer) {
    FreeComment.findOne({ _id: commentid }, (err, result) => {
      FreeComment.updateOne(
        { _id: commentid },
        { $set: { comment: comment } },
        (err, result2) => {
          let parent = result.parent;
          console.log(
            `자유게시판 ${parent}번 게시글에서 ${writer}님이 댓글을 수정하셨습니다.`
          );
          res.send("수정되었습니다.");
        }
      );
    });
  } else {
    res.send("수정 권한이 없습니다.");
  }
});

// 자유게시판 댓글 삭제
router.delete("/comment", (req, res) => {
  let commentid = parseInt(req.body._id);
  let writer = req.body.writer;
  if (req.user === undefined) {
    res.send("로그인 후 이용 가능합니다.");
  } else if (req.user.id === writer) {
    FreeComment.findOne({ _id: commentid }, (err, result) => {
      FreeComment.deleteOne({ _id: commentid }, (err, result2) => {
        let parent = result.parent;
        Post.updateOne(
          { _id: parent },
          { $inc: { commentcnt: -1 } },
          (err, result3) => {
            Counter.updateOne(
              { name: "freecomments" },
              { $inc: { current: -1 } },
              (err, result4) => {
                console.log(
                  `자유게시판 ${parent}번 게시글에서 ${writer}님이 댓글을 삭제하셨습니다.`
                );
                res.send("삭제되었습니다.");
              }
            );
          }
        );
      });
    });
  } else {
    res.send("삭제 권한이 없습니다.");
  }
});

// 자유게시판 추천 (ID당 한명씩만 가능)
router.post("/detail/like", (req, res) => {
  if (req.user != null) {
    let postid = parseInt(req.body._id);
    let userid = req.user.id;
    Post.findOne({ _id: postid }, (err, result) => {
      if (result.likeusers.includes(userid)) {
        res.send("이미 추천한 게시글입니다.");
      } else {
        Post.updateOne(
          { _id: postid },
          { $inc: { recommend: 1 },
            $push: { likeusers: userid },
           
          },
          (err, result) => {
            console.log(
              `자유게시판 ${postid}번 게시글이 추천되었습니다. 추천한 User : ${userid}`
            );
            res.send("추천하였습니다.");
          }
        );
      }
    });
  } else {
    res.send("로그인 후 가능합니다.");
  }
});

//로그인 확인(로그인했니?)
function isLogin(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send("로그인 후 이용해주세요.");
  }
}

module.exports = router;
