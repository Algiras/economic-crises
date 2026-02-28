import { FONT_DISPLAY } from '../fonts';
import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { COLORS, SHADOWS } from '../theme';

const DIP_FRAMES = 8;

// Variable card boundaries derived from intro_narration.wav word timings.
// Each card starts ~12 frames before its sentence so the visual settles as narration begins.
// Sentence audio starts: "Three" 3f, "Seventeen" 58f, "Each" 118f, "This" 234f
const CARD_STARTS = [0, 46, 106, 222] as const; // frame each card becomes active
export const OPENER_FRAMES = 360;               // full — Episode 0 only
export const EPISODE_OPENER_FRAMES = 210;       // short brand card — every episode (~7s)

// Words tagged as gold/large get cinematic emphasis
interface WordDef {
    word: string;
    break?: boolean; // line break after this word
}

const CARDS: { words: WordDef[]; baseFontSize: number }[] = [
    {
        baseFontSize: 88,
        words: [
            { word: 'Three' },
            { word: 'hundred' },
            { word: 'years', break: true },
        ],
    },
    {
        baseFontSize: 88,
        words: [
            { word: 'Seventeen' },
            { word: 'crises', break: true },
        ],
    },
    {
        baseFontSize: 54,
        words: [
            { word: 'Each' },
            { word: 'one' },
            { word: 'came' },
            { word: 'with', break: true },
            { word: 'warnings' },
            { word: 'nobody' },
            { word: 'wanted' },
            { word: 'to', break: true },
            { word: 'hear' },
        ],
    },
    // Card 4 is the brand card
];

interface StaggeredWordsProps {
    words: WordDef[];
    baseFontSize: number;
    localFrame: number;
    fps: number;
}

const WORD_STAGGER = 8; // frames between each word appearing

const StaggeredWords: React.FC<StaggeredWordsProps> = ({ words, baseFontSize, localFrame, fps }) => {
    // Shared block slide-up — all words move together
    const blockY = spring({ frame: localFrame, fps, from: 40, to: 0, durationInFrames: 35, config: { damping: 15, stiffness: 160 } });

    // Build lines by splitting on break markers
    const lines: WordDef[][] = [[]];
    for (const w of words) {
        lines[lines.length - 1].push(w);
        if (w.break) lines.push([]);
    }
    if (lines[lines.length - 1].length === 0) lines.pop();

    let wordIdx = 0;
    return (
        <div style={{ textAlign: 'center', lineHeight: 1.3, transform: `translateY(${blockY}px)` }}>
            {lines.map((line, li) => (
                <div key={li} style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    marginBottom: li < lines.length - 1 ? baseFontSize * 0.12 : 0,
                }}>
                    {line.map((w) => {
                        const idx = wordIdx++;
                        const delay = idx * WORD_STAGGER;
                        const wOpacity = interpolate(localFrame, [delay, delay + 18], [0, 1], {
                            extrapolateLeft: 'clamp',
                            extrapolateRight: 'clamp',
                        });
                        // Ink bleed: blur collapses from 14px → 0 as word materialises
                        const wBlur = interpolate(localFrame, [delay, delay + 22], [14, 0], {
                            extrapolateLeft: 'clamp',
                            extrapolateRight: 'clamp',
                        });

                        return (
                            <span
                                key={idx}
                                style={{
                                    display: 'inline-block',
                                    opacity: wOpacity,
                                    filter: `blur(${wBlur}px)`,
                                    fontSize: baseFontSize,
                                    fontWeight: 900,
                                    color: '#ffffff',
                                    textShadow: '0 6px 24px rgba(0,0,0,0.85)',
                                    letterSpacing: '-1px',
                                    fontFamily: FONT_DISPLAY,
                                    marginRight: idx < words.length - 1 ? baseFontSize * 0.28 : 0,
                                }}
                            >
                                {w.word}
                            </span>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

interface TextCardProps {
    cardDef: typeof CARDS[number];
    localFrame: number;
    fps: number;
    cardDuration: number;
}

const TextCard: React.FC<TextCardProps> = ({ cardDef, localFrame, fps, cardDuration }) => {
    // Fade the whole card out near end
    const cardOpacity = interpolate(localFrame, [cardDuration - DIP_FRAMES - 4, cardDuration - DIP_FRAMES], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 180px',
            opacity: cardOpacity,
        }}>
            <StaggeredWords
                words={cardDef.words}
                baseFontSize={cardDef.baseFontSize}
                localFrame={localFrame}
                fps={fps}
            />
        </div>
    );
};

interface BrandCardProps {
    localFrame: number;
    fps: number;
}

const BrandCard: React.FC<BrandCardProps> = ({ localFrame, fps }) => {
    const opacity = interpolate(localFrame, [0, 18], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const lineWidth = interpolate(localFrame, [4, 22], [0, 620], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const title1Y = spring({ frame: localFrame, fps, from: 50, to: 0, durationInFrames: 20, delay: 10, config: { damping: 13 } });
    const title2Y = spring({ frame: localFrame, fps, from: 40, to: 0, durationInFrames: 20, delay: 20, config: { damping: 13 } });
    const title1Opacity = interpolate(localFrame, [10, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const title2Opacity = interpolate(localFrame, [20, 36], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const subtitleOpacity = interpolate(localFrame, [32, 46], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity,
        }}>
            <div style={{ width: lineWidth, height: 3, backgroundColor: COLORS.gold, marginBottom: 36, boxShadow: SHADOWS.goldenGlow }} />

            <div style={{ opacity: title1Opacity, transform: `translateY(${title1Y}px)` }}>
                <h1 style={{
                    color: '#ffffff', fontSize: 100, fontWeight: 900, margin: 0,
                    letterSpacing: '-2px', lineHeight: 1, textTransform: 'uppercase',
                    textAlign: 'center', textShadow: '0 20px 60px rgba(0,0,0,0.9)',
                    fontFamily: FONT_DISPLAY,
                }}>
                    ECONOMIC CRISES
                </h1>
            </div>

            <div style={{ opacity: title2Opacity, transform: `translateY(${title2Y}px)` }}>
                <h1 style={{
                    color: COLORS.blue, fontSize: 100, fontWeight: 900, margin: 0,
                    letterSpacing: 16, lineHeight: 1, textTransform: 'uppercase',
                    textAlign: 'center', textShadow: '0 20px 60px rgba(78,159,240,0.5)',
                    fontFamily: FONT_DISPLAY,
                }}>
                    EXPLAINED
                </h1>
            </div>

            <div style={{ opacity: subtitleOpacity, marginTop: 32 }}>
                <p style={{
                    color: COLORS.textMuted, fontSize: 18, fontWeight: 400,
                    letterSpacing: 7, textTransform: 'uppercase', margin: 0,
                    textAlign: 'center', fontFamily: FONT_DISPLAY,
                }}>
                    A Documentary Series
                </p>
            </div>
        </div>
    );
};

interface SeriesOpenerProps {
    short?: boolean;
    episodeNumber?: number;
    episodeTitle?: string;
    episodeSubtitle?: string;
}

export const SeriesOpener: React.FC<SeriesOpenerProps> = ({ short = false, episodeNumber, episodeTitle, episodeSubtitle }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Short mode: brand settles (0-50f), then divider + episode info (55f+)
    if (short) {
        // Beat 1: brand card (same as full mode)
        // Beat 2: separator line sweeps in at frame 55, episode text follows
        const BEAT2 = 55;
        const dividerWidth = spring({ frame, fps, from: 0, to: 320, durationInFrames: 22, delay: BEAT2, config: { damping: 14, stiffness: 200 } });
        const epNumOpacity  = interpolate(frame, [BEAT2 + 18, BEAT2 + 32], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const epNumY        = spring({ frame, fps, from: 16, to: 0, durationInFrames: 24, delay: BEAT2 + 18, config: { damping: 14 } });
        const titleOpacity  = interpolate(frame, [BEAT2 + 26, BEAT2 + 42], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const titleY        = spring({ frame, fps, from: 20, to: 0, durationInFrames: 28, delay: BEAT2 + 26, config: { damping: 14 } });
        const subtitleOpacity = interpolate(frame, [BEAT2 + 38, BEAT2 + 52], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

        return (
            <div style={{ width: '100%', height: '100%', backgroundColor: COLORS.bgDark, position: 'relative', overflow: 'hidden' }}>
                {/* Beat 1: brand card anchored to upper-center */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '42%' }}>
                    <BrandCard localFrame={frame} fps={fps} />
                </div>

                {/* Beat 2: episode info in lower section */}
                {episodeTitle && (
                    <div style={{
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0,
                        height: '38%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0,
                    }}>
                        {/* Divider */}
                        <div style={{ width: dividerWidth, height: 2, backgroundColor: COLORS.gold, marginBottom: 28, boxShadow: SHADOWS.goldenGlow }} />

                        {/* Episode number */}
                        <p style={{
                            opacity: epNumOpacity,
                            transform: `translateY(${epNumY}px)`,
                            color: COLORS.textMuted,
                            fontSize: 18,
                            fontWeight: 600,
                            letterSpacing: 7,
                            textTransform: 'uppercase',
                            margin: 0,
                            fontFamily: FONT_DISPLAY,
                        }}>
                            Episode {episodeNumber}
                        </p>

                        {/* Episode title */}
                        <p style={{
                            opacity: titleOpacity,
                            transform: `translateY(${titleY}px)`,
                            color: '#ffffff',
                            fontSize: 48,
                            fontWeight: 900,
                            letterSpacing: '-1px',
                            margin: '12px 0 0',
                            fontFamily: FONT_DISPLAY,
                            textShadow: '0 4px 20px rgba(0,0,0,0.9)',
                            textAlign: 'center',
                            padding: '0 120px',
                        }}>
                            {episodeTitle}
                        </p>

                        {/* Subtitle / date range */}
                        {episodeSubtitle && (
                            <p style={{
                                opacity: subtitleOpacity,
                                color: COLORS.gold,
                                fontSize: 24,
                                fontWeight: 600,
                                letterSpacing: 3,
                                margin: '10px 0 0',
                                fontFamily: FONT_DISPLAY,
                            }}>
                                {episodeSubtitle}
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Find which card is active based on variable boundaries
    let cardIndex = CARD_STARTS.length - 1;
    for (let i = 0; i < CARD_STARTS.length - 1; i++) {
        if (frame < CARD_STARTS[i + 1]) { cardIndex = i; break; }
    }
    const localFrame = frame - CARD_STARTS[cardIndex];

    const dipOpacity = localFrame < DIP_FRAMES && cardIndex > 0
        ? interpolate(localFrame, [0, DIP_FRAMES], [1, 0], { extrapolateRight: 'clamp' })
        : 0;

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: COLORS.bgDark,
            position: 'relative',
            overflow: 'hidden',
        }}>
            {cardIndex < CARDS.length ? (
                <TextCard
                    cardDef={CARDS[cardIndex]}
                    localFrame={localFrame}
                    fps={fps}
                    cardDuration={(cardIndex < CARD_STARTS.length - 1 ? CARD_STARTS[cardIndex + 1] : OPENER_FRAMES) - CARD_STARTS[cardIndex]}
                />
            ) : (
                <BrandCard localFrame={localFrame} fps={fps} />
            )}

            {dipOpacity > 0 && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'black',
                    opacity: dipOpacity,
                    pointerEvents: 'none',
                }} />
            )}
        </div>
    );
};
