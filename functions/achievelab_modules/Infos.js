/* eslint-disable require-jsdoc */
const {getFirestore} = require("firebase-admin/firestore");
const {ranking} = require("./Ranking");

const db = getFirestore();

// Wrapper function for firebase-admin
function doc(_db, path, subPath) {
  const doc = db.doc(path + "/" + subPath);
  return doc;
}

async function getDoc(doc) {
  const docSnap = doc.get();
  return docSnap;
}

async function collection(db, path) {
  const col = await db.collection(path);
  return col;
}


async function userExist(userName) {
  const userRef = doc(db, "users", userName);
  console.log(userRef);
  const userDoc = await getDoc(userRef);
  console.log(userDoc);
  const result = userDoc.exists;
  return result;
}

async function teamExist(teamName) {
  const teamRef = doc(db, "teams", teamName);
  const teamDoc = await getDoc(teamRef);
  console.log(teamDoc.exists);
  const result = teamDoc.exists;
  return result;
}

async function extractTeamNames(referenceList) {
  const teamNames = [];
  for (const ref of referenceList) {
    const a = (await getDoc(ref)).data();
    teamNames.push(a.name);
  }
  return teamNames;
}

async function extractUserNames(referenceList) {
  const userNames = [];
  for (const ref of referenceList) {
    const a = (await getDoc(ref)).data();
    userNames.push(a.name);
  }
  return userNames;
}

async function getUserInfo(userName) {
  const userRef = doc(db, "users", userName);
  const userDoc = await getDoc(userRef);
  const data = await userDoc.data();
  const x = await {
    "name": data.name,
    "progress": data.progress,
    "deposits": data.deposits,
    "social_credit": data.social_credit,
    "teams": await extractTeamNames(data.team_refs),
  };
  return x;
}

async function getTeamInfo(teamName) {
  const teamRef = doc(db, "teams", teamName);
  const teamDoc = await getDoc(teamRef);
  const data = await teamDoc.data();
  const x = await {
    "name": teamDoc.id,
    "description": data.description,
    "duration_start": data.duration_start,
    "members": await extractUserNames(data.user_refs),
    "ranking": data.team_ranking,
    "total_points": data.total_points,
  };
  return x;
}

async function userCredit(userName) {
  const userRef = doc(collection(db, "users"), userName);
  const userDoc = await getDoc(userRef);

  try {
    return userDoc.data().social_credit;
  } catch (error) {
    return "error";
  }
}

async function userTeamPoints(userName, teamName) {
  const userRef = doc(db, "users", userName);
  const userDoc = await getDoc(userRef);

  try {
    return userDoc.data().team_points[teamName];
  } catch (error) {
    return "error";
  }
}

async function userDeposits(userName, teamName) {
  const userRef = doc(db, "teams", userName);
  const userDoc = await getDoc(userRef);

  try {
    return userDoc.data().deposits[teamName];
  } catch (error) {
    return "error";
  }
}

async function teamPoints(teamName) {
  const teamRef = doc(collection(db, "teams"), teamName);
  const teamDoc = await getDoc(teamRef);

  try {
    return teamDoc.data().total_points;
  } catch (error) {
    return "error";
  }
}

function rank(rankings, name) {
  for (let i = 0; i < rankings.length; i++) {
    if (rankings[i].id === name) {
      return i + 1;
    }
  }
}

async function progressInfo(userName, teamName) {
  // const userRef = doc(db, "users", userName);
  // const userDoc = await getDoc(userRef);
  const teamRef = doc(db, "teams", teamName);
  const teamDoc = await getDoc(teamRef);
  const rankings = await ranking(teamName);
  const Ranking = await rank(rankings, userName);
  const TotalPoint = teamDoc.data().total_points;
  const Point = teamDoc.data().team_points[userName];
  return {
    Ranking: Ranking,
    TotalPoint: TotalPoint,
    Point: Point,
  };
}

async function getTier(userName) {
  const userRef = doc(db, "usrs", userName);
  const userDoc = await getDoc(userRef);
  const tier = userDoc.data().tier;
  return tier;
}
module.exports = {
  progressInfo, userCredit, userTeamPoints, userDeposits,
  teamPoints, getUserInfo, getTeamInfo, userExist, teamExist, getTier,
};
