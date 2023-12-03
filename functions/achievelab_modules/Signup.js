/* eslint-disable require-jsdoc */
// const {getAuth} = require("firebase-admin/auth");


const {getFirestore} = require("firebase-admin/firestore");
const {getAuth, signInWithEmailAndPassword} = require("firebase-admin/auth");


async function handleSignUp(email, password, name) {
  getAuth()
      .createUser({
        email: email,
        emailVerified: false,
        password: password,
        displayName: name,
        disabled: false,
      })
      .then((userRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
        console.log("Successfully created new user:", userRecord.uid);

        getFirestore().collection("users").doc(name).set({
          name: name,
          social_credit: 100,
          team_refs: [],
          deposits: {},
          team_points: {},
          tier: "Bronze",
          progress: {},
        })
            .then(() => {
              console.log(`new user ${name} is written`);
            })
            .catch(() => {
              console.error("Error adding document");
            });
      })
      .catch((error) => {
        console.log("Error creating new user:", error);
      });
}

// Sign in function
async function handleSignIn(email, password) {
  try {
    const userCredential =
      await signInWithEmailAndPassword(getAuth(), email, password);
    // Signed in
    const user = userCredential.user;
    console.log("User signed in:", user);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Error signing in:", errorCode, errorMessage);
  }
}

/** Version 2 */


module.exports = {handleSignUp, handleSignIn};
