'use strict';

const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/profileController');
const { validateCreate, validateUpdate } = require('../middleware/validateProfileInput');

/**
 * Student Profile CRUD Routes
 *
 *  POST   /api/profiles          – Create a new student profile
 *  GET    /api/profiles          – Get all profiles (supports ?careerGoal= ?page= ?limit=)
 *  GET    /api/profiles/:id      – Get one profile by ID
 *  PUT    /api/profiles/:id      – Update a profile (partial update supported)
 *  DELETE /api/profiles/:id      – Delete a profile
 */

router.post(  '/',    validateCreate, ctrl.createProfile);
router.get(   '/',                    ctrl.getAllProfiles);
router.get(   '/:id',                 ctrl.getProfileById);
router.put(   '/:id', validateUpdate, ctrl.updateProfile);
router.delete('/:id',                 ctrl.deleteProfile);

module.exports = router;
