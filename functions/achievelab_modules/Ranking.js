/* eslint-disable require-jsdoc */
const {getFirestore} = require("firebase-admin/firestore");

const db = getFirestore();

// collection, getDocs, query, where, orderBy, limit


async function ranking(teamName) {
  try {
    // const usersCollectionRef = collection(db, "users");
    // const q = query(usersCollectionRef,
    //     where(`team_points.${teamName}`, ">", 0));
    // const querySnapshot = await getDocs(q);

    const querySnapshot = await db.collection("users")
        .where(`team_points.${teamName}`, ">", 0).get();

    const usersData = [];


    for (const userDoc of querySnapshot.docs) {
      const userData = userDoc.data();
      usersData.push({
        id: userDoc.id,
        team_points: userData.team_points &&
        userData.team_points[teamName] ? userData.team_points[teamName] : 0,
      });
    }

    const sortedUsers = usersData.sort((a, b) => b.team_points - a.team_points);
    return sortedUsers;
  } catch (error) {
    console.error("Error in rank function:", error);
    throw error; // Re-throw the error for handling in the calling code
  }
}

async function getTeamRanking(teamName) {
  try {
    // Query teams with the specified teamName
    // const q = query(teamsCollectionRef, orderBy("total_points", "desc"));
    // const querySnapshot = await getDocs(q);

    const querySnapshot =
      await db.collection("teams").orderBy("total_points", "desc").get();


    let ranking = 0;

    // Iterate through the query results to find the team's ranking
    for (const teamDoc of querySnapshot.docs) {
      ranking++;
      if (teamDoc.id == teamName) {
        return ranking; // Stop the iteration when the team is found
      }
    }
    return false;
  } catch (error) {
    console.error("Error in getTeamRanking function:", error);
    throw error;
  }
}

async function getTopNRanking() {
  try {
    // const teamsCollectionRef = collection(db, "teams");
    // Query teams with non-zero team_points, order by team_points
    // in descending order, and limit to the top N teams
    // const q = query(teamsCollectionRef, where("total_points", ">", 0)
    //     , orderBy("total_points", "desc"), limit(N));
    // const querySnapshot = await getDocs(q);

    // N = parseInt(N);

    // console.log(N);

    const querySnapshot = await db.collection("teams")
        .where("total_points", ">", 0)
        .orderBy("total_points", "desc")
        .get();

    const topNRanking = [];

    // Iterate through the query results to build the top N ranking
    for (const teamDoc of querySnapshot.docs) {
      const teamData = teamDoc.data();
      topNRanking.push({
        teamName: teamDoc.id,
        totalPoints: teamData.total_points,
      });
    }


    return topNRanking;
  } catch (error) {
    console.error("Error in getTopNRanking function:", error);
    throw error;
  }
}

module.exports = {ranking, getTeamRanking, getTopNRanking};
