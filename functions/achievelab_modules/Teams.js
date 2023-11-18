/* eslint-disable require-jsdoc */
// const {getAuth} = require("firebase-admin/auth");

// const { getFirestore, doc, collection, getDocs, getDoc, setDoc, addDoc,
//     updateDoc, increment, arrayUnion, query, where,
//     orderBy, limit } = require("firebase-admin/firestore");

const {getFirestore, doc, collection, getDoc, setDoc,
  updateDoc, arrayUnion, runTransaction} = require("firebase/firestore");

const {setTier} = require("./SetTier");

const {transferUserTeam} =
  require("./PointLogic");

const db = getFirestore();


async function newTeam(userName, teamName, rules, description
    , entryDeposit = 100) {
  const teamRef = doc(db, "teams", teamName);
  const userRef = doc(db, "users", userName);
  const teamDoc = await getDoc(teamRef);
  const userDoc = await getDoc(userRef);

  if (teamDoc.exists()) {
    console.log(`team ${teamName} already exists`);
  } else {
    const currentSocialCredit = userDoc.data().social_credit;
    if (currentSocialCredit >= entryDeposit) {
      await updateDoc(userRef, {
        team_refs: arrayUnion(doc(collection(db, "teams"), teamName)),
        social_credit: currentSocialCredit - entryDeposit,
        [`deposits.${teamName}`]: entryDeposit,
        [`team_points.${teamName}`]: 0,
      });
      await setDoc(teamRef, {
        name: teamName,
        rules: rules,
        description: description,
        duration_start: new Date().toISOString().split("T")[0],
        duration: 21,
        total_deposit: 0,
        total_points: 0,
        team_points: {[userName]: 0},
        entry_deposit: 100,
        deduction_deposit: 20,
        team_ranking: 100,
        leader_ref: doc(collection(db, "users"), userName),
        user_refs: [doc(collection(db, "users"), userName)],
        increment: 5,
        decrement: 0,
      });
      await setTier(userName);
      console.log(`${userName} created team ${teamName}`);
    } else {
      console.log(`${userName} has not enough social credit`);
    }
  }
}

async function joinTeam(userName, teamName) {
  const teamRef = doc(db, "teams", teamName);
  const userRef = doc(db, "users", userName);
  const teamDoc = await getDoc(teamRef);
  const userDoc = await getDoc(userRef);
  const memberRefs = teamDoc.data().user_refs;
  const memberExistsInTeam =
    memberRefs.some((memberRef) => memberRef.path == userRef.path);
  if (!teamDoc.exists()) {
    console.log(`${teamName} does not exist`);
    return false;
  } else if (memberExistsInTeam) {
    console.log(`${userName} is already in the team ${teamName}`);
    return false;
  } else if (teamDoc.exists() && !memberExistsInTeam) {
    const entryDeposit = teamDoc.data().entry_deposit;
    const currentSocialCredit = userDoc.data().social_credit;
    if (currentSocialCredit >= entryDeposit) {
      // TODO: Change to transfer function
      // await updateDoc(userRef, {
      //   team_refs: arrayUnion(doc(collection(db, "teams"), teamName)),
      //   social_credit: currentSocialCredit - entryDeposit,
      //   [`deposits.${teamName}`]: entryDeposit,
      //   [`team_points.${teamName}`]: 0,
      // });
      // await updateDoc(teamRef, {
      //   user_refs: arrayUnion(doc(collection(db, "users"), userName)),
      //   [`team_points.${userName}`]: 0,
      // });
      // await setTier(userName);

      // transaction
      runTransaction(db, async (transaction) => {
        await transaction.update(userRef, {
          team_refs: arrayUnion(doc(collection(db, "teams"), teamName)),
          social_credit: currentSocialCredit - entryDeposit,
          [`deposits.${teamName}`]: entryDeposit,
          [`team_points.${teamName}`]: 0,
        });
        await transaction.update(teamRef, {
          user_refs: arrayUnion(doc(collection(db, "users"), userName)),
          [`team_points.${userName}`]: 0,
        });
        await setTier(userName);
        const suc = await transferUserTeam(userName, teamName, entryDeposit);
        // If suc fail, revert transaction
        if (!suc) {
          throw new Error("fail to transfer");
        }
      });

      // await updateDoc(teamRef, {
      //   user_refs: arrayUnion(doc(collection(db, "users"), userName)),
      //   [`team_points.${userName}`]: 0,
      // });

      // await updateDoc(userRef, {
      //   team_refs: arrayUnion(doc(collection(db, "teams"), teamName)),
      //   // social_credit: currentSocialCredit - entryDeposit,
      //   [`deposits.${teamName}`]: entryDeposit,
      //   [`team_points.${teamName}`]: 0,
      // });

      // transfer entry deposit to team


      console.log(`${userName} becomes a member of team ${teamName}`);
      return true;
    } else {
      console.log(`${userName} has not enough social credit`);
      return false;
    }
  }
}


module.exports = {newTeam, joinTeam};
