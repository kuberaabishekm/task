-- Hotel Listing Management System Database Schema
-- Table: hotels

CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(500) NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  price DECIMAL NOT NULL,
  rating DECIMAL DEFAULT 4.5,
  category VARCHAR(100) DEFAULT 'Luxury Hotels',
  location VARCHAR(255) DEFAULT 'New York, USA',
  amenities TEXT DEFAULT 'Free Wi-Fi, Swimming Pool, Parking, Restaurant, Air Conditioning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for title search and price filtering
CREATE INDEX IF NOT EXISTS idx_hotels_title ON hotels(title);
CREATE INDEX IF NOT EXISTS idx_hotels_price ON hotels(price);
CREATE INDEX IF NOT EXISTS idx_hotels_category ON hotels(category);
CREATE INDEX IF NOT EXISTS idx_hotels_rating ON hotels(rating);
