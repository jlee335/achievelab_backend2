/* eslint-disable require-jsdoc */
const {getFirestore} =
  require("firebase-admin/firestore");


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

async function updateDoc(doc, data) {
  doc.update(data);
}

async function extractTeamNames(referenceList) {
  const teamNames = [];
  for (const ref of referenceList) {
    const a = (await getDoc(ref)).data();
    teamNames.push(a.name);
  }
  return teamNames;
}

const {setTier} = require("./SetTier");


const doesMappingExist = async (userName, date, teamName) => {
  const userRef = doc(db, "users", userName);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists) {
    const progressMap = userDoc.data().progress || {};
    const dateMap = progressMap[date] || {};
    return (dateMap[teamName] != undefined);
  } else {
    console.error(`${userName} does not exist`);
  }
};

async function addProgressMapping(userName, date, teamName, result) {
  try {
    const userRef = doc(db, "users", userName);
    const teamRef = doc(db, "teams", teamName);
    const userDoc = await getDoc(userRef);
    const teamDoc = await getDoc(teamRef);
    const MappingExist = await doesMappingExist(userName, date, teamName);
    if (MappingExist) {
      console.error("same mapping already exists");
      return false;
    } else {
      if (userDoc.exists && teamDoc.exists) {
        const progress = userDoc.data().progress || {};
        const dateMap = progress[date] || {};
        dateMap[teamName] = result;

        // Update the user document with the new progress map
        await updateDoc(userRef, {[`progress.${date}`]: dateMap});

        console.log(`Progress mapping added successfully for user 
            ${userName} on ${date} for team ${teamName}.`);
        const teamPts = await teamDoc.data().team_points[userName];
        const increment = await teamDoc.data().increment;
        const decrement = await teamDoc.data().decrement;
        const totalPoints = await teamDoc.data().total_points;
        if (result == "success") {
          //* ***** */
          await updateDoc(teamRef, {
            [`team_points.${userName}`]: teamPts + increment,
            total_points: totalPoints + increment,
          });
          //* ***** */

          await updateDoc(userRef, {
            [`team_points.${teamName}`]: teamPts + increment,
          });
        } else {
          const currentDeposit = userDoc.data().deposits[teamName];
          const deductionDeposit = teamDoc.data().deductionDeposit;
          if (currentDeposit < deductionDeposit) {
            console.log("OUT !!!!!!!!!!!!!!!!!!!!");
            await updateDoc(userRef, {
              [`deposits.${teamName}`]: 0,
              [`team_points.${teamName}`]: teamPts - decrement,
            });
            await updateDoc(teamRef, {
              [`team_points.${userName}`]: teamPts - decrement,
              total_points: totalPoints - decrement,
            });
          } else {
            await updateDoc(userRef, {
              [`deposits.${teamName}`]: currentDeposit - deductionDeposit,
              [`team_points.${teamName}`]: teamPts - decrement,
            });
            await updateDoc(teamRef, {
              [`team_points.${userName}`]: teamPts - decrement,
              total_points: totalPoints - decrement,
            });
          }
        }
        setTier(userName);
        return true;
      } else {
        console.log(`User ${userName} does not exist.`);
        return false;
      }
    }
  } catch (error) {
    console.error("Error adding progress mapping:", error);
  }
}

async function everyNightProgress() {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  const dateTimeString = `${year}-${month}-${day}`;

  const userDocs = await db.collection("users").get();
  userDocs.forEach(async (userDoc) => {
    const userName = userDoc.data().name;
    const teamNames = await extractTeamNames(userDoc.data().team_refs);
    teamNames.forEach(async (teamName) => {
      await addProgressMapping(userName, dateTimeString, teamName, "fail");
    });
  });
}

async function testEveryNightProgress(givenUserName) {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  const dateTimeString = `${year}-${month}-${day}`;

  const userDocs = await db.collection("users").get();
  userDocs.forEach(async (userDoc) => {
    const userName = userDoc.data().name;
    if (userName == givenUserName) {
      const teamNames = await extractTeamNames(userDoc.data().team_refs);
      teamNames.forEach(async (teamName) => {
        await addProgressMapping(userName, dateTimeString, teamName, "fail");
      });
    }
  });
}


module.exports = {
  doesMappingExist,
  addProgressMapping, everyNightProgress, testEveryNightProgress,
};
