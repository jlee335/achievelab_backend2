/* eslint-disable require-jsdoc */
const {getFirestore, doc, collection, getDoc,
  updateDoc} = require("firebase/firestore");


const db = getFirestore();

async function setTier(userName) {
  const userRef = doc(collection(db, "users"), userName);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    let score = userDoc.data().social_credit;
    for (const [team, deposit] of Object.entries(userDoc.data().deposits)) {
      team;
      score += deposit;
    }
    let tier;
    if (score <= 30) tier = "Iron";
    else if (score <= 60) tier = "Bronze";
    else if (score <= 90) tier = "Silver";
    else if (score <= 120) tier = "Gold";
    else if (score <= 150) tier = "Platinum";
    else if (score <= 180) tier = "Emerald";
    else if (score <= 210) tier = "Diamond";
    else if (score <= 240) tier = "Master";
    else if (score <= 270) tier = "GrandMaster";
    else tier = "Challenger";
    await updateDoc(userRef, {tier: tier});
  } else {
    console.error(`no user named ${userName}`);
  }
}
module.exports = {setTier};
