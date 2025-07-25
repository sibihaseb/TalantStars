ALTER TABLE promo_codes 
ADD COLUMN IF NOT EXISTS discount_duration_months INTEGER,
ADD COLUMN IF NOT EXISTS auto_downgrade_on_expiry BOOLEAN DEFAULT false;
