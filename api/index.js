export default async function handler(req, res) {
  // CORS Enable
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');

  const sendFormattedJson = (statusCode, data) => {
    return res.status(statusCode).send(JSON.stringify(data, null, 2));
  };

  const { number } = req.query;

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
    const apiUrl = `https://api-pro-v2.vercel.app/key/576f1e132326cee10f887ec38ccae1/get_data?number=${number}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Original API se SARE records nikalna
    const records = data?.result?.result?.result?.result || [];

    // Filter hata diya gaya hai! Ab jitne bhi records aayenge sab show honge.
    if (records.length > 0) {
      const getValidValue = (val) => {
        if (val === null || val === undefined || String(val).trim() === "") {
          return "null"; 
        }
        return String(val).trim();
      };

      // Shuruwat ka response format
      const finalResponse = {
        success: true,
        message: "Records found successfully",
        total_records: records.length // Ye batayega total kitne records mile 
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
          email: getValidValue(item.email),   // Email aadhar ke niche
          circle: getValidValue(item.circle),
          state: parts.length > 1 ? parts[parts.length - 2] : "null",
          district: parts.length > 2 ? parts[parts.length - 3] : "null",
          "village/city": parts.length > 4 ? parts[1] : "null",
          landmark: parts.length > 4 ? parts[2] : "null",
          pincode: parts.length > 0 ? parts[parts.length - 1] : "null",
          full_address: parts.length > 0 ? parts.join(', ') : "null"
        };
      });

      // Saare records ke baad ekdum LAST me Developer details daalna
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
    return sendFormattedJson(500, {
      success: false,
      message: "Server Error, please try again",
      developer: "MOHD ZUBAIR",
      telegram: "t.me/ZB15y"
    });
  }
}
