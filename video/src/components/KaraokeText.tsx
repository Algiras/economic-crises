import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export interface WordTiming {
    word: string;
    start: number; // seconds
    end: number;   // seconds
}

interface KaraokeTextProps {
    wordTimings: WordTiming[];
    style?: React.CSSProperties;
    glowColor?: string;
}

/**
 * Renders words with a karaoke-style white glow that tracks the currently
 * spoken word. Unspoken words are dim; the active word brightens to full white.
 * Reused by QuoteSlide and NarratedTextSlide.
 */
export const KaraokeText: React.FC<KaraokeTextProps> = ({
    wordTimings,
    style,
    glowColor = '#ffffff',
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentSec = frame / fps;
    const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

    return (
        <>
            {wordTimings.map((w, i) => {
                const spoken = currentSec >= w.start;
                const eps = 0.001;
                const p2 = Math.min(w.start + 0.1, w.end - eps);
                const p3 = Math.max(p2 + eps, w.end);
                const glow = interpolate(
                    currentSec,
                    [w.start, p2, p3, w.end + 0.13],
                    [0, 1, 1, 0],
                    clamp,
                );
                const brightness = Math.round(interpolate(glow, [0, 1], [spoken ? 255 : 89, 255]));
                const alpha = spoken ? 1 : interpolate(glow, [0, 1], [0.35, 1], clamp);
                const glowPx = Math.round(glow * 14);

                return (
                    <span
                        key={i}
                        style={{
                            ...style,
                            color: `rgba(${brightness},${brightness},${brightness},${alpha.toFixed(2)})`,
                            textShadow: glow > 0.05
                                ? `0 0 ${glowPx}px ${glowColor}`
                                : '0 10px 30px rgba(0,0,0,0.8)',
                        }}
                    >
                        {w.word}{' '}
                    </span>
                );
            })}
        </>
    );
};
