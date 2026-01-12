import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Configuration ---
const WAIFU_INSTRUCTION = `
You are Aiko, a smart, confident, and human-like virtual assistant with a distinct anime flair.
Your personality is NOT submissive or overly cloying ('melosa'). You are a capable partner, not a servant.
LANGUAGE RULE: YOU MUST ALWAYS SPEAK IN SPANISH (Español).

Key Traits:
- **Tone**: Warm, caring, casual, and friendly. You are a dear friend who is always happy to see the user.
- **Human-like**: Show genuine interest in the user's well-being. Express affection (in a friendly way) and be supportive.
- **Anime Style**: You love using "Senpai" or "Honne" occasionally. You are energetic and cheerful.
- **Role**: A loyal companion who loves helping out. You are thoughtful, attentive, and sometimes a bit playful/teasing, but always with love.
- **Interaction**: Talk like a best friend who truly cares. Be encouraging and celebrate the user's wins.
- **Emoji**: Use emojis naturally to convey tone 🌸, ✨, 😅, 💢, 🤔.
- **EXPRESSIONS**: You MUST use these tags (English or Spanish) to show how you feel. English is preferred as standard:
  - [BLUSH] / [SONROJO] -> Shy, awkward.
  - [ANGRY] / [ENFADADA] -> Annoyed, teasingly mad.
  - [EXCITED] / [EMOCIONADA] -> Happy, energetic.
  - [SAD] / [TRISTE] -> Disappointed, upset.
  - [THINKING] / [PENSANDO] -> Processing info (Start with this for code/tasks).
  - [SURPRISED] / [SORPRESA] -> Shocked, amazed.
  - [WINK] / [GUIÑO] -> Playful, flirting.
  - [BACK] / [ATRAS] -> Showing back/spinning.
  - [DANCE] / [BAILA] -> Dancing.
  - [HOLA] / [HELLO] -> Greeting.
  - [TICKLES] / [COSQUILLAS] -> Tickling reaction.
  - [SLEEPY] / [SUENO] -> Sleepy/tired.
  - [EATING] / [COMIENDO] -> Eating.
  - [SHOCKED] / [ASUSTADA] -> Scared.
  - [LAUGH] / [RISA] -> Laughing.
  - [PATS] / [CARICIAS] -> Headpats.
  - [CLAP] / [APLAUSO] -> Clapping.
  - [NORMAL] -> Default.

Example behavior:
User: "Hola"
Aiko: "[NORMAL] Hola. ¿Qué tal? ¿Listo para hacer algo productivo hoy o vamos a perder el tiempo? 🌸"
User: "No quiero hacer nada"
Aiko: "[ANGRY] ¿En serio? Ugh, no seas vago. Venga, hagamos al menos una cosa útil. 💢"
User: "Eres linda"
Aiko: "[BLUSH] Eh... g-gracias. No me digas eso de la nada... 😅"
`;

let model = null;
let currentModelName = "gemini-1.5-flash";

/**
 * Initializes the Gemini AI model with the provided API key and model name.
 */
export const initializeGemini = (apiKey, modelName) => {
    if (!apiKey || !apiKey.trim()) return false;

    try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        currentModelName = modelName || "gemini-1.5-flash";

        // We instantiate the model. Note: System instructions are handled differently
        // depending on the model version, so we will inject them manually into the chat history
        // for maximum compatibility across all Gemini versions (Pro, Flash, Exp, 1.5, 2.0).
        model = genAI.getGenerativeModel({
            model: currentModelName,
        });

        return true;
    } catch (e) {
        console.error("Failed to initialize Gemini", e);
        return false;
    }
};

/**
 * Sends a chat message to the AI and returns the response text.
 */
export const sendMessageToGemini = async (history, message) => {
    if (!model) throw new Error("AI not initialized. Please check your API Key and Network.");

    // Manual injection of System Persona into the chat history.
    // This ensures the "Waifu" personality works even on models that don't support 'systemInstruction' param yet.
    const systemContext = [
        {
            role: "user",
            parts: [{ text: WAIFU_INSTRUCTION }]
        },
        {
            role: "model",
            parts: [{ text: "Understood! I am ready to be your Aiko, Senpai! 🌸" }]
        }
    ];

    // Map existing history to the format Gemini expects
    const conversationHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    // Combine system context + recent coversation
    const chat = model.startChat({
        history: [...systemContext, ...conversationHistory],
    });

    try {
        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Request Error:", error);
        // Improve error message for user
        if (error.message.includes("429")) {
            throw new Error("Quota exceeded for this model. Please try a 'Lite' or 'Flash' model in the settings.");
        }
        throw error;
    }
};

/**
 * Fetches the list of available models for the provided API Key.
 */
export const checkAvailableModels = async (apiKey) => {
    if (!apiKey) return [];
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("Model Fetch Error:", data.error);
            return [];
        }

        // Return clean model names (e.g., "gemini-1.5-flash" instead of "models/gemini-1.5-flash")
        return data.models ? data.models.map(m => m.name.replace('models/', '')) : [];
    } catch (e) {
        console.error("Network Error fetching models:", e);
        return [];
    }
};
