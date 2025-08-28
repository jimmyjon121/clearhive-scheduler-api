# Quick Start Guide - Therapeutic Outing Scheduler

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- PostgreSQL installed and running
- Node.js 14+ installed
- (Optional) Gmail account for email notifications
- (Optional) Google Cloud account for Sheets integration

### Step 1: Clone and Install

```bash
git clone https://github.com/yourusername/clearhive-scheduler-api.git
cd clearhive-scheduler-api
npm install
```

### Step 2: Run Setup

```bash
npm run setup
```

Follow the prompts to:
- Configure your database connection
- Create the database tables
- Set up email notifications (optional)
- Configure Google Sheets integration (optional)

### Step 3: Start the Server

```bash
npm start
```

Your API is now running at `http://localhost:3000`

### Step 4: Open the Web Interface

Open `examples/web-interface.html` in your browser to:
- Generate a year of schedules
- View weekly schedules
- Download PDFs
- Send email notifications

## 📊 Understanding the System

### Programs (Houses)
- **Banyan**: 10:00 AM - 12:00 PM (Red)
- **Hedge**: 11:00 AM - 1:00 PM (Teal)
- **Preserve**: 9:00 AM - 11:00 AM (Blue)
- **Cove**: 2:00 PM - 4:00 PM (Green)
- **Meridian**: 1:00 PM - 3:00 PM (Yellow)
- **Prosperity**: 10:30 AM - 12:30 PM (Purple)

### Rotation Vendors
These vendors automatically rotate through all programs weekly:
- **Equine Therapy**: 4-week rotation
- **Surf Therapy**: 4-week rotation
- **Peach Painting**: 4-week rotation
- **Goat Yoga**: 4-week rotation

### Color Coding
- **Program Colors**: Appear as row backgrounds in PDFs
- **Vendor Colors**: Appear as cell tints in Google Sheets

## 🔧 Common Tasks

### Generate Schedules for the Year
```bash
curl -X POST http://localhost:3000/api/v1/advanced-schedules/generate-year \
  -H "Content-Type: application/json" \
  -d '{
    "facility_id": 1,
    "start_date": "2025-09-02",
    "weeks": 52
  }'
```

### Download PDF for Next Tuesday
```bash
curl -O http://localhost:3000/api/v1/advanced-schedules/2025-09-02/pdf
```

### Add a New Vendor
```bash
curl -X POST http://localhost:3000/api/v1/vendors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nature Walk Park",
    "vendor_type": "Nature Therapy",
    "contact": "John Doe",
    "phone": "555-1234",
    "address": "123 Park Lane, City, FL 12345"
  }'
```

## 📱 Key Features

### Automated Scheduling
- Prevents double-booking
- Handles rotation vendors automatically
- Ensures no time conflicts

### PDF Generation
- Color-coded by program
- Click-to-call phone numbers
- Click-to-navigate addresses
- Includes outing expectations

### Google Sheets Integration
- Live calendar view
- Color-coded cells
- Automatic formatting
- Share with view-only access

### Email Notifications
- Sent to program coordinators
- Includes PDF attachment
- Contains all outing details
- Includes safety reminders

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Create database manually if needed
createdb family_first_scheduler
```

### Email Not Working
1. For Gmail, enable 2-factor authentication
2. Generate an app password
3. Update EMAIL_CONFIG in .env

### Google Sheets Issues
1. Enable Google Sheets API in Cloud Console
2. Create service account
3. Download credentials JSON
4. Update GOOGLE_SHEETS_CREDENTIALS in .env

## 📞 Support

For issues or questions:
1. Check the [full documentation](README.md)
2. Review [example code](examples/)
3. Submit an issue on GitHub

## 🎯 Next Steps

1. Customize program schedules in the database
2. Add your vendors with contact information
3. Generate your first yearly schedule
4. Set up automated email notifications
5. Create a Google Sheets calendar view

Happy scheduling! 🗓️
