const { searchUsers, sendConnectionRequest, acceptConnection, removeConnection, cancelConnectionRequest, rejectConnection, blockUser, getAllRequests, getAllConnections } = require("../models/userConnection.model");
const { getUserIdFromRequest } = require("./utils.controller");

exports.searchUsers = async (req, res) => {
  try {
    const { q, userId } = req.query;

    if (!q || !userId) {
      return res.status(400).json({
        success: false,
        message: "q and userId are required",
      });
    }

    const users = await searchUsers(q, userId);

    res.json({
      success: true,
      data: users,
    });

  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.sendRequest = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: "senderId and receiverId are required",
      });
    }

    const connection = await sendConnectionRequest(senderId, receiverId);

    res.status(201).json({
      success: true,
      message: "Connection request sent",
      data: connection,
    });

  } catch (err) {
    console.error("Send request error:", err.message);

    res.status(400).json({
      success: false,
      message: err.message || "Failed to send request",
    });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: "senderId and receiverId are required",
      });
    }

    const result = await cancelConnectionRequest(senderId, receiverId);

    res.json({
      success: true,
      message: "Connection request cancelled",
      data: result,
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


exports.removeConnectionController = async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;

    if (!userId1 || !userId2) {
      return res.status(400).json({
        success: false,
        message: "userId1 and userId2 are required",
      });
    }

    const result = await removeConnection(userId1, userId2);

    res.json({
      success: true,
      message: "Connection removed",
      data: result,
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


exports.acceptRequest = async (req, res) => {
  try {
    const { receiverId, senderId } = req.query;

    const result = await acceptConnection(receiverId, senderId);

    res.json({
      success: true,
      message: "Connection accepted",
      data: result,
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { receiverId, senderId } = req.query;

    const result = await rejectConnection(receiverId, senderId);

    res.json({
      success: true,
      message: "Connection rejected",
      data: result,
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.blockUserController = async (req, res) => {
  try {
    const { blockerId, blockedId } = req.body;

    const result = await blockUser(blockerId, blockedId);

    res.json({
      success: true,
      message: result.message,
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.allRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    const data = await getAllRequests(userId);

    res.json({
      success: true,
      count: data.length,
      data,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.allConnections = async (req, res) => {
  try {
    const { username } = req.params;

    const userId = await getUserIdFromRequest(username, res);
    if (!userId) return;

    const data = await getAllConnections(userId);

    res.json({
      success: true,
      count: data.length,
      data,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};