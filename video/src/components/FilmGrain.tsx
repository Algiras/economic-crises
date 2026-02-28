import React from 'react';
import { useCurrentFrame } from 'remotion';

export const FilmGrain: React.FC = () => {
    const frame = useCurrentFrame();
    const seed = frame; // change every frame for organic feel

    return (
        <svg style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0.05,
            pointerEvents: 'none',
            zIndex: 100,
        }}>
            <filter id={`grain-${seed}`}>
                <feTurbulence
                    type="fractalNoise"
                    baseFrequency={0.62 + (seed % 17) * 0.0007}
                    numOctaves={4}
                    seed={seed}
                />
                <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
        </svg>
    );
};
