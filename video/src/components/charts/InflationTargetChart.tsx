/**
 * InflationTargetChart — US CPI vs 2% central bank target (2018–2023)
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { ChartBase, Margin } from './ChartBase';
import { COLORS } from '../../theme';

const MONTHS_X = Array.from({ length: 72 }, (_, i) => 2018 + i / 12);
const ACTUAL = [
    1.9, 2.1, 2.4, 2.3, 2.2, 2.0, 1.9, 1.8, 1.7, 1.7, 1.8, 2.1,
    2.3, 2.3, 1.5, 0.3, 0.1, 0.1, 1.0, 1.2, 1.3, 1.2, 1.2, 1.4,
    1.4, 1.7, 2.6, 4.2, 5.0, 5.4, 5.4, 5.3, 5.4, 6.2, 6.8, 7.0,
    7.5, 7.9, 8.5, 8.3, 8.6, 9.1, 8.5, 8.3, 8.2, 7.7, 7.1, 6.5,
    6.4, 6.0, 5.0, 4.9, 4.0, 3.0, 3.2, 3.7, 3.7, 3.2, 3.1, 2.7,
    2.7, 2.5, 2.4, 2.3, 2.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.5, 2.3,
];

const W = 960, H = 480;
const MARGIN: Margin = { top: 30, right: 30, bottom: 60, left: 80 };
const IW = W - MARGIN.left - MARGIN.right;
const IH = H - MARGIN.top - MARGIN.bottom;

const xMin = 2018, xMax = 2024;
const yMin = -0.5, yMax = 10.5;

const xScale = (v: number) => ((v - xMin) / (xMax - xMin)) * IW;
const yScale = (v: number) => IH - ((v - yMin) / (yMax - yMin)) * IH;

const xTicks   = [2018, 2019, 2020, 2021, 2022, 2023, 2024].map(y => ({ value: y, label: String(y) }));
const yTicks   = [0, 2, 4, 6, 8, 10].map(v => ({ value: v, label: `${v}%` }));
const gridLines = [0, 2, 4, 6, 8, 10];

export const InflationTargetChart: React.FC = () => {
    const frame = useCurrentFrame();
    const START = 45;

    const lineProgress  = interpolate(frame, [90, 240],  [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const fillOpacity   = interpolate(frame, [150, 240], [0, 0.22], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const annotOpacity  = interpolate(frame, [220, 270], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const targetProgress = interpolate(frame, [240, 270], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

    const linePath = 'M ' + MONTHS_X.map((x, i) => `${xScale(x)},${yScale(ACTUAL[i])}`).join(' L ');

    const abovePath = buildZonePath(MONTHS_X, ACTUAL, 2, 'above');
    const belowPath = buildZonePath(MONTHS_X, ACTUAL, 2, 'below');

    const BLUE  = COLORS.blue;
    const GOLD  = COLORS.gold;
    const MUTED = COLORS.textMuted;
    const RED   = '#e05c5c';
    const GREEN = '#5ce07a';

    return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
            <defs>
                <clipPath id="infl-clip">
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

                {/* Colored zones */}
                <g clipPath="url(#infl-clip)" opacity={fillOpacity}>
                    <path d={abovePath} fill={RED} />
                    <path d={belowPath} fill={GREEN} />
                </g>

                {/* Main line */}
                <g clipPath="url(#infl-clip)">
                    <path d={linePath} fill="none" stroke={BLUE} strokeWidth={2.5} />
                </g>

                {/* 2% target line */}
                <line
                    x1={0}                     y1={yScale(2)}
                    x2={IW * targetProgress}   y2={yScale(2)}
                    stroke={GOLD} strokeWidth={1.5} strokeDasharray="6 4"
                />
                <text x={8} y={yScale(2) - 7} fill={GOLD} fontSize={12} opacity={annotOpacity} fontWeight="600">
                    2% target
                </text>

                {/* "Transitory" annotation */}
                <g opacity={annotOpacity}>
                    <line
                        x1={xScale(2021.4)} y1={yScale(5.4)}
                        x2={xScale(2021.0)} y2={yScale(7.2)}
                        stroke={MUTED} strokeWidth={1} strokeDasharray="3 3"
                    />
                    <text x={xScale(2021.0)} y={yScale(7.6)} fill={MUTED} fontSize={11} textAnchor="middle">
                        "Transitory" assessment
                    </text>
                </g>

                {/* Peak annotation */}
                <g opacity={annotOpacity}>
                    <line
                        x1={xScale(2022.5)} y1={yScale(9.1)}
                        x2={xScale(2022.5)} y2={yScale(9.8)}
                        stroke={RED} strokeWidth={1}
                    />
                    <text x={xScale(2022.5)} y={yScale(10.1)} fill={RED} fontSize={12} fontWeight="bold" textAnchor="middle">
                        Peak: 9.1%
                    </text>
                </g>

                {/* Axis labels */}
                <text x={IW / 2} y={IH + 48} textAnchor="middle" fill={MUTED} fontSize={13}>Year</text>
                <text transform="rotate(-90)" x={-IH / 2} y={-62} textAnchor="middle" fill={MUTED} fontSize={13}>
                    CPI Inflation (%)
                </text>
            </g>
        </svg>
    );
};

function buildZonePath(xs: number[], ys: number[], target: number, side: 'above' | 'below'): string {
    let inZone = false;
    const segments: Array<[number, number][]> = [];
    let current: [number, number][] = [];

    for (let i = 0; i < xs.length; i++) {
        const above = ys[i] > target;
        const match = side === 'above' ? above : !above;
        if (match) {
            if (!inZone) { inZone = true; current = []; }
            current.push([xs[i], ys[i]]);
        } else {
            if (inZone) { segments.push(current); current = []; inZone = false; }
        }
    }
    if (inZone && current.length) segments.push(current);

    return segments.map(seg => {
        const top    = seg.map(([x, y]) => `${xScale(x)},${yScale(y)}`).join(' L ');
        const bottom = [...seg].reverse().map(([x]) => `${xScale(x)},${yScale(target)}`).join(' L ');
        return `M ${top} L ${bottom} Z`;
    }).join(' ');
}
