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
    
    db.flat_users.aggregate([
        {
            $facet: {
                // Case 1: user_id is the smaller, friends is the larger
                first_case: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "friends",
                            foreignField: "user_id",
                            as: "friend_details",
                        }
                    },
                    { $unwind: "$friend_details" },
                    {
                        $project: {
                            user_id: 1,
                            friend_id: "$friend_details.user_id",
                            year_of_birth: "$friend_details.YOB"
                        }
                    },
                    {
                        $sort: { year_of_birth: 1, friend_id: 1 }
                    },
                    {
                        $group: {
                            _id: "$user_id",
                            oldest_friend: { $first: "$friend_id" }
                        }
                    }
                ],
                // Case 2: friends is the smaller, user_id is the larger
                second_case: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "user_id",
                            foreignField: "user_id",
                            as: "friend_details",
                        }
                    },
                    { $unwind: "$friend_details" },
                    {
                        $project: {
                            user_id: "$friends",  // friends is now the user_id
                            friend_id: "$friend_details.user_id",
                            year_of_birth: "$friend_details.YOB"
                        }
                    },
                    {
                        $sort: { year_of_birth: 1, friend_id: 1 }
                    },
                    {
                        $group: {
                            _id: "$user_id",
                            oldest_friend: { $first: "$friend_id" }
                        }
                    }
                ]
            }
        },
        {
            $project: {
                // Combine both cases
                combined_results: { $concatArrays: ["$first_case", "$second_case"] }
            }
        },
        {
            $unwind: "$combined_results"  // Unwind the combined results to have each user in one document
        },
        {
            $project: {
                _id: 0,
                user_id: "$combined_results._id",
                oldest_friend_id: "$combined_results.oldest_friend"
            }
        }
    ]).forEach(function(doc) {
        results[doc.user_id] = doc.oldest_friend_id;
    });

    return results;
}
