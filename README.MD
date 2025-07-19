# 🚀 commitsense — AI-Powered Git Commit Summarizer 🧠✨

`commitsense` is a CLI tool that reads your Git commit history and uses **Google Gemini** AI to generate clean, easy-to-understand project summaries — perfect for release notes, daily standups, or quick tweet-sized updates!

---

## ⚡ Features

- 📜 Parses recent Git commits
- 🤖 Uses Gemini AI to create meaningful summaries
- 📝 Supports multiple output formats: release notes, tweets, standups
- 🔧 Simple CLI interface: just run `gitsense`
- 🔒 Secure API key handling with environment variables

---

## 🛠️ Getting Started

### 1️⃣ Get Your Gemini API Key 🔑

Sign up or log in to the [Google Gemini platform](https://example.com) and generate your API key.

### 2️⃣ Set Your API Key 🔐

Create a `.env` file in your project root (or wherever you run the CLI) with:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Important:** Never commit your `.env` file! Add `.env` to `.gitignore` to keep your key safe.

Alternatively, you can set the key directly in your shell:

```bash
# macOS/Linux
export GEMINI_API_KEY=your_gemini_api_key_here

# Windows CMD
set GEMINI_API_KEY=your_gemini_api_key_here

# PowerShell
$Env:GEMINI_API_KEY="your_gemini_api_key_here"
```

---

### 3️⃣ Install & Link Locally (for developers) 🔧

If you’re working on the CLI locally:

```bash
npm install
npm run build        # compile TypeScript
npm link             # makes `commitsense` available globally
```

---

### 4️⃣ Run the CLI 🚀

Simply run:

```bash
gitsense
```

Watch your commit history get transformed into clear, AI-powered summaries!

---

### 5️⃣ Using CLI Flags for More Control 🎛️

You can pass your Gemini API key directly as a command-line flag instead of using environment variables:

```bash
gitsense --api-key your_gemini_api_key_here


## ⚠️ Troubleshooting & Tips

- ❌ **No API key?** The CLI will remind you to set `GEMINI_API_KEY`.
- 🛡️ **Keep your API key secret!** Use environment variables, never hardcode keys.
- 💡 Want more control? Future releases may support CLI flags or config files.

---

## ❤️ Contributing

Feel free to open issues or PRs — contributions are welcome!

---

## 📄 License

MIT License © Shehab Dawiri
```
