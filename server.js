import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

const sendFormattedJson = (res, statusCode, data) => {
  return res.status(statusCode).send(JSON.stringify(data, null, 2));
};

const getValidValue = (val) => {
  if (val === null || val === undefined || String(val).trim() === "" || String(val).trim().toLowerCase() === "null") {
    return "null";
  }
  return String(val).trim();
};

app.get("/api", async (req, res) => {
  const { number, key } = req.query;

  if (!number) {
    return sendFormattedJson(res, 400, {
      success: false,
      message: "Number required",
      example: "/api?number=1234567890",
      developer: "MOHD ZUBAIR",
      telegram: "t.me/ZB15y"
    });
  }

  try {
    const apiKey = key || "576f1e132326cee10f887ec38ccae1";
    const apiUrl = `https://api-pro-v2.vercel.app/key/${apiKey}/get_data?number=${number}`;

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      return sendFormattedJson(res, response.status, {
        success: false,
        message: `Upstream API error: Status ${response.status}`,
        developer: "MOHD ZUBAIR",
        telegram: "t.me/ZB15y"
      });
    }

    const data = await response.json();

    // Safe multi-level extraction
    let records = [];
    if (Array.isArray(data?.result?.result?.result?.result)) {
      records = data.result.result.result.result;
    } else if (Array.isArray(data?.result?.result)) {
      records = data.result.result;
    } else if (Array.isArray(data?.result)) {
      records = data.result;
    } else if (Array.isArray(data?.data)) {
      records = data.data;
    }

    if (records.length > 0) {
      const finalResponse = {
        success: true,
        message: "Records found successfully",
        total_records: records.length
      };

      records.forEach((item, index) => {
        const rawAddress = item.address || "";
        const parts = rawAddress.split("!").map(p => p.trim()).filter(Boolean);

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
          full_address: parts.length > 0 ? parts.join(", ") : "null"
        };
      });

      finalResponse.developer = "MOHD ZUBAIR";
      finalResponse.telegram = "t.me/ZB15y";

      return sendFormattedJson(res, 200, finalResponse);
    } else {
      return sendFormattedJson(res, 404, {
        success: false,
        message: "No record found",
        developer: "MOHD ZUBAIR",
        telegram: "t.me/ZB15y"
      });
    }
  } catch (error) {
    return sendFormattedJson(res, 500, {
      success: false,
      message: "Server Error: " + (error.message || "Unknown error"),
      developer: "MOHD ZUBAIR",
      telegram: "t.me/ZB15y"
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
