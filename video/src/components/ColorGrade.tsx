import React from 'react';
import { useCurrentFrame } from 'remotion';

export const ColorGrade: React.FC = () => {
    const frame = useCurrentFrame();

    // Breathing vignette: slow sine shifts the transparent-stop ±3%
    const stop = Math.round(62 + Math.sin(frame * 0.025) * 3);

    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 190, pointerEvents: 'none' }}>
            {/* Blue-teal tint in multiply blend — darkens shadows, cools midtones */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(20, 40, 80, 0.18)',
                mixBlendMode: 'multiply',
            }} />
            {/* Breathing vignette */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse at center, transparent ${stop}%, rgba(13,27,42,0.32) 100%)`,
            }} />
        </div>
    );
};
