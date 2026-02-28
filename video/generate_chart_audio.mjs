/**
 * generate_chart_audio.mjs — generate narration WAVs for chart slides
 *
 * Reads:  data/chart_narrations.json        — list of { id, text } items
 * Writes: public/audio/charts/<id>.wav      — one WAV per chart narration
 *
 * Run:    node generate_chart_audio.mjs
 */

import fs from 'fs';
import path from 'path';
import { synthesize, VOICE } from './tts_edge.mjs';

const NARRATIONS_FILE = path.join(process.cwd(), 'data', 'chart_narrations.json');
const AUDIO_DIR       = path.join(process.cwd(), 'out', 'audio', 'charts');  // persists alongside renders

async function main() {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });

    const narrations = JSON.parse(fs.readFileSync(NARRATIONS_FILE, 'utf8'));
    console.log(`${narrations.length} chart narrations to process. Voice: ${VOICE}\n`);

    for (const item of narrations) {
        const outPath = path.join(AUDIO_DIR, `${item.id}.wav`);
        const skip    = fs.existsSync(outPath) && fs.statSync(outPath).size > 1000;
        console.log(`${skip ? 'Skipping' : 'Synthesizing'} ${item.id}...`);
        await synthesize(item.text, outPath);
        if (!skip) {
            const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(0);
            console.log(`  Saved ${item.id}.wav (${sizeKb} KB)`);
        }
    }

    console.log('\nDone.');
}

main().catch(console.error);
