-- Create database if not exists
CREATE DATABASE IF NOT EXISTS travel_management;
USE travel_management;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phno VARCHAR(15),
    pwd VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Destinations table
CREATE TABLE IF NOT EXISTS destinations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    country VARCHAR(100),
    image_url VARCHAR(255),
    is_international BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tour packages table
CREATE TABLE IF NOT EXISTS tour_packages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    destination_id INT,
    duration INT,
    price DECIMAL(10,2) NOT NULL,
    max_participants INT DEFAULT 10,
    image_url VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    package_id INT NOT NULL,
    travel_date DATE NOT NULL,
    number_of_people INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES tour_packages(id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT,
    amount DECIMAL(10,2),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Drop existing reviews table if it exists
DROP TABLE IF EXISTS reviews;

-- Create reviews table with correct column name
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    package_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES tour_packages(id)
);

-- Insert sample destinations
INSERT INTO destinations (name, country, description, image_url, is_international) VALUES
('Paris', 'France', 'The City of Light', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a', true),
('Tokyo', 'Japan', 'A blend of modern and traditional', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', true),
('New York', 'USA', 'The city that never sleeps', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', true),
('Swiss Alps', 'Switzerland', 'Majestic mountain ranges', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5', true),
('Bali', 'Indonesia', 'Tropical paradise with rich culture', 'https://images.unsplash.com/photo-1597211684565-dca64d72bdfe', true),
('Dubai', 'UAE', 'Modern marvel in the desert', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', true),
('Sydney', 'Australia', 'Harbor city with iconic landmarks', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9', true),
('Cape Town', 'South Africa', 'Where mountains meet the sea', 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216', true);

-- Insert sample tour packages
INSERT INTO tour_packages (name, description, destination_id, duration, price, max_participants, image_url, status) VALUES
('Paris Explorer', 'Discover the magic of Paris with this comprehensive tour package', 1, 7, 1499.99, 15, 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a', 'active'),
('Tokyo Adventure', 'Experience the blend of traditional and modern Japan', 2, 10, 2499.99, 12, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', 'active'),
('New York City Tour', 'Experience the excitement of the Big Apple', 3, 5, 999.99, 20, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', 'active'),
('Swiss Alps Expedition', 'Adventure in the majestic Swiss Alps', 4, 8, 1899.99, 10, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5', 'active'),
('Bali Paradise', 'Experience the magic of Bali', 5, 8, 1799.99, 15, 'https://images.unsplash.com/photo-1597211684565-dca64d72bdfe', 'active'),
('Dubai Luxury', 'Experience luxury in the desert', 6, 6, 1999.99, 12, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', 'active'),
('Sydney Explorer', 'Discover the beauty of Sydney', 7, 7, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9', 15, 'active'),
('Cape Town Adventure', 'Explore the wonders of Cape Town', 8, 9, 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216', 12, 'active');

-- Insert admin user (password: admin123)
INSERT INTO users (uname, email, phno, pwd, role) VALUES
('Admin User', 'admin@example.com', '1234567890', '$2a$10$XFE/UkHfpPXWVvH8hxqkT.LZJVYGOy0iAL5oq4tqYFBWTg3j2AoSi', 'admin');

-- Add more destinations
INSERT INTO destinations (name, country, description, image_url, is_international) VALUES
('Venice', 'Italy', 'The romantic city of canals and gondolas', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', true),
('Singapore', 'Singapore', 'Modern city-state with stunning architecture and gardens', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd', true),
('Queenstown', 'New Zealand', 'Adventure capital with breathtaking landscapes', 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad', true),
('Marrakech', 'Morocco', 'Ancient city with vibrant markets and culture', 'https://images.unsplash.com/photo-1597211684565-dca64d72bdfe', true),
('Reykjavik', 'Iceland', 'Gateway to northern lights and natural wonders', 'https://images.unsplash.com/photo-1504893524553-b855bce32c67', true),
('Rio de Janeiro', 'Brazil', 'Vibrant city with iconic beaches and landmarks', 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325', true),
('Prague', 'Czech Republic', 'City of hundred spires with medieval charm', 'https://images.unsplash.com/photo-1519677100203-a0e668c92439', true),
('Seoul', 'South Korea', 'Dynamic city blending tradition with technology', 'https://images.unsplash.com/photo-1517154421773-0529f29ea451', true);

-- Add tour packages for new destinations
INSERT INTO tour_packages (destination_id, name, description, duration, price, max_participants, image_url, status) VALUES
-- Venice Packages
((SELECT id FROM destinations WHERE name = 'Venice'), 'Venice Romance', 'Gondola rides and historic tours', 5, 1800, 15, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', 'active'),
((SELECT id FROM destinations WHERE name = 'Venice'), 'Art & Architecture', 'Explore Venetian masterpieces', 4, 1500, 12, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', 'active'),

-- Singapore Packages
((SELECT id FROM destinations WHERE name = 'Singapore'), 'Singapore Highlights', 'Modern attractions and cultural sites', 6, 1900, 20, 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd', 'active'),
((SELECT id FROM destinations WHERE name = 'Singapore'), 'Garden City Tour', 'Nature and city exploration', 5, 1600, 15, 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd', 'active'),

-- Queenstown Packages
((SELECT id FROM destinations WHERE name = 'Queenstown'), 'Adventure Package', 'Bungee jumping and skiing', 7, 2200, 12, 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad', 'active'),
((SELECT id FROM destinations WHERE name = 'Queenstown'), 'Nature Explorer', 'Hiking and scenic tours', 6, 1900, 15, 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad', 'active'),

-- Marrakech Packages
((SELECT id FROM destinations WHERE name = 'Marrakech'), 'Medina Experience', 'Explore ancient markets and palaces', 5, 1400, 16, 'https://images.unsplash.com/photo-1597211684565-dca64d72bdfe', 'active'),
((SELECT id FROM destinations WHERE name = 'Marrakech'), 'Desert Gateway', 'Sahara adventures and cultural tours', 7, 1800, 14, 'https://images.unsplash.com/photo-1597211684565-dca64d72bdfe', 'active'),

-- Reykjavik Packages
((SELECT id FROM destinations WHERE name = 'Reykjavik'), 'Northern Lights', 'Aurora viewing and hot springs', 6, 2500, 15, 'https://images.unsplash.com/photo-1504893524553-b855bce32c67', 'active'),
((SELECT id FROM destinations WHERE name = 'Reykjavik'), 'Iceland Complete', 'Glaciers and volcanic landscapes', 8, 2800, 12, 'https://images.unsplash.com/photo-1504893524553-b855bce32c67', 'active'),

-- Rio de Janeiro Packages
((SELECT id FROM destinations WHERE name = 'Rio de Janeiro'), 'Carnival Experience', 'Beach life and city highlights', 7, 2100, 18, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325', 'active'),
((SELECT id FROM destinations WHERE name = 'Rio de Janeiro'), 'Cultural Rio', 'Historical tours and local cuisine', 5, 1700, 15, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325', 'active'),

-- Prague Packages
((SELECT id FROM destinations WHERE name = 'Prague'), 'Medieval Magic', 'Castle tours and historic walks', 5, 1600, 20, 'https://images.unsplash.com/photo-1519677100203-a0e668c92439', 'active'),
((SELECT id FROM destinations WHERE name = 'Prague'), 'Bohemian Journey', 'Art and cultural exploration', 6, 1800, 15, 'https://images.unsplash.com/photo-1541849454-c4a3501662bb', 'active'),

-- Seoul Packages
((SELECT id FROM destinations WHERE name = 'Seoul'), 'K-Culture Explorer', 'Modern Korea and entertainment', 6, 1900, 18, 'https://images.unsplash.com/photo-1517154421773-0529f29ea451', 'active'),
((SELECT id FROM destinations WHERE name = 'Seoul'), 'Temple & Technology', 'Traditional and modern Korea', 7, 2100, 15, 'https://images.unsplash.com/photo-1517154421773-0529f29ea451', 'active');

-- Update destination images with high-quality, representative images
UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a' WHERE name = 'Paris';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4' WHERE name = 'Venice';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd' WHERE name = 'Singapore';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad' WHERE name = 'Queenstown';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1597211684565-dca64d72bdfe' WHERE name = 'Marrakech';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1504893524553-b855bce32c67' WHERE name = 'Reykjavik';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325' WHERE name = 'Rio de Janeiro';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1519677100203-a0e668c92439' WHERE name = 'Prague';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1517154421773-0529f29ea451' WHERE name = 'Seoul';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4' WHERE name = 'Tokyo';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c' WHERE name = 'Dubai';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1552832230-c0197dd311b5' WHERE name = 'Rome';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1590253230532-a67f6bc61c9e' WHERE name = 'Bali';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9' WHERE name = 'Sydney';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216' WHERE name = 'Barcelona';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e' WHERE name = 'Santorini';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a' WHERE name = 'Cairo';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1526392060635-9d6019884377' WHERE name = 'Machu Picchu';

UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8' WHERE name = 'Maldives';

-- Update missing destination images
UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9' WHERE name = 'New York';
UPDATE destinations SET image_url = 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7' WHERE name = 'Swiss Alps';

-- Update their corresponding tour packages
UPDATE tour_packages tp 
JOIN destinations d ON tp.destination_id = d.id 
SET tp.image_url = d.image_url 
WHERE d.name IN ('New York', 'Swiss Alps');

-- Update corresponding tour packages
UPDATE tour_packages tp 
JOIN destinations d ON tp.destination_id = d.id 
SET tp.image_url = d.image_url 
WHERE d.name = 'Prague';

-- Add some sample reviews
INSERT INTO reviews (user_id, package_id, rating, comment) VALUES
(1, 1, 5, 'Amazing experience! The tour guides were knowledgeable and the itinerary was well-planned.'),
(2, 1, 4, 'Great package overall. The hotel could have been better, but the sightseeing was excellent.'),
(3, 2, 5, 'Perfect family vacation. Kids loved the activities and the staff was very accommodating.');

-- First delete any reviews for Island Paradise
DELETE FROM reviews 
WHERE package_id IN (SELECT id FROM tour_packages WHERE name LIKE '%Island Paradise%');

-- Then delete any bookings
DELETE FROM bookings 
WHERE package_id IN (SELECT id FROM tour_packages WHERE name LIKE '%Island Paradise%');

-- Delete the tour package
DELETE FROM tour_packages WHERE name LIKE '%Island Paradise%';

-- Delete the destination if it exists
DELETE FROM destinations WHERE name LIKE '%Island Paradise%';

-- Remove Water Villa Dream and Dubai Luxury Experience packages
-- First delete any reviews
DELETE FROM reviews 
WHERE package_id IN (
    SELECT id FROM tour_packages 
    WHERE name IN ('Water Villa Dream', 'Dubai Luxury Experience')
);

-- Then delete any bookings
DELETE FROM bookings 
WHERE package_id IN (
    SELECT id FROM tour_packages 
    WHERE name IN ('Water Villa Dream', 'Dubai Luxury Experience')
);

-- Finally delete the packages
DELETE FROM tour_packages 
WHERE name IN ('Water Villa Dream', 'Dubai Luxury Experience');

-- Remove specified tour packages
-- First delete any reviews
DELETE FROM reviews 
WHERE package_id IN (
    SELECT id FROM tour_packages 
    WHERE name IN (
        'Australian Adventure',
        'Traditional Japan',
        'Greek Island Escape',
        'Inca Trail',
        'Sydney Explorer',
        'Cherry Blossom Special',
        'Nile Adventure',
        'Roman Holiday'
    )
);

-- Then delete any bookings
DELETE FROM bookings 
WHERE package_id IN (
    SELECT id FROM tour_packages 
    WHERE name IN (
        'Australian Adventure',
        'Traditional Japan',
        'Greek Island Escape',
        'Inca Trail',
        'Sydney Explorer',
        'Cherry Blossom Special',
        'Nile Adventure',
        'Roman Holiday'
    )
);

-- Finally delete the packages
DELETE FROM tour_packages 
WHERE name IN (
    'Australian Adventure',
    'Traditional Japan',
    'Greek Island Escape',
    'Inca Trail',
    'Sydney Explorer',
    'Cherry Blossom Special',
    'Nile Adventure',
    'Roman Holiday'
);

-- Remove additional tour packages
-- First delete any reviews
DELETE FROM reviews 
WHERE package_id IN (
    SELECT id FROM tour_packages 
    WHERE name IN (
        'Spanish Delight',
        'Sacred Valley',
        'Sunset Special',
        'Barcelona Arts'
    )
);

-- Then delete any bookings
DELETE FROM bookings 
WHERE package_id IN (
    SELECT id FROM tour_packages 
    WHERE name IN (
        'Spanish Delight',
        'Sacred Valley',
        'Sunset Special',
        'Barcelona Arts'
    )
);

-- Finally delete the packages
DELETE FROM tour_packages 
WHERE name IN (
    'Spanish Delight',
    'Sacred Valley',
    'Sunset Special',
    'Barcelona Arts'
);

-- Remove additional tour packages (Desert Adventure, Italian Food Tour, etc.)
-- First delete any reviews
DELETE FROM reviews 
WHERE package_id IN (
    SELECT id FROM tour_packages 
    WHERE name IN (
        'Desert Adventure',
        'Italian Food Tour',
        'Pyramid Explorer',
        'Bali Beach Paradise',
        'Ubud Cultural Tour'
    )
);

-- Then delete any bookings
DELETE FROM bookings 
WHERE package_id IN (
    SELECT id FROM tour_packages 
    WHERE name IN (
        'Desert Adventure',
        'Italian Food Tour',
        'Pyramid Explorer',
        'Bali Beach Paradise',
        'Ubud Cultural Tour'
    )
);

-- Finally delete the packages
DELETE FROM tour_packages 
WHERE name IN (
    'Desert Adventure',
    'Italian Food Tour',
    'Pyramid Explorer',
    'Bali Beach Paradise',
    'Ubud Cultural Tour'
); 