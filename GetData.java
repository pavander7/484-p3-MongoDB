import java.io.FileWriter;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.TreeSet;
import java.util.Vector;

import org.json.JSONObject;
import org.json.JSONArray;

public class GetData {

    static String prefix = "project3.";

    // You must use the following variable as the JDBC connection
    Connection oracleConnection = null;

    // You must refer to the following variables for the corresponding 
    // tables in your database
    String userTableName = null;
    String friendsTableName = null;
    String cityTableName = null;
    String currentCityTableName = null;
    String hometownCityTableName = null;

    // DO NOT modify this constructor
    public GetData(String u, Connection c) {
        super();
        String dataType = u;
        oracleConnection = c;
        userTableName = prefix + dataType + "_USERS";
        friendsTableName = prefix + dataType + "_FRIENDS";
        cityTableName = prefix + dataType + "_CITIES";
        currentCityTableName = prefix + dataType + "_USER_CURRENT_CITIES";
        hometownCityTableName = prefix + dataType + "_USER_HOMETOWN_CITIES";
    }

    // TODO: Implement this function
    @SuppressWarnings("unchecked")
    public JSONArray toJSON() throws SQLException {

        // This is the data structure to store all users' information
        JSONArray users_info = new JSONArray();
        
        try (Statement stmt = oracleConnection.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
             Statement stmt2 = oracleConnection.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);) {
            // Your implementation goes here....
            ResultSet rst = stmt.executeQuery(
                    "SELECT user_id, first_name, last_name, gender, year_of_birth, month_of_birth, day_of_birth " + 
                    "FROM " + userTableName);
                
            while(rst.next()) {
                int curr_user_id = rst.getInt(1);
                // create the final JSON object for each user
                JSONObject userEntry = new JSONObject();
                userEntry.put("user_id", curr_user_id);

                // load user table info
                userEntry.put("first_name", rst.getString(2));
                userEntry.put("last_name", rst.getString(3));
                userEntry.put("gender", rst.getString(4));
                userEntry.put("YOD", rst.getInt(5));
                userEntry.put("MOD", rst.getInt(6));
                userEntry.put("DOB", rst.getInt(7));

                // load friends table info
                ResultSet rst_friends = stmt2.executeQuery(
                        "SELECT user2_id " + 
                        "FROM " + friendsTableName + " " + 
                        "WHERE user1_id = " + curr_user_id);

                JSONArray friendsArray = new JSONArray();
                while(rst_friends.next()) {
                    friendsArray.put(rst_friends.getInt(1));
                }
                userEntry.put("friends", friendsArray);

                // load current_city table info
                ResultSet rst_current = stmt2.executeQuery(
                        "SELECT city_name, state_name, country_name " +
                        "FROM " + currentCityTableName + " curr " + 
                        "JOIN " + cityTableName + " c " + 
                            "ON curr.current_city_id = c.city_id " + 
                        "WHERE curr.user_id = " + curr_user_id);

                JSONObject currentCity = new JSONObject();
                while(rst_current.next()) {
                    currentCity.put("city", rst_current.getString(1));
                    currentCity.put("state", rst_current.getString(2));
                    currentCity.put("country", rst_current.getString(3));
                }
                userEntry.put("current", currentCity);

                // load hometown table info
                ResultSet rst_hometown = stmt2.executeQuery(
                        "SELECT city_name, state_name, country_name " +
                        "FROM " + hometownCityTableName + " home " + 
                        "JOIN " + cityTableName + " c " + 
                            "ON home.hometown_city_id = c.city_id " + 
                        "WHERE home.user_id = " + curr_user_id);

                JSONObject hometownCity = new JSONObject();
                while(rst_hometown.next()) {
                    hometownCity.put("city", rst_hometown.getString(1));
                    hometownCity.put("state", rst_hometown.getString(2));
                    hometownCity.put("country", rst_hometown.getString(3));
                }
                userEntry.put("hometown", hometownCity);

                // add userEntry to the final JSONArray users_info
                users_info.put(userEntry);
            }
            stmt.close();
        } catch (SQLException e) {
            System.err.println(e.getMessage());
        }

        return users_info;
    }

    // This outputs to a file "output.json"
    // DO NOT MODIFY this function
    public void writeJSON(JSONArray users_info) {
        try {
            FileWriter file = new FileWriter(System.getProperty("user.dir") + "/output.json");
            file.write(users_info.toString());
            file.flush();
            file.close();

        } catch (IOException e) {
            e.printStackTrace();
        }

    }
}
