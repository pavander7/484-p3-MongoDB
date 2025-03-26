// Query 6
// Find the average friend count per user.
// Return a decimal value as the average user friend count of all users in the users collection.

function find_average_friendcount(dbname) {
    db = db.getSiblingDB(dbname);

    unwind_friends(dbname);

    let results = db.flat_users.aggregate([
        {
            $group: {
                _id: "$user_id",
                num_friends: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: null,
                totalFriends: { $sum: "$num_friends" },
                totalUsers: { $sum: 1 }
            }
        }
    ]);

    let avgFriends = 0

    if (results.length > 0) {
        avgFriends = results[0].totalFriends / results[0].totalUsers;
    }

    return avgFriends;
}
