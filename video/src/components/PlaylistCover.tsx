import React from 'react';
import { COLORS } from '../theme';

export const PlaylistCover: React.FC = () => {
    const episodes = [
        'The South Sea Bubble',
        'The Long Depression',
        'The Panic of 1907',
        'The Weimar Hyperinflation',
        'The Great Depression',
        'The 1970s Stagflation',
        'The Latin American Debt Crisis',
        'Black Monday',
        'The Japanese Lost Decade',
        'The Asian Financial Crisis',
        'The LTCM Collapse',
        'The Dot-com Crash',
        'The Argentine Crisis',
        'The Global Financial Crisis',
        'The Eurozone Debt Crisis',
        'The COVID-19 Economic Shock',
        'The Great Inflation',
    ];

    return (
        <div
            style={{
                width: 1280,
                height: 720,
                backgroundColor: COLORS.bgDark,
                display: 'flex',
                flexDirection: 'row',
                fontFamily: "'Georgia', 'Times New Roman', serif",
                overflow: 'hidden',
            }}
        >
            {/* Left panel — branding */}
            <div
                style={{
                    width: 580,
                    height: '100%',
                    backgroundColor: COLORS.bgEpisode,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '0 60px',
                    flexShrink: 0,
                    position: 'relative',
                }}
            >
                {/* Top accent line */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        backgroundColor: COLORS.blue,
                    }}
                />

                <div
                    style={{
                        color: COLORS.blue,
                        fontSize: 13,
                        fontFamily: "'Arial', 'Helvetica', sans-serif",
                        fontWeight: 700,
                        letterSpacing: 6,
                        textTransform: 'uppercase',
                        marginBottom: 28,
                    }}
                >
                    A Documentary Series
                </div>

                <div
                    style={{
                        color: '#ffffff',
                        fontSize: 52,
                        fontWeight: 700,
                        lineHeight: 1.15,
                        marginBottom: 16,
                        textShadow: '0 2px 20px rgba(0,0,0,0.6)',
                    }}
                >
                    Economic<br />Crises<br />Explained
                </div>

                <div
                    style={{
                        width: 60,
                        height: 3,
                        backgroundColor: COLORS.gold,
                        marginBottom: 28,
                    }}
                />

                <div
                    style={{
                        color: COLORS.textMuted,
                        fontSize: 16,
                        fontFamily: "'Arial', 'Helvetica', sans-serif",
                        fontWeight: 400,
                        lineHeight: 1.6,
                        marginBottom: 40,
                    }}
                >
                    17 crises · 3 centuries<br />
                    What happened, why it failed,<br />
                    what changed permanently.
                </div>

                <div
                    style={{
                        color: '#8ab4d8',
                        fontSize: 13,
                        fontFamily: "'Arial', 'Helvetica', sans-serif",
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                    }}
                >
                    1720 — 2023
                </div>

                {/* Bottom accent line */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        backgroundColor: COLORS.blue,
                    }}
                />
            </div>

            {/* Blue divider */}
            <div
                style={{
                    width: 4,
                    height: '100%',
                    backgroundColor: COLORS.blue,
                    flexShrink: 0,
                }}
            />

            {/* Right panel — episode list */}
            <div
                style={{
                    flex: 1,
                    height: '100%',
                    backgroundColor: COLORS.bgThumbnailPanel,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '0 44px',
                }}
            >
                {episodes.map((title, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'baseline',
                            marginBottom: 6,
                        }}
                    >
                        <div
                            style={{
                                color: COLORS.blue,
                                fontSize: 11,
                                fontFamily: "'Arial', 'Helvetica', sans-serif",
                                fontWeight: 700,
                                width: 36,
                                flexShrink: 0,
                                letterSpacing: 1,
                            }}
                        >
                            {String(i + 1).padStart(2, '0')}
                        </div>
                        <div
                            style={{
                                color: '#c8d8e8',
                                fontSize: 13,
                                fontFamily: "'Georgia', 'Times New Roman', serif",
                                lineHeight: 1.3,
                            }}
                        >
                            {title}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
