///引入套件
const mongoose = require('mongoose');

///該資料表的格式設定
const messagesSchema = new mongoose.Schema({
    username:{ //使用者名稱
        type:String,
        required:true
    },
    msg:{
        type:String,
        required:true
    },
    createdDate:{ //新增時的時間
        type: Number
    }
});

//匯出該資料表
module.exports = mongoose.model("chats" , messagesSchema);