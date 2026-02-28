import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

/** Fade out over the last `frames` frames of the current Sequence */
export function useFadeOut(frames = 15): number {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    return interpolate(
        frame,
        [durationInFrames - frames, durationInFrames],
        [1, 0],
        { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
    );
}

/** Fade in from frame `start` to frame `end` */
export function useFadeIn(start = 0, end = 20): number {
    const frame = useCurrentFrame();
    return interpolate(frame, [start, end], [0, 1], { extrapolateRight: 'clamp' });
}

export type KBDirection = 'in' | 'out' | 'left' | 'right';

/** Ken Burns effect — returns scale, panX, panY for a bleed container */
export function useKenBurns(direction?: KBDirection, slideIndex = 0): { scale: number; panX: number; panY: number } {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const dirs: KBDirection[] = ['in', 'out', 'left', 'right'];
    const dir = direction ?? dirs[slideIndex % 4];

    let scale: number;
    let panX = 0;
    let panY = 0;

    if (dir === 'in') {
        scale = interpolate(frame, [0, durationInFrames], [1.0, 1.12], { extrapolateRight: 'clamp' });
        panY  = interpolate(frame, [0, durationInFrames], [0, -30],   { extrapolateRight: 'clamp' });
    } else if (dir === 'out') {
        scale = interpolate(frame, [0, durationInFrames], [1.12, 1.0], { extrapolateRight: 'clamp' });
        panY  = interpolate(frame, [0, durationInFrames], [-30, 0],    { extrapolateRight: 'clamp' });
    } else if (dir === 'left') {
        scale = interpolate(frame, [0, durationInFrames], [1.05, 1.14], { extrapolateRight: 'clamp' });
        panX  = interpolate(frame, [0, durationInFrames], [0, -50],   { extrapolateRight: 'clamp' });
    } else {
        scale = interpolate(frame, [0, durationInFrames], [1.05, 1.14], { extrapolateRight: 'clamp' });
        panX  = interpolate(frame, [0, durationInFrames], [0, 50],    { extrapolateRight: 'clamp' });
    }

    return { scale, panX, panY };
}
