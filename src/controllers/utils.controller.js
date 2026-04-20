const { getUserIdByUsername } = require("../models/utils.model");

exports.getUserIdFromRequest = async (username, res) => {
  const userId = await getUserIdByUsername(username);
  if (!userId) {
    res.status(404).json({ success: false, message: 'User not found' });
    return null;
  }
  return userId;
};