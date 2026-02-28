import { FONT_DISPLAY } from '../fonts';
import React from 'react';
import { Img, interpolate, useCurrentFrame, useVideoConfig, spring, staticFile } from 'remotion';
import { COLORS, SHADOWS } from '../theme';
import { useFadeOut } from '../hooks/useAnimation';

interface TitleCardProps {
    episodeNumber?: number;
    episodeTitle?: string;
    episodeSubtitle?: string;
}

export const TitleCard: React.FC<TitleCardProps> = ({ episodeNumber, episodeTitle, episodeSubtitle }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    const coverOpacity = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: 'clamp' });
    const titleY = spring({ frame, fps, from: 60, to: 0, durationInFrames: 50, config: { damping: 14 } });
    const titleOpacity = interpolate(frame, [20, 60], [0, 1], { extrapolateRight: 'clamp' });
    const subtitleOpacity = interpolate(frame, [40, 80], [0, 1], { extrapolateRight: 'clamp' });
    const authorOpacity = interpolate(frame, [60, 100], [0, 1], { extrapolateRight: 'clamp' });

    const scale = interpolate(frame, [0, durationInFrames], [1, 1.1], { extrapolateRight: 'clamp' });

    const fadeOutOpacity = useFadeOut();

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: COLORS.bgDark,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT_DISPLAY,
            opacity: fadeOutOpacity,
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Deep cinematic background */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(ellipse at center, rgba(13,27,42,0.8) 0%, rgba(2,4,6,1) 80%)',
                transform: `scale(${scale})`,
                zIndex: 0,
            }} />

            <div style={{ opacity: coverOpacity, marginBottom: 60, zIndex: 1, transform: `translateY(${titleY / 2}px)` }}>
                <Img
                    src={staticFile('cover.png')}
                    style={{ width: 280, borderRadius: 12, boxShadow: SHADOWS.cardDrop }}
                />
            </div>

            <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, textAlign: 'center', zIndex: 1 }}>
                {episodeNumber ? (
                    <>
                        <p style={{ color: COLORS.blue, fontSize: 18, fontWeight: 700, letterSpacing: 6, textTransform: 'uppercase', margin: '0 0 16px' }}>
                            Episode {episodeNumber}
                        </p>
                        <h1 style={{ color: '#ffffff', fontSize: 72, fontWeight: 900, margin: 0, letterSpacing: '-2px', lineHeight: 1.05, textTransform: 'uppercase', textShadow: SHADOWS.titleDrop }}>
                            {episodeTitle}
                        </h1>
                    </>
                ) : (
                    <h1 style={{ color: '#ffffff', fontSize: 82, fontWeight: 900, margin: 0, letterSpacing: '-3px', lineHeight: 1.05, textTransform: 'uppercase', textShadow: SHADOWS.titleDrop }}>
                        Economic<br /><span style={{ color: COLORS.blue }}>Crises</span><br />Explained
                    </h1>
                )}
            </div>

            <div style={{ opacity: subtitleOpacity, marginTop: 30, zIndex: 1 }}>
                <p style={{ color: COLORS.textMuted, fontSize: 26, margin: 0, fontWeight: 300, letterSpacing: 2, textShadow: '0 10px 20px rgba(0,0,0,0.6)' }}>
                    {episodeSubtitle ?? 'A Documentary Series · Seventeen Crises · A Century of Economic Management'}
                </p>
            </div>

            <div style={{ opacity: authorOpacity, marginTop: 50, zIndex: 1 }}>
                <p style={{ color: COLORS.gold, fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: 4 }}>
                    ALGIMANTAS K. · 2026
                </p>
            </div>
        </div>
    );
};
