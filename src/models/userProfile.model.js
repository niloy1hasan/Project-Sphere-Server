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

exports.setupProfile = async (data, email) => {
  const query = `
    WITH user_row AS (
      SELECT id FROM users WHERE email = $1
    ),
    update_user AS (
      UPDATE users
      SET photo_url = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE email = $1
      RETURNING id
    )
    INSERT INTO user_profiles (user_id, username, top_skill)
    SELECT id, $3, $4 FROM user_row
    ON CONFLICT (user_id)
    DO UPDATE SET
      username = EXCLUDED.username,
      top_skill = EXCLUDED.top_skill
    RETURNING id, username, top_skill;
  `;

  try {
    const result = await pool.query(query, [
      email,        
      data.photo_url,
      data.username,
      data.top_skill
    ]);

    if (result.rows.length === 0) {
      throw new Error("User not found or insert failed");
    }

    return result.rows[0];

  } catch (err) {
    throw err;
  }
};

exports.setUserProfileByQuery = async () => {

};

exports.completeOnboarding = async (email) => {
  const query = `
    UPDATE users
    SET onboarding_completed = TRUE
    WHERE email = $1
    RETURNING id, email, onboarding_completed
  `;

  const result = await pool.query(query, [email]);

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  return result.rows[0];
};

exports.checkOnboarding = async (email) => {

  const getUserQuery = `
    SELECT id, onboarding_completed, photo_url
    FROM users
    WHERE email = $1
  `;

  const getProfileQuery = `
    SELECT username, top_skill
    FROM user_profiles
    WHERE user_id = $1
  `;

  const updateOnboardingQuery = `
    UPDATE users
    SET onboarding_completed = TRUE
    WHERE id = $1
  `;

  const userRes = await pool.query(getUserQuery, [email]);
  console.log(userRes)
  if (userRes.rows.length === 0) {
    throw new Error('User not found');
  }

  const { id: user_id, onboarding_completed, photo_url } = userRes.rows[0];

  if (onboarding_completed) {
    return false;
  }

  const profileRes = await pool.query(getProfileQuery, [user_id]);
  const profile = profileRes.rows[0];

  if (profile && profile.username && profile.top_skill && photo_url) {
    await pool.query(updateOnboardingQuery, [user_id]);
    return false;
  }

  return true;
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

exports.updateMobileNumberByUsername = async (username, mobile_number) => {
  const query = `
    UPDATE user_profiles
    SET mobile_number = $1
    WHERE username = $2
    RETURNING *;
  `;

  const values = [mobile_number, username];

  const result = await pool.query(query, values);
  return result.rows[0];
};

exports.updateBioByUsername = async (username, bio) => {
  const query = `
    UPDATE user_profiles
    SET bio = $1
    WHERE username = $2
    RETURNING *;
  `;

  const values = [bio, username];

  const result = await pool.query(query, values);
  return result.rows[0];
};

