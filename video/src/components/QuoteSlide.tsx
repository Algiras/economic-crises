import { FONT_DISPLAY } from '../fonts';
import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { KaraokeText, WordTiming } from './KaraokeText';
import { COLORS } from '../theme';
import { useFadeOut, useKenBurns, KBDirection } from '../hooks/useAnimation';
import { AnimatedBgImage } from './AnimatedBgImage';

interface QuoteSlideProps {
    quote: string;
    attribution?: string;
    accentColor?: string;
    bgImage?: string;
    wordTimings?: WordTiming[] | null;
    slideIndex?: number;
    kbDirection?: KBDirection;
}

export const QuoteSlide: React.FC<QuoteSlideProps> = ({
    quote,
    attribution,
    accentColor = COLORS.gold,
    bgImage,
    wordTimings,
    slideIndex = 0,
    kbDirection,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const fontSize = Math.max(36, Math.min(64, Math.round(1150 / Math.sqrt(quote.length))));

    const { scale, panX, panY } = useKenBurns(kbDirection, slideIndex);

    const textOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
    const textY = spring({ frame, fps, from: 30, to: 0, durationInFrames: 30, config: { damping: 12 } });
    const barWidth = spring({ frame, fps, from: 0, to: 60, durationInFrames: 25, config: { damping: 14, stiffness: 200 } });

    const fadeOutOpacity = useFadeOut(10);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: COLORS.bgSlide,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT_DISPLAY,
            position: 'relative',
            overflow: 'hidden',
            opacity: fadeOutOpacity,
        }}>
            {/* 1. Full-Bleed Dynamic Background Element */}
            {bgImage && (
                <AnimatedBgImage src={bgImage} scale={scale} panX={panX} panY={panY} vignetteStrength="heavy" />
            )}

            {/* 2. Bold, Minimal Typography Overlay */}
            <div style={{
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0 150px',
                opacity: textOpacity,
                transform: `translateY(${textY}px)`,
                maxWidth: 1400,
            }}>
                {/* Subtle decorative accent */}
                <div style={{
                    width: barWidth, height: 4,
                    background: accentColor,
                    marginBottom: 40,
                    boxShadow: `0 0 20px ${accentColor}`
                }} />

                <h2 style={{
                    color: '#ffffff',
                    fontSize,
                    fontWeight: 800,
                    lineHeight: 1.3,
                    margin: 0,
                    textAlign: 'center',
                    letterSpacing: '-1px',
                    textShadow: '0 10px 30px rgba(0,0,0,0.8)',
                }}>
                    {wordTimings && wordTimings.length > 0
                        ? <KaraokeText wordTimings={wordTimings} />
                        : quote
                    }
                </h2>

                {attribution && (
                    <p style={{
                        color: COLORS.textMuted,
                        fontSize: 24,
                        fontWeight: 600,
                        letterSpacing: 4,
                        textTransform: 'uppercase',
                        marginTop: 60,
                    }}>
                        {attribution}
                    </p>
                )}
            </div>
        </div>
    );
};
