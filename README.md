# Family First Therapeutic Outing Scheduler API

A comprehensive scheduling system for managing therapeutic outings for multiple residential programs. This system automates the scheduling process, prevents conflicts, generates PDFs, syncs with Google Sheets, and sends email notifications.

## Features

- 🗓️ **Automated Scheduling**: Generate schedules for an entire year with rotation vendor support
- 🎨 **Color-Coded System**: Visual organization with program and vendor colors
- 📄 **PDF Generation**: Professional PDF schedules with all outing details
- 📊 **Google Sheets Integration**: Live calendar sync for easy viewing and sharing
- 📧 **Email Notifications**: Automated notifications to program coordinators
- 🚫 **Conflict Prevention**: Ensures no double-booking or time overlaps
- 📱 **Contact Integration**: Click-to-call and click-to-map functionality

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Features in Detail](#features-in-detail)
- [Database Schema](#database-schema)
- [Usage Examples](#usage-examples)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/clearhive-scheduler-api.git
cd clearhive-scheduler-api
```

2. Install dependencies:
```bash
npm install
```

3. Run the setup script:
```bash
node src/cli/setup.js
```

4. Start the server:
```bash
npm start
```

## Configuration

### Environment Variables

Create a `.env` file with the following configuration:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/family_first_scheduler

# Server
PORT=3000
NODE_ENV=development

# Email Configuration (optional)
EMAIL_CONFIG={"host":"smtp.gmail.com","port":587,"secure":false,"user":"your-email@gmail.com","pass":"your-app-password"}

# Google Sheets Configuration (optional)
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account","project_id":"your-project",...}
```

### Database Setup

The system uses PostgreSQL. Run the schema file to create all necessary tables:

```bash
psql -U postgres -d family_first_scheduler -f src/models/schema.sql
```

## API Documentation

### Programs (Houses)

#### List all programs
```
GET /api/v1/programs?facility_id=1
```

#### Create a program
```
POST /api/v1/programs
{
  "house_name": "Banyan",
  "tuesday_start": "10:00:00",
  "tuesday_end": "12:00:00",
  "priority": 1,
  "color": "#FF6B6B",
  "program_coordinator_email": "pc.banyan@familyfirst.org"
}
```

### Vendors

#### List all vendors
```
GET /api/v1/vendors?facility_id=1
```

#### Create a vendor
```
POST /api/v1/vendors
{
  "name": "Johnson Folly Equestrian Farm",
  "vendor_type": "Equine Therapy",
  "capacity": 15,
  "contact": "Sarah Johnson",
  "email": "sarah@johnsonfolly.com",
  "address": "14052 52nd Ave S, Delray Beach, FL 33484",
  "phone": "555-0100",
  "maps_link": "https://maps.google.com/?q=14052+52nd+Ave+S,+Delray+Beach,+FL+33484",
  "color": "#8B4513",
  "is_rotation_vendor": true,
  "rotation_weeks": 4
}
```

### Schedule Management

#### Generate yearly schedule
```
POST /api/v1/advanced-schedules/generate-year
{
  "facility_id": 1,
  "start_date": "2025-09-02",
  "weeks": 52
}
```

#### Get schedule details for a date
```
GET /api/v1/advanced-schedules/2025-09-02/details?facility_id=1
```

#### Download PDF schedule
```
GET /api/v1/advanced-schedules/2025-09-02/pdf?facility_id=1
```

#### Send email notifications
```
POST /api/v1/advanced-schedules/2025-09-02/notify
{
  "programs": ["Banyan", "Hedge"] // Optional - sends to all if not specified
}
```

#### Sync with Google Sheets
```
POST /api/v1/advanced-schedules/sync-sheets
{
  "date_range": {
    "start": "2025-09-01",
    "end": "2025-12-31"
  },
  "spreadsheet_id": "existing-sheet-id" // Optional - creates new if not provided
}
```

## Features in Detail

### Rotation Vendors

The system supports vendors on monthly rotation contracts. These vendors automatically rotate through all programs on a weekly basis. For example:
- Week 1: Equine Therapy → Banyan
- Week 2: Equine Therapy → Hedge
- Week 3: Equine Therapy → Preserve
- etc.

### Color Coding System

- **Program Colors**: Each house has a designated color that appears as row backgrounds in PDFs
- **Vendor Colors**: Vendors have tint colors that appear in Google Sheets cells

### Conflict Prevention

The system automatically prevents:
- Multiple programs being assigned to the same vendor at overlapping times
- Programs being double-booked
- Invalid time slots

### PDF Generation

PDFs include:
- Color-coded rows by program
- Vendor contact information with click-to-call
- Address with click-to-map functionality
- Outing expectations/rules
- Optional QR code for incident reporting

### Email Notifications

Program coordinators receive:
- HTML email with outing details
- PDF attachment with full schedule
- Standard outing expectations

## Database Schema

### Key Tables

- `facilities`: Multi-tenant support for different facilities
- `programs`: Houses/programs with schedules and colors
- `vendors`: Outing providers with contact details
- `schedules`: Weekly schedule assignments
- `vendor_rotations`: Rotation patterns for monthly contract vendors
- `outing_expectations`: Standard rules and reminders

## Usage Examples

### Generate a Year of Schedules

```javascript
// Using fetch or axios
const response = await fetch('http://localhost:3000/api/v1/advanced-schedules/generate-year', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    facility_id: 1,
    start_date: '2025-09-02',
    weeks: 52
  })
});
```

### Update a Single Assignment

```javascript
const response = await fetch('http://localhost:3000/api/v1/advanced-schedules/2025-09-02/assignment', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    program_name: 'Banyan',
    vendor_id: 5,
    facility_id: 1
  })
});
```

## Development

### Running in Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

### Database Migrations

Place migration files in `src/migrations/` and run:

```bash
npm run migrate
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env
   - Verify database exists

2. **Email Not Sending**
   - Check EMAIL_CONFIG in .env
   - For Gmail, use App Passwords
   - Ensure less secure app access is enabled

3. **Google Sheets Not Working**
   - Verify service account has Sheets API enabled
   - Check GOOGLE_SHEETS_CREDENTIALS format
   - Ensure service account has edit access to sheet

## License

This project is licensed under the MIT License.
