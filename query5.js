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
            $group: {
                _id: "user_id",
                friends: { $push: "$friends" }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "friends",
                foreignField: "user_id",
                as: "friend_details",
            }
        },
        {
            $project: {
                _id: 0,
                user_id: "$_id",
                friends: {
                    $map: {
                        input: "$friend_details",
                        as: "friend",
                        in: { 
                            user_id: "$$friend.user_id",
                            year_of_birth: "$$friend.YOB"
                        }
                    }
                }
            }
        },
        {
            $project: {
                user_id: 1,
                oldest_friend: {
                    $arrayElemAt: [
                        { 
                            $sortArray: {
                                input: "$friends", 
                                sortBy: { year_of_birth: -1, user_id: 1 }
                            }
                        }, 0
                    ]
                }
            }
        },
        {
            $project: {
                _id: 0,
                user_id: 1,
                oldest_friend_id: "$oldest_friend.user_id"
            }
        }
    ]).forEach(function(doc) {
        results[doc.user_id] = doc.oldest_friend_id;
    });

    return results;
}
