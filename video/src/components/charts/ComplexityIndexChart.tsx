import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ChartBase, Margin } from './ChartBase';
import { COLORS } from '../../theme';
import { ChartDimensions } from '../ChartSlide';

const COUNTRIES  = ['Japan', 'Germany', 'S. Korea', 'Switzerland', 'USA',
                    'UK', 'France', 'China', 'Brazil', 'India',
                    'Mexico', 'Nigeria', 'Saudi Arabia', 'Argentina'];
const ECI        = [2.3, 2.1, 1.9, 1.8, 1.5, 1.3, 1.1, 0.6, -0.1, -0.2,
                    0.1, -1.2, -1.4, -0.4];
const GDP_GROWTH = [0.9, 1.2, 2.8, 1.5, 2.4, 1.8, 1.1, 6.5, 1.5, 6.8,
                    2.3, 2.9, 2.2, 0.8];

const n     = ECI.length;
const sumX  = ECI.reduce((a, b) => a + b, 0);
const sumY  = GDP_GROWTH.reduce((a, b) => a + b, 0);
const sumXY = ECI.reduce((s, x, i) => s + x * GDP_GROWTH[i], 0);
const sumX2 = ECI.reduce((s, x) => s + x * x, 0);
const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
const intercept = (sumY - slope * sumX) / n;
const trend = (x: number) => slope * x + intercept;

const MARGIN: Margin = { top: 28, right: 28, bottom: 60, left: 82 };
const xMin = -1.8, xMax = 2.7;
const yMin = 0,    yMax = 8.5;

const xTicks    = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5].map(v => ({ value: v, label: String(v) }));
const yTicks    = [0, 2, 4, 6, 8].map(v => ({ value: v, label: `${v}%` }));
const gridLines = [0, 2, 4, 6, 8];
const xGridLines = [-1, 0, 1, 2];

function dotColor(growth: number): string {
    const t = Math.min(1, growth / 7);
    const r = Math.round(224 * (1 - t) + 92 * t);
    const g = Math.round(92 * (1 - t) + 224 * t);
    return `rgb(${r},${g},100)`;
}

const txMin = -1.6, txMax = 2.5;

export const ComplexityIndexChart: React.FC<ChartDimensions> = ({ width: W, height: H }) => {
    const IW = W - MARGIN.left - MARGIN.right;
    const IH = H - MARGIN.top - MARGIN.bottom;

    const xScale = (v: number) => ((v - xMin) / (xMax - xMin)) * IW;
    const yScale = (v: number) => IH - ((v - yMin) / (yMax - yMin)) * IH;

    const dx = xScale(txMax) - xScale(txMin);
    const dy = yScale(trend(txMax)) - yScale(trend(txMin));
    const trendLen = Math.sqrt(dx * dx + dy * dy);

    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const START = 45;

    const trendProgress = interpolate(frame, [220, 270], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const annotOpacity  = interpolate(frame, [220, 260], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

    const GOLD  = COLORS.gold;
    const MUTED = COLORS.textMuted;

    return (
        <svg width={W} height={H} style={{ display: 'block' }}>
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
                <ChartBase margin={MARGIN} startFrame={START}
                    xTicks={xTicks} yTicks={yTicks}
                    innerWidth={IW} innerHeight={IH}
                    xScale={xScale} yScale={yScale}
                    gridLines={gridLines} xGridLines={xGridLines}
                />
                <line x1={xScale(0)} y1={0} x2={xScale(0)} y2={IH}
                    stroke={MUTED} strokeWidth={0.8} strokeDasharray="3 3" opacity={0.5} />

                {COUNTRIES.map((country, i) => {
                    const dotDelay    = 90 + i * 8;
                    const dotScale    = spring({ frame, fps, from: 0, to: 1, delay: dotDelay, durationInFrames: 25, config: { damping: 10 } });
                    const labelOpacity = interpolate(frame, [dotDelay + 15, dotDelay + 30], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
                    const cx = xScale(ECI[i]);
                    const cy = yScale(GDP_GROWTH[i]);
                    const flipLabel = ECI[i] > 1.8;
                    return (
                        <g key={country}>
                            <circle cx={cx} cy={cy} r={7 * dotScale}
                                fill={dotColor(GDP_GROWTH[i])} stroke="#0d1b2a" strokeWidth={1.5} />
                            <text x={cx + (flipLabel ? -10 : 10)} y={cy + 4}
                                fill={MUTED} fontSize={10}
                                textAnchor={flipLabel ? 'end' : 'start'}
                                opacity={labelOpacity}
                            >
                                {country}
                            </text>
                        </g>
                    );
                })}

                <line
                    x1={xScale(txMin)} y1={yScale(trend(txMin))}
                    x2={xScale(txMax)} y2={yScale(trend(txMax))}
                    stroke={GOLD} strokeWidth={1.8}
                    strokeDasharray={`${trendLen * trendProgress} ${trendLen}`}
                    opacity={0.75}
                />
                <text x={xScale(txMax) - 10} y={yScale(trend(txMax)) - 8}
                    fill={GOLD} fontSize={11} textAnchor="end" opacity={annotOpacity}>Trend</text>

                <text x={IW / 2} y={IH + 48} textAnchor="middle" fill={MUTED} fontSize={13}>
                    Economic Complexity Index (ECI)
                </text>
                <text transform="rotate(-90)" x={-IH / 2} y={-65} textAnchor="middle" fill={MUTED} fontSize={13}>
                    Avg GDP Growth (%/yr, 2010–2023)
                </text>
            </g>
        </svg>
    );
};
