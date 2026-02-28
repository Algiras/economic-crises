import React from 'react';
import { COLORS } from '../theme';

export interface ThumbnailProps {
    episodeNumber: number;
    episodeTitle: string;
    episodeSubtitle: string;
}

export const Thumbnail: React.FC<ThumbnailProps> = ({
    episodeNumber,
    episodeTitle,
    episodeSubtitle,
}) => {
    const epStr = String(episodeNumber).padStart(2, '0');

    return (
        <div
            style={{
                width: 1280,
                height: 720,
                display: 'flex',
                flexDirection: 'row',
                fontFamily: "'Georgia', 'Times New Roman', serif",
                overflow: 'hidden',
            }}
        >
            {/* Left panel — EP number */}
            <div
                style={{
                    width: 200,
                    height: '100%',
                    backgroundColor: COLORS.bgEpisode,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <div
                    style={{
                        color: COLORS.blue,
                        fontSize: 18,
                        fontFamily: "'Arial', 'Helvetica', sans-serif",
                        fontWeight: 700,
                        letterSpacing: 4,
                        textTransform: 'uppercase',
                        marginBottom: 8,
                    }}
                >
                    EP
                </div>
                <div
                    style={{
                        color: '#ffffff',
                        fontSize: 72,
                        fontWeight: 700,
                        fontFamily: "'Arial', 'Helvetica', sans-serif",
                        lineHeight: 1,
                    }}
                >
                    {epStr}
                </div>
            </div>

            {/* Blue accent bar */}
            <div
                style={{
                    width: 6,
                    height: '100%',
                    backgroundColor: COLORS.blue,
                    flexShrink: 0,
                }}
            />

            {/* Right panel */}
            <div
                style={{
                    flex: 1,
                    height: '100%',
                    backgroundColor: COLORS.bgThumbnailPanel,
                    position: 'relative',
                }}
            >
                {/* Top: series label */}
                <div
                    style={{
                        position: 'absolute',
                        top: 60,
                        left: 80,
                        right: 80,
                        color: COLORS.blue,
                        fontSize: 20,
                        fontFamily: "'Arial', 'Helvetica', sans-serif",
                        fontWeight: 700,
                        letterSpacing: 6,
                        textTransform: 'uppercase',
                    }}
                >
                    Economic Crises Explained
                </div>

                {/* Center: episode title — always true vertical center */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: 80,
                        right: 80,
                        transform: 'translateY(-50%)',
                        color: '#ffffff',
                        fontSize: 68,
                        fontWeight: 700,
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        lineHeight: 1.15,
                        textShadow: '0 2px 20px rgba(0,0,0,0.8)',
                    }}
                >
                    {episodeTitle}
                </div>

                {/* Bottom: subtitle / era */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 60,
                        left: 80,
                        right: 80,
                        color: '#8ab4d8',
                        fontSize: 28,
                        fontFamily: "'Arial', 'Helvetica', sans-serif",
                        fontWeight: 400,
                        letterSpacing: 2,
                    }}
                >
                    {episodeSubtitle}
                </div>
            </div>
        </div>
    );
};
