const express = require("express");
const app = express();
//const pool = require("./config/db");
const cors = require("cors");
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

const requestRoutes = require("./routes/requestRoutes");

app.use("/requests", requestRoutes);
// this means any url starting with /requests will go to requestRoutes

app.get("/health", (req, res) => {
    res.send("Server is running");
});

app.get("/db-test", async (req, res) => {
    const pool = require("./config/db");
    try {
        const client = await pool.connect();
        client.release();
        res.status(200).json({ status: "Success", message: "Connected to DB" });
    } catch (err) {
        res.status(500).json({ status: "Failed", error: err.message, code: err.code });
    }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Start the background worker process
require('./worker.js');
