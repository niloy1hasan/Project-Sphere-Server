const express = require('express');
const {getUsers, createUser, checkUserExists } = require('../controllers/users.controller');
const router = express.Router();

router.get('/users', getUsers);
router.post('/users', createUser);

router.get('/users/exist', checkUserExists);

module.exports = router;