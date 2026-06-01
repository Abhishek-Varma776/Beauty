const http = require("http");

http.get("http://localhost:5000/api/services", (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    try {
      const parsed = JSON.parse(data);
      console.log(`API returned ${parsed.services ? parsed.services.length : 0} services.`);
      if (parsed.services) {
        parsed.services.forEach((s) => {
          console.log(`- Name: "${s.name}", is_active: ${s.is_active}`);
        });
      }
    } catch (err) {
      console.error("Error parsing response:", err.message);
    }
  });
}).on("error", (err) => {
  console.error("HTTP request error:", err.message);
});
