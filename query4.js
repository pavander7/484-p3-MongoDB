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
    
    db.users.aggregate([
        // get male users
        { $match: { gender: "male" } },
        {
            $lookup: {
                from: "users",
                localField: "hometown.city",
                foreignField: "hometown.city",
                as: "possible_friends"
            }
        },
        // unwind
        { $unwind: "$possible_friends" },
        // filter females
        {
            $match: {
                "possible_friends.gender": "female",
                $expr: { $lt: [{ $abs: { $subtract: ["$YOB", "$possible_friends.YOB"] } }, year_diff] },
                $expr: { $not: { $in: ["$possible_friends.user_id", "$friends"] } }
            }
        },
        // project to desired format
        {
            $project: {
                _id: 0,
                pair: [
                    "$user_id", 
                    "$possible_friends.user_id"
                ]
            }
        },
        {
            $group: {
                _id: null,
                pairs: { $push: "$pair" }
            }
        }
    ]).forEach(function(doc) {
        pairs = doc.pairs;
    });

    
    return pairs;
}
