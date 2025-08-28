-- Database Seed Script for Plant Disease Classification System
-- PostgreSQL Database - Insert sample data

-- Connect to your database
-- \c plant_classifier_dev;

-- Insert sample admin user (password: admin123)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@plantclassifier.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample regular user (password: user123)
INSERT INTO users (username, email, password, role) VALUES 
('user1', 'user1@plantclassifier.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
ON CONFLICT (username) DO NOTHING;

-- Insert sample plants data
INSERT INTO plants (name, scientific_name, description, symptoms, treatment, prevention, severity, model_class_id) VALUES
('Corn Healthy', 'Zea mays', 'Healthy corn plant without disease', 'No symptoms', 'No treatment needed', 'Maintain good soil health and proper irrigation', 'none', 'Corn_(maize)___healthy'),
('Corn Common Rust', 'Zea mays', 'Corn plant affected by common rust disease', 'Reddish-brown pustules on leaves', 'Apply fungicides, remove infected plants', 'Plant resistant varieties, avoid overhead irrigation', 'medium', 'Corn_(maize)___Common_rust_'),
('Corn Gray Leaf Spot', 'Zea mays', 'Corn plant with gray leaf spot disease', 'Gray to tan lesions on leaves', 'Apply fungicides, improve air circulation', 'Crop rotation, tillage practices', 'high', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot'),
('Corn Northern Leaf Blight', 'Zea mays', 'Corn plant affected by northern leaf blight', 'Large cigar-shaped lesions on leaves', 'Apply fungicides, remove crop debris', 'Crop rotation, resistant varieties', 'high', 'Corn_(maize)___Northern_Leaf_Blight'),
('Potato Healthy', 'Solanum tuberosum', 'Healthy potato plant', 'No symptoms', 'No treatment needed', 'Good soil management and rotation', 'none', 'Potato___healthy'),
('Potato Early Blight', 'Solanum tuberosum', 'Potato plant with early blight disease', 'Dark brown spots with concentric rings', 'Apply fungicides, remove infected leaves', 'Crop rotation, proper spacing', 'medium', 'Potato___Early_blight'),
('Potato Late Blight', 'Solanum tuberosum', 'Potato plant affected by late blight', 'Water-soaked lesions on leaves and stems', 'Apply fungicides, destroy infected plants', 'Avoid overhead irrigation, resistant varieties', 'high', 'Potato___Late_blight'),
('Tomato Healthy', 'Solanum lycopersicum', 'Healthy tomato plant', 'No symptoms', 'No treatment needed', 'Good cultural practices', 'none', 'Tomato___healthy'),
('Tomato Bacterial Spot', 'Solanum lycopersicum', 'Tomato plant with bacterial spot', 'Small dark spots with yellow halos', 'Remove infected plants, copper-based sprays', 'Use disease-free seeds, avoid overhead irrigation', 'medium', 'Tomato___Bacterial_spot'),
('Tomato Early Blight', 'Solanum lycopersicum', 'Tomato plant affected by early blight', 'Dark brown spots with target-like appearance', 'Apply fungicides, improve air circulation', 'Crop rotation, proper spacing', 'medium', 'Tomato___Early_blight'),
('Tomato Late Blight', 'Solanum lycopersicum', 'Tomato plant with late blight', 'Water-soaked lesions, white fungal growth', 'Apply fungicides, destroy infected plants', 'Avoid overhead irrigation, resistant varieties', 'high', 'Tomato___Late_blight'),
('Tomato Leaf Mold', 'Solanum lycopersicum', 'Tomato plant affected by leaf mold', 'Yellow spots with olive-green mold', 'Improve air circulation, apply fungicides', 'Proper spacing, avoid overhead irrigation', 'medium', 'Tomato___Leaf_Mold'),
('Tomato Septoria Leaf Spot', 'Solanum lycopersicum', 'Tomato plant with septoria leaf spot', 'Small circular spots with dark borders', 'Remove infected leaves, apply fungicides', 'Crop rotation, avoid overhead irrigation', 'medium', 'Tomato___Septoria_leaf_spot'),
('Tomato Spider Mites', 'Solanum lycopersicum', 'Tomato plant infested with spider mites', 'Yellow stippling on leaves, fine webbing', 'Apply miticides, release beneficial insects', 'Regular monitoring, avoid dusty conditions', 'low', 'Tomato___Spider_mites Two-spotted_spider_mite'),
('Tomato Target Spot', 'Solanum lycopersicum', 'Tomato plant with target spot disease', 'Concentric rings on leaves and fruit', 'Apply fungicides, remove infected parts', 'Crop rotation, proper spacing', 'medium', 'Tomato___Target_Spot'),
('Tomato Mosaic Virus', 'Solanum lycopersicum', 'Tomato plant infected with mosaic virus', 'Mottled leaves, stunted growth', 'Remove infected plants, control aphids', 'Use virus-free seeds, control vectors', 'high', 'Tomato___Tomato_mosaic_virus'),
('Tomato Yellow Leaf Curl Virus', 'Solanum lycopersicum', 'Tomato plant with yellow leaf curl virus', 'Yellow curled leaves, stunted growth', 'Remove infected plants, control whiteflies', 'Use resistant varieties, control vectors', 'high', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus')
ON CONFLICT (model_class_id) DO NOTHING;

-- Insert sample detection history for testing
INSERT INTO detection_history (user_id, ip_address, user_agent, image_file_name, original_image_name, prediction_result, confidence, plant_class, recommendations, is_guest, session_id) VALUES
(NULL, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'sample1.jpg', 'corn_healthy.jpg', '{"classId": "Corn_(maize)___healthy", "confidence": 0.95}', 0.95, 'Corn Healthy', 'No treatment needed', true, 'guest_session_1'),
(NULL, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'sample2.jpg', 'tomato_blight.jpg', '{"classId": "Tomato___Early_blight", "confidence": 0.87}', 0.87, 'Tomato Early Blight', 'Apply fungicides, improve air circulation', true, 'guest_session_1'),
(2, '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'sample3.jpg', 'potato_healthy.jpg', '{"classId": "Potato___healthy", "confidence": 0.92}', 0.92, 'Potato Healthy', 'No treatment needed', false, 'user_session_1'),
(2, '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'sample4.jpg', 'corn_rust.jpg', '{"classId": "Corn_(maize)___Common_rust_", "confidence": 0.89}', 0.89, 'Corn Common Rust', 'Apply fungicides, remove infected plants', false, 'user_session_1')
ON CONFLICT DO NOTHING;

-- Insert sample guest detection limits for testing
INSERT INTO guest_detection_limits (ip_address, detection_count, last_detection_at, is_blocked, user_agent) VALUES
('192.168.1.100', 2, CURRENT_TIMESTAMP - INTERVAL '2 hours', true, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('192.168.1.102', 1, CURRENT_TIMESTAMP - INTERVAL '1 hour', false, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'),
('192.168.1.103', 0, NULL, false, 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36')
ON CONFLICT (ip_address) DO NOTHING;

-- Verify inserted data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Plants' as table_name, COUNT(*) as count FROM plants
UNION ALL
SELECT 'Detection History' as table_name, COUNT(*) as count FROM detection_history
UNION ALL
SELECT 'Guest Detection Limits' as table_name, COUNT(*) as count FROM guest_detection_limits;

-- Show sample detection history
SELECT 
    dh.id,
    COALESCE(u.username, 'Guest') as user_type,
    dh.plant_class,
    dh.confidence,
    dh.created_at
FROM detection_history dh
LEFT JOIN users u ON dh.user_id = u.id
ORDER BY dh.created_at DESC
LIMIT 10;

-- Show guest detection limits status
SELECT 
    ip_address,
    detection_count,
    is_blocked,
    last_detection_at,
    CASE 
        WHEN is_blocked THEN 'Blocked - Limit reached'
        WHEN detection_count >= 2 THEN 'Warning - Near limit'
        ELSE 'OK - Available'
    END as status
FROM guest_detection_limits
ORDER BY created_at DESC;
