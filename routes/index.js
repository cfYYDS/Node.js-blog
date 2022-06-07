var express = require('express');
var router = express.Router();
var crypto = require('crypto')
var mysql = require('./../database')
/* GET home page. */
router.get('/', function (req, res, next) {
  var page = req.query.page || 1;
  var start = (page - 1) * 8;
  var end = page * 8;
  var queryCount = 'select count(*) as articleNum from article'
  var queryArticle = 'select * from article order by articleID desc limit ' + start + ',' + end;
  mysql.query(queryArticle, function (err, rows, fields) {
    var articles = rows;
    articles.forEach(function (ele) {
      var year = ele.articleTime.getFullYear();
      var month = ele.articleTime.getMonth() + 1 > 10 ? ele.articleTime.getMonth() : '0' + (ele.articleTime.getMonth() + 1);
      var date = ele.articleTime.getDate() > 10 ? ele.articleTime.getDate() : '0' + ele.articleTime.getDate();
      ele.articleTime = year + '-' + month + '-' + date;
    });
    mysql.query(queryCount, function (err, rows, fields) {
      var articleNum = rows[0].articleNum;
      var pageNum = Math.ceil(articleNum / 8);
      res.render("index", { articles: articles, user: req.session.user, pageNum: pageNum, page: page })
    })
  });
});
router.get('/login', function (req, res, next) {
  res.render('login', { message: '' });
})
// 登录信息验证
router.post('/login', function (req, res, next) {
  var name = req.body.name;
  var password = req.body.password;
  var hash = crypto.createHash('md5');
  hash.update(password);
  password = hash.digest('hex');
  var query = 'SELECT * FROM author WHERE authorName=' + mysql.escape(name) + 'AND authorPassword=' + mysql.escape(password);
  mysql.query(query, function (err, rows, fields) {
    if (err) {
      console.log(err);
      return;
    }
    var user = rows[0];
    if (!user) {
      res.render('login', { message: '用户名或密码错误' });
      return;
    }
    req.session.user = user;
    res.redirect('/');
  })
})
// 发布文章
router.get('/edit', function (req, res, next) {
  var user = req.session.user;
  if (!user) {
    res.redirect('/login');
    return;
  }
  res.render('edit', { user: req.session.user })
})
router.post('/edit', function (req, res, next) {
  var title = req.body.title;
  var content = req.body.content;
  var author = req.session.user.authorName;
  var query = 'insert article set articleTitle=' + mysql.escape(title) + ',articleAuthor='
    + mysql.escape(author) +
    ',articleContent=' +
    mysql.escape(content) + ',articleTime=curdate()';
  mysql.query(query, function (err, rows, fields) {
    if (err) {
      console.log(err);
      return;
    }
    res.redirect('/')
  })
})
// 文章内容页
router.get('/articles/:articleID', function (req, res, next) {
  var articleID = req.params.articleID;
  var query = 'select * from article where articleID=' + mysql.escape(articleID);
  mysql.query(query, function (err, rows, fields) {
    if (err) {
      console.log(err)
      return;
    }
    var query = 'update article set articleClick=articleClick+1 where articleID=' + mysql.escape(articleID);
    var article = rows[0]
    mysql.query(query, function (err, rows, fields) {
      if (err) {
        console.log(err)
        return;
      }
    })
    var year = article.articleTime.getFullYear();
    var month = article.articleTime.getMonth() + 1 > 10 ? article.articleTime.getMonth() : '0' + (article.articleTime.getMonth() + 1);
    var date = article.articleTime.getDate() > 10 ? article.articleTime.getDate() : '0' + article.articleTime.getDate();
    article.articleTime = year + '-' + month + '-' + date;
    res.render('article', { article: article, user: req.session.user });
  })
})
// 写文章页面
router.get('/edit', function (req, res, next) {
  res.render('edit', { user: req.session.user })
})
// 友情链接
router.get('/friends', function (req, res, next) {
  res.render('friends', { user: req.session.user });
})
// 关于博客
router.get('/about', function (req, res, next) {
  res.render('about', { user: req.session.user })
})
// 登出博客
router.get('/logout', function (req, res, next) {
  req.session.user = null;
  res.redirect('/')
})
// 修改文章
router.get('/modify/:articleID', function (req, res, next) {
  var articleID = req.params.articleID;
  var user = req.session.user;
  var query = 'select * from article where articleID=' + mysql.escape(articleID);
  if (!user) {
    res.redirect('/login');
    return;
  }
  mysql.query(query, function (err, rows, fields) {
    if (err) {
      console.log(err);
      return;
    }
    var artile = rows[0]
    var title = artile.articleTitle;
    var content = artile.articleContent;
    console.log(title, content)
    res.render('modify', { user: user, title: title, content: content })
  })
})
router.post('/modify/:articleID', function (req, res, next) {
  var articleID = req.params.articleID;
  var user = req.session.user;
  var title = req.body.title;
  var content = req.body.content;
  var query = 'update article set articleTitle=' + mysql.escape(title)
    + ',articleContent=' + mysql.escape(content)
    + 'where articleID=' + mysql.escape(articleID);
  mysql.query(query, function (err, rows, fields) {
    if (err) {
      console.log(err);
      return;
    }
    res.redirect('/')
  })
})
// 删除文章
router.get('/delete/:articleID', function (req, res, next) {
  var articleID = req.params.articleID;
  var user = req.session.user;
  var query = 'delete from article where articleID=' + mysql.escape(articleID);
  if (!user) {
    res.redirect('/login');
    return;
  }
  mysql.query(query, function (err, rows, fields) {
    res.redirect('/')
  })
})
module.exports = router;
