// Query 4
// Find user pairs (A,B) that meet the following constraints:
// i) user A is male and user B is female
// ii) their Year_Of_Birth difference is less than year_diff
// iii) user A and B are not friends
// iv) user A and B are from the same hometown city
// The following is the schema for output pairs:
// [
//      [user_id1, user_id2],
//      [user_id1, user_id3],
//      [user_id4, user_id2],
//      ...
//  ]
// user_id is the field from the users collection. Do not use the _id field in users.
// Return an array of arrays.

function suggest_friends(year_diff, dbname) {
    db = db.getSiblingDB(dbname);

    let pairs = [];

    // Fetch all users and store them in an array for iteration
    let users = db.users.find().toArray();

    users.forEach(userA => {
        if (userA.gender !== "male") return; // Ensure user A is male

        users.forEach(userB => {
            if (userB.gender !== "female") return; // Ensure user B is female
            if (userA.hometown.city !== userB.hometown.city) return; // Same city
            if (Math.abs(userA.YOB - userB.YOB) >= year_diff) return; // Check YOB difference
            if (userA.friends.indexOf(userB.user_id) !== -1) return; // Ensure they are not friends
            if (userB.friends.indexOf(userA.user_id) !== -1) return; // Check both directions
            
            // Add pair to pairs
            pairs.push([userA.user_id, userB.user_id]);
        });
    });

    return pairs;
}
