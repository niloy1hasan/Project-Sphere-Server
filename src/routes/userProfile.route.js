const express = require('express');
const { getUserProfileByQuery, checkUsernameAvailable } = require('../controllers/userProfile.controller');
const router = express.Router();

router.get('/profile', getUserProfileByQuery);
router.get('/profile/username/availability', checkUsernameAvailable);

module.exports = router;