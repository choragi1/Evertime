const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Post = require("../models/post");
const QnaPost = require("../models/qnapost");

require("dotenv").config();

//관리자 페이지
router.get("/admin", isAdmin, function (req, res) {
  res.render("admin.ejs", { user: req.user });
});

//일반회원 관리
router.get("/members/:page", isAdmin, (req, res) => {
  let page = parseInt(req.params.page);
  // 한 페이지에 보여줄 회원 수
  let countMember = 10;
  // 한 페이지에 보여줄 페이지 수
  let countPage = 5;
  User.find({ auth: "normal" })
    .sort({ _id: -1 })
    .skip(countMember * (page - 1))
    .limit(countMember)
    .exec((err, result) => {
      User.count({ auth: "normal" }, (err, count) => {
        // 전체 회원 수
        let totalMember = count;
        // 총 페이지 수
        let totalPage = Math.floor(totalMember / countMember);
        // 페이지 수 관련 로직
        totalMember % countMember > 0 ? totalPage++ : null;
        // 페이지 시작 번호
        let startPage = Math.floor((page - 1) / countPage) * countPage + 1;
        let endPage = startPage + countPage - 1;
        if ((page > 0) & (page <= totalPage)) {
          res.render("memberlist.ejs", {
            member: result,
            totalMember: totalMember,
            page: page,
            totalPage: totalPage,
            countPage: countPage,
            startPage: startPage,
            endPage: endPage,
            user: req.user,
          });
        } else if (page > totalPage) {
          res.redirect(`/manage/members/${totalPage}`);
        } else {
          res.redirect(`/manage/members/${startPage}`);
        }
      });
    });
});

//총회원 관리
router.get("/users/:page", isOperator, (req, res) => {
  let page = parseInt(req.params.page);
  // 한 페이지에 보여줄 회원 수
  let countMember = 10;
  // 한 페이지에 보여줄 페이지 수
  let countPage = 5;
  User.find({})
    .sort({ _id: -1 })
    .skip(countMember * (page - 1))
    .limit(countMember)
    .exec((err, result) => {
      User.count({}, (err, count) => {
        // 전체 회원 수
        let totalMember = count;
        // 총 페이지 수
        let totalPage = Math.floor(totalMember / countMember);
        // 페이지 수 관련 로직
        totalMember % countMember > 0 ? totalPage++ : null;
        // 페이지 시작 번호
        let startPage = Math.floor((page - 1) / countPage) * countPage + 1;
        let endPage = startPage + countPage - 1;
        if ((page > 0) & (page <= totalPage)) {
          res.render("userlist.ejs", {
            member: result,
            totalMember: totalMember,
            page: page,
            totalPage: totalPage,
            countPage: countPage,
            startPage: startPage,
            endPage: endPage,
            user: req.user,
          });
        } else if (page > totalPage) {
          res.redirect(`/manage/users/${totalPage}`);
        } else {
          res.redirect(`/manage/users/${startPage}`);
        }
      });
    });
});

// 회원 등급 변경
router.put("/users/:userNo", (req, res) => {
  let userNo = parseInt(req.params.userNo);
  let select = req.body.select;
  User.updateOne({ _id: userNo }, { $set: { auth: select } }, (err, result) => {
    res.send("회원등급이 변경되었습니다.");
  });
});

//자유게시판 관리
router.get("/freeboard/:page", isAdmin, (req, res) => {
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
          res.render("postlist.ejs", {
            post: result,
            totalPost: totalPost,
            page: page,
            totalPage: totalPage,
            countPage: countPage,
            count: count,
            startPage: startPage,
            endPage: endPage,
            user: req.user,
          });
        } else if (page > totalPage) {
          res.redirect(`/manage/freeboard/${totalPage}`);
        } else {
          res.redirect(`/manage/freeboard/${startPage}`);
        }
      });
    });
});

// 자유게시판 게시글 삭제
router.delete("/post", isAdmin, (req, res) => {
  let postno = req.body._id;
  Post.findOneAndDelete({ _id: postno }, (err, result) => {
    res.send("삭제되었습니다.");
  });
});

//질답게시판 관리
router.get("/qnaboard/:page", isAdmin, (req, res) => {
  let page = parseInt(req.params.page);
  // 한 페이지에 보여줄 게시물 수
  let countPost = 10;
  // 한 페이지에 보여줄 페이지 수
  let countPage = 5;
  QnaPost.find({})
    .sort({ _id: -1 })
    .skip(countPost * (page - 1))
    .limit(countPost)
    .exec((err, result) => {
      QnaPost.count({}, (err, count) => {
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
          res.render("qnapostlist.ejs", {
            qnapost: result,
            totalPost: totalPost,
            page: page,
            totalPage: totalPage,
            countPage: countPage,
            count: count,
            startPage: startPage,
            endPage: endPage,
            user: req.user,
          });
        } else if (page > totalPage) {
          res.redirect(`/manage/qnaboard/${totalPage}`);
        } else {
          res.redirect(`/manage/qnaboard/${startPage}`);
        }
      });
    });
});

// 질답게시판 게시글 삭제
router.delete("/qnapost", isAdmin, (req, res) => {
  let postno = req.body._id;
  QnaPost.findOneAndDelete({ _id: postno }, (err, result) => {
    res.send("삭제되었습니다.");
  });
});

router.get("/ga", isAdmin, (req, res) => {
  res.render("analytics.ejs", { user: req.user });
});

//일반회원 관리 검색기능
router.get("/members/search/:page", (req, res) => {
  try {
    let query = req.query.value;
    let search = query.split("?option=");

    let page = parseInt(req.params.page);
    // 한 페이지에 보여줄 게시물 수
    let countPost = 10;
    // 한 페이지에 보여줄 페이지 수
    let countPage = 5;

    if (search[1] === "아이디") {
      User.find({
        id: new RegExp(search[0]),
      })
        .sort({ _id: -1 })
        .skip(countPost * (page - 1))
        .limit(countPost)
        .exec((err, result) => {
          User.count({ id: new RegExp(search[0]) }, (err, count) => {
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
              res.render("membersearch.ejs", {
                member: result,
                totalPost: totalPost,
                page: page,
                totalPage: totalPage,
                countPage: countPage,
                count: count,
                startPage: startPage,
                endPage: endPage,

                user: req.user,
              });
            } else if (page > totalPage) {
              res.redirect(`/manage/members/search/${totalPage}`);
            } else {
              res.redirect(`/manage/members/search/${startPage}`);
            }
          });
        });
    } else if (search[1] === "이름") {
      User.find({
        name: new RegExp(search[0]),
      })
        .sort({ _id: -1 })
        .skip(countPost * (page - 1))
        .limit(countPost)
        .exec((err, result) => {
          User.count({ name: new RegExp(search[0]) }, (err, count) => {
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
              res.render("membersearch.ejs", {
                member: result,
                totalPost: totalPost,
                page: page,
                totalPage: totalPage,
                countPage: countPage,
                count: count,
                startPage: startPage,
                endPage: endPage,

                user: req.user,
              });
            } else if (page > totalPage) {
              res.redirect(`/manage/members/search/${totalPage}`);
            } else {
              res.redirect(`/manage/members/search/${startPage}`);
            }
          });
        });
    } else if (search[1] === "이메일") {
      Post.find({
        email: new RegExp(search[0]),
      })
        .sort({ _id: -1 })
        .skip(countPost * (page - 1))
        .limit(countPost)
        .exec((err, result) => {
          Post.count(
            {
              email: new RegExp(search[0]),
            },
            (err, count) => {
              // 전체 게시글 수
              let totalPost = count;
              // 총 페이지 수
              let totalPage = Math.floor(totalPost / countPost);
              // 페이지 수 관련 로직
              totalPost % countPost > 0 ? totalPage++ : null;
              // 페이지 시작 번호
              let startPage =
                Math.floor((page - 1) / countPage) * countPage + 1;
              let endPage = startPage + countPage - 1;
              if ((page > 0) & (page <= totalPage)) {
                res.render("membersearch.ejs", {
                  member: result,
                  totalPost: totalPost,
                  page: page,
                  totalPage: totalPage,
                  countPage: countPage,
                  count: count,
                  startPage: startPage,
                  endPage: endPage,

                  user: req.user,
                });
              } else if (page > totalPage) {
                res.redirect(`/manage/members/search/${totalPage}`);
              } else {
                res.redirect(`/manage/members/search/${startPage}`);
              }
            }
          );
        });
    }
  } catch {
    res.send(
      "<script>alert('검색 결과가 없습니다.');location.href = document.referrer;</script>"
    );
  }
});

//자유게시판 관리 검색기능
router.get("/free/search/:page", (req, res) => {
  try {
    let query = req.query.value;
    let search = query.split("?option=");

    let page = parseInt(req.params.page);
    // 한 페이지에 보여줄 게시물 수
    let countPost = 10;
    // 한 페이지에 보여줄 페이지 수
    let countPage = 5;

    if (search[1] === "제목") {
      Post.find({
        post_title: new RegExp(search[0]),
      })
        .sort({ _id: -1 })
        .skip(countPost * (page - 1))
        .limit(countPost)
        .exec((err, result) => {
          Post.count({ post_title: new RegExp(search[0]) }, (err, count) => {
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
              res.render("postlistsearch.ejs", {
                post: result,
                totalPost: totalPost,
                page: page,
                totalPage: totalPage,
                countPage: countPage,
                count: count,
                startPage: startPage,
                endPage: endPage,
                user: req.user,
              });
            } else if (page > totalPage) {
              res.redirect(`/manage/free/search/${totalPage}`);
            } else {
              res.redirect(`/manage/free/search/${startPage}`);
            }
          });
        });
    } else if (search[1] === "내용") {
      Post.find({
        post_content: new RegExp(search[0]),
      })
        .sort({ _id: -1 })
        .skip(countPost * (page - 1))
        .limit(countPost)
        .exec((err, result) => {
          Post.count({ post_content: new RegExp(search[0]) }, (err, count) => {
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
              res.render("postlistsearch.ejs", {
                post: result,
                totalPost: totalPost,
                page: page,
                totalPage: totalPage,
                countPage: countPage,
                count: count,
                startPage: startPage,
                endPage: endPage,
                user: req.user,
              });
            } else if (page > totalPage) {
              res.redirect(`/manage/free/search/${totalPage}`);
            } else {
              res.redirect(`/manage/free/search/${startPage}`);
            }
          });
        });
    } else if (search[1] === "제목 내용") {
      Post.find({
        $or: [
          { post_title: new RegExp(search[0]) },
          { post_content: new RegExp(search[0]) },
        ],
      })
        .sort({ _id: -1 })
        .skip(countPost * (page - 1))
        .limit(countPost)
        .exec((err, result) => {
          Post.count(
            {
              $or: [
                { post_title: new RegExp(search[0]) },
                { post_content: new RegExp(search[0]) },
              ],
            },
            (err, count) => {
              // 전체 게시글 수
              let totalPost = count;
              // 총 페이지 수
              let totalPage = Math.floor(totalPost / countPost);
              // 페이지 수 관련 로직
              totalPost % countPost > 0 ? totalPage++ : null;
              // 페이지 시작 번호
              let startPage =
                Math.floor((page - 1) / countPage) * countPage + 1;
              let endPage = startPage + countPage - 1;
              if ((page > 0) & (page <= totalPage)) {
                res.render("postlistsearch.ejs", {
                  post: result,
                  totalPost: totalPost,
                  page: page,
                  totalPage: totalPage,
                  countPage: countPage,
                  count: count,
                  startPage: startPage,
                  endPage: endPage,
                  user: req.user,
                });
              } else if (page > totalPage) {
                res.redirect(`/manage/free/search/${totalPage}`);
              } else {
                res.redirect(`/manage/free/search/${startPage}`);
              }
            }
          );
        });
    } else if (search[1] === "작성자") {
      Post.find({
        writer: new RegExp(search[0]),
      })
        .sort({ _id: -1 })
        .skip(countPost * (page - 1))
        .limit(countPost)
        .exec((err, result) => {
          Post.count({ writer: new RegExp(search[0]) }, (err, count) => {
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
              res.render("postlistsearch.ejs", {
                post: result,
                totalPost: totalPost,
                page: page,
                totalPage: totalPage,
                countPage: countPage,
                count: count,
                startPage: startPage,
                endPage: endPage,
                user: req.user,
              });
            } else if (page > totalPage) {
              res.redirect(`/manage/free/search/${totalPage}`);
            } else {
              res.redirect(`/manage/free/search/${startPage}`);
            }
          });
        });
    }
  } catch {
    res.send(
      "<script>alert('검색 결과가 없습니다.');location.href = document.referrer;</script>"
    );
  }
});

//질답게시판 검색기능
router.get("/qna/search/:page", (req, res) => {
  try {
    let query = req.query.value;
    let search = query.split("?option=");

    let page = parseInt(req.params.page);
    // 한 페이지에 보여줄 게시물 수
    let countPost = 10;
    // 한 페이지에 보여줄 페이지 수
    let countPage = 5;

    if (search[1] === "제목") {
      QnaPost.find({
        post_title: new RegExp(search[0]),
      })
        .sort({ _id: -1 })
        .skip(countPost * (page - 1))
        .limit(countPost)
        .exec((err, result) => {
          QnaPost.count({ post_title: new RegExp(search[0]) }, (err, count) => {
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
              res.render("qnapostlistsearch.ejs", {
                post: result,
                totalPost: totalPost,
                page: page,
                totalPage: totalPage,
                countPage: countPage,
                count: count,
                startPage: startPage,
                endPage: endPage,
                user: req.user,
              });
            } else if (page > totalPage) {
              res.redirect(`/manage/qna/search/${totalPage}`);
            } else {
              res.redirect(`/manage/qna/search/${startPage}`);
            }
          });
        });
    } else if (search[1] === "내용") {
      QnaPost.find({
        post_content: new RegExp(search[0]),
      })
        .sort({ _id: -1 })
        .skip(countPost * (page - 1))
        .limit(countPost)
        .exec((err, result) => {
          QnaPost.count(
            { post_content: new RegExp(search[0]) },
            (err, count) => {
              // 전체 게시글 수
              let totalPost = count;
              // 총 페이지 수
              let totalPage = Math.floor(totalPost / countPost);
              // 페이지 수 관련 로직
              totalPost % countPost > 0 ? totalPage++ : null;
              // 페이지 시작 번호
              let startPage =
                Math.floor((page - 1) / countPage) * countPage + 1;
              let endPage = startPage + countPage - 1;
              if ((page > 0) & (page <= totalPage)) {
                res.render("qnapostlistsearch.ejs", {
                  post: result,
                  totalPost: totalPost,
                  page: page,
                  totalPage: totalPage,
                  countPage: countPage,
                  count: count,
                  startPage: startPage,
                  endPage: endPage,
                  user: req.user,
                });
              } else if (page > totalPage) {
                res.redirect(`/manage/qna/search/${totalPage}`);
              } else {
                res.redirect(`/manage/qna/search/${startPage}`);
              }
            }
          );
        });
    } else if (search[1] === "제목 내용") {
      QnaPost.find({
        $or: [
          { post_title: new RegExp(search[0]) },
          { post_content: new RegExp(search[0]) },
        ],
      })
        .sort({ _id: -1 })
        .skip(countPost * (page - 1))
        .limit(countPost)
        .exec((err, result) => {
          QnaPost.count(
            {
              $or: [
                { post_title: new RegExp(search[0]) },
                { post_content: new RegExp(search[0]) },
              ],
            },
            (err, count) => {
              // 전체 게시글 수
              let totalPost = count;
              // 총 페이지 수
              let totalPage = Math.floor(totalPost / countPost);
              // 페이지 수 관련 로직
              totalPost % countPost > 0 ? totalPage++ : null;
              // 페이지 시작 번호
              let startPage =
                Math.floor((page - 1) / countPage) * countPage + 1;
              let endPage = startPage + countPage - 1;
              if ((page > 0) & (page <= totalPage)) {
                res.render("qnapostlistsearch.ejs", {
                  post: result,
                  totalPost: totalPost,
                  page: page,
                  totalPage: totalPage,
                  countPage: countPage,
                  count: count,
                  startPage: startPage,
                  endPage: endPage,
                  user: req.user,
                });
              } else if (page > totalPage) {
                res.redirect(`/manage/qna/search/${totalPage}`);
              } else {
                res.redirect(`/manage/qna/search/${startPage}`);
              }
            }
          );
        });
    } else if (search[1] === "작성자") {
      QnaPost.find({
        writer: new RegExp(search[0]),
      })
        .sort({ _id: -1 })
        .skip(countPost * (page - 1))
        .limit(countPost)
        .exec((err, result) => {
          QnaPost.count({ writer: new RegExp(search[0]) }, (err, count) => {
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
              res.render("qnapostlistsearch.ejs", {
                post: result,
                totalPost: totalPost,
                page: page,
                totalPage: totalPage,
                countPage: countPage,
                count: count,
                startPage: startPage,
                endPage: endPage,
                user: req.user,
              });
            } else if (page > totalPage) {
              res.redirect(`/manage/qna/search/${totalPage}`);
            } else {
              res.redirect(`/manage/qna/search/${startPage}`);
            }
          });
        });
    }
  } catch {
    res.send(
      "<script>alert('검색 결과가 없습니다.');location.href = document.referrer;</script>"
    );
  }
});

//총회원 관리 검색기능
router.get("/users/search/:page", (req, res) => {
  try {
    let query = req.query.value;
    let search = query.split("?option=");

    let page = parseInt(req.params.page);
    // 한 페이지에 보여줄 게시물 수
    let countPost = 10;
    // 한 페이지에 보여줄 페이지 수
    let countPage = 5;

    if (search[1] === "아이디") {
      User.find({
        id: new RegExp(search[0]),
      })
        .sort({ _id: -1 })
        .skip(countPost * (page - 1))
        .limit(countPost)
        .exec((err, result) => {
          User.count({ id: new RegExp(search[0]) }, (err, count) => {
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
              res.render("membersearch.ejs", {
                member: result,
                totalPost: totalPost,
                page: page,
                totalPage: totalPage,
                countPage: countPage,
                count: count,
                startPage: startPage,
                endPage: endPage,
                user: req.user,
              });
            } else if (page > totalPage) {
              res.redirect(`/manage/users/search/${totalPage}`);
            } else {
              res.redirect(`/manage/users/search/${startPage}`);
            }
          });
        });
    } else if (search[1] === "이름") {
      User.find({
        name: new RegExp(search[0]),
      })
        .sort({ _id: -1 })
        .skip(countPost * (page - 1))
        .limit(countPost)
        .exec((err, result) => {
          User.count({ name: new RegExp(search[0]) }, (err, count) => {
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
              res.render("membersearch.ejs", {
                member: result,
                totalPost: totalPost,
                page: page,
                totalPage: totalPage,
                countPage: countPage,
                count: count,
                startPage: startPage,
                endPage: endPage,
                user: req.user,
              });
            } else if (page > totalPage) {
              res.redirect(`/manage/users/search/${totalPage}`);
            } else {
              res.redirect(`/manage/users/search/${startPage}`);
            }
          });
        });
    } else if (search[1] === "이메일") {
      Post.find({
        email: new RegExp(search[0]),
      })
        .sort({ _id: -1 })
        .skip(countPost * (page - 1))
        .limit(countPost)
        .exec((err, result) => {
          Post.count(
            {
              email: new RegExp(search[0]),
            },
            (err, count) => {
              // 전체 게시글 수
              let totalPost = count;
              // 총 페이지 수
              let totalPage = Math.floor(totalPost / countPost);
              // 페이지 수 관련 로직
              totalPost % countPost > 0 ? totalPage++ : null;
              // 페이지 시작 번호
              let startPage =
                Math.floor((page - 1) / countPage) * countPage + 1;
              let endPage = startPage + countPage - 1;
              if ((page > 0) & (page <= totalPage)) {
                res.render("membersearch.ejs", {
                  member: result,
                  totalPost: totalPost,
                  page: page,
                  totalPage: totalPage,
                  countPage: countPage,
                  count: count,
                  startPage: startPage,
                  endPage: endPage,
                  user: req.user,
                });
              } else if (page > totalPage) {
                res.redirect(`/manage/users/search/${totalPage}`);
              } else {
                res.redirect(`/manage/users/search/${startPage}`);
              }
            }
          );
        });
    }
  } catch {
    res.send(
      "<script>alert('검색 결과가 없습니다.');location.href = document.referrer;</script>"
    );
  }
});

//관리자 권한 확인(관리자세요?)
function isAdmin(req, res, next) {
  if (req.user != null) {
    User.findOne({ id: req.user.id }, function (err, result) {
      if ((result.auth === "admin") | (result.auth === "operator")) {
        next();
      } else {
        res.send(
          "<script>alert('관리자 권한이 없습니다.');location.href = '/'</script>"
        );
      }
    });
  } else {
    res.send(
      "<script>alert('관리자 권한이 없습니다.');location.href = '/'</script>"
    );
  }
}

//운영자 권한 확인(운영자세요?)
function isOperator(req, res, next) {
  if (req.user != null) {
    User.findOne({ id: req.user.id }, function (err, result) {
      if (result.auth === "operator") {
        next();
      } else {
        res.send(
          "<script>alert('운영자 권한이 없습니다.');location.href = '/'</script>"
        );
      }
    });
  } else {
    res.send(
      "<script>alert('운영자 권한이 없습니다.');location.href = '/'</script>"
    );
  }
}

module.exports = router;
