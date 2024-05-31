const mongoose = require("mongoose");
const moment = require('moment');
const Chats = require("../models/chat");

module.exports = function(io) {
    /*用戶陣列*/
    let users = [];

    io.on('connection', async (socket) => {
        //var uri = "mongodb://127.0.0.1:27017/details";
        if( mongoose.connection.readyState == 0 || mongoose.connection.readyState == 3){
            var uri = "mongodb+srv://s94604042:Loneokokok328=@cluster0.plnf9kz.mongodb.net/retryWrites=true&w=majority&appName=Cluster0";
            mongoose.connect(uri, { dbName: "test123" });
            const connection = mongoose.connection;
            connection.once("open", async function() {
                //console.log("MongoDB database connection established successfully");
                /*發送 db連接成功 事件*/
                io.sockets.emit('mongodb connection successfully', '');
            });
        }
        else{
            /*發送 db已連接成功 事件*/
            io.sockets.emit('mongodb connection successfully', '');
        }
        
        
        //const chats = await Chats.find();
        //console.log(chats);
        
        /*是否為新用戶*/
        let isNewPerson = true;
        /*當前登入用戶*/
        let username = null;
        
        //監聽登入
        socket.on('login', async function(data){
            for(var i=0; i<users.length; i++){
                isNewPerson = (users[i].username === data.username)? false : true;
            }
            if(isNewPerson){
                username = data.username
                users.push({
                    username: data.username
                })
                data.userCount = users.length
                /*發送 登入成功 事件*/
                socket.emit('loginSuccess', data)
                /*發送 讀取歷史訊息 事件*/
                const chats = await Chats.find();
                socket.emit('HistoryMsg', chats);
                /*向所有連接的用戶廣播 add 事件*/
                io.sockets.emit('add', data)
            }else{
                /*發送 登入失敗 事件*/
                socket.emit('loginFail', '')
            }
        })
    
        //監聽登出
        socket.on('logout', function(){
            /* 發送 離開成功 事件 */
            socket.emit('leaveSuccess')
            users.map(function(val, index){
                if(val.username === username){
                    users.splice(index, 1);
                }
            })
            /* 向所有連接的用戶廣播 有人登出 */
            io.sockets.emit('leave', {username: username, userCount: users.length})
        })
    
        socket.on('sendMessage', async function(data){
            /*發送receiveMessage事件*/
            const chats = new Chats({
                username: data.username,
                msg: data.message,
                createdDate: moment().valueOf(),
            });
            const newmessage = await chats.save();
            console.log(await Chats.find());
            //console.log(newmessage);
            //console.log(data);
            io.sockets.emit('receiveMessage', newmessage);
        })
    });   
}