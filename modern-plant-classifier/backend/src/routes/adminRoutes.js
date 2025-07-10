const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/plants - Get all plants with pagination
router.get('/plants', adminController.getPlants);

// GET /api/admin/plants/:id - Get single plant
router.get('/plants/:id', adminController.getPlant);

// POST /api/admin/plants - Create new plant
router.post('/plants', [
  body('name')
    .notEmpty()
    .withMessage('Plant name is required')
    .isLength({ max: 255 })
    .withMessage('Plant name too long'),
  body('modelClassId')
    .isInt({ min: 0 })
    .withMessage('Model class ID must be a non-negative integer'),
  body('severity')
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Severity must be Low, Medium, High, or Critical')
], adminController.createPlant);

// PUT /api/admin/plants/:id - Update plant
router.put('/plants/:id', [
  body('name')
    .notEmpty()
    .withMessage('Plant name is required')
    .isLength({ max: 255 })
    .withMessage('Plant name too long'),
  body('severity')
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Severity must be Low, Medium, High, or Critical')
], adminController.updatePlant);

// DELETE /api/admin/plants/:id - Soft delete plant
router.delete('/plants/:id', adminController.deletePlant);

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', adminController.getDashboardStats);

// GET /api/admin/predictions - Get all predictions for admin review
router.get('/predictions', adminController.getAllPredictions);

module.exports = router; 