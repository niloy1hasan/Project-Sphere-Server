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


// ==================== SOCIAL LINKS ====================
exports.updateSocialLinks = async (userId, socialData) => {
  const { github, x_handle, instagram, facebook, linkedin, website } = socialData;
  
  const query = `
    INSERT INTO user_social_links (user_id, github, x_handle, instagram, facebook, linkedin, website, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      github = EXCLUDED.github,
      x_handle = EXCLUDED.x_handle,
      instagram = EXCLUDED.instagram,
      facebook = EXCLUDED.facebook,
      linkedin = EXCLUDED.linkedin,
      website = EXCLUDED.website,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  
  const values = [userId, github, x_handle, instagram, facebook, linkedin, website];
  const result = await pool.query(query, values);
  return result.rows[0];
};

exports.getSocialLinks = async (userId) => {
  const query = `SELECT * FROM user_social_links WHERE user_id = $1`;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};



// 

// // ==================== ADDRESSES ====================
// exports.addAddress = async (userId, addressData) => {
//   const { address_line, city, state, postal_code, country } = addressData;
  
//   const query = `
//     INSERT INTO addresses (user_id, address_line, city, state, postal_code, country)
//     VALUES ($1, $2, $3, $4, $5, $6)
//     RETURNING *;
//   `;
  
//   const values = [userId, address_line, city, state, postal_code, country];
//   const result = await pool.query(query, values);
//   return result.rows[0];
// };

// exports.updateAddress = async (addressId, userId, addressData) => {
//   const { address_line, city, state, postal_code, country } = addressData;
  
//   const query = `
//     UPDATE addresses 
//     SET address_line = COALESCE($1, address_line),
//         city = COALESCE($2, city),
//         state = COALESCE($3, state),
//         postal_code = COALESCE($4, postal_code),
//         country = COALESCE($5, country)
//     WHERE id = $6 AND user_id = $7
//     RETURNING *;
//   `;
  
//   const values = [address_line, city, state, postal_code, country, addressId, userId];
//   const result = await pool.query(query, values);
//   return result.rows[0];
// };

// exports.deleteAddress = async (addressId, userId) => {
//   const query = `DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id`;
//   const result = await pool.query(query, [addressId, userId]);
//   return result.rows[0];
// };

// exports.getAddresses = async (userId) => {
//   const query = `SELECT * FROM addresses WHERE user_id = $1 ORDER BY id ASC`;
//   const result = await pool.query(query, [userId]);
//   return result.rows;
// };

// // ==================== ADDITIONAL INFO ====================
exports.updateAdditionalInfo = async (userId, infoData) => {
  const { additional_name, age, gender, country, company_name } = infoData;
  
  const query = `
    UPDATE user_profiles 
    SET additional_name = COALESCE($1, additional_name),
        age = COALESCE($2, age),
        gender = COALESCE($3, gender),
        country = COALESCE($4, country),
        company_name = COALESCE($5, company_name)
    WHERE user_id = $6
    RETURNING *;
  `;
  
  const values = [additional_name, age, gender, country, company_name, userId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

exports.getAdditionalInfo = async (userId) => {
  const query = `
    SELECT additional_name, age, gender, country, company_name 
    FROM user_profiles 
    WHERE user_id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// // ==================== SKILLS ====================
// exports.addSkill = async (userId, skillName) => {
//   const query = `
//     INSERT INTO user_skills (user_id, skill_name)
//     VALUES ($1, $2)
//     ON CONFLICT (user_id, skill_name) DO NOTHING
//     RETURNING *;
//   `;
  
//   const result = await pool.query(query, [userId, skillName]);
//   return result.rows[0];
// };

// exports.addMultipleSkills = async (userId, skills) => {
//   if (!skills || skills.length === 0) return [];
  
//   const values = [];
//   const placeholders = skills.map((skill, i) => {
//     values.push(userId, skill);
//     return `($${i * 2 + 1}, $${i * 2 + 2})`;
//   }).join(',');
  
//   const query = `
//     INSERT INTO user_skills (user_id, skill_name)
//     VALUES ${placeholders}
//     ON CONFLICT (user_id, skill_name) DO NOTHING
//     RETURNING *;
//   `;
  
//   const result = await pool.query(query, values);
//   return result.rows;
// };

// exports.deleteSkill = async (userId, skillName) => {
//   const query = `DELETE FROM user_skills WHERE user_id = $1 AND skill_name = $2 RETURNING id`;
//   const result = await pool.query(query, [userId, skillName]);
//   return result.rows[0];
// };

// exports.getSkills = async (userId) => {
//   const query = `SELECT skill_name FROM user_skills WHERE user_id = $1 ORDER BY created_at ASC`;
//   const result = await pool.query(query, [userId]);
//   return result.rows.map(row => row.skill_name);
// };

// exports.replaceSkills = async (userId, skills) => {
//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');
//     await client.query('DELETE FROM user_skills WHERE user_id = $1', [userId]);
    
//     if (skills && skills.length > 0) {
//       const values = [];
//       const placeholders = skills.map((skill, i) => {
//         values.push(userId, skill);
//         return `($${i * 2 + 1}, $${i * 2 + 2})`;
//       }).join(',');
      
//       await client.query(
//         `INSERT INTO user_skills (user_id, skill_name) VALUES ${placeholders}`,
//         values
//       );
//     }
    
//     await client.query('COMMIT');
//     return skills;
//   } catch (error) {
//     await client.query('ROLLBACK');
//     throw error;
//   } finally {
//     client.release();
//   }
// };

// // ==================== WORKS ====================
// exports.addWork = async (userId, workData) => {
//   const { title, company, description, start_date, end_date, is_current, work_url } = workData;
  
//   const query = `
//     INSERT INTO user_works (user_id, title, company, description, start_date, end_date, is_current, work_url)
//     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//     RETURNING *;
//   `;
  
//   const values = [userId, title, company, description, start_date, end_date, is_current || false, work_url];
//   const result = await pool.query(query, values);
//   return result.rows[0];
// };

// exports.updateWork = async (workId, userId, workData) => {
//   const { title, company, description, start_date, end_date, is_current, work_url } = workData;
  
//   const query = `
//     UPDATE user_works 
//     SET title = COALESCE($1, title),
//         company = COALESCE($2, company),
//         description = COALESCE($3, description),
//         start_date = COALESCE($4, start_date),
//         end_date = COALESCE($5, end_date),
//         is_current = COALESCE($6, is_current),
//         work_url = COALESCE($7, work_url),
//         updated_at = CURRENT_TIMESTAMP
//     WHERE id = $8 AND user_id = $9
//     RETURNING *;
//   `;
  
//   const values = [title, company, description, start_date, end_date, is_current, work_url, workId, userId];
//   const result = await pool.query(query, values);
//   return result.rows[0];
// };

// exports.deleteWork = async (workId, userId) => {
//   const query = `DELETE FROM user_works WHERE id = $1 AND user_id = $2 RETURNING id`;
//   const result = await pool.query(query, [workId, userId]);
//   return result.rows[0];
// };

// exports.getWorks = async (userId) => {
//   const query = `SELECT * FROM user_works WHERE user_id = $1 ORDER BY start_date DESC NULLS LAST, created_at DESC`;
//   const result = await pool.query(query, [userId]);
//   return result.rows;
// };

// // Helper to get user ID by username (internal use)
// exports.getUserIdByUsername = getUserIdByUsername;