-- Создание таблицы категорий витаминов
CREATE TABLE IF NOT EXISTS vitamin_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы товаров
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  price DECIMAL(10,2) NOT NULL,
  size VARCHAR(100),
  quantity INTEGER DEFAULT 0,
  category_id UUID REFERENCES vitamin_categories(id) ON DELETE SET NULL,
  restrictions JSONB DEFAULT '[]',
  benefits JSONB DEFAULT '[]',
  dosage VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы связи правил с товарами (N:M)
CREATE TABLE IF NOT EXISTS rule_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES vitamin_rules(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(rule_id, product_id)
);

-- Обновляем существующую таблицу vitamin_rules
ALTER TABLE vitamin_rules 
DROP COLUMN IF EXISTS vitamins;

-- Добавляем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_rule_products_rule ON rule_products(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_products_product ON rule_products(product_id);

-- Вставляем базовые категории
INSERT INTO vitamin_categories (name, description) VALUES
('Витамины', 'Основные витамины и витаминные комплексы'),
('Минералы', 'Минеральные добавки и микроэлементы'),
('Омега кислоты', 'Омега-3, Омега-6 и другие полезные жиры'),
('Пробиотики', 'Препараты для здоровья кишечника'),
('Антиоксиданты', 'Защита от свободных радикалов'),
('Для иммунитета', 'Укрепление иммунной системы'),
('Для энергии', 'Повышение энергии и выносливости'),
('Для красоты', 'Здоровье кожи, волос и ногтей')
ON CONFLICT (name) DO NOTHING;
