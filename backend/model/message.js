const mongoose = require('mongoose')
 
let messageSchema = mongoose.Schema({
    message:String,
    sender:String,
    date:{
        type:Date,
        default:Date.now
    }
})
let Message = new mongoose.model('Message',messageSchema)
module.exports= Message;