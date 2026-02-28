import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface LightLeakProps {
    boundaries: number[];
}

// Subtle pale streak that sweeps across frame at chapter cuts
export const LightLeak: React.FC<LightLeakProps> = ({ boundaries }) => {
    const frame = useCurrentFrame();

    let sweepProgress = -1;
    for (const boundary of boundaries) {
        const dist = frame - boundary;
        // Start AT the cut, never before — avoids bleeding into preceding slide
        if (dist >= 0 && dist <= 35) {
            sweepProgress = interpolate(dist, [0, 35], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
            });
            break;
        }
    }

    if (sweepProgress < 0) return null;

    const cx = interpolate(sweepProgress, [0, 1], [-10, 110]);
    const opacity = interpolate(sweepProgress, [0, 0.15, 0.7, 1], [0, 0.13, 0.13, 0]);

    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 48, pointerEvents: 'none', overflow: 'hidden' }}>
            {/* Primary streak — cool pale, not amber */}
            <div style={{
                position: 'absolute',
                top: 0, bottom: 0,
                left: `${cx - 12}%`,
                width: '24%',
                opacity,
                background: 'linear-gradient(to right, transparent, rgba(220,235,255,0.5), rgba(240,248,255,0.75), rgba(220,235,255,0.5), transparent)',
                mixBlendMode: 'screen',
            }} />
            {/* Wide soft halo */}
            <div style={{
                position: 'absolute',
                top: 0, bottom: 0,
                left: `${cx - 20}%`,
                width: '40%',
                opacity: opacity * 0.4,
                background: 'linear-gradient(to right, transparent, rgba(200,220,255,0.35), transparent)',
                mixBlendMode: 'screen',
            }} />
        </div>
    );
};
