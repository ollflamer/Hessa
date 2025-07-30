-- Создание ENUM типов для опросника
CREATE TYPE age_group_enum AS ENUM ('under_18', '18_30', '31_45', '46_60', '60_plus');
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');
CREATE TYPE activity_level_enum AS ENUM ('none', '1_2_week', '3_5_week', 'daily');
CREATE TYPE stress_level_enum AS ENUM ('low', 'medium', 'high', 'constant');
CREATE TYPE nutrition_enum AS ENUM ('daily', '3_4_week', 'rare');

-- Добавление полей опросника в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_group age_group_enum;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender gender_enum;
ALTER TABLE users ADD COLUMN IF NOT EXISTS activity_level activity_level_enum;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stress_level stress_level_enum;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nutrition nutrition_enum;
ALTER TABLE users ADD COLUMN IF NOT EXISTS restrictions JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS complaints JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS vitamins_current JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS survey_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS survey_completed_at TIMESTAMP WITH TIME ZONE;

-- Создание таблицы витаминов
CREATE TABLE IF NOT EXISTS vitamins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    benefits JSONB DEFAULT '[]',
    dosage VARCHAR(255),
    contraindications TEXT,
    price DECIMAL(10,2),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы правил подбора витаминов
CREATE TABLE IF NOT EXISTS vitamin_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    condition JSONB NOT NULL,
    vitamins JSONB NOT NULL DEFAULT '[]',
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_survey_completed ON users(survey_completed);
CREATE INDEX IF NOT EXISTS idx_users_age_group ON users(age_group);
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);
CREATE INDEX IF NOT EXISTS idx_users_stress_level ON users(stress_level);
CREATE INDEX IF NOT EXISTS idx_vitamins_category ON vitamins(category);
CREATE INDEX IF NOT EXISTS idx_vitamins_is_active ON vitamins(is_active);
CREATE INDEX IF NOT EXISTS idx_vitamin_rules_priority ON vitamin_rules(priority);
CREATE INDEX IF NOT EXISTS idx_vitamin_rules_is_active ON vitamin_rules(is_active);

-- Создание триггеров для автоматического обновления updated_at
CREATE TRIGGER update_vitamins_updated_at 
    BEFORE UPDATE ON vitamins 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vitamin_rules_updated_at 
    BEFORE UPDATE ON vitamin_rules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Вставка базовых витаминов
INSERT INTO vitamins (name, category, description, benefits, dosage, price) VALUES
('Витамин D3', 'Для иммунитета', 'Поддерживает иммунную систему и здоровье костей', '["иммунитет", "кости", "настроение"]', '1000-4000 МЕ в день', 1200.00),
('Магний', 'Для нервной системы', 'Помогает справиться со стрессом и улучшает сон', '["стресс", "сон", "мышцы"]', '200-400 мг в день', 800.00),
('B-комплекс', 'Для энергии', 'Поддерживает энергетический обмен и нервную систему', '["энергия", "нервы", "метаболизм"]', '1 капсула в день', 1500.00),
('Омега-3', 'Для сердца', 'Поддерживает здоровье сердца и мозга', '["сердце", "мозг", "воспаление"]', '1-2 г в день', 2000.00),
('Цинк', 'Для иммунитета', 'Укрепляет иммунитет и улучшает состояние кожи', '["иммунитет", "кожа", "заживление"]', '15-30 мг в день', 600.00),
('Железо', 'Для энергии', 'Предотвращает анемию и повышает энергию', '["энергия", "кровь", "усталость"]', '18-27 мг в день', 700.00),
('Коэнзим Q10', 'Для энергии', 'Поддерживает энергию клеток и здоровье сердца', '["энергия", "сердце", "антиоксидант"]', '100-200 мг в день', 2500.00),
('Пробиотики', 'Для пищеварения', 'Поддерживают здоровье кишечника и иммунитет', '["пищеварение", "иммунитет", "микрофлора"]', '1-2 капсулы в день', 1800.00);

-- Вставка базовых правил подбора
INSERT INTO vitamin_rules (name, condition, vitamins, priority) VALUES
('Высокий стресс', '{"stress_level": "high"}', '["Магний", "B-комплекс", "Омега-3"]', 1),
('Постоянный стресс', '{"stress_level": "constant"}', '["Магний", "B-комплекс", "Омега-3", "Витамин D3"]', 1),
('Низкая активность', '{"activity_level": "none"}', '["Витамин D3", "B-комплекс"]', 2),
('Высокая активность', '{"activity_level": "daily"}', '["Магний", "Омега-3", "Коэнзим Q10"]', 2),
('Женщины репродуктивного возраста', '{"gender": "female", "age_group": ["18_30", "31_45"]}', '["Железо", "Витамин D3", "Омега-3"]', 1),
('Пожилые люди', '{"age_group": ["46_60", "60_plus"]}', '["Витамин D3", "Омега-3", "Коэнзим Q10"]', 1),
('Плохое питание', '{"nutrition": "rare"}', '["B-комплекс", "Витамин D3", "Омега-3"]', 2),
('Усталость', '{"complaints": ["fatigue"]}', '["B-комплекс", "Железо", "Коэнзим Q10"]', 1),
('Проблемы с кожей', '{"complaints": ["skin_issues"]}', '["Цинк", "Омега-3", "Витамин D3"]', 2),
('Цель: энергия', '{"goals": ["energy"]}', '["B-комплекс", "Железо", "Коэнзим Q10"]', 1),
('Цель: иммунитет', '{"goals": ["immunity"]}', '["Витамин D3", "Цинк", "Пробиотики"]', 1),
('Цель: здоровье кожи', '{"goals": ["skin_health"]}', '["Цинк", "Омега-3", "Витамин D3"]', 1);
