import { FONT } from '../fonts';
import React from 'react';
import { Img, interpolate, useCurrentFrame, useVideoConfig, spring, staticFile, AbsoluteFill } from 'remotion';
import { COLORS, SHADOWS } from '../theme';
import { useFadeOut, useKenBurns } from '../hooks/useAnimation';
import { AnimatedBgImage } from './AnimatedBgImage';

interface ChartSlideProps {
    chartSrc: string;
    title: string;
    source?: string;
    bgImage?: string;
    slideIndex?: number;
}

export const ChartSlide: React.FC<ChartSlideProps> = ({
    chartSrc,
    title,
    source,
    bgImage = 'bg_interest_chart.jpg',
    slideIndex = 0,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const { scale: bgScale, panX: bgPanX, panY: bgPanY } = useKenBurns(undefined, slideIndex);

    // Entrance animations for chart
    const chartOpacity = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: 'clamp' });
    const chartScale = spring({ frame, fps, from: 0.8, to: 1, durationInFrames: 60, delay: 10, config: { damping: 12 } });

    const titleOpacity = interpolate(frame, [20, 50], [0, 1], { extrapolateRight: 'clamp' });
    const titleY = spring({ frame, fps, from: 20, to: 0, durationInFrames: 40, delay: 20 });

    const fadeOutOpacity = useFadeOut();

    return (
        <AbsoluteFill style={{
            backgroundColor: COLORS.bgSlide,
            fontFamily: FONT,
            opacity: fadeOutOpacity,
            overflow: 'hidden',
        }}>
            {/* 1. Cinematic Background */}
            <AnimatedBgImage src={bgImage} scale={bgScale} panX={bgPanX} panY={bgPanY} opacity={0.4} vignetteStrength="heavy" />

            {/* 2. Content Layer */}
            <div style={{
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                padding: '60px 100px',
            }}>
                <div style={{
                    opacity: titleOpacity,
                    transform: `translateY(${titleY}px)`,
                    textAlign: 'center',
                    marginBottom: 40,
                }}>
                    <h2 style={{
                        color: COLORS.gold,
                        fontSize: 42,
                        fontWeight: 800,
                        margin: 0,
                        letterSpacing: -1,
                        textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                    }}>
                        {title}
                    </h2>
                </div>

                <div style={{
                    opacity: chartOpacity,
                    transform: `scale(${chartScale})`,
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: SHADOWS.cardDrop,
                    maxWidth: 1000,
                    width: '100%',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}>
                    <Img
                        src={staticFile(chartSrc)}
                        style={{
                            width: '100%',
                            display: 'block',
                            filter: 'brightness(1.1) contrast(1.1)',
                        }}
                    />
                </div>

                {source && (
                    <p style={{
                        opacity: titleOpacity,
                        color: '#7f8c8d',
                        fontSize: 18,
                        marginTop: 40,
                        fontStyle: 'italic',
                        fontWeight: 500,
                    }}>
                        Source: {source}
                    </p>
                )}
            </div>
        </AbsoluteFill>
    );
};
