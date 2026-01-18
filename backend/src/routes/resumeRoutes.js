// routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');

router.get('/:userId/master', resumeController.getMasterResume);

router.get('/:userId', resumeController.getAllResumes);

router.post('/', resumeController.createResume);

module.exports = router;