const GuestDetectionLimit = require('../models/GuestDetectionLimit');
const { Op } = require('sequelize');

const GUEST_DETECTION_LIMIT = 2;
const RESET_HOURS = 24; // Reset limit setiap 24 jam

const guestDetectionLimit = async (req, res, next) => {
  try {
    // Jika user sudah login, skip middleware ini
    if (req.user || req.session.userId) {
      return next();
    }

    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Cek apakah IP sudah ada di database
    let guestLimit = await GuestDetectionLimit.findOne({
      where: { ipAddress }
    });

    if (!guestLimit) {
      // Buat record baru untuk IP ini
      guestLimit = await GuestDetectionLimit.create({
        ipAddress,
        detectionCount: 0,
        userAgent
      });
    }

    // Cek apakah sudah 24 jam sejak deteksi terakhir
    const now = new Date();
    const lastDetection = guestLimit.lastDetectionAt;
    
    if (lastDetection) {
      const hoursSinceLastDetection = (now - lastDetection) / (1000 * 60 * 60);
      
      if (hoursSinceLastDetection >= RESET_HOURS) {
        // Reset counter jika sudah 24 jam
        await guestLimit.update({
          detectionCount: 0,
          isBlocked: false,
          blockedAt: null
        });
        guestLimit.detectionCount = 0;
        guestLimit.isBlocked = false;
      }
    }

    // Cek apakah sudah mencapai limit
    if (guestLimit.detectionCount >= GUEST_DETECTION_LIMIT) {
      // Update status blocked
      if (!guestLimit.isBlocked) {
        await guestLimit.update({
          isBlocked: true,
          blockedAt: now
        });
      }

      return res.status(429).json({
        error: 'Guest detection limit reached',
        message: `You have reached the limit of ${GUEST_DETECTION_LIMIT} detections per day. Please login to continue or try again tomorrow.`,
        limitReached: true,
        remainingDetections: 0,
        resetTime: lastDetection ? new Date(lastDetection.getTime() + (RESET_HOURS * 60 * 60 * 1000)) : null
      });
    }

    // Simpan IP dan user agent untuk tracking
    req.guestIp = ipAddress;
    req.guestUserAgent = userAgent;
    req.guestLimit = guestLimit;

    next();
  } catch (error) {
    console.error('Error in guest detection limit middleware:', error);
    // Jika ada error, tetap izinkan request (fail-safe)
    next();
  }
};

module.exports = guestDetectionLimit;
