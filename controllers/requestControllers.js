const pool = require("../config/db");

const createRequest = async (req, res) => {
    const { english_text } = req.body;

    if (!english_text) {
        return res.status(400).json({ error: "no english text recieved" })
    }
    try {
        const result = await pool.query(
            "INSERT INTO requests (english_text, status) VALUES ($1, 'pending') RETURNING *",
            [english_text]
        )

        res.status(201).json({
            message: "English Text Recieved",
            data: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "database error" })
    }
}
const getRequests = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM requests");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "database error" })
    }
}

const updateRequest = async (req, res) => {
    const { id } = req.params;
    const { english_text } = req.body;

    if (!english_text) {
        return res.status(400).json({ error: "no english text recieved" })
    }
    try {
        const result = await pool.query(
            "UPDATE requests SET english_text = $1 WHERE id = $2 RETURNING *",
            [english_text, id]
        )

        res.status(200).json({
            message: "English Text Updated",
            data: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "database error" })
    }
}

const deleteRequest = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM requests WHERE id = $1 RETURNING *",
            [id]
        )

        res.status(200).json({
            message: "English Text Deleted",
            data: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "database error" })
    }
}

module.exports = { createRequest,getRequests, updateRequest, deleteRequest };

