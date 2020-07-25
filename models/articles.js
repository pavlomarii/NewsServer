// Modules needed.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema of Comment. 
const commentSchema = new Schema({

    // Text of comment.
    comment: {
        type: String,
        required: true,
    },

    // Author of comment, which is reference to User.
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {

    // Timestamps: createAt, updateAt. Auto-adding.
    timestamps: true
});

// Schema of Article.
const articleSchema = new Schema({

    // Title of Article.
    title: {
        type: String,
        required: true,
        unique: true
    },

    // Text of Article.
    content: {
        type: String,
        required: true
    },

    // Path to image, which will be served on static server.
    image: {
        type: String,
        required: true
    },

    // List of Comments.
    comments: [commentSchema]
}, {

    // The same Timestamps.
    timestamps: true
});

// Export model Article.
module.exports = mongoose.model('Article', articleSchema);