const express = require('express');
const app = express();
// 加入這兩行
const server = require('http').Server(app);
const io = require('socket.io')(server);
const socketController = require(__dirname + '/controllers/socket')(io);
const Chats = require(__dirname + "/models/chat");
app.use(express.static('images'));
app.use(express.static('css'));

const axios = require("axios")
var request = require("request");
var cheerio = require("cheerio");
const webdriver = require('selenium-webdriver')

app.get('/Chatroom', (req, res) => {
    res.sendFile( __dirname + '/views/Chatroom.html');
});

app.get('/', (req, res) => {
    res.sendFile( __dirname + '/views/index.html');
});

app.get('/Travel', async (req, res) => {
    /*
    request({
        url: "https://rate.bot.com.tw/xrt?Lang=zh-TW&redirect=true",
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
    }, 
    function(error, response, body) {
        if (error || !body) {
          return;
        } 
        else {
            // 爬完網頁後要做的事情
            var $ = cheerio.load(body);
            var target = $(".rate-content-sight.text-right.print_hide");
            //console.log(target);
            console.log(target[15].children);
            console.log(target[15].children[0].data.trim());
        }
    });*/
    /*const body = {};
    const options = {
        headers: {
            'Content-Type': 'application/json',
        }
    }
    var response = await axios.get*/

    /*
    const body = {};
    const options = {
        headers: {
            'Content-Type': 'application/json',
        }
    }
    //axios.get('https://rate.bot.com.tw/xrt?Lang=zh-TW&redirect=true',body,options)
    axios.get('https://www.kgibank.com.tw/zh-tw/personal/interest-rate/fx',body,options)
    .then(response => {
        //console.log(response.data);
        var $ = cheerio.load(response.data);
        //var target = $(".rate-content-sight.text-right.print_hide");
        var target = $(".kgibOtherCus004__item-val.d-flex align-items-center");
        console.log(target);
        //console.log(target[15].children);
        //console.log(target[15].children[0].data.trim());
    })
    .catch(error => {
        console.log(error);
    });*/

    let driver = await new webdriver.Builder().forBrowser("chrome").build();
    const web = 'https://www.google.com/';//填寫你想要前往的網站
    driver.get(web);
    driver.quit();
    res.sendFile( __dirname + '/views/Travel.html');
});

// 注意，這邊的 server 原本是 app
server.listen(8080, () => {
    console.log("Server Started. http://localhost:8080");
});
