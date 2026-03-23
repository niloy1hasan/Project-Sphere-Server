const pool = require('../../config/db');

exports.createUser = async ({ first_name, last_name, email }) => {
  const query = `
    INSERT INTO users (first_name, last_name, email)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [first_name, last_name, email];

  const result = await pool.query(query, values);
  return result.rows[0];
};


exports.getUsers = async() => {
    const query = `
    SELECT *
    FROM users
    ORDER BY id ASC;
    `;

    const result = await pool.query(query);
    return result.rows;
}

exports.checkUserExists = async(email) => {
  const query = `
  SELECT EXISTS (
      SELECT 1 FROM users WHERE email = $1
    ) AS user_exists;
  `;

  const result = await pool.query(query, [email]);
  return result.rows[0].user_exists;
}