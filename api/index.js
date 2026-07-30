// api/index.js

export default async function handler(req, res) {
  // CORS Headers (Optional: Agar browser se frontend call karna ho)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 1. Query parameter validation
  const { number } = req.query;

  if (!number || number.trim().length !== 10 || isNaN(number)) {
    return res.status(400).json({
      success: false,
      message: "Number required (10 digits)",
      example: "/api?number=1234567890",
      developer: "MOHD ZUBAIR",
      telegram: "t.me/ZB15y"
    });
  }

  try {
    // 2. Upstream API call (Generic Example URL)
    const upstreamUrl = `https://api-pro-v2.vercel.app/key/576f1e132326cee10f887ec38ccae1/get_data?number=${encodeURIComponent(number)}`;
    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Upstream API returned status: ${response.status}`);
    }

    const rawData = await response.json();

    // 3. Response validation check
    if (!rawData || !rawData.result) {
      return res.status(404).json({
        success: false,
        message: "No records found",
        developer: "MOHD ZUBAIR",
        telegram: "t.me/ZB15y"
      });
    }

    // 4. Transform & Format Data
    // Agar address "!12!bhatpar!..." jaise format mein ho toh usko split karke clean fields bana sakte hain
    const formattedResults = [];
    const resultsObj = rawData.result;

    for (const key in resultsObj) {
      const item = resultsObj[key];
      
      // Address parser example (delimiter separated strings ko split karna)
      const addressParts = (item.address || "").split("!").filter(Boolean);
      const landmark = addressParts[0] || "N/A";
      const villageCity = addressParts[1] || "N/A";
      const district = addressParts[4] || "N/A";
      const state = addressParts[6] || "N/A";
      const pincode = addressParts[7] || "N/A";

      formattedResults.push({
        number: item.num || number,
        name: item.name || "N/A",
        father_name: item.fname || "N/A",
        alt_number: item.alt || "N/A",
        email: item.email || "N/A",
        aadhar: item.aadhar || "N/A",
        circle: item.circle || "N/A",
        state: state,
        district: district,
        village_city: villageCity,
        landmark: landmark,
        pincode: pincode,
        full_address: addressParts.join(", ")
      });
    }

    // 5. Final Formatted JSON Response
    return res.status(200).json({
      success: true,
      total_records: formattedResults.length,
      developer: "MOHD ZUBAIR",
      telegram: "t.me/ZB15y",
      data: formattedResults
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error or Upstream Service Unavailable",
      error: error.message,
      developer: "MOHD ZUBAIR",
      telegram: "t.me/ZB15y"
    });
  }
}
