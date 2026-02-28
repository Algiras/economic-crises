/**
 * ChartBase — shared animated SVG primitives (axes, grid, ticks).
 *
 * Usage: place inside a <g transform="translate(margin.left, margin.top)">.
 * ChartBase draws from (0,0) to (innerWidth, innerHeight) — no additional
 * margin offset is applied here.
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export interface Margin {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface ChartBaseProps {
    margin: Margin;
    /** Frame at which animations begin */
    startFrame?: number;
    xTicks?: { value: number; label: string }[];
    yTicks?: { value: number; label: string }[];
    innerWidth: number;
    innerHeight: number;
    xScale: (v: number) => number;
    yScale: (v: number) => number;
    gridLines?: number[];   // y-data values for horizontal grid lines
    xGridLines?: number[];  // x-data values for vertical grid lines
}

export const ChartBase: React.FC<ChartBaseProps> = ({
    margin: _margin,
    startFrame = 45,
    xTicks = [],
    yTicks = [],
    innerWidth,
    innerHeight,
    xScale,
    yScale,
    gridLines = [],
    xGridLines = [],
}) => {
    const frame = useCurrentFrame();

    const axisProgress = interpolate(frame, [startFrame, startFrame + 30], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const gridOpacity  = interpolate(frame, [startFrame + 30, startFrame + 45], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const tickOpacity  = interpolate(frame, [startFrame + 20, startFrame + 50], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

    const MUTED = '#a0b0c0';
    const GRID  = '#1e3040';

    return (
        <g>
            {/* Horizontal grid lines */}
            {gridLines.map((yVal, i) => (
                <line
                    key={`grid-y-${i}`}
                    x1={0}            y1={yScale(yVal)}
                    x2={innerWidth}   y2={yScale(yVal)}
                    stroke={GRID} strokeWidth={1} strokeDasharray="4 4"
                    opacity={gridOpacity}
                />
            ))}

            {/* Vertical grid lines */}
            {xGridLines.map((xVal, i) => (
                <line
                    key={`grid-x-${i}`}
                    x1={xScale(xVal)} y1={0}
                    x2={xScale(xVal)} y2={innerHeight}
                    stroke={GRID} strokeWidth={1} strokeDasharray="4 4"
                    opacity={gridOpacity}
                />
            ))}

            {/* Y axis — sweeps upward from bottom */}
            <line
                x1={0} y1={innerHeight}
                x2={0} y2={innerHeight * (1 - axisProgress)}
                stroke={MUTED} strokeWidth={1.5}
            />

            {/* X axis — sweeps rightward from origin */}
            <line
                x1={0} y1={innerHeight}
                x2={innerWidth * axisProgress} y2={innerHeight}
                stroke={MUTED} strokeWidth={1.5}
            />

            {/* Y tick labels — left of axis */}
            {yTicks.map((t, i) => (
                <text
                    key={`ytick-${i}`}
                    x={-10}
                    y={yScale(t.value) + 4}
                    textAnchor="end"
                    fill={MUTED} fontSize={12}
                    opacity={tickOpacity}
                >
                    {t.label}
                </text>
            ))}

            {/* X tick labels — below axis */}
            {xTicks.map((t, i) => (
                <text
                    key={`xtick-${i}`}
                    x={xScale(t.value)}
                    y={innerHeight + 20}
                    textAnchor="middle"
                    fill={MUTED} fontSize={12}
                    opacity={tickOpacity}
                >
                    {t.label}
                </text>
            ))}

            {/* Y-axis label — rotated, sitting left of tick labels */}
            {/* Rendered by each chart individually for flexibility */}
        </g>
    );
};
