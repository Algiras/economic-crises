/**
 * generate_intro_chunks.mjs
 *
 * Generates per-paragraph WAV files for the series intro narration,
 * avoiding the click artifacts caused by manual PCM stitching.
 *
 * Each paragraph is synthesized independently by Edge TTS so every clip
 * starts and ends with natural silence — no stitching, no clicks.
 *
 * Outputs:
 *   public/audio/intro/intro_p0.wav, intro_p1.wav, ...
 *   public/audio/intro/overview_p0.wav, overview_p1.wav, ...
 *   data/intro_chunks.json  — durations in seconds used by SeriesIntroVideo
 *
 * Run: node generate_intro_chunks.mjs
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { synthesize, VOICE } from './tts_edge.mjs';

const AUDIO_DIR  = path.join(process.cwd(), 'public', 'audio', 'intro');
const MANIFEST   = path.join(process.cwd(), 'data', 'intro_chunks.json');
const SAMPLE_RATE = 24000;
const BYTES_PER_SAMPLE = 2;

fs.mkdirSync(AUDIO_DIR, { recursive: true });

/** Return duration of a WAV file in seconds using ffprobe. */
function wavDuration(wavPath) {
    const out = execSync(
        `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${wavPath}"`,
        { encoding: 'utf8' }
    );
    return parseFloat(out.trim());
}

const NARRATIONS = {
    intro_narration: [
        'Three hundred years. Seventeen crises. Each one came with warnings nobody wanted to hear.',
        'This is Economic Crises Explained.',
    ],
    series_overview: [
        'We begin in 1720 with the South Sea Bubble — the first great financial mania of the modern era — and follow the wreckage forward: through hyperinflation and depression, through lost decades and debt crises, all the way to the crash of 2008 and the inflation shock of 2021.',
        'For every crisis, the same four questions: what lit the fuse, why no one stopped it, how governments responded, and what it ultimately cost. The answers are almost never comfortable.',
        'Seventeen episodes. Three hundred years. One argument that history has been making the whole time.',
    ],
};

async function main() {
    console.log(`Generating intro audio chunks. Voice: ${VOICE}\n`);

    const manifest = {};

    for (const [key, paragraphs] of Object.entries(NARRATIONS)) {
        manifest[key] = [];
        for (let i = 0; i < paragraphs.length; i++) {
            const filename = `${key.replace('_narration', '').replace('series_', '')}_p${i}.wav`;
            const outPath  = path.join(AUDIO_DIR, filename);
            const fileSrc  = `audio/intro/${filename}`;

            const skip = fs.existsSync(outPath) && fs.statSync(outPath).size > 1000;
            console.log(`${skip ? 'Skipping' : 'Synthesizing'} ${filename}...`);
            if (!skip) {
                await synthesize(paragraphs[i], outPath);
                const kb = (fs.statSync(outPath).size / 1024).toFixed(0);
                console.log(`  Saved ${filename} (${kb} KB)`);
            }

            const durationSec = wavDuration(outPath);
            manifest[key].push({ file: fileSrc, durationSec: parseFloat(durationSec.toFixed(3)) });
            console.log(`  Duration: ${durationSec.toFixed(2)}s`);
        }
        console.log();
    }

    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
    console.log(`Manifest saved to data/intro_chunks.json`);
    console.log('\nDone.');
}

main().catch(console.error);
