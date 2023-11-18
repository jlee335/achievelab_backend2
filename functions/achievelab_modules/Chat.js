/* eslint-disable require-jsdoc */
const {getDatabase, ref, onValue, push, serverTimestamp} =
  require("firebase/database");

const database = getDatabase();
function addChat(userName, teamName, message) {
  const chatRef = ref(database, `chats/${teamName}`);
  push(chatRef, {
    user: userName,
    message: message,
    timestamp: serverTimestamp(),
  });
}
function getChats(teamName, callback) {
  const chatRef = ref(database, `chats/${teamName}`);

  onValue(chatRef, (snapshot) => {
    const chats = [];
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      const chat = [data.user, data.message];
      chats.push(chat);
    });
    callback(chats);
  });
}

// addChat("user1", "teamA", "Hello, team A!");

// getChats("teamA", (chats) => {
//   console.log(chats);
// });

module.exports = {addChat, getChats};
