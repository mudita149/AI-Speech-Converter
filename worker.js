const pool = require('./config/db');
const { translateToHindi } = require('./services/translationServices');
const { generateAudioUrl } = require('./services/ttsServices');

const processQueue = async () => {
    // 1. Grab a dedicated client from the pool to hold the transaction lock
    const client = await pool.connect();

    try {
        await client.query("BEGIN"); // Start Transaction!

        // 2. FIFO Queue Select: Find oldest pending row & LOCK IT for this worker
        const result = await client.query(
            "SELECT * FROM requests WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED"
        );

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");
            return; // No tasks pending
        }

        const task = result.rows[0];
        console.log(`Picked up task ID: ${task.id} inside transaction lock`);

        // 3. Mark as 'processing'
        await client.query("UPDATE requests SET status = 'processing' WHERE id = $1", [task.id]);
        await client.query("COMMIT");

        // 4. Do the AI work
        // SIMULATION: Since the actual AI is so fast, we add an artificial 5 second delay
        // here so that you can visibly demonstrate the Queue System to recruiters!
        console.log(`Task ${task.id} is doing heavy AI processing... (5 second simulated delay)`);
        await new Promise(resolve => setTimeout(resolve, 5000)); 

        const hindi_text = await translateToHindi(task.english_text);
        const audio_url = await generateAudioUrl(hindi_text);

        // 5. Build final DB query
        await pool.query(
            "UPDATE requests SET hindi_text = $1, audio_url = $2, status = 'completed' WHERE id = $3",
            [hindi_text, audio_url, task.id]
        );
        console.log(`Task ${task.id} successfully processed and marked 'completed'!`);

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Worker Error:", error);
    } finally {
        // ALWAYS release the client
        client.release();
    }
};

console.log("Strict FIFO Queue Worker successfully started. Waiting for jobs...");
setInterval(processQueue, 5000);
