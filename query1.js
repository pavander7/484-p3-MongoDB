// Query 1
// Find users who live in city "city".
// Return an array of user_ids. The order does not matter.

function find_user(city, dbname) {
    db = db.getSiblingDB(dbname);

    let results = db.users.find(
        { "hometown.city": city },  // Filter users by city
        { _id: 0, "user_id": 1 }   // Return only user_id, exclude _id
    ).map(user => user.user_id);  // Extract user_id values into an array

    // See test.js for a partial correctness check.

    return results;
}
