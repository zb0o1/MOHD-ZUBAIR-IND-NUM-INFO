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
      example: "/api?number=895428xxxx",
      developer: "MOHD ZUBAIR",
      telegram: "t.me/ZB15y"
    });
  }

  try {
    const apiUrl = `https://api-pro-v2.vercel.app/key/576f1e132326cee10f887ec38ccae1/get_data?number=${encodeURIComponent(number)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    const data = await response.json();

    // Original API se results array nikalna (har format support karega)
    const records = 
      data?.result?.result?.result?.results || 
      data?.result?.result?.result?.result || 
      data?.result?.result?.results ||
      data?.result?.results || 
      data?.results || 
      [];

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
        
        let parts = [];
        let state = "null";
        let district = "null";
        let villageCity = "null";
        let landmark = "null";
        let pincode = "null";

        // Agar address me '!' delimiter ho
        if (rawAddress.includes('!')) {
          parts = rawAddress.split('!').map(p => p.trim()).filter(Boolean);
          state = parts.length > 1 ? parts[parts.length - 2] : "null";
          district = parts.length > 2 ? parts[parts.length - 3] : "null";
          villageCity = parts.length > 4 ? parts[1] : "null";
          landmark = parts.length > 4 ? parts[2] : "null";
          pincode = parts.length > 0 ? parts[parts.length - 1] : "null";
        } else {
          // Normal space-separated address
          const words = rawAddress.split(/\s+/).filter(Boolean);
          const pinMatch = rawAddress.match(/\b\d{6}\b/);
          pincode = pinMatch ? pinMatch[0] : (words.length > 0 ? words[words.length - 1] : "null");

          // Auto-detect common state/district if available
          if (words.length >= 4) {
            state = words.slice(-3, -1).join(' '); // Jaise 'Uttar Pradesh'
            district = words[words.length - 4] || "null";
          }
        }

        const fullAddress = rawAddress.trim() ? rawAddress.trim() : "null";

        finalResponse[`record_${index + 1}`] = {
          number: getValidValue(item.mobile || item.num || item.number) !== "null" 
                  ? getValidValue(item.mobile || item.num || item.number) 
                  : number,
          name: getValidValue(item.name),
          father_name: getValidValue(item.fname || item.father_name),
          alt_number: getValidValue(item.alt || item.alt_number),
          aadhar: getValidValue(item.id || item.aadhar), 
          email: getValidValue(item.email),
          circle: getValidValue(item.circle),
          state: state,
          district: district,
          "village/city": villageCity,
          landmark: landmark,
          pincode: pincode,
          full_address: fullAddress
        };
      });

      finalResponse.developer = "MOHD ZUBAIR";
      finalResponse.telegram = "t.me/ZB15y";

      return sendFormattedJson(200, finalResponse);

    } else {
      return sendFormattedJson(404, {
        success: false,
        message: "No record found",
        developer: "MOHD ZUBAIR",
        telegram: "t.me/ZB15y"
      });
    }

  } catch (error) {
    return sendFormattedJson(500, {
      success: false,
      message: "Server Error, please try again",
      developer: "MOHD ZUBAIR",
      telegram: "t.me/ZB15y"
    });
  }
}
