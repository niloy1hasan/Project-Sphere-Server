const pool = require("../../config/db");
const { roleMap } = require("../utils/RoleMap");

exports.getProjectsByUserId = async (userId) => {
  const query = `
    SELECT 
      id,
      name,
      slug,
      description,
      logo_url,
      privacy,
      status,
      sdlc_model,
      creator_id,
      owner_id,
      created_at,
      updated_at
    FROM projects
    WHERE owner_id = $1 OR creator_id = $1
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

exports.createProject = async (projectData) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      name,
      slug,
      description,
      logo_url,
      privacy,
      status,
      sdlc_model,
      creator_id,
      owner_id,
      tags = [],
      members = []
    } = projectData;

    const projectResult = await client.query(
      `INSERT INTO projects 
      (name, slug, description, logo_url, privacy, status, sdlc_model, creator_id, owner_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;`,
      [name, slug, description, logo_url, privacy, status, sdlc_model, creator_id, owner_id]
    );

    const project = projectResult.rows[0];
    const projectId = project.id;

    const cleanTags = (tags || [])
      .map(t => t?.trim())
      .filter(t => t && t.length > 0);

    for (const tag of cleanTags) {
      await client.query(
        `INSERT INTO project_tags (project_id, tag, created_at)
         VALUES ($1, $2, NOW())`,
        [projectId, tag]
      );
    }

    await client.query(
      `INSERT INTO project_members 
      (project_id, user_id, role, status, invited_by, joined_at, updated_at)
      VALUES ($1,$2,'owner','active',$2,NOW(),NOW())`,
      [projectId, creator_id]
    );

    for (const member of members) {
      if (!member.user_id) continue;

      const userCheck = await client.query(
        `SELECT id FROM users WHERE id = $1`,
        [member.user_id]
      );

      if (userCheck.rows.length === 0) continue;

      const normalizedRole =
        roleMap[member.role];

      await client.query(
        `INSERT INTO project_invitations
        (project_id, invited_by, invitee_id, role, status, created_at, updated_at)
        VALUES ($1,$2,$3,$4,'pending',NOW(),NOW())`,
        [projectId, creator_id, member.user_id, normalizedRole]
      );
    }

    await client.query("COMMIT");

    project.tags = cleanTags;
    project.invited_members = members;

    return project;

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.getProjectBySlug = async (slug) => {
  const query = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.description,
      p.logo_url,
      p.privacy,
      p.status,
      p.sdlc_model,
      p.creator_id,
      p.owner_id,
      p.created_at,
      p.updated_at,

      -- optional: creator info
      u1.first_name || ' ' || u1.last_name AS creator_name,

      -- optional: owner info
      u2.first_name || ' ' || u2.last_name AS owner_name

    FROM projects p
    LEFT JOIN users u1 ON u1.id = p.creator_id
    LEFT JOIN users u2 ON u2.id = p.owner_id
    WHERE p.slug = $1
    LIMIT 1;
  `;

  const result = await pool.query(query, [slug]);
  return result.rows[0];
};


// /**
//  * Insert multiple tags for a project (bulk insert).
//  */
// async function insertTags(client, projectId, tags) {
//   if (!tags || tags.length === 0) return [];
//   const values  = tags.map((tag, i) => `($1, $${i + 2})`).join(', ');
//   const params  = [projectId, ...tags];
//   const { rows } = await client.query(
//     `INSERT INTO project_tags (project_id, tag) VALUES ${values}
//      ON CONFLICT (project_id, tag) DO NOTHING
//      RETURNING *`,
//     params
//   );
//   return rows;
// }

// /**
//  * Insert a project_members row (creator gets added automatically).
//  */
// async function addMember(client, { projectId, userId, role, invitedBy, status = 'active' }) {
//   const { rows } = await client.query(
//     `INSERT INTO project_members (project_id, user_id, role, invited_by, status)
//      VALUES ($1, $2, $3, $4, $5)
//      ON CONFLICT (project_id, user_id) DO NOTHING
//      RETURNING *`,
//     [projectId, userId, role, invitedBy || null, status]
//   );
//   return rows[0];
// }

exports.getProjectById = async (projectId) => {
  const query = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.description,
      p.logo_url,
      p.privacy,
      p.status,
      p.sdlc_model,
      p.creator_id,
      p.owner_id,
      p.created_at,
      p.updated_at,

      -- creator info
      u1.first_name || ' ' || u1.last_name AS creator_name,

      -- owner info
      u2.first_name || ' ' || u2.last_name AS owner_name

    FROM projects p
    LEFT JOIN users u1 ON u1.id = p.creator_id
    LEFT JOIN users u2 ON u2.id = p.owner_id
    WHERE p.id = $1
    LIMIT 1;
  `;

  const result = await pool.query(query, [projectId]);
  return result.rows[0];
};

// /**
//  * Project tags as a plain string array.
//  */
// async function findTagsByProject(projectId) {
//   const { rows } = await pool.query(
//     `SELECT tag FROM project_tags WHERE project_id = $1 ORDER BY created_at`,
//     [projectId]
//   );
//   return rows.map(r => r.tag);
// }

// /**
//  * Members with user details.
//  */
// async function findMembersByProject(projectId) {
//   const { rows } = await pool.query(
//     `SELECT
//        pm.id,
//        pm.role,
//        pm.status,
//        pm.joined_at,
//        u.id          AS user_id,
//        u.username,
//        u.email,
//        u.display_name,
//        u.avatar_url
//      FROM project_members pm
//      JOIN users u ON u.id = pm.user_id
//      WHERE pm.project_id = $1
//        AND pm.status != 'removed'
//      ORDER BY pm.joined_at`,
//     [projectId]
//   );
//   return rows;
// }

// /**
//  * Paginated list of projects visible to a user (public + their own).
//  */
// async function listProjects({ userId, page = 1, limit = 20, search, status, privacy }) {
//   const offset = (page - 1) * limit;
//   const conditions = [
//     `(p.privacy = 'public' OR p.creator_id = $1 OR p.owner_id = $1
//       OR EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = $1 AND pm.status = 'active'))`,
//   ];
//   const params = [userId];
//   let   idx    = 2;

//   if (search) {
//     conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx})`);
//     params.push(`%${search}%`);
//     idx++;
//   }
//   if (status) {
//     conditions.push(`p.status = $${idx}`);
//     params.push(status);
//     idx++;
//   }
//   if (privacy) {
//     conditions.push(`p.privacy = $${idx}`);
//     params.push(privacy);
//     idx++;
//   }

//   const where = conditions.join(' AND ');

//   const { rows: countRows } = await pool.query(
//     `SELECT COUNT(*) FROM projects p WHERE ${where}`,
//     params
//   );
//   const total = parseInt(countRows[0].count);

//   params.push(limit, offset);
//   const { rows } = await pool.query(
//     `SELECT
//        p.id, p.name, p.slug, p.description, p.logo_url,
//        p.privacy, p.status, p.sdlc_model,
//        p.creator_id, p.owner_id, p.created_at, p.updated_at,
//        u.username  AS owner_username,
//        u.avatar_url AS owner_avatar,
//        (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id AND pm.status = 'active') AS member_count,
//        (SELECT ARRAY_AGG(tag) FROM project_tags pt WHERE pt.project_id = p.id) AS tags
//      FROM projects p
//      JOIN users u ON u.id = p.owner_id
//      WHERE ${where}
//      ORDER BY p.updated_at DESC
//      LIMIT $${idx} OFFSET $${idx + 1}`,
//     params
//   );

//   return { projects: rows, total, page, limit };
// }

// // ─── UPDATE ───────────────────────────────────────────────────────────────────

exports.updateProjectById = async (projectId, data) => {
  const {
    name,
    description,
    logo_url,
    privacy,
    status,
    sdlc_model,
  } = data;

  const query = `
    UPDATE projects
    SET 
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      logo_url = COALESCE($3, logo_url),
      privacy = COALESCE($4, privacy),
      status = COALESCE($5, status),
      sdlc_model = COALESCE($6, sdlc_model),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING *;
  `;

  const values = [
    name,
    description,
    logo_url,
    privacy,
    status,
    sdlc_model,
    projectId,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// /**
//  * Replace all tags for a project inside a transaction.
//  */
// async function replaceTags(client, projectId, tags) {
//   await client.query(`DELETE FROM project_tags WHERE project_id = $1`, [projectId]);
//   return insertTags(client, projectId, tags);
// }

// async function updateMemberRole(projectId, userId, role) {
//   const { rows } = await pool.query(
//     `UPDATE project_members SET role = $3
//      WHERE project_id = $1 AND user_id = $2
//      RETURNING *`,
//     [projectId, userId, role]
//   );
//   return rows[0] || null;
// }

// async function removeMember(projectId, userId) {
//   const { rows } = await pool.query(
//     `UPDATE project_members SET status = 'removed'
//      WHERE project_id = $1 AND user_id = $2
//      RETURNING *`,
//     [projectId, userId]
//   );
//   return rows[0] || null;
// }

// // ─── DELETE ───────────────────────────────────────────────────────────────────

exports.deleteProjectById = async (projectId) => {
  const query = `
    DELETE FROM projects
    WHERE id = $1
    RETURNING *;
  `;

  const result = await pool.query(query, [projectId]);
  return result.rows[0];
};

// // ─── HELPERS ──────────────────────────────────────────────────────────────────

// async function slugExists(slug, excludeId = null) {
//   const { rows } = await pool.query(
//     `SELECT 1 FROM projects WHERE slug = $1 ${excludeId ? 'AND id != $2' : ''}`,
//     excludeId ? [slug, excludeId] : [slug]
//   );
//   return rows.length > 0;
// }

// async function findUserByUsernameOrEmail(identifier) {
//   const { rows } = await pool.query(
//     `SELECT id, username, email, display_name, avatar_url
//      FROM users
//      WHERE username = $1 OR email = $1
//      LIMIT 1`,
//     [identifier]
//   );
//   return rows[0] || null;
// }

// async function isMember(projectId, userId) {
//   const { rows } = await pool.query(
//     `SELECT 1 FROM project_members
//      WHERE project_id = $1 AND user_id = $2 AND status = 'active'`,
//     [projectId, userId]
//   );
//   return rows.length > 0;
// }