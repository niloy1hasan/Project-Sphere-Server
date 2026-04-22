const { getProjects, createProject, getProjectsByUserId, getProjectBySlug, getProjectById, updateProjectById, deleteProjectById, getProjectInvitationsByUserId, declineInvitationService, acceptInvitationService } = require("../models/project.model");
const { slugify } = require("../utils/slugify");

// GET /projects
exports.getProjects = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const projects = await getProjectsByUserId(userId);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// // POST /projects
exports.createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      logo_url,
      privacy,
      status,
      sdlc_model,
      tags = [],
      members = []
    } = req.body;

    const userId = req.user?.id || req.body.owner_id;

    if (!name || !userId) {
      return res.status(400).json({
        success: false,
        message: "Name and owner_id are required",
      });
    }

    const slug = slugify(name);

    const project = await createProject({
      name,
      slug,
      description,
      logo_url,
      privacy,
      status,
      sdlc_model,
      creator_id: userId,
      owner_id: userId,
      tags,
      members
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Project slug already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getProjectBySlugController = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }

    const project = await getProjectBySlug(slug);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getProjectByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const project = await getProjectById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // if (project.privacy === "private" && req.user?.id !== project.owner_id) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Access denied",
    //   });
    // }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// // PATCH /projects/:id
exports.updateProjectController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    // check project exists
    const existing = await getProjectById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // 🔐 permission check
    if (req.user?.id !== existing.owner_id) {
      return res.status(403).json({
        success: false,
        message: "Only owner can update project",
      });
    }

    const updated = await updateProjectById(id, req.body);

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// // DELETE /projects/:id
exports.deleteProjectController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const existing = await getProjectById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // 🔐 permission check
    if (req.user?.id !== existing.owner_id) {
      return res.status(403).json({
        success: false,
        message: "Only owner can delete project",
      });
    }

    const deleted = await deleteProjectById(id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.getProjectInvitations = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const invitations = await getProjectInvitationsByUserId(userId);

    return res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ACCEPT
exports.acceptProjectInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "invitationId is required",
      });
    }

    const result = await acceptInvitationService(invitationId);

    return res.status(200).json({
      success: true,
      message: "Invitation accepted",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// DECLINE
exports.declineProjectInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    if (!invitationId) {
      return res.status(400).json({
        success: false,
        message: "invitationId is required",
      });
    }

    const result = await declineInvitationService(invitationId);

    return res.status(200).json({
      success: true,
      message: "Invitation declined",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};


// // POST /projects/:id/members
// exports.addMember = async (req, res) => {
//   try {
//     const member = await addMember(req.params.id, req.body);
//     res.status(201).json({ success: true, data: member });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // PATCH /projects/:id/members/:userId
// exports.updateMemberRole = async (req, res) => {
//   try {
//     const member = await updateMemberRole(
//       req.params.id,
//       req.params.userId,
//       req.body.role
//     );

//     res.status(200).json({ success: true, data: member });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // DELETE /projects/:id/members/:userId
// exports.removeMember = async (req, res) => {
//   try {
//     await removeMember(req.params.id, req.params.userId);

//     res.status(200).json({ success: true, message: "Member removed" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };