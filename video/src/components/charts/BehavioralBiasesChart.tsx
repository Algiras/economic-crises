/**
 * BehavioralBiasesChart — horizontal bar chart of cognitive bias effect sizes
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from '../../theme';

const BIASES      = ['Loss Aversion', 'Present Bias', 'Over-confidence', 'Herding Behaviour', 'Status Quo Bias', 'Anchoring'];
const EFFECT_SIZE = [1.9, 1.6, 1.4, 1.3, 1.1, 1.0];
const N_STUDIES   = [320, 240, 410, 180, 290, 350];

const W = 960, H = 460;
// left: room for bias labels, right: room for value labels
const ML = 170, MR = 160, MT = 30, MB = 55;
const IW = W - ML - MR;
const IH = H - MT - MB;

const xMin = 0, xMax = 2.5;
const xScale = (v: number) => ((v - xMin) / (xMax - xMin)) * IW;

const BAR_H   = IH / BIASES.length;
const BAR_PAD = 12;

const xTicks = [0, 0.5, 1.0, 1.5, 2.0, 2.5];

export const BehavioralBiasesChart: React.FC = () => {
    const frame = useCurrentFrame();
    const START = 45;

    const axisProgress = interpolate(frame, [START, START + 30], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const gridOpacity  = interpolate(frame, [START + 30, START + 45], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const refProgress  = interpolate(frame, [210, 240], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const annotOpacity = interpolate(frame, [220, 260], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

    const BLUE  = COLORS.blue;
    const GOLD  = COLORS.gold;
    const MUTED = COLORS.textMuted;
    const GRID  = '#1e3040';

    return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
            <g transform={`translate(${ML},${MT})`}>

                {/* Vertical grid lines */}
                {xTicks.map((v, i) => (
                    <line key={i}
                        x1={xScale(v)} y1={0}
                        x2={xScale(v)} y2={IH}
                        stroke={GRID} strokeWidth={1} strokeDasharray="4 4"
                        opacity={gridOpacity}
                    />
                ))}

                {/* Y axis */}
                <line x1={0} y1={0} x2={0} y2={IH * axisProgress} stroke={MUTED} strokeWidth={1.5} />
                {/* X axis */}
                <line x1={0} y1={IH} x2={IW * axisProgress} y2={IH} stroke={MUTED} strokeWidth={1.5} />

                {/* X tick labels */}
                {xTicks.map((v, i) => (
                    <text key={i} x={xScale(v)} y={IH + 20} textAnchor="middle" fill={MUTED} fontSize={12} opacity={gridOpacity}>
                        {v.toFixed(1)}
                    </text>
                ))}

                {/* Bars */}
                {BIASES.map((bias, i) => {
                    const barDelay    = 90 + i * 15;
                    const barProgress = interpolate(frame, [barDelay, barDelay + 40], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
                    const labelOpacity = interpolate(frame, [barDelay + 35, barDelay + 50], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
                    const bw = xScale(EFFECT_SIZE[i]) * barProgress;
                    const by = i * BAR_H + BAR_PAD / 2;
                    const bh = BAR_H - BAR_PAD;

                    return (
                        <g key={bias}>
                            {/* Bias name — left of axis */}
                            <text x={-12} y={by + bh / 2 + 5}
                                textAnchor="end" fill={MUTED} fontSize={13}
                                opacity={gridOpacity}
                            >
                                {bias}
                            </text>

                            {/* Bar */}
                            <rect x={0} y={by} width={bw} height={bh}
                                fill={BLUE} opacity={0.85} rx={3}
                            />

                            {/* Value + study count — right of bar */}
                            <text x={bw + 8} y={by + bh / 2 + 5}
                                fill={MUTED} fontSize={11}
                                opacity={labelOpacity}
                            >
                                d = {EFFECT_SIZE[i].toFixed(1)} · n = {N_STUDIES[i]}
                            </text>
                        </g>
                    );
                })}

                {/* Reference line at 1.0 */}
                <line
                    x1={xScale(1.0)} y1={IH * (1 - refProgress)}
                    x2={xScale(1.0)} y2={IH}
                    stroke={GOLD} strokeWidth={1.5} strokeDasharray="6 4" opacity={0.85}
                />
                <text x={xScale(1.0) + 5} y={IH * (1 - refProgress) - 5}
                    fill={GOLD} fontSize={11} opacity={annotOpacity}
                >
                    Effect = 1.0
                </text>

                {/* Axis labels */}
                <text x={IW / 2} y={IH + 46} textAnchor="middle" fill={MUTED} fontSize={13}>
                    Effect Size (Cohen's d)
                </text>
            </g>
        </svg>
    );
};
