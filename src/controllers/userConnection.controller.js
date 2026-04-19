const { searchUsers } = require("../models/userConnection.model");

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const users = await searchUsers(q);

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      email: u.email,
      avatar: u.avatar,
      location: u.location,
    }));

    res.json({
      success: true,
      data: formatted,
    });

  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};