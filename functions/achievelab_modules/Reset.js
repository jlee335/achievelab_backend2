/* eslint-disable require-jsdoc */
// const {getAuth} = require("firebase-admin/auth");

// const { getFirestore, doc, collection, getDocs, getDoc, setDoc, addDoc,
//     updateDoc, increment, arrayUnion, query, where,
//     orderBy, limit } = require("firebase-admin/firestore");

const {getFirestore} = require("firebase-admin/firestore");


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


// Resets releationship between User and Team
async function resetUserTeam(userRef, teamRef) {
  // 거지같은 코딩
  const userDoc = await getDoc(userRef);
  // const teamDoc = await getDoc(teamRef);
  const userName = userDoc.data().name;
  // const teamName = teamDoc.data().name;

  //

  // Reset team_oints from user doc
  // await updateDoc(userRef, {
  //   [`deposits.${teamName}`]: 100,
  //   [`team_points.${teamName}`]: 0,
  // });

  // Reset team_points from team doc
  await updateDoc(teamRef, {
    [`team_points.${userName}`]: 0,
  });

  // team_points = {[userName]: 0}
}

async function resetTeam(teamName) {
  const teamRef = doc(db, "teams", teamName);
  const teamDoc = await getDoc(teamRef);
  const teamMembers = teamDoc.data().team_refs;
  for (const memberRef of teamMembers) {
    await resetUserTeam(memberRef, teamRef);
  }
  // Reset total team points to 0
  await updateDoc(teamRef, {
    total_points: 0,
  });
}

module.exports = {
  resetTeam,
};
