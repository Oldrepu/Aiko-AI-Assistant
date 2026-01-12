# 🌸 Aiko: The Next-Gen Virtual AI Companion
 "https://github.com/user-attachments/assets/e1286325-ef1d-4010-978c-0e053e2f2372

Aiko is a highly interactive, premium virtual assistant built with **React 19** and **Vite**. She features a dynamic emotion system, multi-language support (English/Spanish), and real-time video expressions synchronized with AI responses.

![Avatar Preview](https://img.shields.io/badge/Status-Premium-ff7eb3?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2-646cff?style=for-the-badge&logo=vite)
![Tailwind](https://img.shields.io/badge/Design-Glassmorphism-a29bfe?style=for-the-badge)

## ✨ Features

- **🎭 Dynamic Emotion System**: Aiko expresses herself through synchronized video animations (`.mp4`) based on her mood and the conversation context.
- **🌐 Dual Core Intelligence**: Supports both **Google Gemini API** (cloud) and **LM Studio** (fully offline/local).
- **💫 Premium UI/UX**: Neon glassmorphism design with smooth floating animations and responsive layouts.
- **🧹 Tag Filtering**: Advanced regex system that automatically hides technical emotion tags (`[DANCE]`, `[EXCITED]`, etc.) from the chat, keeping the conversation immersive.
- **🇪🇸 Multi-language Support**: Recognizes expressions and speaks natively in Spanish, supporting both English and Spanish emotion synonyms.
- **💾 Persistent Memory**: Automatically saves chat history and settings to local storage.

## 🚀 Quick Start

### 1. Requirements
- **Node.js**: (LTS version)
- **API Key**: A Google Gemini key (optional) or **LM Studio** running locally.

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/aiko-ai-assistant.git

# Enter the project directory
cd aiko-ai-assistant

# Install dependencies
npm install
```

### 3. Multimedia Setup
Aiko needs video files to express herself.
1. Place your `.mp4` files in the `public/` folder.
2. Follow the naming convention: `waifu_normal.mp4`, `waifu_hello.mp4`, etc.
3. See `public/lista_acciones.txt` for the full list of supported animations.

### 4. Running the App
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

## 🛠️ Configuration

- **Local Mode (LM Studio)**: Open LM Studio, start the local server on port `1234`, and enable "Local Mode" in Aiko's settings.
- **Cloud Mode (Gemini)**: Paste your Google API Key in the settings panel to enable cloud-based intelligence.

## 📁 Project Structure

- `src/components/`: UI components (Sidebar, ChatInterface).
- `src/services/`: AI logic for Gemini and LM Studio.
- `public/`: Assets (Videos, Icons).
- `src/index.css`: Premium neon-glassmorphism design system.

## 🤝 Contributing

Contributions are welcome! If you have ideas for new emotions, better UI, or additional AI features, feel free to open an issue or pull request.

---
*Created with 💖 by the Aiko Team. Make the world a better place, one conversation at a time.*
