DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;

CREATE TABLE facilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facilities(id),
  name VARCHAR(255) NOT NULL,
  vendor_type VARCHAR(100),
  capacity INTEGER DEFAULT 10,
  contact VARCHAR(255),
  address TEXT,
  phone VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE programs (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facilities(id),
  house_name VARCHAR(255) NOT NULL,
  tuesday_start TIME,
  tuesday_end TIME,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facilities(id),
  schedule_date DATE NOT NULL,
  assignments JSONB DEFAULT '{}',
  locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255)
);

INSERT INTO facilities (name, email) VALUES ('Family First Test', 'admin@familyfirst.org');

INSERT INTO vendors (facility_id, name, vendor_type, capacity, contact, address, phone) VALUES
(1, 'Adventure Park', 'Recreation', 15, 'John Smith', '123 Fun St', '555-0100'),
(1, 'City Museum', 'Educational', 20, 'Jane Doe', '456 Culture Ave', '555-0101'),
(1, 'Sports Complex', 'Athletic', 25, 'Bob Johnson', '789 Sport Blvd', '555-0102'),
(1, 'Art Studio', 'Creative', 12, 'Alice Brown', '321 Creative Lane', '555-0103');

INSERT INTO programs (facility_id, house_name, tuesday_start, tuesday_end, priority) VALUES
(1, 'House Alpha', '09:00:00', '11:00:00', 1),
(1, 'House Beta', '10:00:00', '12:00:00', 2),
(1, 'House Gamma', '13:00:00', '15:00:00', 1);
