import { FONT, FONT_DISPLAY } from '../fonts';
import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring, AbsoluteFill } from 'remotion';
import { COLORS, SHADOWS } from '../theme';
import { useFadeOut, useKenBurns } from '../hooks/useAnimation';
import { AnimatedBgImage } from './AnimatedBgImage';

const references = [
    'Friedman M. & Schwartz A.J. (1963). A Monetary History of the United States. Princeton University Press.',
    'Bernanke B. (2015). The Courage to Act. W.W. Norton. · Geithner T. (2014). Stress Test. Crown.',
    'IMF World Economic Outlook Database (2024). GDP growth, unemployment, inflation series.',
    'Reinhart C.M. & Rogoff K.S. (2009). This Time Is Different: Eight Centuries of Financial Folly.',
    'Caballero R.J. & Krishnamurthy A. (2009). Global imbalances and financial fragility. NBER.',
    'Acemoglu D. & Robinson J.A. (2012). Why Nations Fail. Crown Publishers.',
];

export const CreditsSlide: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const { scale, panX, panY } = useKenBurns('out');
    const fadeOutOpacity = useFadeOut(20);

    // Title entrance
    const titleOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
    const titleY = spring({ frame, fps, from: -30, to: 0, durationInFrames: 30, config: { damping: 14 } });

    // Gold accent line sweeps in
    const lineWidth = spring({ frame, fps, from: 0, to: 500, durationInFrames: 35, config: { damping: 12 } });

    return (
        <AbsoluteFill style={{
            backgroundColor: COLORS.bgDark,
            fontFamily: FONT,
            opacity: fadeOutOpacity,
            overflow: 'hidden',
        }}>
            {/* Cinematic background */}
            <AnimatedBgImage
                src="bg_wallstreet.jpg"
                scale={scale}
                panX={panX}
                panY={panY}
                opacity={0.25}
                vignetteStrength="heavy"
            />

            <div style={{
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                padding: '60px 120px',
            }}>
                {/* Animated accent line */}
                <div style={{
                    width: lineWidth,
                    height: 3,
                    backgroundColor: COLORS.gold,
                    marginBottom: 32,
                    boxShadow: SHADOWS.goldenGlow,
                }} />

                {/* Title */}
                <div style={{
                    opacity: titleOpacity,
                    transform: `translateY(${titleY}px)`,
                    marginBottom: 48,
                    textAlign: 'center',
                }}>
                    <h2 style={{
                        fontFamily: FONT_DISPLAY,
                        color: COLORS.gold,
                        fontSize: 36,
                        fontWeight: 900,
                        letterSpacing: 8,
                        textTransform: 'uppercase',
                        margin: 0,
                        textShadow: '0 0 30px rgba(240,173,78,0.5)',
                    }}>
                        Key Sources & References
                    </h2>
                </div>

                {/* References */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    {references.map((ref, i) => {
                        const appearStart = 20 + i * 12;
                        const refOpacity = interpolate(frame, [appearStart, appearStart + 20], [0, 1], { extrapolateRight: 'clamp' });
                        const refY = spring({ frame, fps, from: 24, to: 0, durationInFrames: 30, delay: appearStart, config: { damping: 14 } });
                        return (
                            <p key={i} style={{
                                opacity: refOpacity,
                                transform: `translateY(${refY}px)`,
                                color: '#bdc3c7',
                                fontSize: 26,
                                lineHeight: 1.55,
                                margin: '0 0 18px 0',
                                fontWeight: 400,
                                textAlign: 'center',
                                maxWidth: 1300,
                                textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                            }}>
                                {ref}
                            </p>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: 48,
                    opacity: interpolate(frame, [100, 130], [0, 1], { extrapolateRight: 'clamp' }),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <div style={{ width: 80, height: 2, background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`, marginBottom: 20 }} />
                    <p style={{
                        color: COLORS.textMuted,
                        fontSize: 20,
                        fontWeight: 600,
                        letterSpacing: 5,
                        textTransform: 'uppercase',
                        margin: 0,
                    }}>
                        Economic Crises Explained · 2026
                    </p>
                </div>
            </div>
        </AbsoluteFill>
    );
};
