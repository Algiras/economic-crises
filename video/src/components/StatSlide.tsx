import { FONT_DISPLAY } from '../fonts';
import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring, AbsoluteFill } from 'remotion';
import { COLORS } from '../theme';
import { useFadeOut, useKenBurns } from '../hooks/useAnimation';
import { AnimatedBgImage } from './AnimatedBgImage';

interface StatSlideProps {
    stat: string;
    description: string;
    bgImage?: string;
    slideIndex?: number;
}

export const StatSlide: React.FC<StatSlideProps> = ({
    stat,
    description,
    bgImage = 'bg_demographics.jpg',
    slideIndex = 0,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const { scale: bgScale, panX: bgPanX, panY: bgPanY } = useKenBurns(undefined, slideIndex);

    // Entrance animations
    const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
    const statScale = spring({ frame, fps, from: 0.5, to: 1, durationInFrames: 50, config: { damping: 12 } });

    const descOpacity = interpolate(frame, [40, 70], [0, 1], { extrapolateRight: 'clamp' });
    const descY = spring({ frame, fps, from: 20, to: 0, durationInFrames: 40, delay: 40 });

    // Animated counter: parse numeric prefix from stat (e.g. "25%", "$700B", "89")
    const counterProgress = interpolate(frame, [0, 90], [0, 1], {
        extrapolateRight: 'clamp',
        easing: (t) => 1 - Math.pow(1 - t, 3),
    });
    const displayStat = (() => {
        const match = stat.match(/^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/);
        if (!match) return stat;
        const [, prefix, numStr, suffix] = match;
        const num = parseFloat(numStr);
        const animated = num * counterProgress;
        const decimals = (numStr.includes('.') ? numStr.split('.')[1].length : 0);
        return `${prefix}${animated.toFixed(decimals)}${suffix}`;
    })();

    // Heartbeat pulse
    const pulse = Math.sin((frame / 45) * Math.PI) * 0.03 + 1;

    const fadeOutOpacity = useFadeOut();

    return (
        <AbsoluteFill style={{
            backgroundColor: COLORS.bgSlide,
            fontFamily: FONT_DISPLAY,
            opacity: fadeOutOpacity,
            overflow: 'hidden',
        }}>
            {/* 1. Cinematic Background */}
            <AnimatedBgImage src={bgImage} scale={bgScale} panX={bgPanX} panY={bgPanY} opacity={0.4} vignetteStrength="light" />

            {/* 2. Content Layer */}
            <div style={{
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                padding: '0 100px',
                opacity,
            }}>
                <h1 style={{
                    color: COLORS.gold,
                    fontSize: 220,
                    fontWeight: 900,
                    margin: 0,
                    letterSpacing: '-8px',
                    transform: `scale(${statScale * pulse})`,
                    textShadow: '0 20px 80px rgba(0,0,0,0.8), 0 0 30px rgba(240,173,78,0.3)',
                }}>
                    {displayStat}
                </h1>

                <div style={{
                    opacity: descOpacity,
                    transform: `translateY(${descY}px)`,
                    maxWidth: 900,
                    textAlign: 'center',
                    marginTop: -20,
                }}>
                    <p style={{
                        color: '#ffffff',
                        fontSize: 36,
                        fontWeight: 700,
                        lineHeight: 1.3,
                        margin: 0,
                        letterSpacing: '-0.5px',
                        textShadow: '0 5px 15px rgba(0,0,0,0.8)',
                    }}>
                        {description}
                    </p>
                </div>
            </div>
        </AbsoluteFill>
    );
};
