const socket = io();

let form = document.getElementById('form');
let myName = document.getElementById('myName')
let connectButton = document.getElementById('connectButton');
let messageInput = document.getElementById('message');
let targets = document.getElementById("targets");
let messageArea = document.getElementById('messageArea');
let sendButton = document.getElementById('sendButton');

//when user clicks connect
connectButton.addEventListener('click', (e) => {
    e.preventDefault();
    let name = myName.value;
    if (name) {
        socket.emit('register', name);
        alert(`Connected as ${name}`);
    }

    else {
        alert('please enter your User-ID');
    }
});

//when user clicks send Message
sendButton.addEventListener('click', (e) => {
    e.preventDefault(); 
    let message = messageInput.value;
    let targetUsers = targets.value.split(',').map(t => t.trim());

    if (message && targetUsers.length > 0) {
        socket.emit('sendMessage',{
            message: message,
            sender: myName.value,
            receivers: targetUsers
        });
        messageInput.value = ''
    }
    else{
        alert('Please enter a message and target user');
    }
});

//Listening for message from the server
socket.on('receiverMessage',(data)=>{
    messageArea.innerHTML+= `<p><b>${data.sender}</b>: ${data.message}</p>`;
});  
  
socket.on('chatHistory', (messages) => {
        messages.forEach((msg) => {
            messageArea.innerHTML += `<p><b>${msg.sender}</b>: ${msg.message}</p>`;
        });
    });