// Modules needed.
const express = require('express');
const articleRouter = express.Router();
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Articles = require('../models/articles');

// JSON-parsing.
articleRouter.use(bodyParser.json());

// Route for '/'.
articleRouter.route('/')
.get((req, res, next) => {
    Articles.find({})
    .populate('comments.author')
    .then((articles) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(articles);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Articles.create(req.body)
    .then((article) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(article);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /articles');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Articles.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

// Route for '/:articleId'.
articleRouter.route('/:articleId')
.get((req,res,next) => {
    Articles.findById(req.params.articleId)
    .populate('comments.author')
    .then((article) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(article);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /articles/'+ req.params.articleId);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Articles.findByIdAndUpdate(req.params.articleId, {$set: req.body}, {new: true})
    .then((article) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(article);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Articles.findByIdAndRemove(req.params.articleId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

// Route for '/:articleId/comments'.
articleRouter.route('/:articleId/comments')
.get((req, res, next) => {
    Articles.findById(req.params.articleId)
    .populate('comments.author')
    .then((article) => {
        if(article != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(article.comments);
        }
        else {
            err = new Error('Article ' + req.params.articleId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Articles.findById(req.params.articleId)
    .then((article) => {
        if(article != null) {
            req.body.author = req.user._id
            article.comments.push(req.body);
            article.save().then((article) => {
                Articles.findById(article._id)
                .populate('comments.author')
                .then((article) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(article.comments);
                })  
            }, (err) => next(err));
        }
        else {
            err = new Error('Article ' + req.params.articleId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /articles/' + req.params.articleId + '/comments');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Articles.findById(req.params.articleId)
    .then((article) => {
        if(article != null) {
            for (var i = (article.comments.length - 1); i>=0; i--){
                article.comments.id(article.comments[i]._id).remove();
            }
            article.save().then((article) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(article.comments);
            }, (err) => next(err));
        }
        else {
            err = new Error('Article ' + req.params.articleId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

// Route for '/:articleId/comments/:commentId'
dishRouter.route('/:articleId/comments/:commentId')
.get((req,res,next) => {
    Articles.findById(req.params.articleId)
    .populate('comments.author')
    .then((article) => {
        if(article != null && article.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(article.comments.id(req.params.commentId));
        }
        else if (article == null) {
            err = new Error('Article ' + req.params.articleId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /articles/' + req.params.articleId
        + '/comments/' + req.params.commentId);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Articles.findById(req.params.articleId)
    .then((article) => {
        if(article != null && article.comments.id(req.params.commentId) != null) {
            if(!((article.comments.id(req.params.commentId).author).equals(req.user._id))){
                err = new Error('You are not author of this comment!');
                err.status = 403;
                return next(err);
            }
            if(req.body.comment) {
                article.comments.id(req.params.commentId).comment = req.body.comment;
            }
            article.save().then((article) => {
                Articles.findById(article._id)
                .populate('comments.author')
                .then((article) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(article);
                })
            }, (err) => next(err));
        }
        else if (article == null) {
            err = new Error('Article ' + req.params.articleId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Articles.findById(req.params.articleId)
    .then((article) => {
        if(article != null && article.comments.id(req.params.commentId) != null) {
            if(!((article.comments.id(req.params.commentId).author).equals(req.user._id))){
                err = new Error('You are not author of this comment!');
                err.status = 403;
                return next(err);
            }
            article.comments.id(req.params.commentId).remove();
            article.save().then((article) => {
                Articles.findById(article._id)
                .populate('comments.author')
                .then((article) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(article);
                })
            }, (err) => next(err));
        }
        else if (article == null) {
            err = new Error('Article ' + req.params.articleId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

// Export this router to app.js.
module.exports = articleRouter;