-- Добавляем новые поля для атрибутов товаров
ALTER TABLE products ADD COLUMN IF NOT EXISTS target_complaints JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS target_goals JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS vitamin_type JSONB DEFAULT '[]';

-- Обновляем существующие товары с атрибутами на основе их названий и описаний
UPDATE products SET 
  target_complaints = CASE 
    WHEN name ILIKE '%магний%' OR name ILIKE '%ashwagandha%' THEN '["stress", "sleep_problems"]'::jsonb
    WHEN name ILIKE '%железо%' OR name ILIKE '%iron%' THEN '["fatigue"]'::jsonb
    WHEN name ILIKE '%цинк%' OR name ILIKE '%zinc%' THEN '["skin_issues", "low_immunity"]'::jsonb
    WHEN name ILIKE '%омега%' OR name ILIKE '%omega%' THEN '["skin_issues", "joint_pain"]'::jsonb
    WHEN name ILIKE '%b-комплекс%' OR name ILIKE '%b_complex%' THEN '["fatigue", "memory_issues"]'::jsonb
    WHEN name ILIKE '%пробиотик%' OR name ILIKE '%probio%' THEN '["digestive_issues"]'::jsonb
    WHEN name ILIKE '%коллаген%' OR name ILIKE '%collagen%' THEN '["skin_issues", "joint_pain"]'::jsonb
    WHEN name ILIKE '%витамин c%' OR name ILIKE '%vit-c%' THEN '["low_immunity"]'::jsonb
    WHEN name ILIKE '%витамин d%' OR name ILIKE '%vit-d%' THEN '["low_immunity", "fatigue"]'::jsonb
    WHEN name ILIKE '%coq10%' OR name ILIKE '%коэнзим%' THEN '["fatigue"]'::jsonb
    WHEN name ILIKE '%мультивитамин%' OR name ILIKE '%multi%' THEN '["fatigue", "low_immunity"]'::jsonb
    ELSE '[]'::jsonb
  END,
  target_goals = CASE 
    WHEN name ILIKE '%магний%' OR name ILIKE '%ashwagandha%' THEN '["stress_relief", "better_sleep"]'::jsonb
    WHEN name ILIKE '%железо%' OR name ILIKE '%iron%' THEN '["energy"]'::jsonb
    WHEN name ILIKE '%цинк%' OR name ILIKE '%zinc%' THEN '["immunity", "skin_health"]'::jsonb
    WHEN name ILIKE '%омега%' OR name ILIKE '%omega%' THEN '["heart_health", "skin_health"]'::jsonb
    WHEN name ILIKE '%b-комплекс%' OR name ILIKE '%b_complex%' THEN '["energy"]'::jsonb
    WHEN name ILIKE '%пробиотик%' OR name ILIKE '%probio%' THEN '["immunity"]'::jsonb
    WHEN name ILIKE '%коллаген%' OR name ILIKE '%collagen%' THEN '["skin_health"]'::jsonb
    WHEN name ILIKE '%витамин c%' OR name ILIKE '%vit-c%' THEN '["immunity"]'::jsonb
    WHEN name ILIKE '%витамин d%' OR name ILIKE '%vit-d%' THEN '["immunity", "energy"]'::jsonb
    WHEN name ILIKE '%coq10%' OR name ILIKE '%коэнзим%' THEN '["energy", "heart_health"]'::jsonb
    WHEN name ILIKE '%мультивитамин%' OR name ILIKE '%multi%' THEN '["energy", "immunity"]'::jsonb
    ELSE '[]'::jsonb
  END,
  vitamin_type = CASE 
    WHEN name ILIKE '%магний%' THEN '["magnesium"]'::jsonb
    WHEN name ILIKE '%железо%' OR name ILIKE '%iron%' THEN '["iron"]'::jsonb
    WHEN name ILIKE '%цинк%' OR name ILIKE '%zinc%' THEN '["zinc"]'::jsonb
    WHEN name ILIKE '%омега%' OR name ILIKE '%omega%' THEN '["omega_3"]'::jsonb
    WHEN name ILIKE '%b-комплекс%' OR name ILIKE '%b_complex%' THEN '["b_complex"]'::jsonb
    WHEN name ILIKE '%пробиотик%' OR name ILIKE '%probio%' THEN '["probiotics"]'::jsonb
    WHEN name ILIKE '%коллаген%' OR name ILIKE '%collagen%' THEN '["collagen"]'::jsonb
    WHEN name ILIKE '%витамин c%' OR name ILIKE '%vit-c%' THEN '["vitamin_c"]'::jsonb
    WHEN name ILIKE '%витамин d%' OR name ILIKE '%vit-d%' THEN '["vitamin_d"]'::jsonb
    WHEN name ILIKE '%coq10%' OR name ILIKE '%коэнзим%' THEN '["coenzyme_q10"]'::jsonb
    WHEN name ILIKE '%ashwagandha%' OR name ILIKE '%ашваганда%' THEN '["ashwagandha"]'::jsonb
    WHEN name ILIKE '%мультивитамин%' OR name ILIKE '%multi%' THEN '["multivitamin"]'::jsonb
    ELSE '[]'::jsonb
  END;

-- Добавляем индексы для быстрого поиска по атрибутам
CREATE INDEX IF NOT EXISTS idx_products_target_complaints ON products USING GIN (target_complaints);
CREATE INDEX IF NOT EXISTS idx_products_target_goals ON products USING GIN (target_goals);
CREATE INDEX IF NOT EXISTS idx_products_vitamin_type ON products USING GIN (vitamin_type);

-- Комментарии к новым полям
COMMENT ON COLUMN products.target_complaints IS 'Массив проблем, которые решает товар (fatigue, stress, skin_issues, etc.)';
COMMENT ON COLUMN products.target_goals IS 'Массив целей, которые помогает достичь товар (energy, immunity, skin_health, etc.)';
COMMENT ON COLUMN products.vitamin_type IS 'Массив типов витаминов/добавок (vitamin_d, magnesium, omega_3, etc.)';
