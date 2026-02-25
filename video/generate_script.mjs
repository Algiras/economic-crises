import fs from 'fs';
import path from 'path';

const CHUNKS_FILE = path.join(process.cwd(), 'data', 'chunks.json');
const DURATIONS_FILE = path.join(process.cwd(), 'data', 'chunk_durations.json');
const WORD_TIMINGS_FILE = path.join(process.cwd(), 'data', 'word_timings.json');
const CHART_NARRATIONS_FILE = path.join(process.cwd(), 'data', 'chart_narrations.json');
const CHART_AUDIO_DIR = path.join(process.cwd(), 'public', 'audio', 'charts');
const OUT_FILE = path.join(process.cwd(), 'data', 'script.json');

const FPS = 30;
const BACKGROUNDS = [
    'bg_abstract.jpg',
    'bg_demographics.jpg',
    'bg_lifestyle.jpg',
    'bg_lab.jpg',
    'bg_toxicology.jpg'
];

const CHAPTER_TITLES = {
    'ep1_event':     'Episode 1 · Event',
    'ep1_problems':  'Episode 1 · Problems',
    'ep1_solutions': 'Episode 1 · Solutions',
    'ep1_results':   'Episode 1 · Results',
    'ep2_event':     'Episode 2 · Event',
    'ep2_problems':  'Episode 2 · Problems',
    'ep2_solutions': 'Episode 2 · Solutions',
    'ep2_results':   'Episode 2 · Results',
    'ep3_event':     'Episode 3 · Event',
    'ep3_problems':  'Episode 3 · Problems',
    'ep3_solutions': 'Episode 3 · Solutions',
    'ep3_results':   'Episode 3 · Results',
    'ep4_event':     'Episode 4 · Event',
    'ep4_problems':  'Episode 4 · Problems',
    'ep4_solutions': 'Episode 4 · Solutions',
    'ep4_results':   'Episode 4 · Results',
    'ep5_event':     'Episode 5 · Event',
    'ep5_problems':  'Episode 5 · Problems',
    'ep5_solutions': 'Episode 5 · Solutions',
    'ep5_results':   'Episode 5 · Results',
    'ep6_event':     'Episode 6 · Event',
    'ep6_problems':  'Episode 6 · Problems',
    'ep6_solutions': 'Episode 6 · Solutions',
    'ep6_results':   'Episode 6 · Results',
};

const CHAPTER_CHARTS = {
    // Episode 1: Great Depression — complexity index shows structural economic sophistication
    'ep1_solutions':   { src: 'complexity_index.png',   title: 'Economic Complexity Index vs Long-Run Growth',   audioId: 'chart_complexity_index' },
    // Episode 2: Stagflation — behavioral biases behind the transitory miscalculation pattern
    'ep2_problems':    { src: 'behavioral_biases.png',  title: 'Cognitive Biases in Economic Decision-Making',   audioId: 'chart_behavioral_biases' },
    // Episode 4: GFC — IMF forecast errors show systemic overconfidence before 2008
    'ep4_event':       { src: 'forecast_errors.png',    title: 'IMF Forecast Errors vs Actual Growth',           audioId: 'chart_forecast_errors' },
    // Episode 5: COVID — debt-to-GDP shows fiscal consequence of pandemic spending
    'ep5_results':     { src: 'debt_gdp.png',           title: 'Government Debt-to-GDP Ratio (G7, 1980–2024)',   audioId: 'chart_debt_gdp' },
    // Episode 6: Great Inflation — inflation vs target shows the breach and recovery
    'ep6_event':       { src: 'inflation_target.png',   title: 'Inflation vs Central Bank Target (US, 2018–2023)', audioId: 'chart_inflation_target' },
};

function getChartAudioDuration(audioId) {
    try {
        const candidates = [
            path.join(CHART_AUDIO_DIR, `${audioId}.wav`),
            path.join(process.cwd(), 'public', 'audio', `${audioId}.wav`),
        ];
        const wavPath = candidates.find(p => fs.existsSync(p));
        if (!wavPath) return null;
        const buf = fs.readFileSync(wavPath);
        const byteRate = buf.readUInt32LE(28);
        let offset = 12;
        while (offset < buf.length - 8) {
            const id = buf.slice(offset, offset + 4).toString('ascii');
            const size = buf.readUInt32LE(offset + 4);
            if (id === 'data') return size / byteRate;
            offset += 8 + size;
        }
        return null;
    } catch { return null; }
}

function main() {
    if (!fs.existsSync(CHUNKS_FILE) || !fs.existsSync(DURATIONS_FILE)) {
        console.error("Missing chunks.json or chunk_durations.json — run generate_audio_kokoro.mjs first");
        return;
    }

    const chunksMeta = JSON.parse(fs.readFileSync(CHUNKS_FILE, 'utf8'));
    const durations = JSON.parse(fs.readFileSync(DURATIONS_FILE, 'utf8'));
    const wordTimings = fs.existsSync(WORD_TIMINGS_FILE)
        ? JSON.parse(fs.readFileSync(WORD_TIMINGS_FILE, 'utf8'))
        : {};

    const fullScript = [];
    let globalStartFrame = 0;

    const introDuration = getChartAudioDuration('intro_narration');
    const introDurationFrames = introDuration
        ? Math.ceil(introDuration * FPS) + 2 * FPS
        : 5 * FPS;
    fullScript.push({
        id: 'intro',
        title: 'Intro',
        globalStart: globalStartFrame,
        duration: introDurationFrames,
        subSlides: [{
            type: 'intro',
            start: 0,
            duration: introDurationFrames,
            audioSrc: 'audio/intro_narration.wav',
        }]
    });
    globalStartFrame += introDurationFrames;

    const chapters = {};
    for (const chunk of chunksMeta) {
        if (!chapters[chunk.chapter_id]) {
            chapters[chunk.chapter_id] = { id: chunk.chapter_id, subSlides: [], durationFrames: 0 };
        }

        let durationSec = durations[chunk.chunk_id];
        let audioExists = true;

        if (durationSec === undefined) {
            const wordCount = chunk.text.split(' ').length;
            durationSec = Math.max(wordCount / 2.8, 3);
            audioExists = false;
        }

        const PAUSE_BUFFER_FRAMES = Math.round(0.4 * FPS);
        const chunkFrames = Math.ceil(durationSec * FPS) + PAUSE_BUFFER_FRAMES;
        chapters[chunk.chapter_id].subSlides.push({
            type: 'quote',
            chunk_id: chunk.chunk_id,
            audio_exists: audioExists,
            text: chunk.text,
            duration: chunkFrames,
            bgImage: BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)],
            wordTimings: wordTimings[chunk.chunk_id] || null,
        });
        chapters[chunk.chapter_id].durationFrames += chunkFrames;
    }

    for (const chapterId of Object.keys(chapters)) {
        const chapter = chapters[chapterId];

        const bumperFrames = 3 * FPS;
        const chapterTitle = CHAPTER_TITLES[chapter.id] || chapter.id.toUpperCase();
        const chapterObj = {
            id: chapter.id,
            title: chapterTitle,
            globalStart: globalStartFrame,
            duration: chapter.durationFrames + bumperFrames,
            subSlides: []
        };

        let localStart = 0;

        chapterObj.subSlides.push({
            type: 'bumper',
            start: localStart,
            duration: bumperFrames,
            title: chapterTitle
        });
        localStart += bumperFrames;

        if (CHAPTER_CHARTS[chapterId]) {
            const chart = CHAPTER_CHARTS[chapterId];
            const audioDuration = chart.audioId ? getChartAudioDuration(chart.audioId) : null;
            const PAUSE_BUFFER_FRAMES = Math.round(0.5 * FPS);
            const chartFrames = audioDuration
                ? Math.ceil(audioDuration * FPS) + PAUSE_BUFFER_FRAMES
                : 6 * FPS;
            chapterObj.subSlides.push({
                type: 'chart',
                start: localStart,
                duration: chartFrames,
                chartSrc: chart.src,
                title: chart.title,
                audioSrc: chart.audioId ? `audio/charts/${chart.audioId}.wav` : null,
            });
            localStart += chartFrames;
            chapterObj.duration += chartFrames;
        }

        for (const slide of chapter.subSlides) {
            slide.start = localStart;
            chapterObj.subSlides.push(slide);
            localStart += slide.duration;
        }

        fullScript.push(chapterObj);
        globalStartFrame += chapterObj.duration;
    }

    const outroDuration = getChartAudioDuration('outro_narration');
    const creditsDurationFrames = outroDuration
        ? Math.ceil(outroDuration * FPS) + 3 * FPS
        : 10 * FPS;
    fullScript.push({
        id: 'credits',
        title: 'Credits',
        globalStart: globalStartFrame,
        duration: creditsDurationFrames,
        subSlides: [{
            type: 'credits',
            start: 0,
            duration: creditsDurationFrames,
            audioSrc: 'audio/outro_narration.wav',
        }]
    });

    fs.writeFileSync(OUT_FILE, JSON.stringify(fullScript, null, 2));
    console.log(`Generated script.json (${(globalStartFrame / FPS / 60).toFixed(1)} mins total).`);

    // ── Per-episode scripts ────────────────────────────────────────────────
    const EPISODE_META = {
        1: { title: 'The Great Depression', subtitle: '1929–1939' },
        2: { title: 'The 1970s Stagflation', subtitle: '1973–1982' },
        3: { title: 'The Asian Financial Crisis', subtitle: '1997–1998' },
        4: { title: 'The Global Financial Crisis', subtitle: '2008–2012' },
        5: { title: 'The COVID-19 Economic Shock', subtitle: '2020' },
        6: { title: 'The Great Inflation', subtitle: '2021–2023' },
    };

    const introChunk = fullScript.find(s => s.id === 'intro');
    const creditsChunk = fullScript.find(s => s.id === 'credits');

    for (let ep = 1; ep <= 6; ep++) {
        const epChapters = fullScript.filter(s => s.id.startsWith(`ep${ep}_`));
        const epScript = [];
        let epFrame = 0;

        // Brief per-episode intro (reuse global intro audio)
        const epIntroDuration = introChunk ? introChunk.duration : 5 * FPS;
        epScript.push({ ...introChunk, globalStart: epFrame, duration: epIntroDuration, episode: ep, episodeMeta: EPISODE_META[ep] });
        epFrame += epIntroDuration;

        for (const chapter of epChapters) {
            epScript.push({ ...chapter, globalStart: epFrame });
            epFrame += chapter.duration;
        }

        epScript.push({ ...creditsChunk, globalStart: epFrame });
        epFrame += creditsChunk.duration;

        const epOutFile = path.join(process.cwd(), 'data', `ep${ep}_script.json`);
        fs.writeFileSync(epOutFile, JSON.stringify(epScript, null, 2));

        const mins = (epFrame / FPS / 60).toFixed(1);
        console.log(`  ep${ep}_script.json — ${mins} min (${epFrame} frames)`);
    }
    console.log('Done.');
}

main();
