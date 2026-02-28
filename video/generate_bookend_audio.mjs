/**
 * generate_bookend_audio.mjs — generate intro/outro narration WAVs
 *
 * Reads:  data/bookend_narrations.json   — list of { id, text } items
 * Writes: public/audio/<id>.wav          — one WAV per narration
 *
 * Run:    node generate_bookend_audio.mjs
 *
 * Uses paragraph pauses (0.6s silence between blank-line-separated
 * paragraphs) so long narrations breathe naturally.
 */

import fs from 'fs';
import path from 'path';
import { synthesizeWithPauses, VOICE } from './tts_edge.mjs';

const NARRATIONS_FILE = path.join(process.cwd(), 'data', 'bookend_narrations.json');
const AUDIO_DIR       = path.join(process.cwd(), 'out', 'audio');  // persists alongside renders

async function main() {
    const narrations = JSON.parse(fs.readFileSync(NARRATIONS_FILE, 'utf8'));
    console.log(`${narrations.length} narrations to process. Voice: ${VOICE}\n`);

    for (const item of narrations) {
        const outPath = path.join(AUDIO_DIR, `${item.id}.wav`);
        const skip    = fs.existsSync(outPath) && fs.statSync(outPath).size > 1000;
        console.log(`${skip ? 'Skipping' : 'Synthesizing'} ${item.id}...`);
        await synthesizeWithPauses(item.text, outPath);
        if (!skip) {
            const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(0);
            console.log(`  Saved ${item.id}.wav (${sizeKb} KB)`);
        }
    }

    console.log('\nDone.');
}

main().catch(console.error);
