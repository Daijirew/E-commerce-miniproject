-- Insert Categories for Supabase (PostgreSQL)
INSERT INTO categories (id, name, description, image_url, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'อาหารสุนัข', 'อาหารคุณภาพสูงสำหรับสุนัขทุกวัย ทุกสายพันธุ์', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', NOW()),
('22222222-2222-2222-2222-222222222222', 'อาหารแมว', 'อาหารโภชนาการครบถ้วนสำหรับแมวรักของคุณ', 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=400', NOW()),
('33333333-3333-3333-3333-333333333333', 'ขนมสุนัข', 'ขนมและของว่างสำหรับสุนัข เสริมสุขภาพและความสุข', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', NOW()),
('44444444-4444-4444-4444-444444444444', 'ขนมแมว', 'ขนมแมวแสนอร่อย ช่วยดูแลสุขภาพฟัน', 'https://images.unsplash.com/photo-1569591159212-b02ea8a9f239?w=400', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Products
INSERT INTO products (id, name, description, price, stock, category_id, brand, weight, image_url, created_at, updated_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Royal Canin Medium Adult', 'อาหารสุนัขพันธุ์กลาง อายุ 1-7 ปี มีสารอาหารครบถ้วน ช่วยเสริมสร้างระบบภูมิคุ้มกัน', 1599.00, 45, '11111111-1111-1111-1111-111111111111'::uuid, 'Royal Canin', '3kg', 'https://familypetcentre.co.za/cdn/shop/products/medium-adult-7-dog-food_1_1200x.jpg?v=1520516952', NOW(), NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Pedigree Adult Dry Food', 'อาหารเม็ดสำหรับสุนัขโต รสเนื้อไก่และผัก มีวิตามินครบถ้วน', 899.00, 60, '11111111-1111-1111-1111-111111111111'::uuid, 'Pedigree', '3kg', 'https://gourmetmarketthailand.com/_next/image?url=https%3A%2F%2Fmedia-stark.gourmetmarketthailand.com%2Fproducts%2Fcover%2F9334214022925-1.webp&w=1200&q=75', NOW(), NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Whiskas Tuna Selection', 'อาหารแมวเปียก รสทูน่าคัดสรร โปรตีนสูง เหมาะสำหรับแมวทุกวัย', 45.00, 150, '22222222-2222-2222-2222-222222222222'::uuid, 'Whiskas', '85g', 'https://tailybuddy.com/products/598/%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%96%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B8%AB%E0%B8%99%E0%B9%89%E0%B8%B2%E0%B8%88%E0%B8%AD_2024-02-08_%E0%B9%80%E0%B8%A7%E0%B8%A5%E0%B8%B2_16.15.17.png', NOW(), NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Me-O Adult Cat Food', 'อาหารเม็ดแมวโต รสปลาทะเล ช่วยลดก้อนขน บำรุงผิวหนังและขน', 299.00, 80, '22222222-2222-2222-2222-222222222222'::uuid, 'Me-O', '1.2kg', 'https://tailybuddy.com/products/743/8850477001732.jpg', NOW(), NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Royal Canin Persian Adult', 'อาหารแมวเปอร์เซีย สูตรพิเศษ ช่วยลดก้อนขน บำรุงขนให้สวยงาม', 1899.00, 25, '22222222-2222-2222-2222-222222222222'::uuid, 'Royal Canin', '2kg', 'https://www.central.co.th/_next/image?url=https%3A%2F%2Fassets.central.co.th%2Ffile-assets%2FCDSPIM%2Fweb%2FImage%2FMKP1225%2FRoyalCanin-PersianAdultDryCatFood2kg-MKP1225786-1.webp&w=1080&q=75', NOW(), NOW()),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Pedigree Dentastix', 'ขนมสุนัข ช่วยทำความสะอาดฟัน ลดคราบพลัค กลิ่นปากสดชื่น', 189.00, 100, '33333333-3333-3333-3333-333333333333'::uuid, 'Pedigree', '180g', 'https://www.petnme.co.th/wp-content/uploads/2024/05/1305000020001-1.jpg', NOW(), NOW()),
('a1b2c3d4-e5f6-1234-5678-9abcdef01234', 'SmartHeart Dog Treats', 'ขนมสุนัข รสไก่ย่าง อุดมด้วยโปรตีน ไม่มีสีและกลิ่นเทียม', 129.00, 120, '33333333-3333-3333-3333-333333333333'::uuid, 'SmartHeart', '100g', 'https://www.petz.world/wp-content/uploads/2020/07/sh-dog-treat-bf.jpg', NOW(), NOW()),
('fedcba98-7654-3210-fedc-ba9876543210', 'Ciao Churu Chicken', 'ขนมแมวเนื้อสัมผัสครีมมี่ รสไก่ เสริมน้ำให้แมว อร่อยและมีประโยชน์', 159.00, 90, '44444444-4444-4444-4444-444444444444'::uuid, 'Ciao', '14g x 4', 'https://www.petz.world/wp-content/uploads/2022/11/2b5d0ecd16fbf78d4cc28503396b2e4b.jpg', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
