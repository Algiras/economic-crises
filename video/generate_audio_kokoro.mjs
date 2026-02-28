/**
 * generate_audio_kokoro.mjs — generate narration WAV for all episode scenes
 *
 * Reads:  data/scenes.json        — list of chapters with text
 * Writes: public/audio/chunks/    — one WAV per text chunk
 *         data/chunks.json        — chunk metadata (id + text)
 *
 * Run:    node generate_audio_kokoro.mjs
 *
 * Skips any chunk that already has a WAV file, so it's safe to re-run
 * after adding new episodes without regenerating everything.
 */

import fs from 'fs';
import path from 'path';
import { synthesize, VOICE } from './tts_edge.mjs';

const BASE_DIR    = process.cwd();
const SCENES_FILE = path.join(BASE_DIR, 'data/scenes.json');
const AUDIO_DIR   = path.join(BASE_DIR, 'out/audio/chunks');  // persists alongside renders
const CHUNKS_JSON = path.join(BASE_DIR, 'data/chunks.json');

// Split long scene text into sentence-level chunks so each audio clip
// matches one visual slide (max ~250 characters per chunk).
function chunkText(text, maxChars = 250) {
    const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
    const chunks = [];
    let current = '';
    for (const sentence of sentences) {
        if (current.length + sentence.length > maxChars && current) {
            chunks.push(current.trim());
            current = sentence + ' ';
        } else {
            current += sentence + ' ';
        }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
}

async function main() {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });

    const scenes = JSON.parse(fs.readFileSync(SCENES_FILE, 'utf8'));
    console.log(`Loaded ${scenes.length} scenes. Voice: ${VOICE}\n`);

    // Load existing chunk metadata so we can resume interrupted runs
    let allChunks = fs.existsSync(CHUNKS_JSON)
        ? JSON.parse(fs.readFileSync(CHUNKS_JSON, 'utf8'))
        : [];

    for (const scene of scenes) {
        console.log(`[${scene.id}]`);
        const chunks = chunkText(scene.text);

        for (let i = 0; i < chunks.length; i++) {
            const chunkId  = `${scene.id}_${i}`;
            const wavPath  = path.join(AUDIO_DIR, `${chunkId}.wav`);
            const text     = chunks[i];

            // Record metadata on first encounter
            if (!allChunks.find(c => c.chunk_id === chunkId)) {
                allChunks.push({ chapter_id: scene.id, chunk_id: chunkId, text });
                fs.writeFileSync(CHUNKS_JSON, JSON.stringify(allChunks, null, 2));
            }

            process.stdout.write(`  ${chunkId} — "${text.slice(0, 50)}..."\n`);
            await synthesize(text, wavPath); // no-op if file already exists
        }
    }

    console.log(`\nDone. ${allChunks.length} total chunks.`);
}

main().catch(console.error);
