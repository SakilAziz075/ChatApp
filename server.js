const express = require('express');
const app = express();
const mysql = require('mysql');

const http = require('http').createServer(app);
const io = require('socket.io')(http);

/*app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
*/
app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chatapp'
});


io.on('connection', (socket) => {                   //setting up listener for new WebSocket Connections

    console.log('A user connected');

    socket.on('sendMessage', (data) => {                //Listens for a sendMessage event. When a message is sent, it extracts the sender, 
        const { sender, receivers, message } = data;     //receiver, and message from the data.

        for (let i = 0; i < receivers.length; i++) {

            let receiver = receivers[i]
            //storing the message in the database
            let query = 'INSERT INTO messages(sender, receiver, message) VALUES(?,?,?)';

            db.query(query, [sender, receiver, message], (err, result) => {
                if (err) {
                    console.error(`Database Error: ${err.message}`);
                    socket.emit('dbError', 'Failed to store message');
                    return;
                }
                console.log(`message stored in DB for ${receiver}`);
            });

            //emit the message to the receiver if they are connected
            io.to(receiver).emit('receiverMessage', { sender, message });
        }
    });

    socket.on('register', (username) => {
        console.log(`${username} register with ID${socket.id}`);
        socket.join(username);


        // Fetch chat history for the user
        const query = 'SELECT * FROM messages WHERE receiver = ?';
        db.query(query, [username], (err, results) => {
            if (err) throw err;
            // Send the messages back to the client
            socket.emit('chatHistory', results);
        });

    });

    // Disconnect event

    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`);
    });

});


http.listen(3000, () => {
    console.log('server listenning on port 3000')
});
