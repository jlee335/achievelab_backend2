/* eslint-disable require-jsdoc */
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
// const {logger} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const functions = require("firebase-functions");
// const {onDocumentCreated} = require("firebase-functions/v2/firestore");s

// The Firebase Admin SDK to access Firestore.
// const { initializeApp } = require("firebase-admin/app");
// const {getFirestore} = require("firebase-admin/firestore");
// const {getAuth} = require("firebase-admin/auth");

const firebaseConfig = {
  apiKey: "AIzaSyDgXIlbNj-LheKdER9a29ZDJO20Ik6lCOw",
  authDomain: "achievalab-hifi.firebaseapp.com",
  databaseURL: "https://achievalab-hifi-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "achievalab-hifi",
  storageBucket: "achievalab-hifi.appspot.com",
  messagingSenderId: "862067171806",
  appId: "1:862067171806:web:185cca6c85fb0bb81dbd4f",
  measurementId: "G-DBKZ3NHNCL",
};

initializeApp(firebaseConfig);

const {getFirestore, collection,
  getDocs} = require("firebase/firestore");


const {handleSignUp} = require("./achievelab_modules/Signup");
const {newTeam, joinTeam} = require("./achievelab_modules/Teams");
const {addProgressMapping, everyNightProgress} =
  require("./achievelab_modules/Progress");
const {addChat, getChats} = require("./achievelab_modules/Chat");
const {getUserInfo, getTeamInfo, userExist, teamExist, progressInfo, getTier} =
  require("./achievelab_modules/Infos");
const {getTopNRanking} = require("./achievelab_modules/Ranking");
const {resetTeam} = require("./achievelab_modules/reset");
// const {transferTeamUser, transferUserTeam} =
//   require("./achievelab_modules/PointLogic");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// Signup
exports.handleSignUp = onRequest((request, response) => {
  // Extract the email and password from the POST request.
  console.log(request.body);
  const email = request.body.email;
  const password = request.body.password;
  const name = request.body.name;
  // Call the `handleSignUp` function from the `Signup` module.
  handleSignUp(email, password, name);
  // Return a JSON response.
  response.json({result: "success"});
});

// exports.handleSignIn = onRequest((request, response) => {
//   // Extract the email and password from the POST request.
//   console.log(request.body);
//   const email = request.body.email;
//   const password = request.body.password;
//   // Call the `handleSignUp` function from the `Signup` module.
//   handleSignIn(email, password);
//   // Return a JSON response.
//   response.json({result: "success"});
// });

exports.newTeam = onRequest((request, response) => {
  // Extract the email and password from the POST request.
  console.log(request.body);
  const userName = request.body.userName;
  const teamName = request.body.teamName;
  const rules = request.body.rules;
  const description = request.body.description;
  const entryDeposit = request.body.entry_deposit;
  // Call the `handleSignUp` function from the `Signup` module.
  newTeam(userName, teamName, rules, description, entryDeposit);
  // Return a JSON response.
  response.json({result: "team created"});
});

/* Ranking and progress */
exports.addProgressMapping = onRequest((request, response) => {
  const userName = request.body.userName;
  const date = request.body.date; // new Date().toISOString().split('T')[0]
  const teamName = request.body.teamName;
  const result = request.body.result; // 'success' or 'failure'

  // addProgressMapping(userName, date, teamName, result);
  // response.json({ add_progress: "success" });
  addProgressMapping(userName, date, teamName, result).then((result) => {
    response.json({add_progress: result});
  }).catch((error) => {
    console.error(error);
  });
});

// exports.ranking = onRequest((request, response) => {
//   const teamName = request.body.teamName;
//   ranking(teamName).then((result) => {
//     response.json({in_team_ranking: result});
//   }).catch((error) => {
//     console.error(error);
//   });
// });

// exports.getTeamRanking = onRequest((request, response) => {
//   const teamName = request.body.teamName;
//   getTeamRanking(teamName).then((result) => {
//     response.json({team_ranking: result});
//   }).catch((error) => {
//     console.error(error);
//   });
// });

// exports.getTopNRanking = onRequest((request, response) => {
//   const numTeams = request.body.numTeams;
//   getTopNRanking(numTeams).then((result) => {
//     response.json({topNranking: result});
//   }).catch((error) => {
//     console.error(error);
//   });
// });
exports.addChatAPI = onRequest(async (request, response) => {
  const userName = request.body.userName;
  const teamName = request.body.teamName;
  const uE = userExist(userName);
  const tE = teamExist(teamName);
  if (!uE || !tE) {
    response.json({
      result: "user or team does not exist",
    });
  } else {
    const message = request.body.message;
    addChat(userName, teamName, message);
    response.json({
      result: "Chat added successfully",
    });
  }
});

exports.getChatsAPI = onRequest(async (request, response) => {
  const teamName = request.body.teamName;
  const tE = await teamExist(teamName);
  if (!tE) {
    response.json({
      result: "team does not exist",
    });
  } else {
    getChats(teamName, (chats) => {
      response.json({chats: chats});
    });
  }
});

exports.joinTeamAPI = onRequest(async (request, response) => {
  const userName = request.body.userName;
  const teamName = request.body.teamName;
  console.log("========================================");
  const uE = await userExist(userName);
  const tE = await teamExist(teamName);
  console.log(tE, uE);
  if (!uE || !tE) {
    response.json({
      result: "no user or no team",
    });
  } else {
    const result = joinTeam(userName, teamName);
    if (result) {
      getUserInfo(userName).then((userInfo) => {
        getTeamInfo(teamName).then((teamInfo) => {
          const socialCredit = userInfo["social_credit"];
          const teamScore = teamInfo["total_points"];
          console.log(userInfo);
          console.log(teamInfo);
          response.json({
            socialCredit: socialCredit,
            deposit: 100,
            failDeduction: 20,
            teamScore: teamScore,
            initialScore: 0,
            increment: 5,
          });
        });
      });
    } else {
      response.json({
        result: "fail to join",
      });
    }
  }
});


exports.progressAPI = onRequest(async (request, response) => {
  const userName = request.body.userName;
  const teamName = request.body.teamName;
  const date = request.body.date;
  const success = request.body.isSuccess;

  const prevInfo = await progressInfo(userName, teamName);
  const result = await addProgressMapping(userName, date, teamName, "success");
  if (!result) {
    response.json({
      result: "fail",
    });
  } else {
    if (success) {
      const curInfo = await progressInfo(userName, teamName);
      const rankChanged = (prevInfo["Ranking"] != curInfo["Ranking"]);
      response.json({
        rankChanged: rankChanged,
        prevRank: prevInfo["Ranking"],
        curRank: curInfo["Ranking"],
        prevScore: prevInfo["Point"],
        curScore: curInfo["Point"],
        prevTotalScore: prevInfo["TotalPoint"],
        curTotalScore: curInfo["TotalPoint"],
      });
    } else {
      const userInfo = await getUserInfo(userName);
      response.json({
        leftDeposit: userInfo["deposits"][teamName],
      });
    }
  }
});

exports.LeaderBoardAPI = onRequest(async (request, response) => {
  const N = request.body.N;
  const LeaderBoardInfos = await getTopNRanking(N);
  response.json({
    LeaderBoardInfos,
  });
});


async function paybackCallback(event) {
  const db = getFirestore();
  const teamsRef = collection(db, "teams");
  const teamsSnapshot = await getDocs(teamsRef);
  teamsSnapshot.forEach(async (teamDoc) => {
    const teamName = teamDoc.data().name;
    await resetTeam(teamName);
  });
  // await resetUsers();
}


exports.paybackManual = onRequest(async (request, response) => {
  paybackCallback(null);
  response.json({
    result: "success",
  });
});

exports.payback = onSchedule("every monday 00:00", paybackCallback);

exports.getTierAPI = onRequest(async (request, response) => {
  const userName = request.body.userName;
  const tier = await getTier(userName);
  response.json({
    "tier": tier,
    "message": "xxxxxxxxxxxxxxxxxxxxx",
  });
});

exports.scheduledFunction = functions.pubsub
  .schedule('every day 22:11')
  .timeZone('Asia/Seoul') // Set the time zone to Korea Standard Time (UTC+9)
  .onRun(async (context) => {
    console.log('This will be run every day at 22:10 in Korea Standard Time!');
    await everyNightProgress();
    return null;
  });
// Force reset all users by GET call
exports.resetUsers = onRequest(async (request, response) => {
  paybackCallback(null);
});
