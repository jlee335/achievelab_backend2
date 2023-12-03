/* eslint-disable require-jsdoc */

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

async function collection(db, path) {
  const col = await db.collection(path);
  return col;
}

async function getDocs(col) {
  const colSnap = await col.get();
  return colSnap;
}

async function updateDoc(doc, data) {
  doc.update(data);
}


async function resetUser(userName) {
  const userRef = doc(db, "users", userName);
  const userDoc = await getDoc(userRef);
  const teamRefs = userDoc.data().team_refs;
  for (const teamRef of teamRefs) {
    const teamDoc = await getDoc(teamRef);
    const teamName = teamDoc.data().name;
    const teamDeposit = userDoc.data().deposits[teamName];
    const teamPoints = userDoc.data().team_points[teamName];
    const socialCredit = userDoc.data().social_credit;
    await updateDoc(userRef, {
      social_credit: socialCredit + teamDeposit + 10 * teamPoints,
      [`deposits${teamName}`]: 0,
      [`team_points${teamName}`]: 0,
    });
  }
}

async function resetUsers() {
  const collectionRef = await collection(db, "users");
  const userDocs = await getDocs(collectionRef);
  await userDocs.forEach((doc) => {
    resetUser(doc.data().name);
  });
  return true;
}

module.exports = {
  resetUsers,
};
