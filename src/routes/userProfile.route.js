const express = require('express');
const { getUserProfileByQuery } = require('../controllers/userProfile.controller');
const router = express.Router();

router.get('/profile', getUserProfileByQuery);

module.exports = router;