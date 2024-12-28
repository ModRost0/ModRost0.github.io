const mongoose = require('mongoose')
const passportLocalMongose = require('passport-local-mongoose')
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String
    }
})
userSchema.plugin(passportLocalMongose)
const User = mongoose.model('User', userSchema)
module.exports = User