export default async function handler(req, res) {
  // CORS Enable
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sendFormattedJson = (statusCode, data) => {
    return res.status(statusCode).send(JSON.stringify(data, null, 2));
  };

  const { number } = req.query;

  // Agar number blank ho
  if (!number) {
    return sendFormattedJson(400, {
      success: false,
      message: "Number required",
      example: "/api?number=8954285xxx",
      developer: "MOHD ZUBAIR",
      telegram: "t.me/ZB15y"
    });
  }

  try {
    const apiUrl = `https://api-pro-v2.vercel.app/key/576f1e132326cee10f887ec38ccae1/get_data?number=${encodeURIComponent(number)}`;
    
    // Proper browser headers taaki request block na ho
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      return sendFormattedJson(502, {
        success: false,
        message: "Original API returned non-JSON response (possibly blocked or down)",
        raw_response: rawText.substring(0, 300),
        developer: "MOHD ZUBAIR",
        telegram: "t.me/ZB15y"
      });
    }

    // Har tarah ke format se records dhoondhna
    let records = [];
    if (Array.isArray(data)) {
      records = data;
    } else if (Array.isArray(data?.result?.result?.result?.result)) {
      records = data.result.result.result.result;
    } else if (Array.isArray(data?.result?.result)) {
      records = data.result.result;
    } else if (Array.isArray(data?.result)) {
      records = data.result;
    } else if (Array.isArray(data?.data)) {
      records = data.data;
    } else if (data?.result && typeof data.result === 'object') {
      records = [data.result];
    } else if (data?.data && typeof data.data === 'object') {
      records = [data.data];
    }

    if (records.length > 0) {
      const getValidValue = (val) => {
        if (val === null || val === undefined || String(val).trim() === "" || String(val).trim() === "null") {
          return "null"; 
        }
        return String(val).trim();
      };

      const finalResponse = {
        success: true,
        message: "Records found successfully",
        total_records: records.length
      };

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

      finalResponse.developer = "MOHD ZUBAIR";
      finalResponse.telegram = "t.me/ZB15y";

      return sendFormattedJson(200, finalResponse);

    } else {
      return sendFormattedJson(404, {
        success: false,
        message: "No record found",
        original_response: data,
        developer: "MOHD ZUBAIR",
        telegram: "t.me/ZB15y"
      });
    }

  } catch (error) {
    return sendFormattedJson(500, {
      success: false,
      message: "Server Error, please try again",
      error_detail: error.message,
      developer: "MOHD ZUBAIR",
      telegram: "t.me/ZB15y"
    });
  }
}
