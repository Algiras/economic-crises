import fs from 'fs';
import path from 'path';

const CHUNKS_FILE = path.join(process.cwd(), 'data', 'chunks.json');
const DURATIONS_FILE = path.join(process.cwd(), 'data', 'chunk_durations.json');
const WORD_TIMINGS_FILE = path.join(process.cwd(), 'data', 'word_timings.json');
const CHART_NARRATIONS_FILE = path.join(process.cwd(), 'data', 'chart_narrations.json');
const CHART_AUDIO_DIR = path.join(process.cwd(), 'public', 'audio', 'charts');
const OUT_FILE = path.join(process.cwd(), 'data', 'script.json');

const FPS = 30;

const CHAPTER_IMAGES = {
    ep1_event:     ['bg_stock_red.jpg','bg_wallstreet.jpg','bg_nyse_floor.jpg','bg_breadline.jpg'],
    ep1_problems:  ['bg_breadline.jpg','bg_factory_dark.jpg','bg_gold_bars.jpg','bg_bank_run.jpg'],
    ep1_solutions: ['bg_fed_building.jpg','bg_gold_bars.jpg','bg_recovery.jpg','bg_city_night.jpg'],
    ep1_results:   ['bg_recovery.jpg','bg_wallstreet.jpg','bg_city_night.jpg','bg_factory_dark.jpg'],

    ep2_event:     ['bg_oil_pump.jpg','bg_gas_queue.jpg','bg_factory_dark.jpg','bg_city_night.jpg'],
    ep2_problems:  ['bg_gas_queue.jpg','bg_protest_70s.jpg','bg_inflation_cash.jpg','bg_supermarket.jpg'],
    ep2_solutions: ['bg_fed_building.jpg','bg_interest_chart.jpg','bg_wallstreet.jpg','bg_city_night.jpg'],
    ep2_results:   ['bg_interest_chart.jpg','bg_fed_building.jpg','bg_recovery.jpg','bg_city_night.jpg'],

    ep3_event:     ['bg_asia_skyline.jpg','bg_currency_trade.jpg','bg_global_map.jpg','bg_city_night.jpg'],
    ep3_problems:  ['bg_currency_trade.jpg','bg_bank_run.jpg','bg_global_map.jpg','bg_asia_skyline.jpg'],
    ep3_solutions: ['bg_imf_meeting.jpg','bg_fed_building.jpg','bg_global_map.jpg','bg_interest_chart.jpg'],
    ep3_results:   ['bg_asia_skyline.jpg','bg_recovery.jpg','bg_global_map.jpg','bg_interest_chart.jpg'],

    ep4_event:     ['bg_lehman.jpg','bg_housing_bubble.jpg','bg_stock_red.jpg','bg_wallstreet.jpg'],
    ep4_problems:  ['bg_bank_run.jpg','bg_lehman.jpg','bg_interest_chart.jpg','bg_stock_red.jpg'],
    ep4_solutions: ['bg_qe_printer.jpg','bg_fed_building.jpg','bg_imf_meeting.jpg','bg_city_night.jpg'],
    ep4_results:   ['bg_recovery.jpg','bg_city_night.jpg','bg_interest_chart.jpg','bg_wallstreet.jpg'],

    ep5_event:     ['bg_empty_street.jpg','bg_supply_chain.jpg','bg_city_night.jpg','bg_factory_dark.jpg'],
    ep5_problems:  ['bg_empty_street.jpg','bg_supermarket.jpg','bg_supply_chain.jpg','bg_interest_chart.jpg'],
    ep5_solutions: ['bg_qe_printer.jpg','bg_fed_building.jpg','bg_city_night.jpg','bg_recovery.jpg'],
    ep5_results:   ['bg_recovery.jpg','bg_inflation_cash.jpg','bg_city_night.jpg','bg_interest_chart.jpg'],

    ep6_event:     ['bg_supermarket.jpg','bg_inflation_cash.jpg','bg_supply_chain.jpg','bg_gas_queue.jpg'],
    ep6_problems:  ['bg_inflation_cash.jpg','bg_interest_chart.jpg','bg_fed_building.jpg','bg_supermarket.jpg'],
    ep6_solutions: ['bg_fed_building.jpg','bg_interest_chart.jpg','bg_wallstreet.jpg','bg_city_night.jpg'],
    ep6_results:   ['bg_recovery.jpg','bg_city_night.jpg','bg_interest_chart.jpg','bg_inflation_cash.jpg'],

    ep7_event:     ['bg_breadline.jpg','bg_inflation_cash.jpg','bg_factory_dark.jpg','bg_protest_70s.jpg'],
    ep7_problems:  ['bg_inflation_cash.jpg','bg_breadline.jpg','bg_protest_70s.jpg','bg_gold_bars.jpg'],
    ep7_solutions: ['bg_gold_bars.jpg','bg_fed_building.jpg','bg_recovery.jpg','bg_city_night.jpg'],
    ep7_results:   ['bg_recovery.jpg','bg_breadline.jpg','bg_factory_dark.jpg','bg_city_night.jpg'],

    ep8_event:     ['bg_asia_skyline.jpg','bg_housing_bubble.jpg','bg_stock_red.jpg','bg_city_night.jpg'],
    ep8_problems:  ['bg_bank_run.jpg','bg_interest_chart.jpg','bg_empty_street.jpg','bg_asia_skyline.jpg'],
    ep8_solutions: ['bg_qe_printer.jpg','bg_fed_building.jpg','bg_city_night.jpg','bg_interest_chart.jpg'],
    ep8_results:   ['bg_asia_skyline.jpg','bg_recovery.jpg','bg_interest_chart.jpg','bg_city_night.jpg'],

    ep9_event:     ['bg_wallstreet.jpg','bg_interest_chart.jpg','bg_nyse_floor.jpg','bg_stock_red.jpg'],
    ep9_problems:  ['bg_stock_red.jpg','bg_interest_chart.jpg','bg_wallstreet.jpg','bg_city_night.jpg'],
    ep9_solutions: ['bg_imf_meeting.jpg','bg_fed_building.jpg','bg_wallstreet.jpg','bg_city_night.jpg'],
    ep9_results:   ['bg_wallstreet.jpg','bg_recovery.jpg','bg_interest_chart.jpg','bg_city_night.jpg'],

    ep10_event:    ['bg_protest_70s.jpg','bg_global_map.jpg','bg_currency_trade.jpg','bg_breadline.jpg'],
    ep10_problems: ['bg_breadline.jpg','bg_protest_70s.jpg','bg_imf_meeting.jpg','bg_currency_trade.jpg'],
    ep10_solutions:['bg_fed_building.jpg','bg_imf_meeting.jpg','bg_global_map.jpg','bg_recovery.jpg'],
    ep10_results:  ['bg_recovery.jpg','bg_global_map.jpg','bg_city_night.jpg','bg_interest_chart.jpg'],

    ep11_event:    ['bg_vintage_market.jpg','bg_bank_run.jpg','bg_gold_bars.jpg','bg_wallstreet.jpg'],
    ep11_problems: ['bg_bank_run.jpg','bg_gold_bars.jpg','bg_wallstreet.jpg','bg_nyse_floor.jpg'],
    ep11_solutions:['bg_fed_building.jpg','bg_gold_bars.jpg','bg_wallstreet.jpg','bg_city_night.jpg'],
    ep11_results:  ['bg_fed_building.jpg','bg_recovery.jpg','bg_wallstreet.jpg','bg_city_night.jpg'],

    ep12_event:    ['bg_global_map.jpg','bg_inflation_cash.jpg','bg_imf_meeting.jpg','bg_breadline.jpg'],
    ep12_problems: ['bg_breadline.jpg','bg_inflation_cash.jpg','bg_global_map.jpg','bg_imf_meeting.jpg'],
    ep12_solutions:['bg_imf_meeting.jpg','bg_global_map.jpg','bg_fed_building.jpg','bg_recovery.jpg'],
    ep12_results:  ['bg_recovery.jpg','bg_global_map.jpg','bg_city_night.jpg','bg_interest_chart.jpg'],

    ep13_event:    ['bg_stock_red.jpg','bg_nyse_floor.jpg','bg_wallstreet.jpg','bg_interest_chart.jpg'],
    ep13_problems: ['bg_stock_red.jpg','bg_interest_chart.jpg','bg_wallstreet.jpg','bg_city_night.jpg'],
    ep13_solutions:['bg_fed_building.jpg','bg_wallstreet.jpg','bg_interest_chart.jpg','bg_recovery.jpg'],
    ep13_results:  ['bg_recovery.jpg','bg_interest_chart.jpg','bg_wallstreet.jpg','bg_city_night.jpg'],

    ep14_event:    ['bg_dotcom.jpg','bg_stock_red.jpg','bg_city_night.jpg','bg_interest_chart.jpg'],
    ep14_problems: ['bg_dotcom.jpg','bg_interest_chart.jpg','bg_stock_red.jpg','bg_wallstreet.jpg'],
    ep14_solutions:['bg_fed_building.jpg','bg_dotcom.jpg','bg_city_night.jpg','bg_recovery.jpg'],
    ep14_results:  ['bg_recovery.jpg','bg_dotcom.jpg','bg_city_night.jpg','bg_interest_chart.jpg'],

    ep15_event:    ['bg_protest_70s.jpg','bg_bank_run.jpg','bg_currency_trade.jpg','bg_breadline.jpg'],
    ep15_problems: ['bg_bank_run.jpg','bg_breadline.jpg','bg_currency_trade.jpg','bg_imf_meeting.jpg'],
    ep15_solutions:['bg_imf_meeting.jpg','bg_currency_trade.jpg','bg_fed_building.jpg','bg_recovery.jpg'],
    ep15_results:  ['bg_recovery.jpg','bg_global_map.jpg','bg_city_night.jpg','bg_interest_chart.jpg'],

    ep16_event:    ['bg_railroad.jpg','bg_factory_dark.jpg','bg_gold_bars.jpg','bg_city_night.jpg'],
    ep16_problems: ['bg_factory_dark.jpg','bg_breadline.jpg','bg_gold_bars.jpg','bg_railroad.jpg'],
    ep16_solutions:['bg_gold_bars.jpg','bg_fed_building.jpg','bg_recovery.jpg','bg_city_night.jpg'],
    ep16_results:  ['bg_recovery.jpg','bg_factory_dark.jpg','bg_city_night.jpg','bg_interest_chart.jpg'],

    ep17_event:    ['bg_parliament.jpg','bg_vintage_market.jpg','bg_gold_bars.jpg','bg_city_night.jpg'],
    ep17_problems: ['bg_gold_bars.jpg','bg_vintage_market.jpg','bg_breadline.jpg','bg_parliament.jpg'],
    ep17_solutions:['bg_parliament.jpg','bg_fed_building.jpg','bg_gold_bars.jpg','bg_city_night.jpg'],
    ep17_results:  ['bg_recovery.jpg','bg_parliament.jpg','bg_city_night.jpg','bg_gold_bars.jpg'],
};

// Maps internal ep number → series (chronological) number
const EP_TO_SERIES = {
    17: 1, 16: 2, 11: 3, 7: 4, 1: 5, 2: 6,
    12: 7, 13: 8, 8: 9, 3: 10, 9: 11, 14: 12,
    15: 13, 4: 14, 10: 15, 5: 16, 6: 17,
};

function getChapterTitle(chapterId) {
    const m = chapterId.match(/^ep(\d+)_(\w+)$/);
    if (!m) return chapterId.toUpperCase();
    const section = m[2].charAt(0).toUpperCase() + m[2].slice(1);
    return section; // e.g. "Event", "Problems", "Solutions", "Results"
}

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
    const chapterSlideIndex = {};
    for (const chunk of chunksMeta) {
        if (!chapters[chunk.chapter_id]) {
            chapters[chunk.chapter_id] = { id: chunk.chapter_id, subSlides: [], durationFrames: 0 };
            chapterSlideIndex[chunk.chapter_id] = 0;
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
        const pool = CHAPTER_IMAGES[chunk.chapter_id] || ['bg_wallstreet.jpg'];
        const slideIdx = chapterSlideIndex[chunk.chapter_id]++;
        const epNum = chunk.chapter_id.match(/^ep(\d+)_/)?.[1];
        chapters[chunk.chapter_id].subSlides.push({
            type: 'quote',
            chunk_id: chunk.chunk_id,
            audio_exists: audioExists,
            audioPath: audioExists ? `episodes/ep${epNum}/audio/${chunk.chunk_id}.wav` : null,
            text: chunk.text,
            duration: chunkFrames,
            bgImage: pool[slideIdx % pool.length],
            wordTimings: wordTimings[chunk.chunk_id] || null,
        });
        chapters[chunk.chapter_id].durationFrames += chunkFrames;
    }

    for (const chapterId of Object.keys(chapters)) {
        const chapter = chapters[chapterId];

        const bumperFrames = 3 * FPS;
        const chapterTitle = getChapterTitle(chapter.id);
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
        1:  { title: 'The Great Depression', subtitle: '1929–1939' },
        2:  { title: 'The 1970s Stagflation', subtitle: '1973–1982' },
        3:  { title: 'The Asian Financial Crisis', subtitle: '1997–1998' },
        4:  { title: 'The Global Financial Crisis', subtitle: '2008–2012' },
        5:  { title: 'The COVID-19 Economic Shock', subtitle: '2020' },
        6:  { title: 'The Great Inflation', subtitle: '2021–2023' },
        7:  { title: 'The Weimar Hyperinflation', subtitle: '1921–1923' },
        8:  { title: 'The Japanese Lost Decade', subtitle: '1990–2000' },
        9:  { title: 'The LTCM Collapse', subtitle: '1998' },
        10: { title: 'The Eurozone Debt Crisis',         subtitle: '2010–2012' },
        11: { title: 'The Panic of 1907',                subtitle: '1907' },
        12: { title: 'The Latin American Debt Crisis',   subtitle: '1982–1989' },
        13: { title: 'Black Monday',                     subtitle: '1987' },
        14: { title: 'The Dot-com Crash',                subtitle: '2000–2001' },
        15: { title: 'The Argentine Crisis',             subtitle: '2001–2002' },
        16: { title: 'The Long Depression',              subtitle: '1873–1896' },
        17: { title: 'The South Sea Bubble',             subtitle: '1720' },
    };

    const creditsChunk = fullScript.find(s => s.id === 'credits');

    for (let ep = 1; ep <= 17; ep++) {
        const epChapters = fullScript.filter(s => s.id.startsWith(`ep${ep}_`));
        const epScript = [];
        let epFrame = 0;

        // Short per-episode intro — audio in episode folder, episode = series number
        const seriesNum = EP_TO_SERIES[ep] ?? ep;
        const epIntroAudioId = `ep${ep}_intro`;
        const epIntroDuration = (() => {
            const dur = getChartAudioDuration(epIntroAudioId);
            return dur ? Math.ceil(dur * FPS) + Math.round(0.5 * FPS) : 5 * FPS;
        })();
        epScript.push({
            id: 'intro',
            title: 'Intro',
            globalStart: epFrame,
            duration: epIntroDuration,
            episode: seriesNum,
            episodeMeta: EPISODE_META[ep],
            subSlides: [{
                type: 'intro',
                start: 0,
                duration: epIntroDuration,
                audioSrc: `episodes/ep${ep}/intro.wav`,
            }],
        });
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
