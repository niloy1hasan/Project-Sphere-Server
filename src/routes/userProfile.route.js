const express = require('express');
const { getUserProfileByQuery, setUserProfileByQuery, updateUserProfileByQuery, checkUsernameAvailable, setupProfile, isOnboardingNeeded,completeOnboarding, updateBio, updateMobileNumber } = require('../controllers/userProfile.controller');
const router = express.Router();

router.get('/profile', getUserProfileByQuery);
router.post('/profile', setUserProfileByQuery);
router.patch('/profile', updateUserProfileByQuery);
router.post('/profile/onboarding-needed', isOnboardingNeeded );
router.post('/profile/setup', setupProfile);
router.post('/profile/complete-onboarding', completeOnboarding );
router.get('/profile/username/availability', checkUsernameAvailable);
router.put("/profile/:username/bio", updateBio);
router.put("/profile/:username/contact", updateMobileNumber);

module.exports = router;