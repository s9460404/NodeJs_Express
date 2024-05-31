const express = require('express');
const app = express();
// 加入這兩行
const server = require('http').Server(app);
const io = require('socket.io')(server);
const socketController = require(__dirname + '/controllers/socket')(io);
const Chats = require(__dirname + "/models/chat");
app.use(express.static('images'));
app.use(express.static('css'));
const cors = require('cors');
const XLSX = require('xlsx');
const fileupload = require('express-fileupload');
app.use(fileupload(), cors())
app.get('/', (req, res) => {
    res.sendFile( __dirname + '/views/index.html');
});

/*app.get('/Check_xlsx', (req, res) => {
    //res.sendFile(path.join(__dirname, '/index.html'));
    res.sendFile( __dirname + '/views/Check_xlsx.html');
})*/

app.post('/Check_xlsx', (req, res) => {
    let wb= XLSX.read(req.files.clientFile.data, {type: "buffer"});
    
    var sheet_name_list = wb.SheetNames;
    var xlData = XLSX.utils.sheet_to_json(wb.Sheets[sheet_name_list[0]]);
    
    var testData = new Array;
    testData.push({'會員編號': 'b','會員姓名': 'f','最後交易日': 'i'});
    testData.push({'會員編號': 'c','會員姓名': 'g'});
    testData.push({'會員編號': 'd'});

    var flag = "true";
    for(var i = 0; i < xlData.length; i++){
        for(var key in xlData[i.toString()]){
            if( xlData[i.toString()][key] != testData[i.toString()][key] ){
                flag = "false";
                break;
            }
        };

        if( flag == "false" ){
            break;
        }
    }

    res.send({status: flag}).end();
})

// 注意，這邊的 server 原本是 app
server.listen(8080, () => {
    console.log("Server Started. http://localhost:8080");
});


//https://nodejs-413016.de.r.appspot.com/