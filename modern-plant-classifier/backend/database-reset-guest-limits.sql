-- Database Reset Guest Detection Limits Script
-- PostgreSQL Database - Reset guest user detection limits

-- Connect to your database
-- \c plant_classifier_dev;

-- Reset all guest detection limits (for testing purposes)
UPDATE guest_detection_limits 
SET 
    detection_count = 0,
    is_blocked = false,
    blocked_at = NULL,
    last_detection_at = NULL,
    updated_at = CURRENT_TIMESTAMP;

-- Reset specific IP address (replace with actual IP)
-- UPDATE guest_detection_limits 
-- SET 
--     detection_count = 0,
--     is_blocked = false,
--     blocked_at = NULL,
--     last_detection_at = NULL,
--     updated_at = CURRENT_TIMESTAMP
-- WHERE ip_address = '192.168.1.100';

-- Reset limits for IPs that haven't been used in 24 hours
UPDATE guest_detection_limits 
SET 
    detection_count = 0,
    is_blocked = false,
    blocked_at = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    last_detection_at IS NOT NULL 
    AND last_detection_at < CURRENT_TIMESTAMP - INTERVAL '24 hours';

-- Show current status after reset
SELECT 
    ip_address,
    detection_count,
    is_blocked,
    last_detection_at,
    CASE 
        WHEN is_blocked THEN 'Blocked'
        WHEN detection_count >= 2 THEN 'Warning - Near limit'
        ELSE 'OK - Available'
    END as status,
    updated_at
FROM guest_detection_limits
ORDER BY updated_at DESC;

-- Count how many IPs were reset
SELECT 
    COUNT(*) as total_ips,
    COUNT(CASE WHEN is_blocked = false THEN 1 END) as available_ips,
    COUNT(CASE WHEN is_blocked = true THEN 1 END) as blocked_ips
FROM guest_detection_limits;
