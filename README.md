# Economic Crises Explained

A documentary series and companion book covering seventeen major economic crises from 1720 to today — their causes, human cost, policy responses, and lessons learned.

**Watch the series:** [YouTube Playlist](https://www.youtube.com/playlist?list=PLZdiqjR6mTJDI3-T2o-ZK6ycQl9AfJ65b)
**Read the book:** [algiras.github.io/economic-crises](https://algiras.github.io/economic-crises/)
**Download PDF:** [Economic-Crises-Explained.pdf](https://algiras.github.io/economic-crises/book/Economic-Crises-Explained.pdf)

## Episodes

| # | Crisis | Period | Video |
|---|--------|--------|-------|
| Intro | Economic Crises (series intro) | — | [▶](https://www.youtube.com/watch?v=eftN-1paKvA) |
| 1 | The South Sea Bubble | 1720 | [▶](https://www.youtube.com/watch?v=ZOD-uVHhqHA) |
| 2 | The Long Depression | 1873–1896 | [▶](https://www.youtube.com/watch?v=EkXC3367roM) |
| 3 | The Panic of 1907 | 1907 | [▶](https://www.youtube.com/watch?v=f5wp8Q8g8Eg) |
| 4 | The Weimar Hyperinflation | 1921–1923 | [▶](https://www.youtube.com/watch?v=Mjnc1c7sTEM) |
| 5 | The Great Depression | 1929–1939 | [▶](https://www.youtube.com/watch?v=4n8vXthEAPw) |
| 6 | The 1970s Stagflation | 1973–1982 | [▶](https://www.youtube.com/watch?v=UzD4kmW3eOE) |
| 7 | The Latin American Debt Crisis | 1982–1989 | [▶](https://www.youtube.com/watch?v=W4wBi1Pw53g) |
| 8 | Black Monday | 1987 | [▶](https://www.youtube.com/watch?v=f2EuKHBETLg) |
| 9 | The Japanese Lost Decade | 1990–2000 | [▶](https://www.youtube.com/watch?v=B6wy0taYqHQ) |
| 10 | The Asian Financial Crisis | 1997–1998 | [▶](https://www.youtube.com/watch?v=Oj2nrI4srQM) |
| 11 | The LTCM Collapse | 1998 | [▶](https://www.youtube.com/watch?v=eQ55LN3fqIQ) |
| 12 | The Dot-com Crash | 2000–2001 | [▶](https://www.youtube.com/watch?v=oRlwT_PDYFc) |
| 13 | The Argentine Crisis | 2001–2002 | [▶](https://www.youtube.com/watch?v=3yp3obZRM70) |
| 14 | The Global Financial Crisis | 2008–2012 | [▶](https://www.youtube.com/watch?v=8EBJcquPcy4) |
| 15 | The Eurozone Debt Crisis | 2010–2012 | [▶](https://www.youtube.com/watch?v=IuOSLf5BamM) |
| 16 | The COVID-19 Economic Shock | 2020 | [▶](https://www.youtube.com/watch?v=svPxpdVVHXM) |
| 17 | The Great Inflation | 2021–2023 | [▶](https://www.youtube.com/watch?v=JBCMd2Attq4) |

Each chapter follows a four-part structure mirroring the video: **event → failures → response → legacy**.

## Repository Structure

```
.
├── book/                   # Quarto book source
│   ├── _quarto.yml         # Book configuration
│   ├── index.qmd           # Preface
│   ├── 00-series-framework.qmd
│   ├── ch01-south-sea-bubble.qmd
│   ├── ...                 # ch01–ch17 (one file per crisis)
│   ├── epilogue.qmd
│   └── references.qmd
├── video/                  # Remotion video project
│   ├── src/                # React components
│   ├── data/               # Narration & script data
│   ├── public/             # Static assets (charts, audio)
│   └── package.json
├── youtube/                # YouTube description texts (ep0–ep17)
├── generate_charts.py      # Matplotlib chart generation
└── .github/workflows/
    ├── pages.yml           # Auto-deploy book on push
    └── render-video.yml    # Manual video render trigger
```

## Building the Book

```bash
cd book
quarto render          # builds HTML, PDF, EPUB
quarto preview         # live-preview in browser
```

**Requirements:** [Quarto](https://quarto.org/), TinyTeX (for PDF), Liberation Sans font

```bash
# Ubuntu/Debian
sudo apt-get install fonts-liberation
# macOS
brew install --cask font-liberation
```

## Generating Charts

```bash
pip install matplotlib numpy
python3 generate_charts.py
# Outputs to video/public/*.png and book/images/*.png
```

## Building the Video

```bash
cd video
npm install

# Generate audio (requires Kokoro TTS)
node generate_script.mjs
node generate_audio_kokoro.mjs

# Preview in browser
npm start

# Render to MP4
npm run render
```

**Requirements:** Node.js 20+, [Kokoro TTS](https://github.com/hexgrad/kokoro)

## Audio Assets (Large Files)

Audio chunks and background music are excluded from git. They are stored as a GitHub Release asset:

```bash
gh release download audio-assets --pattern "audio-chunks.tar.gz" --dir /tmp/
tar xzf /tmp/audio-chunks.tar.gz -C video/public/audio/

gh release download audio-assets --pattern "bgm.wav" --dir video/public/audio/
```

## CI / GitHub Pages

- **pages.yml** — Triggered on every push to `main`. Renders the Quarto book and deploys to GitHub Pages.
- **render-video.yml** — Manual trigger only. Renders the Remotion video (resource-intensive; best run locally or on a powerful runner).

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Book | [Quarto](https://quarto.org/) → HTML / PDF / EPUB |
| Video | [Remotion](https://remotion.dev/) 4.0 (React) |
| TTS | [Kokoro-JS](https://github.com/hexgrad/kokoro) (local, `am_adam`) |
| Word timing | [faster-whisper](https://github.com/SYSTRAN/faster-whisper) |
| Charts | [Matplotlib](https://matplotlib.org/) |
| Hosting | GitHub Pages + GitHub Releases |

## License

- **Code** (scripts, components, workflows): [MIT License](LICENSE)
- **Content** (book text, narration): [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/)
