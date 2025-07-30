-- Создание таблицы для связи товаров с несколькими категориями (N:M)
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES vitamin_categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, category_id)
);

-- Добавляем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_product_categories_product ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_primary ON product_categories(is_primary);

-- Переносим существующие связи из products.category_id в новую таблицу
INSERT INTO product_categories (product_id, category_id, is_primary)
SELECT id, category_id, true
FROM products 
WHERE category_id IS NOT NULL;

-- Добавляем дополнительные категории для товаров
DO $$
DECLARE
    cat_vitamins UUID;
    cat_minerals UUID;
    cat_omega UUID;
    cat_immunity UUID;
    cat_energy UUID;
    cat_beauty UUID;
    
    prod_d3 UUID;
    prod_omega3 UUID;
    prod_b_complex UUID;
    prod_multi_women UUID;
    prod_zinc UUID;
BEGIN
    -- Получаем ID категорий
    SELECT id INTO cat_vitamins FROM vitamin_categories WHERE name = 'Витамины';
    SELECT id INTO cat_minerals FROM vitamin_categories WHERE name = 'Минералы';
    SELECT id INTO cat_omega FROM vitamin_categories WHERE name = 'Омега кислоты';
    SELECT id INTO cat_immunity FROM vitamin_categories WHERE name = 'Для иммунитета';
    SELECT id INTO cat_energy FROM vitamin_categories WHERE name = 'Для энергии';
    SELECT id INTO cat_beauty FROM vitamin_categories WHERE name = 'Для красоты';
    
    -- Получаем ID товаров
    SELECT id INTO prod_d3 FROM products WHERE sku = 'VIT-D3-1000';
    SELECT id INTO prod_omega3 FROM products WHERE sku = 'OMEGA3-1000';
    SELECT id INTO prod_b_complex FROM products WHERE sku = 'B-COMPLEX-50';
    SELECT id INTO prod_multi_women FROM products WHERE sku = 'MULTI-WOMEN';
    SELECT id INTO prod_zinc FROM products WHERE sku = 'ZINC-15';
    
    -- Добавляем дополнительные категории (не основные)
    INSERT INTO product_categories (product_id, category_id, is_primary) VALUES
    -- Витамин D3 также для иммунитета
    (prod_d3, cat_immunity, false),
    
    -- Омега-3 также для красоты (кожа)
    (prod_omega3, cat_beauty, false),
    
    -- B-комплекс также для энергии
    (prod_b_complex, cat_energy, false),
    
    -- Мультивитамины для женщин также витамины
    (prod_multi_women, cat_vitamins, false),
    
    -- Цинк также для иммунитета
    (prod_zinc, cat_immunity, false)
    
    ON CONFLICT (product_id, category_id) DO NOTHING;
    
END $$;

-- Комментарий: category_id в таблице products можно оставить для обратной совместимости
-- или удалить позже, когда убедимся что новая система работает корректно
