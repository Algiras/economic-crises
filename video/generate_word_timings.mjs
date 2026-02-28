/**
 * generate_word_timings.mjs
 *
 * For every episode chunk WAV in public/episodes/ep{N}/audio/,
 * generates word-level timings using edge-tts word boundary events
 * and writes data/word_timings.json  { [chunk_id]: WordTiming[] }
 *
 * Run: node generate_word_timings.mjs
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { synthesizeWithTimings } from './tts_edge.mjs';

const CHUNKS_FILE   = path.join(process.cwd(), 'data', 'chunks.json');
const OUT_FILE      = path.join(process.cwd(), 'data', 'word_timings.json');
const EPISODES_DIR  = path.join(process.cwd(), 'public', 'episodes');

const chunks = JSON.parse(fs.readFileSync(CHUNKS_FILE, 'utf8'));

// Load existing timings so we can skip already-done chunks
const existing = fs.existsSync(OUT_FILE)
    ? JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'))
    : {};

// Detect which episode folder a chunk belongs to
function epFolder(chunkId) {
    const m = chunkId.match(/^(ep\d+)_/);
    return m ? m[1] : null;
}

let done = 0;
let skipped = 0;

for (const chunk of chunks) {
    const { chunk_id, text } = chunk;
    if (!text) continue;

    if (existing[chunk_id]) {
        skipped++;
        continue;
    }

    const ep = epFolder(chunk_id);
    if (!ep) continue;

    const wavPath = path.join(EPISODES_DIR, ep, 'audio', `${chunk_id}.wav`);
    if (!fs.existsSync(wavPath)) {
        console.log(`  Skip ${chunk_id} — WAV missing`);
        continue;
    }

    // Write timings to a temp file; we only care about the JSON, not re-generating the WAV
    const tmpTimings = path.join(os.tmpdir(), `timings_${chunk_id}.json`);

    // synthesizeWithTimings skips if both wav+timings exist, so we pass a dummy wav path
    // that already exists — it will still generate timings if timings file is missing.
    // We use a separate temp wav to avoid overwriting the real one.
    const tmpWav = path.join(os.tmpdir(), `wav_${chunk_id}.wav`);

    try {
        process.stdout.write(`  Generating timings: ${chunk_id} ... `);
        await synthesizeWithTimings(text, tmpWav, tmpTimings);
        const timings = JSON.parse(fs.readFileSync(tmpTimings, 'utf8'));
        existing[chunk_id] = timings;
        done++;
        console.log(`${timings.length} words`);
    } catch (err) {
        console.log(`ERROR: ${err.message}`);
    } finally {
        if (fs.existsSync(tmpTimings)) fs.unlinkSync(tmpTimings);
        if (fs.existsSync(tmpWav)) fs.unlinkSync(tmpWav);
    }
}

fs.writeFileSync(OUT_FILE, JSON.stringify(existing, null, 2));
console.log(`\nDone. ${done} generated, ${skipped} skipped. Saved to ${OUT_FILE}`);
console.log('Run `node generate_script.mjs` to rebuild episode scripts with timings.');
