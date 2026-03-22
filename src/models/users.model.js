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
    return result.rows[0];
}