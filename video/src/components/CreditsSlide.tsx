import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';

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
    const { durationInFrames } = useVideoConfig();

    const titleOpacity = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: 'clamp' });

    // Fade out
    const fadeOutOpacity = interpolate(
        frame,
        [durationInFrames - 20, durationInFrames],
        [1, 0],
        { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
    );

    return (
        <AbsoluteFill style={{
            backgroundColor: '#020406',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Inter", "Helvetica Neue", sans-serif',
            opacity: fadeOutOpacity,
        }}>
            {/* Background kinetic texture */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at center, rgba(13,27,42,0.3) 0%, rgba(2,4,6,1) 100%)',
                zIndex: 0,
            }} />

            <div style={{ zIndex: 1, textAlign: 'center', maxWidth: 1000 }}>
                <h2 style={{
                    opacity: titleOpacity,
                    color: '#f0ad4e',
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: 6,
                    textTransform: 'uppercase',
                    margin: '0 0 60px 0',
                    textShadow: '0 0 20px rgba(240, 173, 78, 0.4)',
                }}>
                    Key Sources & References
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {references.map((ref, i) => {
                        const refOpacity = interpolate(frame, [30 + i * 10, 60 + i * 10], [0, 1], { extrapolateRight: 'clamp' });
                        const refY = interpolate(frame, [30 + i * 10, 60 + i * 10], [20, 0], { extrapolateRight: 'clamp' });
                        return (
                            <p key={i} style={{
                                opacity: refOpacity,
                                transform: `translateY(${refY}px)`,
                                color: '#bdc3c7',
                                fontSize: 18,
                                lineHeight: 1.6,
                                margin: '0 0 24px 0',
                                fontWeight: 400,
                                textAlign: 'center',
                                maxWidth: 800,
                            }}>
                                {ref}
                            </p>
                        );
                    })}
                </div>

                <div style={{
                    marginTop: 80,
                    opacity: interpolate(frame, [120, 150], [0, 1], { extrapolateRight: 'clamp' }),
                }}>
                    <div style={{ width: 100, height: 1, background: '#34495e', margin: '0 auto 30px' }} />
                    <p style={{
                        color: '#7f8c8d',
                        fontSize: 16,
                        fontWeight: 600,
                        letterSpacing: 4,
                        textTransform: 'uppercase',
                    }}>
                        Economic Crises Explained · 2026
                    </p>
                </div>
            </div>
        </AbsoluteFill>
    );
};
