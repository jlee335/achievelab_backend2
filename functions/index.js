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
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
// const {getAuth} = require("firebase-admin/auth");

initializeApp();


const {handleSignUp} = require("./achievelab_modules/Signup");
const {newTeam, joinTeam} = require("./achievelab_modules/Teams");
const {addProgressMapping, everyNightProgress, testEveryNightProgress} =
  require("./achievelab_modules/Progress");
const {addChat, getChats} = require("./achievelab_modules/Chat");
const {getUserInfo, getTeamInfo, userExist, teamExist, progressInfo, getTier} =
  require("./achievelab_modules/Infos");
const {getTopNRanking} = require("./achievelab_modules/Ranking");
const {resetTeam} = require("./achievelab_modules/Reset");
// const {transferTeamUser, transferUserTeam} =
//   require("./achievelab_modules/PointLogic");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// Signup
exports.handleSignUp = onRequest({cors: true},
    (request, response) => {
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

// exports.handleSignIn = onRequest({cors: true},(request, response) => {
//   // Extract the email and password from the POST request.
//   console.log(request.body);
//   const email = request.body.email;
//   const password = request.body.password;
//   // Call the `handleSignUp` function from the `Signup` module.
//   handleSignIn(email, password);
//   // Return a JSON response.
//   response.json({result: "success"});
// });

exports.newTeam = onRequest({cors: true}, (request, response) => {
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
exports.addProgressMapping = onRequest({cors: true}, (request, response) => {
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

// exports.ranking = onRequest({cors: true},(request, response) => {
//   const teamName = request.body.teamName;
//   ranking(teamName).then((result) => {
//     response.json({in_team_ranking: result});
//   }).catch((error) => {
//     console.error(error);
//   });
// });

// exports.getTeamRanking = onRequest({cors: true},(request, response) => {
//   const teamName = request.body.teamName;
//   getTeamRanking(teamName).then((result) => {
//     response.json({team_ranking: result});
//   }).catch((error) => {
//     console.error(error);
//   });
// });

// exports.getTopNRanking = onRequest({cors: true},(request, response) => {
//   const numTeams = request.body.numTeams;
//   getTopNRanking(numTeams).then((result) => {
//     response.json({topNranking: result});
//   }).catch((error) => {
//     console.error(error);
//   });
// });
exports.addChatAPI = onRequest({cors: true}, async (request, response) => {
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

exports.getChatsAPI = onRequest({cors: true}, async (request, response) => {
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

exports.joinTeamAPI = onRequest({cors: true}, async (request, response) => {
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


exports.progressAPI = onRequest({cors: true}, async (request, response) => {
  const userName = request.body.userName;
  const teamName = request.body.teamName;
  const date = request.body.date;
  const success = request.body.isSuccess;

  // Format YYYYMMDD to  YYYY-MM-DD
  const dateStr = date.toString();
  const dateFormatted =
    `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  console.log(dateFormatted);


  const prevInfo = await progressInfo(userName, teamName);

  let a = "success";
  if (!success) a = "fail";


  const result = await addProgressMapping(
      userName, dateFormatted, teamName, a);
  if (!result) {
    response.json({
      result: {
        isSuccess: false,
        body: {
          error: "fail to add progress",
        },
      },
    });
  } else {
    if (success) {
      const curInfo = await progressInfo(userName, teamName);
      const rankChanged = (prevInfo["Ranking"] != curInfo["Ranking"]);
      response.json({
        result: {
          isSuccess: true,
          body: {
            rankChanged: rankChanged,
            prevRank: prevInfo["Ranking"],
            curRank: curInfo["Ranking"],
            prevScore: prevInfo["Point"],
            curScore: curInfo["Point"],
            prevTotalScore: prevInfo["TotalPoint"],
            curTotalScore: curInfo["TotalPoint"],
          },
        },
      });
    } else {
      const userInfo = await getUserInfo(userName);
      response.json({
        result: {
          isSuccess: true,
          body: {
            leftDeposit: userInfo["deposits"][teamName],
          },
        },
      });
    }
  }
});

exports.LeaderBoardAPI = onRequest({cors: true}, async (request, response) => {
  // const N = request.body.N;
  const LeaderBoardInfos = await getTopNRanking();
  response.json({
    LeaderBoardInfos,
  });
});


async function paybackCallback(event) {
  const db = getFirestore();

  // const teamsRef = collection(db, "teams");
  const teamsRef = db.collection("teams");
  // const teamsSnapshot = await getDocs(teamsRef);
  const teamsSnapshot = await teamsRef.get();
  teamsSnapshot.forEach(async (teamDoc) => {
    const teamName = teamDoc.data().name;
    await resetTeam(teamName);
  });
  // await resetUsers();
}


exports.paybackManual = onRequest({cors: true}, async (request, response) => {
  paybackCallback(null);
  response.json({
    result: "success",
  });
});

exports.payback = onSchedule("every monday 00:00", paybackCallback);

exports.getTierAPI = onRequest({cors: true}, async (request, response) => {
  const userName = request.body.userName;
  const tier = await getTier(userName);
  response.json({
    "tier": tier,
    "message": "xxxxxxxxxxxxxxxxxxxxx",
  });
});

exports.scheduledFunctionTest = onRequest({cors: true},
    async (request, response) => {
      const userName = request.body.userName;
      console.log(
          "This will be run every day at 22:10 in Korea Standard Time!");

      await testEveryNightProgress(userName);
      response.json({
        "result": "success",
      });
    });

exports.scheduledFunction = functions.pubsub
    .schedule("every day 22:11")
    .timeZone("Asia/Seoul") // Set the time zone to Korea Standard Time (UTC+9)
    .onRun(async (context) => {
      console.log(
          "This will be run every day at 22:10 in Korea Standard Time!");
      await everyNightProgress();
      return null;
    });
// Force reset all users by GET call
exports.resetUsers = onRequest({cors: true}, async (request, response) => {
  paybackCallback(null);
});


/**
 * Input format
 *  userName : string
 *  teamName : string
 * Outputs
 * is_success : boolean
 * message : string
 *
 */
exports.joinTeamAPI2 = onRequest({cors: true}, async (request, response) => {
  const userKey = request.body.userKey;
  const teamKey = request.body.teamKey;


  // find userRef and teamRef
  const db = getFirestore();
  const usersRef = db.collection("users2");
  const teamsRef = db.collection("teams2");
  const userDoc = await usersRef.doc(userKey).get();
  const teamDoc = await teamsRef.doc(teamKey).get();

  // Get user's current social points
  const userSocialPoints = userDoc.data().social_points;


  if (userSocialPoints < 100) {
    response.json({
      is_success: false,
      message: "Not enough social points",
    });
    return;
  }

  const userSocialPointsAfter = userSocialPoints - 100;

  // TeamRef 에서 할 것
  const teamMembers = teamDoc.data().team_members;
  // team_members have deposit_left, team_points, user_ref
  const userRef = userDoc.ref;
  const depositLeft = 100;
  const teamPoints = 0;
  const newUser = {
    deposit_left: depositLeft,
    team_points: teamPoints,
    user_ref: userRef,
  };
  teamMembers.push(newUser);
  await teamDoc.ref.update({
    team_members: teamMembers,
  });

  // todos on userRef
  userRef.update({
    team: teamDoc.ref,
    has_team: true,
    social_points: userSocialPointsAfter,
  });

  response.json({
    is_success: true,
    message: "Successfully joined the team",
  });
});
