const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.auth = null;
  }

  async initialize(credentials) {
    try {
      if (!credentials) {
        throw new Error('Google Sheets credentials required');
      }

      // Initialize auth
      this.auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      const authClient = await this.auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: authClient });
      
      return true;
    } catch (error) {
      console.error('Error initializing Google Sheets:', error);
      throw error;
    }
  }

  async createScheduleSpreadsheet(facilityName = 'Family First Program') {
    try {
      const request = {
        resource: {
          properties: {
            title: `${facilityName} - Therapeutic Outing Schedule`,
            locale: 'en_US',
            timeZone: 'America/New_York'
          },
          sheets: [
            {
              properties: {
                sheetId: 0,
                title: 'Schedule',
                gridProperties: {
                  rowCount: 60,
                  columnCount: 10,
                  frozenRowCount: 2
                }
              }
            },
            {
              properties: {
                sheetId: 1,
                title: 'Configuration',
                gridProperties: {
                  rowCount: 20,
                  columnCount: 5
                }
              }
            }
          ]
        }
      };

      const response = await this.sheets.spreadsheets.create(request);
      return response.data;
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw error;
    }
  }

  async updateScheduleSheet(spreadsheetId, schedules, programs, vendors) {
    try {
      const headers = [
        ['THERAPEUTIC OUTING SCHEDULE', '', '', '', '', '', '', '', ''],
        ['Date', 'Banyan', 'Hedge', 'Preserve', 'Cove', 'Meridian', 'Prosperity', 'Notes', 'Updated']
      ];

      const data = [
        ...headers
      ];

      // Sort schedules by date
      schedules.sort((a, b) => new Date(a.schedule_date) - new Date(b.schedule_date));

      // Create program name to column index mapping
      const programColumns = {
        'Banyan': 1,
        'Hedge': 2,
        'Preserve': 3,
        'Cove': 4,
        'Meridian': 5,
        'Prosperity': 6
      };

      // Add schedule data
      for (const schedule of schedules) {
        const row = new Array(9).fill('');
        const scheduleDate = new Date(schedule.schedule_date);
        
        // Format date
        row[0] = scheduleDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          weekday: 'short'
        });

        // Add assignments
        for (const [programName, assignment] of Object.entries(schedule.assignments)) {
          const colIndex = programColumns[programName];
          if (colIndex !== undefined) {
            const vendorName = assignment.vendor || 'TBD';
            const arrivalTime = assignment.arrival_time ? 
              this.formatTime(assignment.arrival_time) : '';
            row[colIndex] = `${vendorName}\n${arrivalTime}`;
          }
        }

        row[8] = new Date().toLocaleString(); // Updated timestamp
        data.push(row);
      }

      // Update values
      const updateValuesRequest = {
        spreadsheetId,
        range: 'Schedule!A1:I100',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: data
        }
      };

      await this.sheets.spreadsheets.values.update(updateValuesRequest);

      // Apply formatting
      await this.applyFormatting(spreadsheetId, programs, vendors);

      return { success: true };
    } catch (error) {
      console.error('Error updating spreadsheet:', error);
      throw error;
    }
  }

  async applyFormatting(spreadsheetId, programs, vendors) {
    try {
      const requests = [];

      // Header formatting
      requests.push({
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 9
          },
          cell: {
            userEnteredFormat: {
              textFormat: {
                fontSize: 16,
                bold: true
              },
              horizontalAlignment: 'CENTER',
              backgroundColor: {
                red: 0.2,
                green: 0.3,
                blue: 0.5
              }
            }
          },
          fields: 'userEnteredFormat(textFormat,horizontalAlignment,backgroundColor)'
        }
      });

      // Column headers formatting
      requests.push({
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 1,
            endRowIndex: 2,
            startColumnIndex: 0,
            endColumnIndex: 9
          },
          cell: {
            userEnteredFormat: {
              textFormat: {
                fontSize: 12,
                bold: true
              },
              horizontalAlignment: 'CENTER',
              backgroundColor: {
                red: 0.9,
                green: 0.9,
                blue: 0.9
              }
            }
          },
          fields: 'userEnteredFormat(textFormat,horizontalAlignment,backgroundColor)'
        }
      });

      // Apply vendor colors based on conditional formatting
      const vendorColorRules = [];
      vendors.forEach((vendor, index) => {
        if (vendor.color) {
          const color = this.hexToRgb(vendor.color);
          vendorColorRules.push({
            booleanRule: {
              condition: {
                type: 'TEXT_CONTAINS',
                values: [{ userEnteredValue: vendor.name }]
              },
              format: {
                backgroundColor: {
                  red: color.r,
                  green: color.g,
                  blue: color.b,
                  alpha: 0.2
                }
              }
            }
          });
        }
      });

      // Apply conditional formatting for each program column
      for (let col = 1; col <= 6; col++) {
        requests.push({
          addConditionalFormatRule: {
            rule: {
              ranges: [{
                sheetId: 0,
                startRowIndex: 2,
                endRowIndex: 100,
                startColumnIndex: col,
                endColumnIndex: col + 1
              }],
              booleanRule: vendorColorRules[col % vendorColorRules.length].booleanRule
            },
            index: 0
          }
        });
      }

      // Column widths
      requests.push({
        updateDimensionProperties: {
          range: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 1
          },
          properties: {
            pixelSize: 120
          },
          fields: 'pixelSize'
        }
      });

      // Program columns width
      for (let i = 1; i <= 6; i++) {
        requests.push({
          updateDimensionProperties: {
            range: {
              sheetId: 0,
              dimension: 'COLUMNS',
              startIndex: i,
              endIndex: i + 1
            },
            properties: {
              pixelSize: 150
            },
            fields: 'pixelSize'
          }
        });
      }

      // Row height
      requests.push({
        updateDimensionProperties: {
          range: {
            sheetId: 0,
            dimension: 'ROWS',
            startIndex: 2,
            endIndex: 100
          },
          properties: {
            pixelSize: 60
          },
          fields: 'pixelSize'
        }
      });

      // Apply all formatting
      const batchUpdateRequest = {
        spreadsheetId,
        resource: {
          requests
        }
      };

      await this.sheets.spreadsheets.batchUpdate(batchUpdateRequest);
    } catch (error) {
      console.error('Error applying formatting:', error);
      throw error;
    }
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 1, g: 1, b: 1 };
  }

  formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHours = h % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  }

  async shareSpreadsheet(spreadsheetId, email, role = 'reader') {
    try {
      const drive = google.drive({ version: 'v3', auth: this.auth });
      
      await drive.permissions.create({
        resource: {
          type: 'user',
          role: role,
          emailAddress: email
        },
        fileId: spreadsheetId,
        fields: 'id'
      });

      return { success: true };
    } catch (error) {
      console.error('Error sharing spreadsheet:', error);
      throw error;
    }
  }
}

module.exports = new GoogleSheetsService();
