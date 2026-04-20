const express = require('express');
const { getUserProfileByQuery, setUserProfileByQuery, updateUserProfileByQuery, checkUsernameAvailable, setupProfile, isOnboardingNeeded,completeOnboarding, updateBio, updateMobileNumber, updateSocialLinks, getSocialLinks, updateAdditionalInfo, getAdditionalInfo } = require('../controllers/userProfile.controller');
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

// --------------
// ==================== SOCIAL LINKS ====================
router.put('/profile/:username/social-links', updateSocialLinks);
router.get('/profile/:username/social-links', getSocialLinks);

// // ==================== ADDRESSES ====================
// router.post('/profile/:username/addresses', addAddress);
// router.put('/profile/:username/addresses/:addressId', updateAddress);
// router.delete('/profile/:username/addresses/:addressId', deleteAddress);
// router.get('/profile/:username/addresses', getAddresses);

// // ==================== ADDITIONAL INFO ====================
router.put('/profile/:username/additional-info', updateAdditionalInfo);
router.get('/profile/:username/additional-info', getAdditionalInfo);

// // ==================== SKILLS ====================
// router.post('/profile/:username/skills', addSkill);
// router.post('/profile/:username/skills/batch', addMultipleSkills);
// router.delete('/profile/:username/skills/:skillName', deleteSkill);
// router.get('/profile/:username/skills', getSkills);
// router.put('/profile/:username/skills', replaceSkills);

// // ==================== WORKS ====================
// router.post('/profile/:username/works', addWork);
// router.put('/profile/:username/works/:workId', updateWork);
// router.delete('/profile/:username/works/:workId', deleteWork);
// router.get('/profile/:username/works', getWorks);



module.exports = router;