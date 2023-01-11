// Initializing the libraries
const express = require("express");
const cors = require("cors");

// Use 'Express' methods
const app = express();
app.use(express.json({ extended: true, limit: "50mb" }));
require("dotenv").config();

app.use(cors());

// Importing routes
const excel = require("./routes/excel");

// API routers
app.get("/", async (req, res) => {
  return res.send("PLEASE LEAVE! You are NOT AUTHORIZED to access this link.");
});

app.use("/files", excel);

// Getting the server Live!
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
