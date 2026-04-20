const express = require('express');
const { searchUsers, sendRequest, cancelRequest, removeConnectionController, acceptRequest, rejectRequest, blockUserController, allRequests, allConnections } = require('../controllers/userConnection.controller');
const router = express.Router();

router.get("/connection/search", searchUsers);
router.post("/connection/request", sendRequest);

router.delete("/connection/cancel", cancelRequest);
router.delete("/connection/remove", removeConnectionController);

router.put("/connection/accept", acceptRequest);
router.delete("/connection/reject", rejectRequest);
router.post("/connection/block", blockUserController);

router.get("/connection/requests/:userId", allRequests);
router.get("/connection/connections/:username", allConnections);

module.exports = router;