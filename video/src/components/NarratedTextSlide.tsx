import { FONT_DISPLAY } from '../fonts';
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { KaraokeText, WordTiming } from './KaraokeText';
import { useFadeOut } from '../hooks/useAnimation';

interface NarratedTextSlideProps {
    text: string;
    wordTimings: WordTiming[];
    fontSize?: number;
}

export const NarratedTextSlide: React.FC<NarratedTextSlideProps> = ({ text, wordTimings, fontSize = 38 }) => {
    const frame = useCurrentFrame();
    const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const fadeOut = useFadeOut();
    const opacity = Math.min(fadeIn, fadeOut);

    return (
        <div style={containerStyle}>
            <div style={{ opacity, maxWidth: 1100, textAlign: 'center', lineHeight: 1.6 }}>
                {wordTimings && wordTimings.length > 0
                    ? <KaraokeText wordTimings={wordTimings} style={{ ...wordStyle, fontSize }} />
                    : <p style={{ ...wordStyle, fontSize, margin: 0 }}>{text}</p>
                }
            </div>
        </div>
    );
};

const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 160px',
    boxSizing: 'border-box',
};

const wordStyle: React.CSSProperties = {
    fontFamily: FONT_DISPLAY,
    fontSize: 38,
    fontWeight: 800,
    letterSpacing: '0.01em',
};
