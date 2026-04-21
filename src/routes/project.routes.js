const express = require('express');
const { getProjects, createProject, getProjectBySlugController, getProjectByIdController, updateProjectController, deleteProjectController } = require('../controllers/project.controller');
const router = express.Router();

router.get('/user/:userId', getProjects);
router.post('/create', createProject);

router.get("/slug/:slug", getProjectBySlugController);
router.get("/id/:id", getProjectByIdController);


router.put("/:id", updateProjectController);
router.delete("/:id", deleteProjectController);
  
// router.post('/:id/members', addMember );
 
// router.patch('/:id/members/:userId', updateMemberRole);
 
// router.delete('/:id/members/:userId',removeMember);

module.exports = router;