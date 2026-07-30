API Response Transformation Service

A lightweight Node.js API that validates a 10-digit mobile number, fetches data from an upstream lookup service, transforms the response into a clean and structured JSON format, and returns standardized output.

Features

* ✅ 10-digit mobile number validation
* ✅ Upstream API integration
* ✅ Standardized JSON response
* ✅ Address parsing and formatting
* ✅ Error handling for invalid requests and upstream failures
* ✅ CORS support for frontend applications

⸻

Project Structure

.
├── api/
│   └── index.js
├── package.json
└── README.md

⸻

Requirements

* Node.js 18 or later (recommended)
* Internet connection for upstream API access

⸻

API Endpoint

GET /

Query Parameters

Parameter	Type	Required	Description
number	String	Yes	10-digit mobile number 

Successful Response

{
  "success": true,
  "total_records": 1,
  "developer": "MOHD ZUBAIR",
  "telegram": "t.me/ZB15y",
  "data": [
    {
      "number": "9876XXXXXX",
      "name": "John Doe",
      "father_name": "Example Name",
      "alt_number": "8954XXXXXX",
      "email": "john@example.com",
      "aadhar": "XXXXXXXXXXXX",
      "circle": "Example Circle",
      "state": "Uttar Pradesh",
      "district": "BAREILLY",
      "village_city": "KARGAINA,BAREILLY",
      "landmark": "PURANA BZAAR KE PASS………",
      "pincode": "243001",
      "full_address": "KARGAINA,BAREILLY,PURANA BAZAAR ………………… etc 243001"
    }
  ]
}

⸻

Error Response

Invalid Number

{
  "success": false,
  "message": "Number required (10 digits)",
  "example": "/api?number=1234567890"
}

No Records Found

{
  "success": false,
  "message": "No records found"
}

Internal Server Error

{
  "success": false,
  "message": "Internal Server Error or Upstream Service Unavailable"
}

⸻

Address Formatting

The API converts delimiter-based address strings into structured fields.

Example input:

Converted output:
* Name
* Father name
* email address
* alt number
* Aadhar number 
* Landmark
* Village / City
* District
* State
* Pincode
* Full Address

⸻

package.json

{
  "name": "MOHD ZUBAIR",
  "version": "1.0.0",
  "description": "API response format transformation service",
  "main": "api/index.js",
  "scripts": {
    "start": "node api/index.js"
  }
}

⸻

Notes

* Supports CORS for browser-based applications.
* Validates input before contacting the upstream service.
* Returns consistent JSON responses.
* Designed for easy integration with frontend and backend applications.

⸻

Author

MOHD ZUBAIR

Telegram: t.me/ZB15y

⸻

License

This project is provided for educational and personal development purposes. Modify and use it according to your requirements.
