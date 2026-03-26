const pool = require("../../config/db");

exports.getUserProfileByEmail = async (email) => {
  const query = `
    SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.photo_url,
    u.account_type,
    u.status,
    u.last_login,
    u.created_at,

    up.username,
    up.additional_name,
    up.mobile_number,
    up.age,
    up.gender,
    up.country,
    up.bio,
    up.top_skill,
    up.company_name,

    usl.github,
    usl.x_handle,
    usl.instagram,
    usl.facebook,
    usl.linkedin,
    usl.website,

    -- Skills array
    COALESCE(
        ARRAY_AGG(DISTINCT us.skill_name) FILTER (WHERE us.skill_name IS NOT NULL),
        '{}'
    ) AS skills,

    -- Address array (object format)
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'address_line', a.address_line,
                'city', a.city,
                'state', a.state,
                'postal_code', a.postal_code,
                'country', a.country
            )
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'
    ) AS addresses

FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN user_social_links usl ON u.id = usl.user_id
LEFT JOIN user_skills us ON u.id = us.user_id
LEFT JOIN addresses a ON u.id = a.user_id

WHERE u.email = $1

GROUP BY 
    u.id,
    up.id,
    usl.id;
  `;

  const result = await pool.query(query, [email]);
  return result.rows[0];
};

exports.getUserProfileByUsername = async (username) => {
  const query = `
    SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.photo_url,
        u.account_type,
        u.status,
        u.last_login,
        u.created_at,

        up.username,
        up.mobile_number,
        up.age,
        up.gender,
        up.country,
        up.bio,
        up.top_skill,
        up.company_name

    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE up.username = $1;
  `;

  const result = await pool.query(query, [username]);
  return result.rows[0];
};

exports.checkUsernameAvailable = async (username) => {
  const query = `
  SELECT EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE username = $1
  ) AS is_taken;
  `;

  const result = await pool.query(query, [username]);

  return !result.rows[0].is_taken;
};
