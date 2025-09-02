const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * This function triggers whenever a new user is created in Firebase Authentication.
 * It reads the user's role from the Firestore 'users' collection and sets it
 * as a custom claim on the user's auth token.
 */
exports.addRoleToNewUser = functions.auth.user().onCreate(async (user) => {
  try {
    // Look up the user's document in the 'users' collection using their UID
    const userDoc = await admin.firestore().collection("users").doc(user.uid).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      const role = userData.role; // e.g., 'admin', 'developer', 'tester'

      if (role) {
        // Set the custom claim 'role' on the user's token
        await admin.auth().setCustomUserClaims(user.uid, { role: role });
        console.log(`Custom claim set for ${user.email}: { role: '${role}' }`);
        return {
          message: `Success! Custom claim '${role}' set for user ${user.email}.`,
        };
      } else {
        // If the user doc exists but has no role, default to 'tester'
        await admin.auth().setCustomUserClaims(user.uid, { role: "tester" });
        return { message: "User document found but no role specified. Defaulted to 'tester'." };
      }
    } else {
      // If no user document is found, default to 'tester' for security
      console.log(`No user document found for ${user.email}. Defaulting role to 'tester'.`);
      await admin.auth().setCustomUserClaims(user.uid, { role: "tester" });
      return { message: "No user document found. Defaulted to 'tester'." };
    }
  } catch (error) {
    console.error("Error setting custom claim:", error);
    return { error: "Failed to set custom claim." };
  }
});