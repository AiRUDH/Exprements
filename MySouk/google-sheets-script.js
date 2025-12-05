/**
 * Google Apps Script for handling form submissions from MySouk website
 * and updating a Google Sheet with the submitted data.
 *
 * Instructions:
 * 1. Create a new Google Sheet with the following columns:
 *    - Timestamp
 *    - Name
 *    - Email
 *    - Phone
 *    - Business
 *    - Message
 * 2. Open the Google Sheet and go to Extensions > Apps Script
 * 3. Copy and paste this code into the Apps Script editor
 * 4. Save the project with a name (e.g., "MySouk Form Handler")
 * 5. Deploy as a web app:
 *    - Click "Deploy" > "New deployment"
 *    - Select type: "Web app"
 *    - Set "Execute as" to "Me"
 *    - Set "Who has access" to "Anyone"
 *    - Click "Deploy"
 * 6. Copy the web app URL and update the googleSheetsUrl variable in your website's JavaScript
 */

// Global variables
const SHEET_NAME = "Form Responses";

/**
 * Process incoming POST requests from the website form
 */
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Log the received data for debugging
    console.log("Received form submission:", data);
    
    // Save the data to the spreadsheet
    saveToSheet(data);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "Form data saved successfully"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log the error
    console.error("Error processing form submission:", error);
    
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Save the form data to the Google Sheet
 */
function saveToSheet(data) {
  // Get the active spreadsheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Get the sheet or create it if it doesn't exist
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    
    // Add headers if this is a new sheet
    sheet.appendRow([
      "Timestamp",
      "Name",
      "Email",
      "Phone",
      "Business",
      "Message"
    ]);
    
    // Format the header row
    sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
  }
  
  // Prepare the data row
  const rowData = [
    data.timestamp || new Date().toISOString(),
    data.name || "",
    data.email || "",
    data.phone || "",
    data.business || "",
    data.message || ""
  ];
  
  // Append the data to the sheet
  sheet.appendRow(rowData);
}

/**
 * Handle GET requests (for testing)
 */
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "The form submission handler is active. Use POST to submit form data."
  })).setMimeType(ContentService.MimeType.JSON);
}