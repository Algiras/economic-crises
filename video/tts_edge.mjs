/**
 * tts_edge.mjs — shared edge-tts helper
 *
 * Uses Microsoft Edge TTS to generate WAV files.
 * Requires internet. Free, fast — streams in real-time via WebSocket.
 *
 * Pipeline: edge-tts → MP3 (temp file) → ffmpeg → WAV @ 24 kHz 16-bit mono
 *
 * Exported functions:
 *   synthesize(text, outputPath)            — single text → WAV
 *   synthesizeWithPauses(text, outputPath)  — splits on blank lines, 0.6 s silence between paragraphs
 *   VOICE                                   — the active voice name (for logging)
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';
import { EdgeTTS } from 'node-edge-tts';

// en-GB-RyanNeural: British male, rich documentary tone, less overused than US defaults.
export const VOICE = 'en-GB-RyanNeural';

// Slightly faster than default — keeps narration energetic.
const RATE = '+15%';

// edge-tts reliably produces MP3; we convert to WAV with ffmpeg afterwards.
const OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';

// WAV target spec — must match what Remotion and calculate_chunk_durations.mjs expect.
const SAMPLE_RATE = 24000;

function makeTTS() {
    return new EdgeTTS({
        voice: VOICE,
        lang: 'en-GB',
        outputFormat: OUTPUT_FORMAT,
        rate: RATE,
        timeout: 60000,
    });
}

/** Convert MP3 → 24 kHz 16-bit mono WAV using ffmpeg. */
function mp3ToWav(mp3Path, wavPath) {
    execSync(
        `ffmpeg -y -i "${mp3Path}" -ar ${SAMPLE_RATE} -ac 1 -acodec pcm_s16le "${wavPath}" -loglevel quiet`,
    );
}

/** Build a minimal 44-byte RIFF/WAV header for raw 16-bit mono PCM data. */
function buildWavHeader(pcmByteLength) {
    const BYTES_PER_SAMPLE = 2;
    const buf = Buffer.alloc(44);
    buf.write('RIFF', 0);
    buf.writeUInt32LE(pcmByteLength + 36, 4);
    buf.write('WAVE', 8);
    buf.write('fmt ', 12);
    buf.writeUInt32LE(16, 16);
    buf.writeUInt16LE(1, 20);                                    // PCM
    buf.writeUInt16LE(1, 22);                                    // mono
    buf.writeUInt32LE(SAMPLE_RATE, 24);
    buf.writeUInt32LE(SAMPLE_RATE * BYTES_PER_SAMPLE, 28);
    buf.writeUInt16LE(BYTES_PER_SAMPLE, 32);
    buf.writeUInt16LE(16, 34);
    buf.write('data', 36);
    buf.writeUInt32LE(pcmByteLength, 40);
    return buf;
}

// ─── private helpers ────────────────────────────────────────────────────────

function makeTTSWithSubs() {
    return new EdgeTTS({
        voice: VOICE,
        lang: 'en-GB',
        outputFormat: OUTPUT_FORMAT,
        rate: RATE,
        timeout: 60000,
        saveSubtitles: true,
    });
}

// ─── public API ─────────────────────────────────────────────────────────────

/**
 * Synthesize a single block of text to a WAV file.
 * Skips generation if the file already exists and is non-empty.
 */
export async function synthesize(text, outputPath) {
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        return; // already generated — skip to avoid unnecessary API calls
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const tmpMp3 = path.join(os.tmpdir(), `edge_${process.pid}_${Date.now()}.mp3`);
    try {
        await makeTTS().ttsPromise(text, tmpMp3);
        mp3ToWav(tmpMp3, outputPath);
    } finally {
        if (fs.existsSync(tmpMp3)) fs.unlinkSync(tmpMp3);
    }
}

/**
 * Synthesize multi-paragraph text with natural pauses between paragraphs.
 * Paragraphs are separated by blank lines in the source text.
 * Each paragraph is synthesized independently, then joined with 0.6 s of silence.
 */
export async function synthesizeWithPauses(text, outputPath, pauseSec = 0.6) {
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        return;
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
    const tmpWavs = [];

    try {
        for (let i = 0; i < paragraphs.length; i++) {
            const tmpMp3 = path.join(os.tmpdir(), `edge_${process.pid}_p${i}.mp3`);
            const tmpWav = path.join(os.tmpdir(), `edge_${process.pid}_p${i}.wav`);
            await makeTTS().ttsPromise(paragraphs[i], tmpMp3);
            mp3ToWav(tmpMp3, tmpWav);
            if (fs.existsSync(tmpMp3)) fs.unlinkSync(tmpMp3);
            tmpWavs.push(tmpWav);
        }

        // Strip WAV headers, interleave silence, reassemble with a single fresh header.
        const WAV_HEADER_BYTES = 44;
        const BYTES_PER_SAMPLE = 2;
        const silence = Buffer.alloc(Math.round(pauseSec * SAMPLE_RATE) * BYTES_PER_SAMPLE);

        const pcmChunks = [];
        for (let i = 0; i < tmpWavs.length; i++) {
            pcmChunks.push(fs.readFileSync(tmpWavs[i]).subarray(WAV_HEADER_BYTES));
            if (i < tmpWavs.length - 1) pcmChunks.push(silence);
        }

        const combined = Buffer.concat(pcmChunks);
        fs.writeFileSync(outputPath, Buffer.concat([buildWavHeader(combined.length), combined]));
    } finally {
        for (const f of tmpWavs) if (fs.existsSync(f)) fs.unlinkSync(f);
    }
}

/**
 * Synthesize multi-paragraph text to WAV and emit a word-timings JSON file.
 * Word timings are `{ word, start, end }` in seconds, adjusted for inter-paragraph silence.
 * Skips if both the WAV and timings JSON already exist and are non-empty.
 */
export async function synthesizeWithTimings(text, wavPath, timingsPath, pauseSec = 0.6) {
    const wavExists = fs.existsSync(wavPath) && fs.statSync(wavPath).size > 1000;
    const timingsExist = fs.existsSync(timingsPath) && fs.statSync(timingsPath).size > 2;
    if (wavExists && timingsExist) return;

    fs.mkdirSync(path.dirname(wavPath), { recursive: true });

    const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
    const WAV_HEADER_BYTES = 44;
    const BYTES_PER_SAMPLE = 2;
    const silence = Buffer.alloc(Math.round(pauseSec * SAMPLE_RATE) * BYTES_PER_SAMPLE);

    const tmpMp3s = [];
    const tmpWavs = [];
    const tmpSubs = [];

    try {
        for (let i = 0; i < paragraphs.length; i++) {
            const tmpMp3 = path.join(os.tmpdir(), `edge_wt_${process.pid}_p${i}.mp3`);
            const tmpWav = path.join(os.tmpdir(), `edge_wt_${process.pid}_p${i}.wav`);
            const tmpSub = tmpMp3 + '.json';
            await makeTTSWithSubs().ttsPromise(paragraphs[i], tmpMp3);
            mp3ToWav(tmpMp3, tmpWav);
            tmpMp3s.push(tmpMp3);
            tmpWavs.push(tmpWav);
            tmpSubs.push(tmpSub);
        }

        // Stitch WAV
        const pcmChunks = [];
        for (let i = 0; i < tmpWavs.length; i++) {
            pcmChunks.push(fs.readFileSync(tmpWavs[i]).subarray(WAV_HEADER_BYTES));
            if (i < tmpWavs.length - 1) pcmChunks.push(silence);
        }
        const combined = Buffer.concat(pcmChunks);
        fs.writeFileSync(wavPath, Buffer.concat([buildWavHeader(combined.length), combined]));

        // Stitch timings — accumulate offset per paragraph
        const allTimings = [];
        let offsetSec = 0;
        for (let i = 0; i < tmpWavs.length; i++) {
            const pcmBytes = fs.readFileSync(tmpWavs[i]).length - WAV_HEADER_BYTES;
            const paraSeconds = pcmBytes / (SAMPLE_RATE * BYTES_PER_SAMPLE);

            if (fs.existsSync(tmpSubs[i])) {
                const raw = JSON.parse(fs.readFileSync(tmpSubs[i], 'utf8'));
                for (const entry of raw) {
                    allTimings.push({
                        word: entry.part,
                        start: parseFloat((offsetSec + entry.start / 1000).toFixed(3)),
                        end:   parseFloat((offsetSec + entry.end   / 1000).toFixed(3)),
                    });
                }
            }

            offsetSec += paraSeconds + pauseSec;
        }
        fs.writeFileSync(timingsPath, JSON.stringify(allTimings, null, 2));
    } finally {
        for (const f of [...tmpMp3s, ...tmpWavs, ...tmpSubs]) {
            if (fs.existsSync(f)) fs.unlinkSync(f);
        }
    }
}
