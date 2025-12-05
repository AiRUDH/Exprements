# MySouk Contact Form Integration with Google Sheets

This document provides instructions on how to set up the contact form integration with Google Sheets for the MySouk website.

## Overview

The contact form on the MySouk website is configured to send form submissions to a Google Sheet. This allows you to collect and manage leads efficiently without requiring a complex backend system.

## Setup Instructions

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name the spreadsheet "MySouk Contact Form Responses" or any name you prefer
3. Add the following column headers in the first row:
   - Timestamp
   - Name
   - Email
   - Phone
   - Business
   - Message

### 2. Set Up Google Apps Script

1. With your Google Sheet open, go to **Extensions > Apps Script**
2. Delete any code in the script editor
3. Copy and paste the entire code from the `google-sheets-script.js` file in this repository
4. Save the project with a name (e.g., "MySouk Form Handler")

### 3. Deploy the Web App

1. In the Apps Script editor, click **Deploy > New deployment**
2. Select type: **Web app**
3. Configure the deployment:
   - Description: "MySouk Contact Form Handler"
   - Execute as: **Me** (your Google account)
   - Who has access: **Anyone**
4. Click **Deploy**
5. Authorize the app when prompted
6. Copy the Web app URL that is displayed after deployment

### 4. Update the Website Code

1. Open the `index.html` file in the MySouk website code
2. Find the following line in the JavaScript section (around line 2600):
   ```javascript
   const googleSheetsUrl = 'https://script.google.com/macros/s/YOUR_GOOGLE_SCRIPT_ID/exec';
   ```
3. Replace `YOUR_GOOGLE_SCRIPT_ID` with the Web app URL you copied in step 3.6

## Testing the Integration

1. Open the MySouk website in a browser
2. Navigate to the contact form
3. Fill out the form with test data and submit
4. Check your Google Sheet to verify that the data was received

## Troubleshooting

### Form Submits Successfully But No Data in Sheet

1. Check that the Web app URL is correctly set in the `index.html` file
2. Verify that the Google Apps Script is deployed as a web app with the correct permissions
3. Check the browser console for any JavaScript errors
4. Try accessing the Web app URL directly in a browser to ensure it's active

### CORS Issues

If you encounter CORS (Cross-Origin Resource Sharing) issues, ensure that:

1. The `mode: 'no-cors'` option is set in the fetch request
2. The Google Apps Script is deployed with access set to "Anyone"

## Security Considerations

- The current implementation uses `no-cors` mode which is secure but provides limited error feedback
- The Google Sheet should be shared only with team members who need access to the leads
- Regularly review access permissions to the Google Sheet

## Maintenance

- Periodically check that the form is still submitting data correctly
- If you make changes to the form fields, update the Google Apps Script accordingly
- Consider setting up email notifications in the Google Apps Script for new submissions