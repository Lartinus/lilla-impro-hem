-- Convert existing course_purchases.total_amount from kronor to öre
UPDATE course_purchases 
SET total_amount = total_amount * 100 
WHERE total_amount < 100000; -- Safety check to avoid converting already converted values

-- Convert course_instances price fields from kronor to öre  
UPDATE course_instances 
SET 
  price = price * 100,
  discount_price = discount_price * 100
WHERE price < 100000; -- Safety check

-- Convert admin_shows price fields from kronor to öre
UPDATE admin_shows 
SET 
  regular_price = regular_price * 100,
  discount_price = discount_price * 100  
WHERE regular_price < 100000; -- Safety check

-- Convert course_offers price fields from kronor to öre
UPDATE course_offers
SET 
  course_price = course_price * 100,
  course_discount_price = course_discount_price * 100
WHERE course_price < 100000; -- Safety check

-- Convert course_templates price fields from kronor to öre
UPDATE course_templates
SET 
  price = price * 100,
  discount_price = discount_price * 100
WHERE price < 100000; -- Safety check

-- Convert show_templates price fields from kronor to öre  
UPDATE show_templates
SET 
  regular_price = regular_price * 100,
  discount_price = discount_price * 100
WHERE regular_price < 100000; -- Safety check