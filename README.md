# 🌐 Inclusive Web Reader

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://github.com/yourusername/inclusive-web-reader)
[![Built with Chrome AI](https://img.shields.io/badge/Built%20with-Chrome%20AI-34A853)](https://developer.chrome.com/docs/ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Making the web accessible for everyone using Chrome's built-in AI—completely offline and private.**

An AI-powered Chrome extension that brings comprehensive web accessibility features to your browser: summarize articles, translate languages, simplify complex text, and proofread grammar. All powered by Chrome's built-in AI APIs with Gemini Nano, running entirely on-device for complete privacy.

---

## ✨ Features

### 📄 **Content Summarization**
Extract key points from long articles in seconds using the **Summarizer API**
- One-click summarization of entire webpages
- Bullet-point format for quick comprehension
- Perfect for research, news, and time-saving

### 🌍 **Real-Time Translation**
Translate text into 20+ languages with the **Translator API**
- Spanish, French, German, Chinese, Japanese, Arabic, and more
- Select any text and get instant translations
- Works completely offline after initial setup
- No data sent to external servers

### 📝 **Text Simplification**
Transform complex content into easy-to-understand language using the **Rewriter API**
- Converts technical jargon to simple vocabulary
- Maintains original meaning while improving readability
- Ideal for students, non-native speakers, and accessibility

### ✅ **Grammar Proofreading**
Correct spelling, grammar, and punctuation with the **Proofreader API**
- Professional-grade corrections
- Instant feedback for writing improvement
- Perfect for drafting responses and comments

### 🖼️ **Image Analysis** (Coming Soon)
AI-generated descriptions of images using the **Prompt API**
- Right-click any image for natural language descriptions
- Accessibility compliance with alt-text generation
- Multimodal understanding of visual content

---

## 🎯 Why This Extension?

- **🔒 100% Private**: All AI processing happens on your device—no data ever leaves your computer
- **⚡ Works Offline**: Once AI models download, everything works without internet
- **🌟 Accessible**: Helps millions including students, researchers, non-native speakers, and people with disabilities
- **🚀 Fast**: Near-instant results after initial model download
- **🆓 Open Source**: MIT licensed, fully auditable codebase

---

## 📦 Installation

### Prerequisites
- **Chrome Canary** (version 128+) or Chrome Dev Channel
- **Chrome Built-in AI Early Preview Program** enrollment
- Experimental flags enabled

### Step-by-Step Setup

1. **Download Chrome Canary**
   ```
   https://www.google.com/chrome/canary/
   ```

2. **Join Chrome Built-in AI Early Preview Program**
   ```
   https://developer.chrome.com/docs/ai/join-epp
   ```

3. **Enable Required Flags**
   - Navigate to: `chrome://flags/#enable-experimental-web-platform-features`
   - Set to: **Enabled**
   - Navigate to: `chrome://flags/#optimization-guide-on-device-model`
   - Set to: **Enabled BypassPerfRequirement**
   - **Restart Chrome completely**

4. **Install Extension**
   - Go to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top right)
   - Click **"Load unpacked"**
   - Select this extension folder
   - Extension icon should appear in toolbar

5. **First Use**
   - On first feature use, Gemini Nano model will download (~10-60 seconds)
   - Progress displayed in UI
   - Subsequent uses are instant

---

## 🚀 Usage

### Summarize Webpage
1. Navigate to any article or webpage
2. Click the extension icon in toolbar
3. Click **"Summarize Page"** button
4. Key points appear in floating overlay (bottom-right)

### Translate Text
1. Select any text on webpage
2. Click extension icon
3. Choose source and target languages
4. Click **"Translate"** button
5. Translation appears in overlay

### Simplify Text
1. Select complex text
2. Click extension icon
3. Click **"Simplify Text"** button
4. Simplified version appears in overlay

### Proofread Text
1. Select text to check
2. Click extension icon
3. Click **"Proofread Text"** button
4. Corrected version appears in overlay

### Analyze Images (Coming Soon)
1. Right-click on any image
2. Select **"Analyze Image with AI"**
3. Description appears in notification

---

## 🛠️ Technical Details

### Chrome AI APIs Integrated
This extension showcases **5 different Chrome Built-in AI APIs**:

| API             | Purpose                    | Implementation                           |
| --------------- | -------------------------- | ---------------------------------------- |
| **Summarizer**  | Extract key points         | `type: 'key-points'`                     |
| **Translator**  | Cross-language translation | 20+ languages supported                  |
| **Rewriter**    | Text simplification        | `tone: 'more-casual', length: 'shorter'` |
| **Proofreader** | Grammar correction         | `outputLanguage: 'en'`                   |
| **Prompt**      | Multimodal image analysis  | Planned feature                          |

### Architecture
- **Manifest V3** for modern Chrome extensions
- **Content Scripts** for page interaction
- **Page MAIN World** execution for AI API access
- **Chrome Message Passing** for component communication
- **On-device Processing** with Gemini Nano

### Privacy & Security
- ✅ All AI runs locally on your device
- ✅ No data transmitted to external servers
- ✅ No tracking or analytics
- ✅ Works offline after model download
- ✅ Open source code (MIT License)

---

## 🧪 Testing

### Quick Test Guide
1. **Summarization**: Visit any news article → Click "Summarize Page"
2. **Translation**: Select Spanish text → Translate to English
3. **Simplification**: Select technical paragraph → Click "Simplify Text"
4. **Proofreading**: Select text with errors → Click "Proofread Text"
5. **Offline Test**: Disconnect internet → Repeat above (should still work)

### Recommended Test Websites
- News: [CNN.com](https://www.cnn.com), [BBC.com](https://www.bbc.com)
- Foreign Language: [ElPais.com](https://elpais.com) (Spanish)
- Technical: [Wikipedia](https://wikipedia.org) articles
- Any webpage with text content

---

## 🐛 Troubleshooting

### "AI API not available" Error
- Ensure you've enabled both required flags (see Installation step 3)
- Restart Chrome **completely** (quit and reopen)
- Verify Chrome Canary version is 128+
- Check enrollment in Early Preview Program

### First Use is Slow
- Normal! Gemini Nano model downloads on first use (10-60 seconds)
- Download happens once per API
- Watch for progress indicator in UI
- Subsequent uses are near-instant

### Features Not Working
- Check browser console for specific errors (`F12` → Console tab)
- Verify extension is enabled in `chrome://extensions/`
- Reload extension after enabling flags
- Ensure you've clicked buttons (user activation required)

### More Help
See detailed troubleshooting in the repository issues section.

---

## 📊 Project Stats

- **Lines of Code**: ~400 JavaScript
- **APIs Used**: 5 Chrome Built-in AI APIs
- **AI Model**: Gemini Nano (on-device)
- **Privacy**: 100% local processing
- **Offline**: ✅ Full functionality
- **License**: MIT (Open Source)

---

## 🤝 Contributing

Contributions welcome! This is an open-source project built for the **Google Chrome Built-in AI Challenge 2025**.

### How to Contribute
1. Fork this repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 Feedback

We actively encourage feedback! For the **Most Valuable Feedback Prize**, please test the extension and complete this form:

**Chrome AI Feedback Form**: https://forms.gle/V3QzcVcNMotTiYdd9

Your feedback helps improve Chrome's AI APIs for the entire developer community.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🏆 Hackathon

Built for the **Google Chrome Built-in AI Challenge 2025**  
Category: **Most Helpful - Chrome Extension**

---

## 🙏 Acknowledgments

- Google Chrome Team for Built-in AI APIs
- Chrome Built-in AI Early Preview Program
- Gemini Nano team for on-device AI capabilities

---

**Made with ❤️ for web accessibility**