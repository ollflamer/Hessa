-- Вставляем тестовые товары
DO $$
DECLARE
    cat_vitamins UUID;
    cat_minerals UUID;
    cat_omega UUID;
    cat_probiotics UUID;
    cat_antioxidants UUID;
    cat_immunity UUID;
    cat_energy UUID;
    cat_beauty UUID;
BEGIN
    -- Получаем ID категорий
    SELECT id INTO cat_vitamins FROM vitamin_categories WHERE name = 'Витамины';
    SELECT id INTO cat_minerals FROM vitamin_categories WHERE name = 'Минералы';
    SELECT id INTO cat_omega FROM vitamin_categories WHERE name = 'Омега кислоты';
    SELECT id INTO cat_probiotics FROM vitamin_categories WHERE name = 'Пробиотики';
    SELECT id INTO cat_antioxidants FROM vitamin_categories WHERE name = 'Антиоксиданты';
    SELECT id INTO cat_immunity FROM vitamin_categories WHERE name = 'Для иммунитета';
    SELECT id INTO cat_energy FROM vitamin_categories WHERE name = 'Для энергии';
    SELECT id INTO cat_beauty FROM vitamin_categories WHERE name = 'Для красоты';

    -- Вставляем товары
    INSERT INTO products (sku, name, description, price, size, quantity, category_id, restrictions, benefits, dosage) VALUES
    ('VIT-D3-1000', 'Витамин D3 1000 МЕ', 'Высококачественный витамин D3 для поддержания здоровья костей и иммунитета', 1200.00, '60 капсул', 100, cat_vitamins, '["pregnancy"]', '["поддержка иммунитета", "здоровье костей", "улучшение настроения"]', '1 капсула в день'),
    
    ('MAG-400', 'Магний 400 мг', 'Хелатный магний для снижения стресса и улучшения сна', 890.00, '90 таблеток', 150, cat_minerals, '["kidney_disease"]', '["снижение стресса", "улучшение сна", "поддержка мышц"]', '1 таблетка перед сном'),
    
    ('B-COMPLEX-50', 'B-комплекс 50', 'Полный комплекс витаминов группы B для энергии и нервной системы', 750.00, '100 капсул', 80, cat_vitamins, '[]', '["повышение энергии", "поддержка нервной системы", "улучшение метаболизма"]', '1 капсула утром'),
    
    ('OMEGA3-1000', 'Омега-3 1000 мг', 'Рыбий жир высокой очистки для сердца и мозга', 1450.00, '120 капсул', 200, cat_omega, '["blood_thinners"]', '["здоровье сердца", "поддержка мозга", "противовоспалительное действие"]', '2 капсулы в день с едой'),
    
    ('ZINC-15', 'Цинк 15 мг', 'Хелатный цинк для иммунитета и здоровья кожи', 650.00, '100 таблеток', 120, cat_minerals, '[]', '["укрепление иммунитета", "здоровье кожи", "заживление ран"]', '1 таблетка в день'),
    
    ('IRON-18', 'Железо 18 мг', 'Легкоусвояемое железо для борьбы с усталостью', 580.00, '60 капсул', 90, cat_minerals, '["children_under_12"]', '["борьба с усталостью", "поддержка крови", "повышение энергии"]', '1 капсула утром натощак'),
    
    ('COQ10-100', 'Коэнзим Q10 100 мг', 'Мощный антиоксидант для энергии клеток и здоровья сердца', 2100.00, '60 капсул', 60, cat_antioxidants, '["blood_thinners"]', '["энергия клеток", "здоровье сердца", "антиоксидантная защита"]', '1 капсула в день с жирной пищей'),
    
    ('PROBIO-50B', 'Пробиотики 50 млрд', 'Комплекс полезных бактерий для здоровья кишечника', 1800.00, '30 капсул', 70, cat_probiotics, '[]', '["здоровье кишечника", "укрепление иммунитета", "улучшение пищеварения"]', '1 капсула утром натощак'),
    
    ('VIT-C-1000', 'Витамин C 1000 мг', 'Аскорбиновая кислота с биофлавоноидами для иммунитета', 420.00, '100 таблеток', 180, cat_immunity, '[]', '["мощная поддержка иммунитета", "антиоксидантная защита", "синтез коллагена"]', '1 таблетка в день'),
    
    ('MULTI-WOMEN', 'Мультивитамины для женщин', 'Специально разработанный комплекс для женского здоровья', 1350.00, '60 таблеток', 110, cat_beauty, '["pregnancy"]', '["женское здоровье", "красота кожи", "энергия", "гормональный баланс"]', '1 таблетка утром с едой'),
    
    ('COLLAGEN-PLUS', 'Коллаген Плюс', 'Гидролизованный коллаген с витамином C для красоты', 2200.00, '300г порошок', 50, cat_beauty, '[]', '["здоровье кожи", "крепкие ногти", "здоровые волосы", "подвижность суставов"]', '1 мерная ложка в день'),
    
    ('ASHWAGANDHA-500', 'Ашваганда 500 мг', 'Адаптоген для снижения стресса и повышения энергии', 980.00, '90 капсул', 85, cat_energy, '["pregnancy", "lactation"]', '["снижение стресса", "повышение энергии", "улучшение сна", "адаптогенные свойства"]', '1-2 капсулы в день');

END $$;

-- Создаем базовые правила подбора витаминов
INSERT INTO vitamin_rules (name, condition, priority, is_active) VALUES
-- Правило для высокого стресса
('Высокий стресс', '{"stress_level": ["high", "constant"]}', 90, true),

-- Правило для низкой активности
('Низкая активность', '{"activity_level": ["none", "1_2_week"]}', 80, true),

-- Правило для высокой активности
('Высокая активность', '{"activity_level": ["daily"]}', 85, true),

-- Правило для женщин репродуктивного возраста
('Женщины репродуктивного возраста', '{"gender": ["female"], "age_group": ["18_30", "31_45"]}', 75, true),

-- Правило для пожилых людей
('Пожилые люди', '{"age_group": ["60_plus"]}', 85, true),

-- Правило для плохого питания
('Плохое питание', '{"nutrition": ["rare"]}', 70, true),

-- Правило для жалоб на усталость
('Усталость', '{"complaints": ["fatigue"]}', 80, true),

-- Правило для проблем с кожей
('Проблемы с кожей', '{"complaints": ["skin_issues"]}', 65, true),

-- Правило для проблем со сном
('Проблемы со сном', '{"complaints": ["sleep_problems"]}', 75, true),

-- Правило для проблем с пищеварением
('Проблемы с пищеварением', '{"complaints": ["digestive_issues"]}', 70, true);

-- Связываем товары с правилами
DO $$
DECLARE
    rule_stress UUID;
    rule_low_activity UUID;
    rule_high_activity UUID;
    rule_women UUID;
    rule_elderly UUID;
    rule_nutrition UUID;
    rule_fatigue UUID;
    rule_skin UUID;
    rule_sleep UUID;
    rule_digestion UUID;
    
    prod_d3 UUID;
    prod_mag UUID;
    prod_b_complex UUID;
    prod_omega3 UUID;
    prod_zinc UUID;
    prod_iron UUID;
    prod_coq10 UUID;
    prod_probio UUID;
    prod_vit_c UUID;
    prod_multi_women UUID;
    prod_collagen UUID;
    prod_ashwa UUID;
BEGIN
    -- Получаем ID правил
    SELECT id INTO rule_stress FROM vitamin_rules WHERE name = 'Высокий стресс';
    SELECT id INTO rule_low_activity FROM vitamin_rules WHERE name = 'Низкая активность';
    SELECT id INTO rule_high_activity FROM vitamin_rules WHERE name = 'Высокая активность';
    SELECT id INTO rule_women FROM vitamin_rules WHERE name = 'Женщины репродуктивного возраста';
    SELECT id INTO rule_elderly FROM vitamin_rules WHERE name = 'Пожилые люди';
    SELECT id INTO rule_nutrition FROM vitamin_rules WHERE name = 'Плохое питание';
    SELECT id INTO rule_fatigue FROM vitamin_rules WHERE name = 'Усталость';
    SELECT id INTO rule_skin FROM vitamin_rules WHERE name = 'Проблемы с кожей';
    SELECT id INTO rule_sleep FROM vitamin_rules WHERE name = 'Проблемы со сном';
    SELECT id INTO rule_digestion FROM vitamin_rules WHERE name = 'Проблемы с пищеварением';
    
    -- Получаем ID товаров
    SELECT id INTO prod_d3 FROM products WHERE sku = 'VIT-D3-1000';
    SELECT id INTO prod_mag FROM products WHERE sku = 'MAG-400';
    SELECT id INTO prod_b_complex FROM products WHERE sku = 'B-COMPLEX-50';
    SELECT id INTO prod_omega3 FROM products WHERE sku = 'OMEGA3-1000';
    SELECT id INTO prod_zinc FROM products WHERE sku = 'ZINC-15';
    SELECT id INTO prod_iron FROM products WHERE sku = 'IRON-18';
    SELECT id INTO prod_coq10 FROM products WHERE sku = 'COQ10-100';
    SELECT id INTO prod_probio FROM products WHERE sku = 'PROBIO-50B';
    SELECT id INTO prod_vit_c FROM products WHERE sku = 'VIT-C-1000';
    SELECT id INTO prod_multi_women FROM products WHERE sku = 'MULTI-WOMEN';
    SELECT id INTO prod_collagen FROM products WHERE sku = 'COLLAGEN-PLUS';
    SELECT id INTO prod_ashwa FROM products WHERE sku = 'ASHWAGANDHA-500';
    
    -- Связываем товары с правилами
    INSERT INTO rule_products (rule_id, product_id) VALUES
    -- Стресс: Магний, B-комплекс, Ашваганда
    (rule_stress, prod_mag),
    (rule_stress, prod_b_complex),
    (rule_stress, prod_ashwa),
    
    -- Низкая активность: D3, B-комплекс
    (rule_low_activity, prod_d3),
    (rule_low_activity, prod_b_complex),
    
    -- Высокая активность: Магний, Омега-3, CoQ10
    (rule_high_activity, prod_mag),
    (rule_high_activity, prod_omega3),
    (rule_high_activity, prod_coq10),
    
    -- Женщины: Железо, D3, Мультивитамины
    (rule_women, prod_iron),
    (rule_women, prod_d3),
    (rule_women, prod_multi_women),
    
    -- Пожилые: D3, Омега-3, CoQ10
    (rule_elderly, prod_d3),
    (rule_elderly, prod_omega3),
    (rule_elderly, prod_coq10),
    
    -- Плохое питание: B-комплекс, D3, Омега-3
    (rule_nutrition, prod_b_complex),
    (rule_nutrition, prod_d3),
    (rule_nutrition, prod_omega3),
    
    -- Усталость: B-комплекс, Железо, CoQ10
    (rule_fatigue, prod_b_complex),
    (rule_fatigue, prod_iron),
    (rule_fatigue, prod_coq10),
    
    -- Кожа: Цинк, Омега-3, Коллаген
    (rule_skin, prod_zinc),
    (rule_skin, prod_omega3),
    (rule_skin, prod_collagen),
    
    -- Сон: Магний, Ашваганда
    (rule_sleep, prod_mag),
    (rule_sleep, prod_ashwa),
    
    -- Пищеварение: Пробиотики
    (rule_digestion, prod_probio);
    
END $$;
