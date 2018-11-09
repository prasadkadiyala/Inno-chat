var express = require('express');
var dbManager = require('../dbManager');
var router = express.Router();
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
server.listen(4000);


io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('disconnect', (socket) => {
        console.log('User disconnected');
    });

    //handles chat message
    socket.on('send-message', (data) => {
        console.log(`Message Received from user ${data.from_user}`);
        dbManager.saveChat(data, (result) => {
            if (result.status === "SUCCESS") {
                data.id = result.data;
                console.log(`Broadcoasting message from user ${data.from_user}`);
                io.emit('new-message', { message: data });
            }
        });
    });

    // handles users request
    socket.on('request-users', (data) => {
        console.log(`Request received for users from ${data.userId}`);
        dbManager.getUsers(data, (result) => {
            if (result.status === "SUCCESS") {
                console.log(`Sending users for request of ${data.userId}`);
                io.emit('response-users', { userId: data.userId, users: result.data });
            }
        });
    });

    //chat history request
    socket.on('request-chats', (data) => {
        console.log(`Request received for chat history from ${data.from_user}`);
        dbManager.getChats(data, (result) => {
            if (result.status === "SUCCESS") {
                console.log(`Sending chat history for request of ${data.from_user}`);
                io.emit('response-chats', { userId: data.from_user, chats: result.data });
            }
        });
    });

    socket.on('message-status-change', (data) => {
        //data.status = 2;
        dbManager.updateMessageStatus(data, (result) => {
            io.emit('message-status-change', { message: data });
        });  
    });

    socket.on('message-read', (data) => {
        data.status = 3;
        dbManager.updateMessageStatus(data, (result) => {
            io.emit('message-status-change', { message: data });
        });  
    });


});



router.post('/register', (req, res, next) => {
    console.log("register api executed");
    dbManager.registerUser(req.body, (response) => {
        res.send(response);
        dbManager.getUser(req.body, (result) => {
            if (result.status === "SUCCESS") {
                console.log(result.data)
                io.emit('new-user-added', { message: result.data });
            }
        });
    });
});

router.post('/login', (req, res, next) => {
    console.log("login api executed");
    dbManager.validateUser(req.body, (result) => {
        res.send(result);
    })
});

module.exports = router;