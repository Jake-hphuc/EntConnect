const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini API client if API key is present
const aiClient = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

exports.chat = async (req, res) => {
    try {
        const { message, eventsContext } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        if (!aiClient) {
            return res.status(503).json({ 
                success: false, 
                message: 'AI Service is currently unavailable (Missing API Key).',
                reply: 'Tính năng AI hiện đang bảo trì. Vui lòng thử lại sau.' 
            });
        }

        // Prepare context
        let contextText = `Bạn là Trợ lý AI của nền tảng EntConnect. 
Nền tảng này kết nối người dùng tham gia các hoạt động giải trí thực tế (như Gaming, Âm nhạc, Thể thao, Boardgame...).
Nhiệm vụ của bạn là tư vấn, gợi ý sự kiện phù hợp một cách thân thiện, ngắn gọn và hữu ích.
Hãy trả lời câu hỏi của người dùng dựa trên danh sách sự kiện hiện có dưới đây.
Nếu tìm thấy sự kiện phù hợp, hãy nhắc đến tên sự kiện.
`;

        if (eventsContext && Array.isArray(eventsContext)) {
            contextText += `\nDanh sách sự kiện hiện có trên hệ thống:\n`;
            eventsContext.forEach(ev => {
                const isFree = !ev.pricing || ev.pricing.isFree || ev.pricing.price === 0;
                const priceText = isFree ? 'Miễn phí' : `${ev.pricing?.price} VND`;
                contextText += `- [ID: ${ev._id}] Tên: "${ev.title}" (Thể loại: ${ev.category}) - ${priceText}. Địa điểm: ${ev.location?.venue?.name || 'Online'}\n`;
            });
        }

        // Combine context and user message
        const prompt = `${contextText}\n\nNgười dùng nói: "${message}"\nAI Trợ lý:`;

        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const replyText = response.text || "Xin lỗi, tôi không thể trả lời lúc này.";

        // Optional: Extract recommended IDs from text if AI mentioned them, but for simplicity,
        // let the frontend fuzzy match based on AI's text or we can just return the text.
        // The frontend ai-assistant.js currently tries to fuzzy match.

        res.json({
            success: true,
            reply: replyText
        });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process AI request',
            error: error.message 
        });
    }
};
