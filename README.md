# Economic Crises Explained

A documentary series and companion book covering six major economic crises of the past century — their causes, human cost, policy responses, and lessons learned.

## Episodes

| # | Crisis | Period |
|---|--------|--------|
| 1 | The Great Depression | 1929–1939 |
| 2 | The 1970s Stagflation | 1973–1982 |
| 3 | The Asian Financial Crisis | 1997–1998 |
| 4 | The 2008 Global Financial Crisis | 2008–2012 |
| 5 | The COVID-19 Economic Shock | 2020 |
| 6 | The Great Inflation | 2021–2023 |

Each episode follows a four-act structure: **Event → Problems → Solutions → Results**.

## Repository Structure

```
.
├── book/                   # Quarto book source
│   ├── _quarto.yml         # Book configuration
│   ├── index.qmd           # Preface
│   ├── 00-series-framework.qmd
│   ├── ep1-01-event.qmd    # Episode 1, Act 1
│   ├── ep1-02-problems.qmd # Episode 1, Act 2
│   ├── ...                 # (24 chapters total)
│   ├── epilogue.qmd
│   └── references.qmd
├── video/                  # Remotion video project
│   ├── src/                # React components
│   ├── data/               # Narration & script data
│   ├── public/             # Static assets (charts, audio)
│   └── package.json
├── docs/                   # GitHub Pages output
│   ├── index.html          # Landing page
│   └── book/               # Built Quarto HTML
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
