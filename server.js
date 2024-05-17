const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  // Allow requests from any origin
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Allow the methods used in the request
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  // Allow the content types used in the request
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // Preflight request, respond with 200 OK
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/update_json") {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      try {
        // Parse JSON data directly as an array
        const cheerMessages = data
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => JSON.parse(line));

        // Write cheer messages to file
        fs.writeFile(
          "cheer_log.json",
          cheerMessages.map((message) => JSON.stringify(message)).join("\n"),
          (err) => {
            if (err) {
              console.error("Error writing JSON file:", err);
              res.statusCode = 500;
              res.end("Internal Server Error");
            } else {
              console.log("JSON file updated successfully");
              res.statusCode = 200;
              res.end("JSON file updated successfully");
            }
          }
        );
      } catch (error) {
        console.error("Error parsing JSON:", error);
        res.statusCode = 400;
        res.end("Bad Request");
      }
    });
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
