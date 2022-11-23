const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("server is running");
});

// Server listing
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
