/* eslint-disable require-jsdoc */
const {getDatabase} =
  require("firebase-admin/database");

const admin = require("firebase-admin");

const database = getDatabase();

// Wrapper function for firebase-admin
function ref(_database, path) {
  const rr = database.ref(path);
  return rr;
}


async function push(ref, data) {
  const newRef = await ref.push(data);
  return newRef;
}

function serverTimestamp() {
  return admin.database.ServerValue.TIMESTAMP;
}


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

  // Get all items of chatRef
  chatRef.on("value", (snapshot) => {
    const chats = [];
    snapshot.forEach((childSnapshot) => {
      chats.push(childSnapshot.val());
    });
    callback(chats);
  });
}

// addChat("user1", "teamA", "Hello, team A!");

// getChats("teamA", (chats) => {
//   console.log(chats);
// });

module.exports = {addChat, getChats};
