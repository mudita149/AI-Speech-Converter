const express = require("express");
const app = express();
//const pool = require("./config/db");
const cors = require("cors");
app.use(cors());
app.use(express.json());

const requestRoutes = require("./routes/requestRoutes");

app.use("/requests", requestRoutes);
// this means any url starting with /requests will go to requestRoutes

app.get("/health", (req, res) => {
    res.send("Server is running");
});

app.listen(3001, () => {
    console.log("Server running on port 3001");
});

