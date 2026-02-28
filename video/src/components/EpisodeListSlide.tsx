import { FONT } from '../fonts';
import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../theme';
import { useFadeOut } from '../hooks/useAnimation';

interface Episode {
    num: number;
    title: string;
    subtitle: string;
}

interface EpisodeListSlideProps {
    episodes: Episode[];
}

const STAGGER = 14;

export const EpisodeListSlide: React.FC<EpisodeListSlideProps> = ({ episodes }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const headerOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
    const headerY = spring({ frame, fps, from: -30, to: 0, durationInFrames: 30, config: { damping: 14 } });

    const fadeOut = useFadeOut(20);

    const col1 = episodes.filter((_, i) => i % 2 === 0);
    const col2 = episodes.filter((_, i) => i % 2 === 1);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '50px 60px',
            fontFamily: FONT,
            opacity: fadeOut,
            boxSizing: 'border-box',
            overflowY: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                opacity: headerOpacity,
                transform: `translateY(${headerY}px)`,
                marginBottom: 28,
                textAlign: 'center',
            }}>
                <div style={{
                    width: 60, height: 3,
                    backgroundColor: COLORS.gold,
                    margin: '0 auto 20px',
                    boxShadow: '0 0 16px rgba(240,173,78,0.6)',
                }} />
                <h2 style={{
                    color: '#ffffff',
                    fontSize: 36,
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: 6,
                    textTransform: 'uppercase',
                }}>
                    Episode Guide
                </h2>
            </div>

            {/* Two-column grid */}
            <div style={{ display: 'flex', gap: 60, width: '100%' }}>
                <EpisodeColumn episodes={col1} baseFrame={frame} fps={fps} colOffset={0} />
                <EpisodeColumn episodes={col2} baseFrame={frame} fps={fps} colOffset={1} />
            </div>
        </div>
    );
};

const EpisodeColumn: React.FC<{
    episodes: Episode[];
    baseFrame: number;
    fps: number;
    colOffset: number;
}> = ({ episodes, baseFrame, colOffset }) => {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {episodes.map((ep, idx) => {
                const originalIndex = idx * 2 + colOffset;
                const appearFrame = 30 + originalIndex * STAGGER;

                const opacity = interpolate(baseFrame, [appearFrame, appearFrame + 18], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });
                const translateY = interpolate(baseFrame, [appearFrame, appearFrame + 22], [20, 0], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });

                return (
                    <div key={ep.num} style={{
                        opacity,
                        transform: `translateY(${translateY}px)`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 18,
                        padding: '10px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <span style={{
                            color: COLORS.blue,
                            fontSize: 21,
                            fontWeight: 700,
                            letterSpacing: 1,
                            minWidth: 42,
                            textTransform: 'uppercase',
                        }}>
                            {String(ep.num).padStart(2, '0')}
                        </span>
                        <div>
                            <p style={{
                                color: '#ffffff',
                                fontSize: 26,
                                fontWeight: 600,
                                margin: 0,
                                lineHeight: 1.2,
                            }}>
                                {ep.title}
                            </p>
                            <p style={{
                                color: '#6a7f90',
                                fontSize: 20,
                                fontWeight: 400,
                                margin: '3px 0 0',
                                letterSpacing: 0.5,
                            }}>
                                {ep.subtitle}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
