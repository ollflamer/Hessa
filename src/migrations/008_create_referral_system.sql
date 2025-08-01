-- Создание реферальной системы и системы баллов
-- Миграция 008: создание referrals, user_points и point_transactions

-- Расширяем таблицу пользователей реферальными полями
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS points_balance INTEGER DEFAULT 0 CHECK (points_balance >= 0);

-- Создаем индекс для реферального кода
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by_user_id);

-- Таблица реферальных связей (для детальной истории)
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    first_order_date TIMESTAMP WITH TIME ZONE,
    first_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    total_orders INTEGER DEFAULT 0,
    total_earned_points INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(referrer_id, referred_id)
);

-- Таблица транзакций баллов
CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'expired', 'bonus')),
    points_amount INTEGER NOT NULL,
    points_balance_after INTEGER NOT NULL,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('referral', 'order', 'bonus', 'admin', 'usage')),
    source_id UUID, -- ID заказа, реферала или другого источника
    description TEXT,
    referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_source ON point_transactions(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at);

-- Триггер для обновления updated_at в referrals
CREATE OR REPLACE FUNCTION update_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_referrals_updated_at
    BEFORE UPDATE ON referrals
    FOR EACH ROW
    EXECUTE FUNCTION update_referrals_updated_at();

-- Функция для генерации уникального реферального кода
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        -- Генерируем код из 8 символов (буквы и цифры)
        code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
        
        -- Проверяем уникальность
        SELECT COUNT(*) INTO exists_check FROM users WHERE referral_code = code;
        
        IF exists_check = 0 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматической генерации реферального кода при создании пользователя
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code_trigger
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_referral_code();

-- Функция для начисления реферальных баллов
CREATE OR REPLACE FUNCTION award_referral_points(
    p_referrer_id UUID,
    p_order_id UUID,
    p_order_amount DECIMAL,
    p_referral_percentage DECIMAL DEFAULT 0.10
)
RETURNS INTEGER AS $$
DECLARE
    points_to_award INTEGER;
    current_balance INTEGER;
    referral_record_id UUID;
BEGIN
    -- Рассчитываем количество баллов (10% от суммы заказа, округляем вниз)
    points_to_award := FLOOR(p_order_amount * p_referral_percentage);
    
    IF points_to_award <= 0 THEN
        RETURN 0;
    END IF;
    
    -- Получаем текущий баланс пользователя
    SELECT points_balance INTO current_balance 
    FROM users 
    WHERE id = p_referrer_id;
    
    IF current_balance IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Обновляем баланс пользователя
    UPDATE users 
    SET points_balance = points_balance + points_to_award,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_referrer_id;
    
    -- Находим запись реферала
    SELECT r.id INTO referral_record_id
    FROM referrals r
    JOIN orders o ON o.user_id = r.referred_id
    WHERE r.referrer_id = p_referrer_id 
    AND o.id = p_order_id;
    
    -- Обновляем статистику реферала
    IF referral_record_id IS NOT NULL THEN
        UPDATE referrals 
        SET total_orders = total_orders + 1,
            total_earned_points = total_earned_points + points_to_award,
            first_order_date = COALESCE(first_order_date, CURRENT_TIMESTAMP),
            first_order_id = COALESCE(first_order_id, p_order_id),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = referral_record_id;
    END IF;
    
    -- Записываем транзакцию баллов
    INSERT INTO point_transactions (
        user_id, 
        transaction_type, 
        points_amount, 
        points_balance_after, 
        source_type, 
        source_id, 
        order_id,
        referral_id,
        description
    ) VALUES (
        p_referrer_id,
        'earned',
        points_to_award,
        current_balance + points_to_award,
        'referral',
        p_referrer_id,
        p_order_id,
        referral_record_id,
        'Реферальные баллы за заказ №' || (SELECT order_number FROM orders WHERE id = p_order_id)
    );
    
    RETURN points_to_award;
END;
$$ LANGUAGE plpgsql;

-- Генерируем реферальные коды для существующих пользователей
UPDATE users 
SET referral_code = generate_referral_code() 
WHERE referral_code IS NULL OR referral_code = '';

-- Комментарии к таблицам
COMMENT ON TABLE referrals IS 'Таблица реферальных связей между пользователями';
COMMENT ON COLUMN referrals.referrer_id IS 'ID пользователя, который пригласил';
COMMENT ON COLUMN referrals.referred_id IS 'ID приглашенного пользователя';
COMMENT ON COLUMN referrals.total_earned_points IS 'Общее количество заработанных баллов с этого реферала';

COMMENT ON TABLE point_transactions IS 'Таблица транзакций баллов пользователей';
COMMENT ON COLUMN point_transactions.transaction_type IS 'Тип транзакции: earned, spent, expired, bonus';
COMMENT ON COLUMN point_transactions.source_type IS 'Источник баллов: referral, order, bonus, admin, usage';
COMMENT ON COLUMN point_transactions.points_balance_after IS 'Баланс баллов после транзакции';

COMMENT ON COLUMN users.referral_code IS 'Уникальный реферальный код пользователя';
COMMENT ON COLUMN users.referred_by_user_id IS 'ID пользователя, который пригласил данного пользователя';
COMMENT ON COLUMN users.points_balance IS 'Текущий баланс баллов пользователя';
