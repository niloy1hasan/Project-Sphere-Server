const express = require('express');
const { searchUsers } = require('../controllers/userConnection.controller');
const router = express.Router();

router.get("/connection/search", searchUsers);


module.exports = router;