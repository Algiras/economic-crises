import React from 'react';
import { Img, staticFile } from 'remotion';

interface AnimatedBgImageProps {
    src: string;
    scale: number;
    panX?: number;
    panY?: number;
    opacity?: number;
    vignetteStrength?: 'light' | 'heavy';
}

export const AnimatedBgImage: React.FC<AnimatedBgImageProps> = ({
    src,
    scale,
    panX = 0,
    panY = 0,
    opacity = 1,
    vignetteStrength = 'heavy',
}) => {
    return (
        <div style={{
            position: 'absolute',
            top: -50, left: -50, right: -50, bottom: -50,
            transform: `scale(${scale}) translateX(${panX}px) translateY(${panY}px)`,
            zIndex: 0,
        }}>
            <Img
                src={staticFile(`images/${src}`)}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity,
                }}
            />
            {/* Radial vignette — edges fade to background colour, not black */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                background: vignetteStrength === 'heavy'
                    ? 'radial-gradient(circle at center, rgba(13,27,42,0.35) 0%, rgba(13,27,42,0.96) 100%)'
                    : 'radial-gradient(circle at center, rgba(13,27,42,0.15) 0%, rgba(13,27,42,0.88) 100%)',
            }} />
        </div>
    );
};
