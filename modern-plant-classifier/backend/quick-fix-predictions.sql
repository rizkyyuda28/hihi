-- =====================================================
-- QUICK FIX PREDICTIONS TABLE
-- Plant Disease Classification System
-- PostgreSQL Database - Quick fix without dropping table
-- =====================================================

-- Connect to your database (uncomment and modify as needed)
-- \c plant_classifier_dev;

-- =====================================================
-- 1. CHECK CURRENT TABLE STRUCTURE
-- =====================================================

SELECT 'Current table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'predictions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 2. ADD MISSING COLUMNS (IF THEY DON'T EXIST)
-- =====================================================

-- Add is_real_ml column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'predictions' 
        AND column_name = 'is_real_ml'
    ) THEN
        ALTER TABLE predictions ADD COLUMN is_real_ml BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_real_ml column';
    ELSE
        RAISE NOTICE 'is_real_ml column already exists';
    END IF;
END $$;

-- Add other missing columns if needed
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'predictions' 
        AND column_name = 'image_filename'
    ) THEN
        ALTER TABLE predictions ADD COLUMN image_filename VARCHAR(255);
        RAISE NOTICE 'Added image_filename column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'predictions' 
        AND column_name = 'predicted_class'
    ) THEN
        ALTER TABLE predictions ADD COLUMN predicted_class VARCHAR(100);
        RAISE NOTICE 'Added predicted_class column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'predictions' 
        AND column_name = 'plant_type'
    ) THEN
        ALTER TABLE predictions ADD COLUMN plant_type VARCHAR(100);
        RAISE NOTICE 'Added plant_type column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'predictions' 
        AND column_name = 'disease_type'
    ) THEN
        ALTER TABLE predictions ADD COLUMN disease_type VARCHAR(100);
        RAISE NOTICE 'Added disease_type column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'predictions' 
        AND column_name = 'processing_time'
    ) THEN
        ALTER TABLE predictions ADD COLUMN processing_time INTEGER;
        RAISE NOTICE 'Added processing_time column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'predictions' 
        AND column_name = 'model_used'
    ) THEN
        ALTER TABLE predictions ADD COLUMN model_used VARCHAR(100) DEFAULT 'klasifikasi-tanaman-v1';
        RAISE NOTICE 'Added model_used column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'predictions' 
        AND column_name = 'model_accuracy'
    ) THEN
        ALTER TABLE predictions ADD COLUMN model_accuracy VARCHAR(20) DEFAULT '86.12%';
        RAISE NOTICE 'Added model_accuracy column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'predictions' 
        AND column_name = 'all_probabilities'
    ) THEN
        ALTER TABLE predictions ADD COLUMN all_probabilities JSONB;
        RAISE NOTICE 'Added all_probabilities column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'predictions' 
        AND column_name = 'user_agent'
    ) THEN
        ALTER TABLE predictions ADD COLUMN user_agent TEXT;
        RAISE NOTICE 'Added user_agent column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'predictions' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE predictions ADD COLUMN metadata JSONB;
        RAISE NOTICE 'Added metadata column';
    END IF;
END $$;

-- =====================================================
-- 3. CREATE MISSING INDEXES
-- =====================================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_predictions_predicted_class ON predictions(predicted_class);
CREATE INDEX IF NOT EXISTS idx_predictions_plant_type ON predictions(plant_type);
CREATE INDEX IF NOT EXISTS idx_predictions_is_real_ml ON predictions(is_real_ml);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);

-- =====================================================
-- 4. VERIFY FINAL STRUCTURE
-- =====================================================

SELECT 'Final table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'predictions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 5. TEST INSERT
-- =====================================================

-- Try to insert a test record
INSERT INTO predictions (
    image_filename, 
    predicted_class, 
    confidence, 
    plant_type, 
    disease_type, 
    is_healthy, 
    processing_time, 
    model_used, 
    model_accuracy, 
    is_real_ml
) VALUES (
    'test_fix.jpg',
    'Test_Class',
    0.95,
    'Test Plant',
    'Test Disease',
    false,
    1000,
    'test-model',
    '90%',
    true
) ON CONFLICT DO NOTHING;

SELECT 'Test insert completed successfully!' as status;

-- =====================================================
-- SCRIPT COMPLETION
-- =====================================================

SELECT '🎉 Quick fix completed!' as message;
SELECT 'Table structure should now work with Sequelize' as info;
SELECT 'Try your prediction again' as next_step;
