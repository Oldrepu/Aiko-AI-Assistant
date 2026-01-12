
export const sendMessageToLocalAI = async (history, message, modelName, onChunk) => {
    const LOCAL_API_URL = "http://localhost:1234/v1/chat/completions";

    // Persona instructions (copied from gemini.js for consistency)
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
`;

    // Map history to OpenAI format
    const messages = [
        { role: "system", content: WAIFU_INSTRUCTION },
        ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text
        })),
        { role: "user", content: message }
    ];

    try {
        const response = await fetch(LOCAL_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: modelName || "local-model",
                messages: messages,
                temperature: 0.7,
                max_tokens: -1,
                stream: !!onChunk // Enable streaming if callback is provided
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "LM Studio Error.");
        }

        if (onChunk) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const dataStr = line.replace("data: ", "").trim();
                        if (dataStr === "[DONE]") break;

                        try {
                            const data = JSON.parse(dataStr);
                            const content = data.choices[0]?.delta?.content || "";
                            if (content) {
                                fullText += content;
                                onChunk(fullText);
                            }
                        } catch (e) {
                            // Skip parse errors for non-json lines
                        }
                    }
                }
            }
            return fullText;
        } else {
            const data = await response.json();
            return data.choices[0].message.content;
        }
    } catch (error) {
        console.error("Local AI Request Error:", error);
        if (error.message.includes("Failed to fetch")) {
            throw new Error("Could not connect to LM Studio. Please ensure it is running and 'Local Server' is ON.");
        }
        throw error;
    }
};

/**
 * Fetches the list of loaded models from LM Studio.
 */
export const checkLocalModels = async () => {
    try {
        const response = await fetch("http://localhost:1234/v1/models");
        const data = await response.json();
        return data.data.map(m => m.id);
    } catch (e) {
        console.error("Failed to fetch local models:", e);
        return [];
    }
};
