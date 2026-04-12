const translate = require('google-translate-api-x');

const translateToHindi = async (english_text) => {
    try {
        const result = await translate(english_text, { to: "hi" });
        return result.text;
    } catch (error) {
        console.error(error);
        return null;
    }
}
module.exports = { translateToHindi };
