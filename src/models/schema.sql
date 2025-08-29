DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS outing_expectations CASCADE;
DROP TABLE IF EXISTS vendor_rotations CASCADE;

CREATE TABLE facilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  settings JSONB DEFAULT '{}',
  incident_form_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facilities(id),
  name VARCHAR(255) NOT NULL,
  vendor_type VARCHAR(100),
  capacity INTEGER DEFAULT 10,
  contact VARCHAR(255),
  email VARCHAR(255),
  address TEXT,
  phone VARCHAR(50),
  maps_link TEXT,
  color VARCHAR(7), -- Hex color for calendar view
  is_rotation_vendor BOOLEAN DEFAULT false,
  rotation_weeks INTEGER DEFAULT 4, -- How many weeks in rotation
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
  color VARCHAR(7), -- Hex color for PDF rows
  program_coordinator_email VARCHAR(255),
  additional_emails TEXT, -- Comma-separated list of additional emails
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facilities(id),
  schedule_date DATE NOT NULL,
  assignments JSONB DEFAULT '{}',
  locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  UNIQUE(facility_id, schedule_date)
);

CREATE TABLE outing_expectations (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facilities(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendor_rotations (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facilities(id),
  vendor_id INTEGER REFERENCES vendors(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  program_sequence TEXT[], -- Array of program names in rotation order
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO facilities (name, email, incident_form_id) VALUES 
('Family First Program', 'admin@familyfirst.org', NULL);

-- Insert rotation vendors (monthly contracts)
INSERT INTO vendors (facility_id, name, vendor_type, capacity, contact, email, address, phone, maps_link, color, is_rotation_vendor, rotation_weeks) VALUES
(1, 'Johnson Folly Equestrian Farm', 'Equine Therapy', 15, 'Sarah Johnson', 'sarah@johnsonfolly.com', '14052 52nd Ave S, Delray Beach, FL 33484', '555-0100', 'https://maps.google.com/?q=14052+52nd+Ave+S,+Delray+Beach,+FL+33484', '#8B4513', true, 4),
(1, 'Surf Therapy Institute', 'Surf Therapy', 12, 'Mike Waters', 'mike@surftherapy.org', '2800 N Ocean Blvd, Boca Raton, FL 33431', '555-0101', 'https://maps.google.com/?q=2800+N+Ocean+Blvd,+Boca+Raton,+FL+33431', '#1E90FF', true, 4),
(1, 'Peach Painting Studio', 'Art Therapy', 10, 'Emma Artist', 'emma@peachpainting.com', '456 Creative Ave, Delray Beach, FL 33444', '555-0102', 'https://maps.google.com/?q=456+Creative+Ave,+Delray+Beach,+FL+33444', '#FFB6C1', true, 4),
(1, 'Happy Goat Yoga', 'Goat Yoga', 8, 'Tom Farmer', 'tom@happygoatyoga.com', '789 Farm Road, Boynton Beach, FL 33436', '555-0103', 'https://maps.google.com/?q=789+Farm+Road,+Boynton+Beach,+FL+33436', '#98D982', true, 4);

-- Insert other available vendors
INSERT INTO vendors (facility_id, name, vendor_type, capacity, contact, email, address, phone, maps_link, color, is_rotation_vendor) VALUES
(1, 'Nature Walk Park', 'Nature Therapy', 20, 'John Nature', 'john@naturewalks.org', '100 Park Lane, West Palm Beach, FL 33401', '555-0200', 'https://maps.google.com/?q=100+Park+Lane,+West+Palm+Beach,+FL+33401', '#228B22', false),
(1, 'Community Garden', 'Gardening Therapy', 15, 'Lisa Green', 'lisa@communitygarden.org', '200 Garden Way, Lake Worth, FL 33460', '555-0201', 'https://maps.google.com/?q=200+Garden+Way,+Lake+Worth,+FL+33460', '#32CD32', false),
(1, 'Music Therapy Center', 'Music Therapy', 10, 'David Melody', 'david@musictherapy.org', '300 Harmony St, Delray Beach, FL 33483', '555-0202', 'https://maps.google.com/?q=300+Harmony+St,+Delray+Beach,+FL+33483', '#9370DB', false);

-- Insert programs (houses) with their specific colors and times
INSERT INTO programs (facility_id, house_name, tuesday_start, tuesday_end, priority, color, program_coordinator_email) VALUES
(1, 'Banyan', '10:00:00', '12:00:00', 1, '#FF6B6B', 'pc.banyan@familyfirst.org'),
(1, 'Hedge', '11:00:00', '13:00:00', 2, '#4ECDC4', 'pc.hedge@familyfirst.org'),
(1, 'Preserve', '09:00:00', '11:00:00', 1, '#45B7D1', 'pc.preserve@familyfirst.org'),
(1, 'Cove', '14:00:00', '16:00:00', 3, '#96CEB4', 'pc.cove@familyfirst.org'),
(1, 'Meridian', '13:00:00', '15:00:00', 3, '#FECA57', 'pc.meridian@familyfirst.org'),
(1, 'Prosperity', '10:30:00', '12:30:00', 2, '#DDA0DD', 'pc.prosperity@familyfirst.org');

-- Insert outing expectations
INSERT INTO outing_expectations (facility_id, title, content) VALUES
(1, 'Outing Expectations', '✅ Searches: Conduct thorough searches on all clients before they enter the van for transport to and from the outing. If any contraband is found, notify PC/APC''s immediately.

✅ Supervision: Maintain constant supervision of clients throughout the outing. If a client needs to use the restroom, a CA must escort them to it.

✅ Client Conduct:
• Ensure clients do not engage in conversations with the public.
• Be mindful of any wandering behavior—clients should not be looking for cigarettes, vapes, or contraband. Redirect and remain vigilant.

✅ Incident Protocol: If any issues arise, contact PC/APC and transport clients back to the appropriate property as needed.');

-- Email archives table
CREATE TABLE email_archives (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facilities(id),
  house_name VARCHAR(255) NOT NULL,
  schedule_date DATE NOT NULL,
  recipients JSONB NOT NULL, -- JSON array of email addresses
  html_path TEXT NOT NULL, -- Path to archived HTML file
  pdf_path TEXT, -- Path to archived PDF file
  email_type VARCHAR(50) DEFAULT 'schedule_notification', -- 'schedule_notification', 'reminder', 'digest'
  message_id VARCHAR(255), -- Email service message ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_archives_house_date ON email_archives(house_name, schedule_date);
CREATE INDEX idx_email_archives_created_at ON email_archives(created_at);

-- Email settings table
CREATE TABLE email_settings (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facilities(id),
  smtp_host VARCHAR(255) DEFAULT 'smtp.gmail.com',
  smtp_port INTEGER DEFAULT 587,
  smtp_secure BOOLEAN DEFAULT false,
  smtp_user VARCHAR(255),
  smtp_pass VARCHAR(255),
  from_email VARCHAR(255) DEFAULT 'noreply@familyfirst.org',
  admin_email VARCHAR(255),
  daily_reminder_time TIME DEFAULT '07:00:00',
  weekly_digest_day INTEGER DEFAULT 1, -- 1 = Monday
  weekly_digest_time TIME DEFAULT '08:00:00',
  auto_reminders_enabled BOOLEAN DEFAULT true,
  color_coding_enabled BOOLEAN DEFAULT true,
  archive_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default email settings
INSERT INTO email_settings (facility_id) VALUES (1);
