const pool = require("../../config/db");
const { formatTime } = require("../utils/formatTime");

exports.searchUsers = async (keyword, currentUserId) => {
  const query = `
    SELECT 
      u.id,
      CONCAT(u.first_name, ' ', u.last_name) AS name,
      u.photo_url AS avatar,
      u.email,
      up.username,
      up.top_skill,
      up.country AS location,

      -- connection state
      CASE
        WHEN ub.blocker_id IS NOT NULL THEN 'blocked'

        WHEN uc.status = 'accepted' THEN 'connected'

        WHEN uc.status = 'pending' AND uc.sender_id = $2 THEN 'sent'

        WHEN uc.status = 'pending' AND uc.receiver_id = $2 THEN 'received'

        ELSE 'none'
      END AS connection_state

    FROM users u
    JOIN user_profiles up ON up.user_id = u.id

    -- connection relation (both directions)
    LEFT JOIN user_connections uc
      ON (
        (uc.sender_id = $2 AND uc.receiver_id = u.id)
        OR
        (uc.sender_id = u.id AND uc.receiver_id = $2)
      )

    -- block relation
    LEFT JOIN user_blocks ub
      ON (
        (ub.blocker_id = $2 AND ub.blocked_id = u.id)
        OR
        (ub.blocker_id = u.id AND ub.blocked_id = $2)
      )

    WHERE 
      (up.username ILIKE $1 OR u.email ILIKE $1)
      AND u.id != $2

    LIMIT 20;
  `;

  const values = [`%${keyword}%`, currentUserId];

  const result = await pool.query(query, values);
  return result.rows;
};

exports.sendConnectionRequest = async (senderId, receiverId) => {
  if (senderId === receiverId) {
    throw new Error("You cannot send request to yourself");
  }

  const checkQuery = `
    SELECT * FROM user_connections
    WHERE 
      (sender_id = $1 AND receiver_id = $2)
      OR
      (sender_id = $2 AND receiver_id = $1)
  `;

  const existing = await pool.query(checkQuery, [senderId, receiverId]);

  if (existing.rows.length > 0) {
    throw new Error("Connection already exists or pending");
  }

  const insertQuery = `
    INSERT INTO user_connections (sender_id, receiver_id)
    VALUES ($1, $2)
    RETURNING *;
  `;

  const result = await pool.query(insertQuery, [senderId, receiverId]);

  return result.rows[0];
};

exports.cancelConnectionRequest = async (senderId, receiverId) => {
  const query = `
    DELETE FROM user_connections
    WHERE sender_id = $1
    AND receiver_id = $2
    AND status = 'pending'
    RETURNING *;
  `;

  const result = await pool.query(query, [senderId, receiverId]);

  if (result.rows.length === 0) {
    throw new Error("No pending request found");
  }

  return result.rows[0];
};

exports.removeConnection = async (userId1, userId2) => {
  const query = `
    DELETE FROM user_connections
    WHERE 
      (
        sender_id = $1 AND receiver_id = $2
      )
      OR
      (
        sender_id = $2 AND receiver_id = $1
      )
    AND status = 'accepted'
    RETURNING *;
  `;

  const result = await pool.query(query, [userId1, userId2]);

  if (result.rows.length === 0) {
    throw new Error("No active connection found");
  }

  return result.rows[0];
};

exports.acceptConnection = async (receiverId, senderId) => {
  const query = `
    UPDATE user_connections
    SET status = 'accepted',
        updated_at = NOW()
    WHERE receiver_id = $1
    AND sender_id = $2
    AND status = 'pending'
    RETURNING *;
  `;

  const result = await pool.query(query, [receiverId, senderId]);

  if (result.rows.length === 0) {
    throw new Error("No pending request found");
  }

  return result.rows[0];
};

exports.rejectConnection = async (receiverId, senderId) => {
  const query = `
    DELETE FROM user_connections
    WHERE receiver_id = $1
    AND sender_id = $2
    AND status = 'pending'
    RETURNING *;
  `;

  const result = await pool.query(query, [receiverId, senderId]);

  if (result.rows.length === 0) {
    throw new Error("No pending request found");
  }

  return result.rows[0];
};

exports.blockUser = async (blockerId, blockedId) => {
  const blockQuery = `
    INSERT INTO user_blocks (blocker_id, blocked_id)
    VALUES ($1, $2)
    ON CONFLICT (blocker_id, blocked_id) DO NOTHING
    RETURNING *;
  `;

  await pool.query(blockQuery, [blockerId, blockedId]);

  const deleteConn = `
    DELETE FROM user_connections
    WHERE 
      (sender_id = $1 AND receiver_id = $2)
      OR
      (sender_id = $2 AND receiver_id = $1);
  `;

  await pool.query(deleteConn, [blockerId, blockedId]);

  return { message: "User blocked successfully" };
};

exports.getAllRequests = async (userId) => {
  const query = `
    SELECT 
      uc.id,
      uc.sender_id,
      u.first_name,
      u.last_name,
      u.photo_url AS avatar,
      up.top_skill,
      up.username,
      up.country AS location,
      uc.created_at
    FROM user_connections uc
    JOIN users u ON u.id = uc.sender_id
    JOIN user_profiles up ON up.user_id = u.id
    WHERE 
      uc.receiver_id = $1
      AND uc.status = 'pending'
    ORDER BY uc.created_at DESC;
  `;

  const result = await pool.query(query, [userId]);

  return result.rows.map((row) => ({
    id: row.id,
    sender_id: row.sender_id,
    name: `${row.first_name} ${row.last_name}`.trim(),
    role: row.top_skill,
    username: row.username,
    location: row.location,
    mutual: 0,
    time: formatTime(row.created_at),
    status: "offline",
    avatar: row.avatar,
  }));
};

exports.getAllConnections = async (userId) => {
  const query = `
    SELECT 
  uc.id AS connection_id,
  
  u.id AS user_id,
  
  -- name
  CONCAT(u.first_name, ' ', u.last_name) AS name,

  -- avatar
  u.photo_url AS avatar,

  -- email (optional keep/remove)
  u.email,

  -- profile fields
  up.username,
  up.country AS location,
  up.top_skill AS designation,
  up.bio,

  -- extra fields (default values or placeholders)
  0 AS mutual,

  -- online status (placeholder for now)
  FALSE AS online,

  uc.created_at

FROM user_connections uc
JOIN users u 
  ON (u.id = uc.sender_id OR u.id = uc.receiver_id)
JOIN user_profiles up 
  ON up.user_id = u.id

WHERE 
  uc.status = 'accepted'
  AND (uc.sender_id = $1 OR uc.receiver_id = $1)
  AND u.id != $1

ORDER BY uc.created_at DESC;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

