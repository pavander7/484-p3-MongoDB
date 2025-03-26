// Query 5
// Find the oldest friend for each user who has a friend. For simplicity,
// use only year of birth to determine age, if there is a tie, use the
// one with smallest user_id. You may find query 2 and query 3 helpful.
// You can create selections if you want. Do not modify users collection.
// Return a javascript object : key is the user_id and the value is the oldest_friend id.
// You should return something like this (order does not matter):
// {user1:userx1, user2:userx2, user3:userx3,...}

function oldest_friend(dbname) {
    db = db.getSiblingDB(dbname);

    let results = {};

    unwind_friends(dbname);

    // First case: user_id is the smaller, friends is the larger
    let first_case = db.flat_users.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "friends",
                foreignField: "user_id",
                as: "friend_details"
            }
        },
        { $unwind: "$friend_details" },
        {
            $project: {
                user_id: "$user_id",
                friend_id: "$friend_details.user_id",
                year_of_birth: "$friend_details.YOB"
            }
        }
    ]);

    // Second case: friends is the smaller, user_id is the larger
    let second_case = db.flat_users.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "user_id",
                as: "friend_details"
            }
        },
        { $unwind: "$friend_details" },
        {
            $project: {
                user_id: "$friends",
                friend_id: "$friend_details.user_id",
                year_of_birth: "$friend_details.YOB"
            }
        }
    ]);

    let merged_results = {};

    // Process first case
    first_case.forEach(doc => {
        if (!merged_results[doc.user_id]) {
            merged_results[doc.user_id] = [];
        }
        merged_results[doc.user_id].push({ friend_id: doc.friend_id, YOB: doc.year_of_birth });
    });

    // Process second case
    second_case.forEach(doc => {
        if (!merged_results[doc.user_id]) {
            merged_results[doc.user_id] = [];
        }
        merged_results[doc.user_id].push({ friend_id: doc.friend_id, YOB: doc.year_of_birth });
    });

    // Sort and get the oldest friend for each user
    Object.keys(merged_results).forEach(user_id => {
        merged_results[user_id].sort((a, b) => a.YOB - b.YOB || a.friend_id - b.friend_id);
        results[user_id] = merged_results[user_id][0].friend_id; // Select the oldest friend
    });

    return results;
}
