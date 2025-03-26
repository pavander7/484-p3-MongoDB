// Query 6
// Find the average friend count per user.
// Return a decimal value as the average user friend count of all users in the users collection.

function find_average_friendcount(dbname) {
    db = db.getSiblingDB(dbname);

    unwind_friends(dbname);

    let results = db.flat_users.aggregate([
        {
            $group: {
                _id: "$user_id",  // Group by user_id
                num_friends: { $sum: 1 }  // Count each appearance of the user as a friend
            }
        },
        {
            $group: {
                _id: null,  // No grouping for overall stats
                totalFriends: { $sum: "$num_friends" },  // Total number of friends for all users
            }
        }
    ]).toArray();  // Make sure to convert the aggregation result to an array

    let totalUsers = db.users.count();  // Count all users in the users collection
    let avgFriends = 0;

    if (results.length > 0) {
        avgFriends = results[0].totalFriends / totalUsers;
    }

    return avgFriends;
}
