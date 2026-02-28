import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from '../../theme';
import { ChartDimensions } from '../ChartSlide';

const BIASES      = ['Loss Aversion', 'Present Bias', 'Over-confidence', 'Herding Behaviour', 'Status Quo Bias', 'Anchoring'];
const EFFECT_SIZE = [1.9, 1.6, 1.4, 1.3, 1.1, 1.0];
const N_STUDIES   = [320, 240, 410, 180, 290, 350];

const xMin = 0, xMax = 2.5;
const xTicks = [0, 0.5, 1.0, 1.5, 2.0, 2.5];

export const BehavioralBiasesChart: React.FC<ChartDimensions> = ({ width: W, height: H }) => {
    const ML = 168, MR = 155, MT = 28, MB = 52;
    const IW = W - ML - MR;
    const IH = H - MT - MB;

    const xScale   = (v: number) => ((v - xMin) / (xMax - xMin)) * IW;
    const BAR_H    = IH / BIASES.length;
    const BAR_PAD  = 10;

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
        <svg width={W} height={H} style={{ display: 'block' }}>
            <g transform={`translate(${ML},${MT})`}>
                {xTicks.map((v, i) => (
                    <line key={i} x1={xScale(v)} y1={0} x2={xScale(v)} y2={IH}
                        stroke={GRID} strokeWidth={1} strokeDasharray="4 4" opacity={gridOpacity} />
                ))}
                <line x1={0} y1={0} x2={0} y2={IH * axisProgress} stroke={MUTED} strokeWidth={1.5} />
                <line x1={0} y1={IH} x2={IW * axisProgress} y2={IH} stroke={MUTED} strokeWidth={1.5} />
                {xTicks.map((v, i) => (
                    <text key={i} x={xScale(v)} y={IH + 20} textAnchor="middle"
                        fill={MUTED} fontSize={12} opacity={gridOpacity}>{v.toFixed(1)}</text>
                ))}

                {BIASES.map((bias, i) => {
                    const barDelay     = 90 + i * 15;
                    const barProgress  = interpolate(frame, [barDelay, barDelay + 40], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
                    const labelOpacity = interpolate(frame, [barDelay + 35, barDelay + 50], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
                    const bw = xScale(EFFECT_SIZE[i]) * barProgress;
                    const by = i * BAR_H + BAR_PAD / 2;
                    const bh = BAR_H - BAR_PAD;
                    return (
                        <g key={bias}>
                            <text x={-12} y={by + bh / 2 + 5} textAnchor="end"
                                fill={MUTED} fontSize={13} opacity={gridOpacity}>{bias}</text>
                            <rect x={0} y={by} width={bw} height={bh} fill={BLUE} opacity={0.85} rx={3} />
                            <text x={bw + 8} y={by + bh / 2 + 5}
                                fill={MUTED} fontSize={11} opacity={labelOpacity}>
                                d = {EFFECT_SIZE[i].toFixed(1)} · n = {N_STUDIES[i]}
                            </text>
                        </g>
                    );
                })}

                <line x1={xScale(1.0)} y1={IH * (1 - refProgress)} x2={xScale(1.0)} y2={IH}
                    stroke={GOLD} strokeWidth={1.5} strokeDasharray="6 4" opacity={0.85} />
                <text x={xScale(1.0) + 5} y={IH * (1 - refProgress) - 5}
                    fill={GOLD} fontSize={11} opacity={annotOpacity}>Effect = 1.0</text>

                <text x={IW / 2} y={IH + 44} textAnchor="middle" fill={MUTED} fontSize={13}>Effect Size (Cohen's d)</text>
            </g>
        </svg>
    );
};
