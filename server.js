// server.js
require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const db = require('./config/db');  // Database pool

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('sendMessage', (data) => {
        const { sender, receivers, message } = data;

        for (let receiver of receivers) {
            const query = 'INSERT INTO messages(sender, receiver, message) VALUES(?,?,?)';

            db.query(query, [sender, receiver, message], (err, result) => {
                if (err) {
                    console.error(`Database Error: ${err.message}`);
                    socket.emit('dbError', 'Failed to store message');
                    return;
                }
                console.log(`Message stored in DB for ${receiver}`);
            });

            io.to(receiver).emit('receiverMessage', { sender, message });
        }
    });

    socket.on('register', (username) => {
        console.log(`${username} registered with ID ${socket.id}`);
        socket.join(username);

        const query = 'SELECT * FROM messages WHERE receiver = ?';
        db.query(query, [username], (err, results) => {
            if (err) {
                console.error(`Database Error: ${err.message}`);
                return;
            }
            socket.emit('chatHistory', results);
        });
    });

    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`);
    });
});

http.listen(3000, () => {
    console.log('Server listening on port 3000');
});
