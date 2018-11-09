var fs = require("fs");
var path = require('path');
var dbPath = path.resolve(__dirname, 'inno_chat.db');
var exists = fs.existsSync(dbPath);
var userSchema = "CREATE TABLE USERS("
    + "id INTEGER PRIMARY KEY,"
    + "email TEXT,"
    + "name TEXT,"
    + "password TEXT"
    + " )";
var chatSchema = "CREATE TABLE CHATS("
    + "id INTEGER PRIMARY KEY,"
    + "from_user INTEGER,"
    + "to_user INTEGER,"
    + "message TEXT,"
    + "status INTIGER"
    + " )";

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(dbPath, (error) => {
    if (!error) {
        console.log('Database opened successfully.');
        // create tables
        db.serialize(() => {
            if (!exists) {
                db.run(userSchema);
                console.log('Database USERS schema created successfully.');
                db.run(chatSchema);
                console.log('Database CHATS schema created successfully.');
            }
        });
    } else {
        console.error(error);
        console.error("Error occurred in Database creation.");
    }
});

module.exports = {
    registerUser: (body, callback) => {
        console.log("Creating user");
        var resultObj = {};
        db.get("select email from users where email=$email", { $email: body.email }, (error, row) => {
            if (error) {
                console.log(error);
                resultObj.status = "FAILURE";
                resultObj.message = "Error occurred during Registration";
                callback(resultObj);
            } else if (row) {
                console.log("user already exists:" + body.email);
                resultObj.status = "FAILURE";
                resultObj.message = "user already exists:" + body.email;
                callback(resultObj);
                return;
            } else {
                db.run("INSERT INTO USERS(id,email,name,password) VALUES (?,?,?, ?)", [null, body.email, body.name, body.password], (error) => {
                    if (error) {
                        resultObj.status = "FAILURE";
                        resultObj.message = "Error occurred during Table insertion";
                        callback(resultObj);
                    } else {
                        console.log("user inserted successfully:" + body.email);
                        resultObj.status = "SUCCESS";
                        resultObj.message = "User inserted successfully";
                        callback(resultObj);
                    }
                });
            }
        });
    },
    validateUser: (request, callback) => {
        var resultObj = { message: "", status: "" };
        db.get("select id,name,email from USERS where email=$email AND password=$password", { $email: request.email, $password: request.password }, (error, user) => {
            if (error) {
                console.error(error);
                resultObj.status = "FAILURE";
                resultObj.message = "Login Failed"
                callback(resultObj);
            } else if (user) {
                resultObj.status = "SUCCESS";
                resultObj.data = user;
                callback(resultObj);
            } else {
                console.log("Invalid Credentials");
                resultObj.status = "FAILURE";
                resultObj.message = "Invalid Credentials";
                callback(resultObj);
            }
        });
    },

    getUsers: (request, callback) => {
        var resultObj = { message: "", status: "" };
        db.all("select id,name,email from USERS where id != $userId", { $userId: request.userId }, (error, users) => {
            if (error) {
                console.error(error);
                resultObj.status = "FAILURE";
                resultObj.message = "Login Failed"
                callback(resultObj);
            } else {
                resultObj.status = "SUCCESS";
                resultObj.data = users;
                callback(resultObj);
            }
        });
    },

    saveChat: (request, callback) => {
        var resultObj = { message: "", status: "" };
        db.run("INSERT INTO CHATS(id,from_user,to_user,message,status) VALUES (?,?,?,?, ?)", [null, request.from_user, request.to_user, request.message, 1], function(error, res) {
            if (error) {
                console.error(error);
                resultObj.status = "FAILURE";
                resultObj.message = "Chat Insert Failed"
                callback(resultObj);
            } else {
                console.log("message saved");
                resultObj.status = "SUCCESS";
                console.log(this.lastID)
                resultObj.data = this.lastID
                callback(resultObj);
            }
        });
    },

    getChats: (request, callback) => {
        var resultObj = { message: "", status: "" };
        db.all("select * from CHATS where from_user in ($fromuserid, $touserid) AND to_user in ($fromuserid, $touserid)", { $fromuserid: request.from_user, $touserid: request.to_user }, (error, chats) => {
            if (error) {
                console.error(error);
                resultObj.status = "FAILURE";
                resultObj.message = "fetching chats failed"
                callback(resultObj);
            } else {
                resultObj.status = "SUCCESS";
                resultObj.data = chats;
                callback(resultObj);
            }
        });
    },

    getUser: (request, callback) => {
        var resultObj = { message: "", status: "" };
        db.get("select id,name,email from USERS where email=$email", { $email: request.email }, (error, user) => {
            if (error) {
                console.error(error);
                resultObj.status = "FAILURE";
                resultObj.message = "Unable to fetch user data"
                callback(resultObj);
            } else if (user) {
                console.log(user);
                resultObj.status = "SUCCESS";
                resultObj.data = user;
                callback(resultObj);
            } else {
                resultObj.status = "FAILURE";
                resultObj.message = "User not Found";
                callback(resultObj);
            }
        })
    },

    updateMessageStatus: (request, callback) => {
        var resultObj = { message: "", status: "" };
        db.run("update CHATS set status=$messageStatus where id=$messageId", {$messageStatus: request.status, $messageId: request.id}, (error)=>{
            if (error) {
                console.error(error);
                resultObj.status = "FAILURE";
                resultObj.message = "Unable to fetch user data"
                callback(resultObj);
            }else {
                console.log("message Status updated" + request.status)
                resultObj.status = "SUCCESS";
                callback(resultObj);
            }
        });
    }
}