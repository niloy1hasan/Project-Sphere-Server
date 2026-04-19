const pool = require("../../config/db");

exports.searchUsers = async (keyword) => {
  const query = `
    SELECT 
      u.id,
      u.first_name,
      u.last_name,
      u.email,
      up.username,
      up.top_skill,
      up.photo_url AS avatar,
      up.country AS location
    FROM users u
    JOIN user_profiles up ON up.user_id = u.id
    WHERE 
      up.username ILIKE $1
      OR u.email ILIKE $1
    LIMIT 20;
  `;

  const values = [`%${keyword}%`];

  const result = await pool.query(query, values);
  return result.rows;
};