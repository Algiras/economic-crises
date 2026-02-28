import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { FONT_DISPLAY } from './fonts';
import { SHADOWS } from './theme';
import { SeriesOpener, OPENER_FRAMES } from './components/SeriesOpener';
import { NarratedTextSlide } from './components/NarratedTextSlide';
import { EpisodeListSlide } from './components/EpisodeListSlide';
import { FilmGrain } from './components/FilmGrain';
import { ColorGrade } from './components/ColorGrade';
import { Letterbox } from './components/Letterbox';
import { LightLeak } from './components/LightLeak';
import { EPISODE_LIST } from './constants/episodes';
import { COLORS } from './theme';

import rawOverviewTimings from '../public/audio/series_overview.timings.json';
import introChunks from '../data/intro_chunks.json';

const FPS = 30;
const PAUSE_SEC   = 0.6;  // silence between paragraphs (matches original synthesizeWithPauses)
const PAUSE_FRAMES = Math.round(PAUSE_SEC * FPS);

/** Compute cumulative frame offsets for a list of audio chunks. */
function chunkOffsets(chunks: typeof introChunks.intro_narration) {
    const offsets: number[] = [];
    let offset = 0;
    for (const chunk of chunks) {
        offsets.push(offset);
        offset += Math.ceil(chunk.durationSec * FPS) + PAUSE_FRAMES;
    }
    return { offsets, totalFrames: offset - PAUSE_FRAMES };
}

const introResult   = chunkOffsets(introChunks.intro_narration);
const overviewResult = chunkOffsets(introChunks.series_overview);

// Keep word timings for NarratedTextSlide (uses original stitched timing offsets)
// Split overview at "For every crisis" (first word of second paragraph)
const SPLIT_SEC = 15.317;
const overviewTimings1 = rawOverviewTimings.filter(w => w.end <= SPLIT_SEC);
const overviewTimings2 = rawOverviewTimings.filter(w => w.start >= SPLIT_SEC);
const BLOCK1_END_SEC = overviewTimings1[overviewTimings1.length - 1]?.end ?? SPLIT_SEC;
const SPLIT_FRAME = Math.ceil(BLOCK1_END_SEC * FPS);

const OVERVIEW_FRAMES = overviewResult.totalFrames + FPS; // small tail buffer
const CTA_FRAMES      = 5 * FPS;

export const SERIES_INTRO_TOTAL =
    OPENER_FRAMES + OVERVIEW_FRAMES + CTA_FRAMES;


/** Renders block1 timings until splitFrame, then crossfades to block2 timings — no Sequence needed */
const OverviewNarrationPanel: React.FC<{
    timings1: typeof overviewTimings1;
    timings2: typeof overviewTimings2;
    splitFrame: number;
}> = ({ timings1, timings2, splitFrame }) => {
    const frame = useCurrentFrame();
    const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
    const op1 = interpolate(frame, [splitFrame - 10, splitFrame], [1, 0], clamp);
    const op2 = interpolate(frame, [splitFrame, splitFrame + 10], [0, 1], clamp);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: op1 }}>
                <NarratedTextSlide text="" wordTimings={timings1} />
            </div>
            <div style={{ position: 'absolute', inset: 0, opacity: op2 }}>
                <NarratedTextSlide text="" wordTimings={timings2} fontSize={42} />
            </div>
        </div>
    );
};

const CtaSlide: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const lineWidth = spring({ frame, fps, from: 0, to: 480, durationInFrames: 28, config: { damping: 14, stiffness: 180 } });
    const opacity   = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const y         = spring({ frame, fps, from: 30, to: 0, durationInFrames: 30, delay: 10, config: { damping: 14 } });
    const fadeOut   = interpolate(frame, [CTA_FRAMES - 20, CTA_FRAMES], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{
            background: COLORS.bgDark,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: fadeOut,
        }}>
            <div style={{ width: lineWidth, height: 3, backgroundColor: COLORS.gold, marginBottom: 48, boxShadow: SHADOWS.goldenGlow }} />
            <div style={{ opacity, transform: `translateY(${y}px)`, textAlign: 'center' }}>
                <p style={{
                    color: '#ffffff',
                    fontSize: 80,
                    fontWeight: 900,
                    margin: 0,
                    letterSpacing: '-2px',
                    fontFamily: FONT_DISPLAY,
                    textShadow: '0 8px 30px rgba(0,0,0,0.9)',
                }}>
                    Let's get started
                </p>
            </div>
        </AbsoluteFill>
    );
};

const SceneDipOverlay: React.FC<{ boundaries: number[] }> = ({ boundaries }) => {
    const frame = useCurrentFrame();
    const opacity = boundaries.reduce((max, boundary) => {
        const dist = Math.abs(frame - boundary);
        if (dist > 10) return max;
        return Math.max(max, interpolate(dist, [0, 10], [1, 0], { extrapolateRight: 'clamp' }));
    }, 0);
    if (opacity === 0) return null;
    return <AbsoluteFill style={{ backgroundColor: 'black', opacity, zIndex: 50, pointerEvents: 'none' }} />;
};

export const SeriesIntroVideo: React.FC = () => {
    const overviewStart = OPENER_FRAMES;
    const ctaStart      = overviewStart + OVERVIEW_FRAMES;
    return (
        <AbsoluteFill style={{ background: COLORS.bgDark }}>
            <Audio src={staticFile('audio/bgm.wav')} volume={0.06} loop />
            <FilmGrain />
            <ColorGrade />
            <Letterbox />
            <LightLeak boundaries={[overviewStart, ctaStart]} />
            <SceneDipOverlay boundaries={[overviewStart, ctaStart]} />

            {/* 1. Branded opener with per-paragraph narration (no stitching = no clicks) */}
            <Sequence from={0} durationInFrames={OPENER_FRAMES}>
                {introChunks.intro_narration.map((chunk, i) => (
                    <Sequence key={i} from={introResult.offsets[i]}>
                        <Audio src={staticFile(chunk.file)} />
                    </Sequence>
                ))}
                <SeriesOpener />
            </Sequence>

            {/* 2. Overview — episode list left, narration right; per-paragraph audio */}
            <Sequence from={overviewStart} durationInFrames={OVERVIEW_FRAMES}>
                {introChunks.series_overview.map((chunk, i) => (
                    <Sequence key={i} from={overviewResult.offsets[i]}>
                        <Audio src={staticFile(chunk.file)} />
                    </Sequence>
                ))}
                <AbsoluteFill style={{ display: 'flex', flexDirection: 'row', background: COLORS.bgDark }}>
                    {/* Left: episode list — spans full duration, already fully rendered after stagger */}
                    <div style={{ width: '50%', height: '100%', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                        <EpisodeListSlide episodes={EPISODE_LIST} />
                    </div>
                    {/* Right: narration swaps at split without Sequence (avoids AbsoluteFill bleed) */}
                    <div style={{ width: '50%', height: '100%' }}>
                        <OverviewNarrationPanel
                            timings1={overviewTimings1}
                            timings2={overviewTimings2}
                            splitFrame={SPLIT_FRAME}
                        />
                    </div>
                </AbsoluteFill>
            </Sequence>

            {/* 3. CTA — "Let's get started" (5s) */}
            <Sequence from={ctaStart} durationInFrames={CTA_FRAMES}>
                <CtaSlide />
            </Sequence>
        </AbsoluteFill>
    );
};
