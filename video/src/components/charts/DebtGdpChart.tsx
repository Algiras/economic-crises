/**
 * DebtGdpChart — G7 average government debt as % of GDP (1980–2024)
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { ChartBase, Margin } from './ChartBase';
import { COLORS } from '../../theme';

const YEARS = Array.from({ length: 45 }, (_, i) => 1980 + i);
const DEBT  = [40, 41, 43, 46, 48, 50, 52, 54, 55, 56,
               57, 59, 62, 65, 67, 68, 69, 70, 68, 67,
               66, 65, 64, 63, 63, 64, 65, 66, 68, 70,
               72, 74, 75, 76, 76, 77, 78, 80, 82, 83,
               84, 85, 87, 90, 92];

const W = 960, H = 480;
// generous margins: left for rotated Y label + ticks, right for nothing (labels moved inside)
const MARGIN: Margin = { top: 30, right: 30, bottom: 60, left: 90 };
const IW = W - MARGIN.left - MARGIN.right;
const IH = H - MARGIN.top - MARGIN.bottom;

const xMin = 1980, xMax = 2024;
const yMin = 30,   yMax = 155;

const xScale = (v: number) => ((v - xMin) / (xMax - xMin)) * IW;
const yScale = (v: number) => IH - ((v - yMin) / (yMax - yMin)) * IH;

const xTicks   = [1980, 1990, 2000, 2010, 2020, 2024].map(y => ({ value: y, label: String(y) }));
const yTicks   = [30, 60, 90, 120, 150].map(v => ({ value: v, label: `${v}%` }));
const gridLines = [60, 90, 120, 150];

export const DebtGdpChart: React.FC = () => {
    const frame = useCurrentFrame();
    const START = 45;

    const lineProgress  = interpolate(frame, [90, 210],  [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const fillOpacity   = interpolate(frame, [150, 210], [0, 0.18], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const threshProgress = interpolate(frame, [240, 270], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const annotOpacity  = interpolate(frame, [220, 260], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

    const linePath = 'M ' + YEARS.map((y, i) => `${xScale(y)},${yScale(DEBT[i])}`).join(' L ');

    const areaPath =
        `M ${xScale(1980)},${yScale(DEBT[0])} ` +
        YEARS.slice(1).map((y, i) => `L ${xScale(y)},${yScale(DEBT[i + 1])}`).join(' ') +
        ` L ${xScale(2024)},${IH} L ${xScale(1980)},${IH} Z`;

    const BLUE = COLORS.blue;
    const RED  = '#e05c5c';
    const GOLD = COLORS.gold;
    const MUTED = COLORS.textMuted;

    // Threshold lines sweep right
    const thresh100X = IW * threshProgress;
    const thresh60X  = IW * threshProgress;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
            <defs>
                <clipPath id="debt-clip">
                    <rect x={0} y={-10} width={IW * lineProgress} height={IH + 20} />
                </clipPath>
            </defs>

            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
                <ChartBase
                    margin={MARGIN} startFrame={START}
                    xTicks={xTicks} yTicks={yTicks}
                    innerWidth={IW} innerHeight={IH}
                    xScale={xScale} yScale={yScale}
                    gridLines={gridLines}
                />

                {/* Area fill (clipped with line progress) */}
                <g clipPath="url(#debt-clip)">
                    <path d={areaPath} fill={BLUE} opacity={fillOpacity} />
                    <path d={linePath} fill="none" stroke={BLUE} strokeWidth={2.5} />
                </g>

                {/* 100% threshold */}
                <line
                    x1={0} y1={yScale(100)}
                    x2={thresh100X} y2={yScale(100)}
                    stroke={RED} strokeWidth={1.5} strokeDasharray="6 4" opacity={0.8}
                />
                {/* Label fixed at left, fades in */}
                <text x={8} y={yScale(100) - 6} fill={RED} fontSize={12} opacity={annotOpacity} fontWeight="600">
                    100% threshold
                </text>

                {/* Maastricht 60% */}
                <line
                    x1={0} y1={yScale(60)}
                    x2={thresh60X} y2={yScale(60)}
                    stroke={GOLD} strokeWidth={1.2} strokeDasharray="4 4" opacity={0.7}
                />
                <text x={8} y={yScale(60) - 6} fill={GOLD} fontSize={12} opacity={annotOpacity} fontWeight="600">
                    Maastricht 60%
                </text>

                {/* GFC 2008 annotation */}
                <g opacity={annotOpacity}>
                    <line
                        x1={xScale(2008)} y1={yScale(DEBT[28])}
                        x2={xScale(2008)} y2={yScale(102)}
                        stroke={MUTED} strokeWidth={1} strokeDasharray="3 3"
                    />
                    <text x={xScale(2008)} y={yScale(107)} fill={MUTED} fontSize={11} textAnchor="middle">
                        GFC 2008
                    </text>
                </g>

                {/* COVID 2020 annotation */}
                <g opacity={annotOpacity}>
                    <line
                        x1={xScale(2020)} y1={yScale(DEBT[40])}
                        x2={xScale(2020)} y2={yScale(135)}
                        stroke={MUTED} strokeWidth={1} strokeDasharray="3 3"
                    />
                    <text x={xScale(2020)} y={yScale(140)} fill={MUTED} fontSize={11} textAnchor="middle">
                        COVID 2020
                    </text>
                </g>

                {/* Axis labels */}
                <text
                    x={IW / 2} y={IH + 48}
                    textAnchor="middle" fill={MUTED} fontSize={13}
                >
                    Year
                </text>
                <text
                    transform="rotate(-90)"
                    x={-IH / 2} y={-72}
                    textAnchor="middle" fill={MUTED} fontSize={13}
                >
                    Debt / GDP (%)
                </text>
            </g>
        </svg>
    );
};
