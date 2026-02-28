import React from 'react';
import { FONT_DISPLAY } from '../fonts';
import { COLORS } from '../theme';
import { useFadeIn } from '../hooks/useAnimation';

interface ChapterLabelProps {
    title: string;
    color?: string;
}

export const ChapterLabel: React.FC<ChapterLabelProps> = ({ title, color = COLORS.gold }) => {
    const opacity = useFadeIn(0, 20);

    return (
        <div style={{
            position: 'absolute',
            bottom: 72,
            left: 80,
            zIndex: 150,
            opacity,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
        }}>
            <div style={{ width: 3, height: 20, background: color, boxShadow: `0 0 8px ${color}` }} />
            <span style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 4,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.7)',
            }}>
                {title}
            </span>
        </div>
    );
};
