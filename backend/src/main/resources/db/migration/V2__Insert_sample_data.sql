-- Sample Data for Online Bookstore
-- Version 2.0.0 - Initial Sample Data

-- Insert sample users
INSERT INTO users (id, email, password, first_name, last_name, phone_number, role, street, city, state, zip_code, country, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@bookstore.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Admin', 'User', '+1-555-0101', 'ADMIN', '123 Admin St', 'New York', 'NY', '10001', 'USA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440002', 'john.doe@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'John', 'Doe', '+1-555-0102', 'USER', '456 User Ave', 'Los Angeles', 'CA', '90210', 'USA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440003', 'jane.smith@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Jane', 'Smith', '+1-555-0103', 'USER', '789 Customer Blvd', 'Chicago', 'IL', '60601', 'USA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440004', 'bob.wilson@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Bob', 'Wilson', '+1-555-0104', 'USER', '321 Reader Rd', 'Houston', 'TX', '77001', 'USA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440005', 'alice.brown@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Alice', 'Brown', '+1-555-0105', 'USER', '654 Book Lane', 'Phoenix', 'AZ', '85001', 'USA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample books
INSERT INTO books (id, title, author, isbn, description, price, category, stock_quantity, image_url, published_date, created_at, updated_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.', 12.99, 'Fiction', 50, 'https://example.com/images/great-gatsby.jpg', '1925-04-10', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440002', 'To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'A gripping tale of racial injustice and childhood innocence in the American South.', 14.99, 'Fiction', 30, 'https://example.com/images/mockingbird.jpg', '1960-07-11', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440003', '1984', 'George Orwell', '9780451524935', 'A dystopian social science fiction novel about totalitarian control and surveillance.', 13.99, 'Fiction', 40, 'https://example.com/images/1984.jpg', '1949-06-08', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440004', 'Pride and Prejudice', 'Jane Austen', '9780141439518', 'A romantic novel that critiques the British landed gentry at the end of the 18th century.', 11.99, 'Romance', 25, 'https://example.com/images/pride-prejudice.jpg', '1813-01-28', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440005', 'The Catcher in the Rye', 'J.D. Salinger', '9780316769174', 'A controversial novel about teenage rebellion and alienation in post-war America.', 13.50, 'Fiction', 35, 'https://example.com/images/catcher-rye.jpg', '1951-07-16', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440006', 'Clean Code', 'Robert C. Martin', '9780132350884', 'A handbook of agile software craftsmanship with practical advice for writing clean, maintainable code.', 42.99, 'Technology', 20, 'https://example.com/images/clean-code.jpg', '2008-08-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440007', 'Design Patterns', 'Gang of Four', '9780201633612', 'Elements of reusable object-oriented software design patterns.', 54.99, 'Technology', 15, 'https://example.com/images/design-patterns.jpg', '1994-10-21', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440008', 'The Lean Startup', 'Eric Ries', '9780307887894', 'How todays entrepreneurs use continuous innovation to create radically successful businesses.', 28.99, 'Business', 30, 'https://example.com/images/lean-startup.jpg', '2011-09-13', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440009', 'Sapiens', 'Yuval Noah Harari', '9780062316097', 'A brief history of humankind from the Stone Age to the present.', 16.99, 'History', 45, 'https://example.com/images/sapiens.jpg', '2014-02-10', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440010', 'The Art of War', 'Sun Tzu', '9781599869773', 'Ancient Chinese military treatise on strategy and tactics.', 9.99, 'Philosophy', 60, 'https://example.com/images/art-of-war.jpg', '2009-03-17', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440011', 'Harry Potter and the Philosophers Stone', 'J.K. Rowling', '9780439708180', 'The first book in the magical Harry Potter series.', 8.99, 'Fantasy', 100, 'https://example.com/images/harry-potter-1.jpg', '1997-06-26', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440012', 'The Lord of the Rings', 'J.R.R. Tolkien', '9780544003415', 'Epic high fantasy novel set in Middle-earth.', 19.99, 'Fantasy', 75, 'https://example.com/images/lotr.jpg', '1954-07-29', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440013', 'Dune', 'Frank Herbert', '9780441172719', 'Science fiction epic set on the desert planet Arrakis.', 15.99, 'Science Fiction', 40, 'https://example.com/images/dune.jpg', '1965-08-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440014', 'The Hitchhikers Guide to the Galaxy', 'Douglas Adams', '9780345391803', 'Humorous science fiction series about space travel and the meaning of life.', 12.99, 'Science Fiction', 55, 'https://example.com/images/hitchhikers-guide.jpg', '1979-10-12', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440015', 'Thinking, Fast and Slow', 'Daniel Kahneman', '9780374533557', 'Exploration of the two systems that drive the way we think.', 17.99, 'Psychology', 25, 'https://example.com/images/thinking-fast-slow.jpg', '2011-10-25', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample carts
INSERT INTO carts (id, user_id, created_at, updated_at) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample cart items
INSERT INTO cart_items (id, cart_id, book_id, quantity, unit_price, total_price) VALUES
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 2, 12.99, 25.98),
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440006', 1, 42.99, 42.99),
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 1, 13.99, 13.99),
('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440011', 3, 8.99, 26.97),
('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440009', 1, 16.99, 16.99);

-- Insert sample orders
INSERT INTO orders (id, order_number, user_id, status, shipping_street, shipping_city, shipping_state, shipping_zip_code, shipping_country, billing_street, billing_city, billing_state, billing_zip_code, billing_country, total_amount, shipping_cost, tax_amount, payment_status, created_at, updated_at) VALUES
('950e8400-e29b-41d4-a716-446655440001', 'ORD-1707123456789-001', '550e8400-e29b-41d4-a716-446655440002', 'DELIVERED', '456 User Ave', 'Los Angeles', 'CA', '90210', 'USA', '456 User Ave', 'Los Angeles', 'CA', '90210', 'USA', 71.97, 5.99, 5.99, 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('950e8400-e29b-41d4-a716-446655440002', 'ORD-1707123456790-002', '550e8400-e29b-41d4-a716-446655440003', 'SHIPPED', '789 Customer Blvd', 'Chicago', 'IL', '60601', 'USA', '789 Customer Blvd', 'Chicago', 'IL', '60601', 'USA', 46.95, 5.99, 3.99, 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('950e8400-e29b-41d4-a716-446655440003', 'ORD-1707123456791-003', '550e8400-e29b-41d4-a716-446655440004', 'CONFIRMED', '321 Reader Rd', 'Houston', 'TX', '77001', 'USA', '321 Reader Rd', 'Houston', 'TX', '77001', 'USA', 22.98, 5.99, 1.99, 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Insert sample order items
INSERT INTO order_items (id, order_id, book_id, quantity, unit_price, total_price) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 2, 12.99, 25.98),
('a50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 1, 14.99, 14.99),
('a50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440004', 2, 11.99, 23.98),
('a50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 1, 13.99, 13.99),
('a50e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440011', 2, 8.99, 17.98),
('a50e8400-e29b-41d4-a716-446655440006', '950e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440009', 1, 16.99, 16.99),
('a50e8400-e29b-41d4-a716-446655440007', '950e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440009', 1, 16.99, 16.99);

-- Insert sample payments
INSERT INTO payments (id, order_id, status, amount, currency, transaction_id, payment_method_id, created_at, completed_at, updated_at) VALUES
('b50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'COMPLETED', 71.97, 'USD', 'txn_1234567890abcdef', 'pm_card_visa', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),
('b50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440002', 'COMPLETED', 46.95, 'USD', 'txn_2345678901bcdefg', 'pm_card_mastercard', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('b50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440003', 'COMPLETED', 22.98, 'USD', 'txn_3456789012cdefgh', 'pm_card_amex', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Update book stock quantities to reflect orders
UPDATE books SET stock_quantity = stock_quantity - 2 WHERE id = '650e8400-e29b-41d4-a716-446655440001'; -- The Great Gatsby
UPDATE books SET stock_quantity = stock_quantity - 1 WHERE id = '650e8400-e29b-41d4-a716-446655440002'; -- To Kill a Mockingbird
UPDATE books SET stock_quantity = stock_quantity - 2 WHERE id = '650e8400-e29b-41d4-a716-446655440003'; -- 1984
UPDATE books SET stock_quantity = stock_quantity - 2 WHERE id = '650e8400-e29b-41d4-a716-446655440004'; -- Pride and Prejudice
UPDATE books SET stock_quantity = stock_quantity - 2 WHERE id = '650e8400-e29b-41d4-a716-446655440009'; -- Sapiens
UPDATE books SET stock_quantity = stock_quantity - 4 WHERE id = '650e8400-e29b-41d4-a716-446655440011'; -- Harry Potter

-- Add some additional sample data for testing

-- Insert more users for testing pagination
INSERT INTO users (email, password, first_name, last_name, phone_number, role, created_at, updated_at) VALUES
('test1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Test', 'User1', '+1-555-0201', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('test2@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Test', 'User2', '+1-555-0202', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('test3@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Test', 'User3', '+1-555-0203', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert more books for testing search and pagination
INSERT INTO books (title, author, isbn, description, price, category, stock_quantity, published_date, created_at, updated_at) VALUES
('The Hobbit', 'J.R.R. Tolkien', '9780547928227', 'A fantasy adventure that precedes The Lord of the Rings.', 13.99, 'Fantasy', 80, '1937-09-21', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Brave New World', 'Aldous Huxley', '9780060850524', 'A dystopian novel about a technologically advanced future society.', 14.99, 'Science Fiction', 35, '1932-08-30', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Alchemist', 'Paulo Coelho', '9780061122415', 'A philosophical novel about following ones dreams.', 13.99, 'Philosophy', 45, '1988-08-17', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Steve Jobs', 'Walter Isaacson', '9781451648539', 'Biography of Apple co-founder Steve Jobs.', 16.99, 'Biography', 30, '2011-10-24', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The 7 Habits of Highly Effective People', 'Stephen Covey', '9781982137274', 'Self-help book about personal effectiveness.', 15.99, 'Self-Help', 40, '1989-08-15', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add some comments for documentation
COMMENT ON TABLE users IS 'Sample users include admin and regular users with complete profiles';
COMMENT ON TABLE books IS 'Sample books across various categories with realistic pricing and stock levels';
COMMENT ON TABLE orders IS 'Sample orders showing different statuses and payment states';
COMMENT ON TABLE payments IS 'Sample payments with completed transactions';

-- Note: All sample passwords are hashed version of 'password123'
-- In a real application, users would set their own passwords during registration