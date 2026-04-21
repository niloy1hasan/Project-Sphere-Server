const express = require('express');
const { searchUsers, sendRequest, cancelRequest, removeConnectionController, acceptRequest, rejectRequest, blockUserController, allRequests, allConnections } = require('../controllers/userConnection.controller');
const router = express.Router();

router.get("/search", searchUsers);
router.post("/request", sendRequest);

router.delete("/cancel", cancelRequest);
router.delete("/remove", removeConnectionController);

router.put("/accept", acceptRequest);
router.delete("/reject", rejectRequest);
router.post("/block", blockUserController);

router.get("/requests/:userId", allRequests);
router.get("/connections/:username", allConnections);

module.exports = router;