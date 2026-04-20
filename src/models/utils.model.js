const pool = require('../../config/db');

exports.getUserIdByUsername = async (username) => {
  const query = `
    SELECT u.id 
    FROM users u
    JOIN user_profiles up ON u.id = up.user_id
    WHERE up.username = $1
  `;
  const result = await pool.query(query, [username]);
  return result.rows[0]?.id;
};