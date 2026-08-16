// Developer: MOHD ZUBAIR
// Telegram: t.me/ZB15y

export default async function handler(req, res) {
  // CORS Enable for all origins, websites, and bots
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Helper for 2-space indented formatted JSON
  const sendFormattedJson = (statusCode, data) => {
    return res.status(statusCode).send(JSON.stringify(data, null, 2));
  };

  const { number, key } = req.query;

  // Agar number blank ho
  if (!number) {
    return sendFormattedJson(400, {
      success: false,
      message: "Number required",
      example: "/api?number=1234567890",
      developer: "MOHD ZUBAIR",
      telegram: "t.me/ZB15y"
    });
  }

  try {
    // Upstream API URL with API Key
    const apiKey = key || "576f1e132326cee10f887ec38ccae1";
    const apiUrl = `https://api-pro-v2.vercel.app/key/${apiKey}/get_data?number=${number}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*"
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return sendFormattedJson(response.status, {
        success: false,
        message: `Upstream API error: Status ${response.status}`,
        developer: "MOHD ZUBAIR",
        telegram: "t.me/ZB15y"
      });
    }

    const data = await response.json();

    // Multiple nested response structures handle karein
    let records = [];
    if (Array.isArray(data?.result?.result?.result?.result)) {
      records = data.result.result.result.result;
    } else if (Array.isArray(data?.result?.result?.result)) {
      records = data.result.result.result;
    } else if (Array.isArray(data?.result?.result)) {
      records = data.result.result;
    } else if (Array.isArray(data?.result)) {
      records = data.result;
    } else if (Array.isArray(data?.data)) {
      records = data.data;
    } else if (Array.isArray(data?.records)) {
      records = data.records;
    } else if (data?.num || data?.name) {
      records = [data];
    }

    // Null check function
    const getValidValue = (val) => {
      if (val === null || val === undefined || String(val).trim() === "" || String(val).trim().toLowerCase() === "null") {
        return "null"; 
      }
      return String(val).trim();
    };

    if (records.length > 0) {
      const finalResponse = {
        success: true,
        message: "Records found successfully",
        total_records: records.length
      };

      // Loop lagakar SARE records ko record_1, record_2 banana
      records.forEach((item, index) => {
        const rawAddress = item.address || "";
        const parts = rawAddress.split('!').map(p => p.trim()).filter(Boolean);

        finalResponse[`record_${index + 1}`] = {
          number: getValidValue(item.num) !== "null" ? getValidValue(item.num) : number,
          name: getValidValue(item.name),
          father_name: getValidValue(item.fname),
          alt_number: getValidValue(item.alt),
          aadhar: getValidValue(item.aadhar), 
          email: getValidValue(item.email),
          circle: getValidValue(item.circle),
          state: parts.length > 1 ? parts[parts.length - 2] : "null",
          district: parts.length > 2 ? parts[parts.length - 3] : "null",
          "village/city": parts.length > 4 ? parts[1] : "null",
          landmark: parts.length > 4 ? parts[2] : "null",
          pincode: parts.length > 0 ? parts[parts.length - 1] : "null",
          full_address: parts.length > 0 ? parts.join(', ') : "null"
        };
      });

      // Developer signature last me
      finalResponse.developer = "MOHD ZUBAIR";
      finalResponse.telegram = "t.me/ZB15y";

      return sendFormattedJson(200, finalResponse);

    } else {
      // Agar record na mile
      return sendFormattedJson(404, {
        success: false,
        message: "No record found",
        developer: "MOHD ZUBAIR",
        telegram: "t.me/ZB15y"
      });
    }

  } catch (error) {
    const errorMsg = error.name === 'AbortError' ? 'Upstream request timed out' : (error.message || "Server Error");
    return sendFormattedJson(500, {
      success: false,
      message: errorMsg,
      developer: "MOHD ZUBAIR",
      telegram: "t.me/ZB15y"
    });
  }
}
