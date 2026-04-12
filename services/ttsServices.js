const googleTTS = require('google-tts-api');

const generateAudioUrl = async (hindi_text) => {
    try {
        // Instead of a URL, we download the raw audio as a text string!
        const base64 = await googleTTS.getAudioBase64(hindi_text, {
            lang: 'hi',
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
        });
        
        // Return a Data URI that React can play natively without CORS errors
        return `data:audio/mp3;base64,${base64}`;
    } catch (error) {
        console.error("TTS Error:", error);
        return null;
    }
}

module.exports = { generateAudioUrl };
