const Plant = require('../models/Plant');
const Prediction = require('../models/Prediction');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class AdminController {
  // Get all plants with pagination
  async getPlants(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { scientificName: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows: plants } = await Plant.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          plants,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('❌ Get plants error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch plants' 
      });
    }
  }

  // Get single plant
  async getPlant(req, res) {
    try {
      const { id } = req.params;
      const plant = await Plant.findByPk(id);

      if (!plant) {
        return res.status(404).json({
          success: false,
          error: 'Plant not found'
        });
      }

      res.json({
        success: true,
        data: plant
      });

    } catch (error) {
      console.error('❌ Get plant error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch plant' 
      });
    }
  }

  // Create new plant
  async createPlant(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const {
        name,
        scientificName,
        description,
        symptoms,
        treatment,
        prevention,
        severity,
        modelClassId,
        imageUrl
      } = req.body;

      // Check if modelClassId already exists
      const existingPlant = await Plant.findOne({ where: { modelClassId } });
      if (existingPlant) {
        return res.status(400).json({
          success: false,
          error: 'A plant with this model class ID already exists'
        });
      }

      const plant = await Plant.create({
        name,
        scientificName,
        description,
        symptoms,
        treatment,
        prevention,
        severity,
        modelClassId,
        imageUrl,
        isActive: true
      });

      res.status(201).json({
        success: true,
        data: plant,
        message: 'Plant created successfully'
      });

    } catch (error) {
      console.error('❌ Create plant error:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          error: 'Plant name already exists'
        });
      }

      res.status(500).json({ 
        success: false, 
 