BEGIN TRANSACTION;

-- Insert Categories
INSERT INTO categories (id, name, description, image_url, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'อาหารสุนัข', 'อาหารคุณภาพสูงสำหรับสุนัขทุกวัย ทุกสายพันธุ์', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222222', 'อาหารแมว', 'อาหารโภชนาการครบถ้วนสำหรับแมวรักของคุณ', 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=400', CURRENT_TIMESTAMP),
('33333333-3333-3333-3333-333333333333', 'ขนมสุนัข', 'ขนมและของว่างสำหรับสุนัข เสริมสุขภาพและความสุข', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444444', 'ขนมแมว', 'ขนมแมวแสนอร่อย ช่วยดูแลสุขภาพฟัน', 'https://images.unsplash.com/photo-1569591159212-b02ea8a9f239?w=400', CURRENT_TIMESTAMP);

-- Insert Products
INSERT INTO products (id, name, description, price, stock, category_id, brand, weight, image_url, created_at, updated_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Royal Canin Medium Adult', 'อาหารสุนัขพันธุ์กลาง อายุ 1-7 ปี มีสารอาหารครบถ้วน ช่วยเสริมสร้างระบบภูมิคุ้มกัน', 1599.00, 45, '11111111-1111-1111-1111-111111111111', 'Royal Canin', '3kg', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Pedigree Adult Dry Food', 'อาหารเม็ดสำหรับสุนัขโต รสเนื้อไก่และผัก มีวิตามินครบถ้วน', 899.00, 60, '11111111-1111-1111-1111-111111111111', 'Pedigree', '3kg', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Whiskas Tuna Selection', 'อาหารแมวเปียก รสทูน่าคัดสรร โปรตีนสูง เหมาะสำหรับแมวทุกวัย', 45.00, 150, '222222222222-2222-2222-2222-222222222222', 'Whiskas', '85g', 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Me-O Adult Cat Food', 'อาหารเม็ดแมวโต รสปลาทะเล ช่วยลดก้อนขน บำรุงผิวหนังและขน', 299.00, 80, '22222222-2222-2222-2222-222222222222', 'Me-O', '1.2kg', 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Royal Canin Persian Adult', 'อาหารแมวเปอร์เซีย สูตรพิเศษ ช่วยลดก้อนขน บำรุงขนให้สวยงาม', 1899.00, 25, '22222222-2222-2222-2222-222222222222', 'Royal Canin', '2kg', 'https://images.unsplash.com/photo-1573865526739-10c1dd3e8b87?w=400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Pedigree Dentastix', 'ขนมสุนัข ช่วยทำความสะอาดฟัน ลดคราบพลัค กลิ่นปากสดชื่น', 189.00, 100, '33333333-3333-3333-3333-333333333333', 'Pedigree', '180g', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('gggggggg-gggg-gggg-gggg-gggggggggggg', 'SmartHeart Dog Treats', 'ขนมสุนัข รสไก่ย่าง อุดมด้วยโปรตีน ไม่มีสีและกลิ่นเทียม', 129.00, 120, '33333333-3333-3333-3333-333333333333', 'SmartHeart', '100g', 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Ciao Churu Chicken', 'ขนมแมวเนื้อสัมผัสครีมมี่ รสไก่ เสริมน้ำให้แมว อร่อยและมีประโยชน์', 159.00, 90, '44444444-4444-4444-4444-444444444444', 'Ciao', '14g x 4', 'https://images.unsplash.com/photo-1569591159212-b02ea8a9f239?w=400', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

COMMIT;
