const socket = io();

const loginPage = document.getElementById('loginPage');
const app = document.getElementById('app');
const usernameInput = document.getElementById('username');
const loginBtn = document.getElementById('loginBtn');
const sidebar = document.getElementById('sidebar');
const chatHeader = document.getElementById('chatHeader');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const groupNameInput = document.getElementById('groupNameInput');
const createGroupBtn = document.getElementById('createGroupBtn');
const groupList = document.getElementById('groupList');
const chatList = document.getElementById('chatList');

let currentChat = null;
let chats = [];
let groups = [];

loginBtn.onclick = () => {
  if (usernameInput.value.trim() !== '') {
    loginPage.style.display = 'none';
    app.style.display = 'flex';
    socket.emit('setUsername', usernameInput.value);
  }
};

function createChat(name) {
  if (!chats.includes(name)) {
    chats.push(name);
    updateSidebar();
  }
}

function createGroup(name) {
  if (!groups.includes(name)) {
    groups.push(name);
    updateSidebar();
  }
}

function updateSidebar() {
  chatList.innerHTML = '';
  chats.forEach(chat => {
    let li = document.createElement('li');
    li.textContent = chat;
    li.onclick = () => openChat(chat);
    chatList.appendChild(li);
  });

  groupList.innerHTML = '';
  groups.forEach(group => {
    let li = document.createElement('li');
    li.textContent = group;
    li.onclick = () => openChat(group);
    groupList.appendChild(li);
  });
}

function openChat(chat) {
  currentChat = chat;
  chatHeader.textContent = chat;
  messages.innerHTML = '';

  socket.emit('joinChat', chat);
}

sendBtn.onclick = () => {
  if (messageInput.value.trim() === '' || !currentChat) return;

  const messageData = {
    sender: usernameInput.value,
    chat: currentChat,
    message: messageInput.value
  };

  socket.emit('sendMessage', messageData);
  messageInput.value = '';
};

socket.on('receiveMessage', (data) => {
  if (data.chat === currentChat) {
    let msg = document.createElement('div');
    msg.className = 'message sent';
    msg.textContent = `${data.sender}: ${data.message}`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }
});

socket.on('chatHistory', (history) => {
  history.forEach(data => {
    let msg = document.createElement('div');
    msg.className = 'message sent';
    msg.textContent = `${data.sender}: ${data.message}`;
    messages.appendChild(msg);
  });
  messages.scrollTop = messages.scrollHeight;
});

messageInput.addEventListener('input', () => {
  if (currentChat) {
    socket.emit('typing', { chat: currentChat, sender: usernameInput.value });
  }
});

socket.on('typing', (data) => {
  if (data.chat === currentChat) {
    chatHeader.textContent = `${data.sender} is typing...`;

    clearTimeout(chatHeader.timeout);
    chatHeader.timeout = setTimeout(() => {
      chatHeader.textContent = currentChat;
    }, 1500);
  }
});

createGroupBtn.onclick = () => {
  const groupName = groupNameInput.value.trim();
  if (groupName) {
    createGroup(groupName);
    groupNameInput.value = '';
  }
};

socket.on('onlineUsers', (users) => {
  console.log('Online users:', users);
});