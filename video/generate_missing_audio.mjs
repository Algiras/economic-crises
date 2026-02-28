/**
 * generate_missing_audio.mjs — fill in any missing chunk WAVs
 *
 * Reads:  data/chunks.json             — chunk metadata (text already split)
 * Writes: public/audio/chunks/<id>.wav — one WAV per missing chunk
 *         data/chunk_durations.json    — updated with new durations
 *
 * Run:    node generate_missing_audio.mjs
 *
 * Use this after adding new episodes or if some chunks failed to generate.
 * It reads chunks.json directly (not scenes.json) so text stays in sync.
 */

import fs from 'fs';
import path from 'path';
import { synthesize, VOICE } from './tts_edge.mjs';

const CHUNKS_JSON    = path.join(process.cwd(), 'data', 'chunks.json');
const DURATIONS_JSON = path.join(process.cwd(), 'data', 'chunk_durations.json');
const AUDIO_DIR      = path.join(process.cwd(), 'out', 'audio', 'chunks');  // persists alongside renders

// WAV duration: scan for 'data' chunk (handles ffmpeg metadata headers)
// For 24kHz 16-bit mono: byte rate = 24000 * 2 = 48000 bytes/sec.
const BYTE_RATE = 48000;

function getWavDuration(wavPath) {
    const buf = fs.readFileSync(wavPath);
    // Read byteRate from WAV fmt chunk (offset 28, 4 bytes)
    const byteRate = buf.readUInt32LE(28) || BYTE_RATE;
    let offset = 12;
    while (offset < buf.length - 8) {
        const id = buf.slice(offset, offset + 4).toString('ascii');
        const size = buf.readUInt32LE(offset + 4);
        if (id === 'data') return size / byteRate;
        offset += 8 + size;
    }
    return (buf.length - 44) / BYTE_RATE; // fallback
}

async function main() {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });

    const chunks = JSON.parse(fs.readFileSync(CHUNKS_JSON, 'utf8'));
    const missing = chunks.filter(c => {
        const p = path.join(AUDIO_DIR, `${c.chunk_id}.wav`);
        return !fs.existsSync(p) || fs.statSync(p).size < 1000;
    });

    if (missing.length === 0) {
        console.log('All audio chunks already exist. Nothing to generate.');
        return;
    }

    console.log(`${missing.length} missing chunks. Voice: ${VOICE}\n`);

    const durations = fs.existsSync(DURATIONS_JSON)
        ? JSON.parse(fs.readFileSync(DURATIONS_JSON, 'utf8'))
        : {};

    for (let i = 0; i < missing.length; i++) {
        const chunk   = missing[i];
        const wavPath = path.join(AUDIO_DIR, `${chunk.chunk_id}.wav`);

        process.stdout.write(`[${i + 1}/${missing.length}] ${chunk.chunk_id} — "${chunk.text.slice(0, 50)}..."\n`);

        await synthesize(chunk.text, wavPath);

        // Record duration so generate_script.mjs can calculate slide lengths
        durations[chunk.chunk_id] = getWavDuration(wavPath);
        fs.writeFileSync(DURATIONS_JSON, JSON.stringify(durations, null, 2));
    }

    console.log(`\nDone. ${missing.length} chunks generated.`);
}

main().catch(console.error);
