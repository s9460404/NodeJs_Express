const express = require('express');
const fs = require('fs');
const path = require('path');
const csvtojson = require('csvtojson');
const multer = require('multer');
const iconv = require('iconv-lite');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fastcsv = require('fast-csv');
const json2csv = require('json2csv').parse;
const app = express();
const mysql = require('mysql2');
// 加入這兩行
const server = require('http').Server(app);
const io = require('socket.io')(server);
const socketController = require(__dirname + '/controllers/socket')(io);
const Chats = require(__dirname + "/models/chat");
app.use(express.static('images'));
app.use(express.static('css'));
app.use(express.static('views'));
app.use(express.static('csv'));
app.use(express.json({ limit: '50mb' })); // Set the limit to 50 MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

app.get('/test', (req, res) => {
    res.sendFile( __dirname + '/views/test.html');
});

app.get('/ChartJs', (req, res) => {
    res.sendFile( __dirname + '/views/ChartJs.html');
});

app.get('/D3Js', (req, res) => {
    res.sendFile( __dirname + '/views/D3Js.html');
});

app.get('/D3Js2', (req, res) => {
    res.sendFile( __dirname + '/views/D3Js2.html');
});

app.get('/day', (req, res) => {
    res.sendFile( __dirname + '/views/day.html');
});
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',          // MySQL 的用戶名
    password: '1qaz@WSX',  // MySQL 的密碼
    database: 'ridedb' // 要連接的資料庫名稱
});
const promisePool = pool.promise();
app.get('/googlemap', async (req, res) => {
    const [rows, fields] = await promisePool.query('SELECT * FROM Users');
    console.log(rows);
    res.sendFile( __dirname + '/views/googlemap.html');
});
app.get('/googlemap/data', async (req, res) => {
    
    try {
        var [rideRequests] = await promisePool.query('SELECT * FROM riderequests');
        
        rideRequests.forEach(request => {
            const utcDate = new Date(request.RequestDate);
            // 转换为本地时间
            localDate = utcDate.toLocaleString();
            request.RequestDate = localDate.split(' ')[0];
            //console.log(request.RequestDate);
        });
        //rideRequests = localDate;
        if (rideRequests.length === 0) {
            // 如果没有任务记录，直接返回空数组
            return res.json({ status: 200, log: [] });
        }
        // 提取所有 UserID
        const userIds = rideRequests.map(request => request.UserID);
        
        // 查询 Users 表获取所有相关用户
        const [users] = await promisePool.query('SELECT * FROM Users WHERE UserID IN (?)', [userIds]);
        
        // 创建一个用户 ID 到用户对象的映射
        const userMap = new Map(users.map(user => [user.UserID, user]));
        
        // 将任务和用户信息合并
        const mergedResults = rideRequests.map(request => ({
            ...request,
            user: userMap.get(request.UserID) || null
        }));
        //console.log(mergedResults);
        res.json({status: 200,log: mergedResults});
    } catch (err) {
        console.error('Error executing query:', err);
        res.json({status: 500,log: err});
    }
});
app.post('/googlemap/data', async (req, res) => {
    const newData = req.body; // 從請求主體中取得新的資料
    console.log(newData["name"]);
    try {
        // 使用具名佔位符 '?' 執行查詢
        const [rows, fields] = await promisePool.query('SELECT * FROM Users WHERE name = ?', [newData["name"]]);
        //console.log(rows);  // 輸出查詢結果
        
        if (rows.length === 0) {
            console.log('No users found with the name:', newData["name"]);
            //搜尋不到才新增
            const [result] = await promisePool.query(`INSERT INTO Users (name, address, phone) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE address = VALUES(address), phone = VALUES(phone)`,
            [newData["name"], newData["address"], newData["phone"]]);
            console.log('Inserted new user with ID:', result.insertId);

            const [riderequests_result] = await promisePool.query(`INSERT INTO riderequests (UserID, RequestDate, DepartureTime, ReturnTime) 
                VALUES (?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE RequestDate = VALUES(RequestDate), DepartureTime = VALUES(DepartureTime), ReturnTime = VALUES(ReturnTime)`,
                [result.insertId, newData["RequestDate"], newData["DepartureTime"], newData["ReturnTime"]]);

            res.json({status: 200,log: riderequests_result});
        } else {
            console.log('Users found:', rows);
            console.log(rows[0]["UserID"]);

            // 无论如何，都将数据写入 ridequests 表
            const [riderequests_result] = await promisePool.query(`INSERT INTO riderequests (UserID, RequestDate, DepartureTime, ReturnTime) 
                VALUES (?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE RequestDate = VALUES(RequestDate), DepartureTime = VALUES(DepartureTime), ReturnTime = VALUES(ReturnTime)`,
                [rows[0]["UserID"], newData["RequestDate"], newData["DepartureTime"], newData["ReturnTime"]]);

            res.json({status: 200,log: riderequests_result});
        }

        //console.log('Ride request data inserted/updated successfully');
    } catch (err) {
        console.error('Error executing query:', err);
        res.json({status: 500,log: err});
    }
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

    /*
    let driver = await new webdriver.Builder().forBrowser("chrome").build();
    const web = 'https://www.google.com/';//填寫你想要前往的網站
    await driver.get(web);
    await driver.quit();*/
    res.sendFile( __dirname + '/views/Travel.html');
});

app.post('/readAllCSV', async (req, res) => {
    
    try {

        const directoryPath = path.join(__dirname, './csv');
        fs.readdir(directoryPath, async (err, files) => {
            if (err) {
                //return console.log('Unable to scan directory: ' + err);
                res.status(700).send('Unable to scan directory: ' + err);
            }

            const csvFiles = files.filter(file => path.extname(file).toLowerCase() === '.csv');

            const allData = [];
            const filename = [];

            for (let file of csvFiles) {
                try {
                    const filePath = path.join(directoryPath, file);
                    const fileContent = fs.readFileSync(filePath);
                    const decodedContent = iconv.decode(fileContent, 'Big5');
                    const jsonArray = await csvtojson().fromString(decodedContent);
                    allData.push({ filename: file, data: jsonArray });
                    filename.push(file.split('.')[0]);
                } catch (error) {
                    console.error('Error processing file:', file, error);
                    // Handle individual file processing error if needed
                }
            }
            //console.log(allData[0]);
            res.json({"status":"200", "file":allData, "filename":filename});
        });
        
        // 将所有文件内容作为 JSON 返回给客户端
        
        //res.json({"status":"success", "data":allData});
    } catch (err) {
        console.error('Error reading CSV files:', err);
        res.status(500).send('Error reading CSV files');
    }
});

app.post('/save_file', async (req, res) => {
    var data = req.body.data;
    var filename = req.body.fileName;
    const headers = ['客戶型態', '藥局型態', '顧客代號', '顧客名稱', '業務代號', '業務名稱', '交易品項', '交易金額', '交易日期', '顧客電話', '顧客地址']; // 这里是CSV的表头
    const rows = data.map(row => `${row.客戶型態},${row.藥局型態},${row.顧客代號},${row.顧客名稱},${row.業務代號},${row.業務名稱},${row.交易品項},${row.交易金額},${row.交易日期},${row.顧客電話},${row.顧客地址}`); // 将数据转换为CSV格式的行
    const csvString = [headers.join(','), ...rows].join('\n');
    const buffer = Buffer.from(iconv.encode(csvString, 'Big5'));
    fs.writeFileSync('./csv/'+filename+'.csv', buffer);

    res.status(200).send({"status":"sucess"});
});

app.delete('/delete_file', async (req, res) => {
    
    // 拼接文件路径
    const absolutePath = path.resolve("./csv/", req.body.fileName+".csv");
    // 删除文件
    fs.unlink(absolutePath, (err) => {
        if (err) {
            // 如果发生错误，则返回错误消息
            console.error('文件删除失败:', err);
            return res.status(500).send({"log":"刪除失敗 : " + err});
        }

        // 如果文件删除成功，则返回成功消息
        res.send({"status":200,"log":"刪除成功"});
    });
});

// 注意，這邊的 server 原本是 app
server.listen(8080, () => {
    console.log("Server Started. http://localhost:8080");
});
