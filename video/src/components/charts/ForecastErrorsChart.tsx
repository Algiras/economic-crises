/**
 * ForecastErrorsChart — dual panel: IMF forecast vs actual (top) + error bars (bottom)
 * Both panels share the same x-scale and left/right margins so columns align.
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { ChartBase } from './ChartBase';
import { COLORS } from '../../theme';

const YEARS    = Array.from({ length: 20 }, (_, i) => 2004 + i);
const FORECAST = [4.9, 4.7, 5.1, 5.2, 5.0, 3.0, -0.5, 4.2, 4.1, 3.9,
                  3.5, 3.5, 3.6, 3.7, 3.8, 3.6, 3.3,  6.0, 4.4, 3.5];
const ACTUAL   = [4.4, 4.8, 5.4, 5.7, 3.9, -0.1, -2.1, 5.4, 3.9, 3.6,
                  3.5, 3.4, 3.3, 3.2, 3.2,  2.8, 2.8, -3.1, 6.2, 3.2];
const ERRORS   = FORECAST.map((f, i) => f - ACTUAL[i]);

const W = 960, H = 480;

// Shared horizontal dimensions
const ML = 80, MR = 30;
const IW = W - ML - MR;

// Top panel occupies 60% of inner height, bottom 35%, with 5% gap
const TOP_H  = Math.round(H * 0.58);
const GAP    = 16;
const BOT_H  = H - TOP_H - GAP;

const MT_top = 25, MB_top = 12;
const MT_bot = 8,  MB_bot = 52;

const IH_TOP = TOP_H - MT_top - MB_top;
const IH_BOT = BOT_H - MT_bot - MB_bot;

// Shared x scale
const xMin = 2003.5, xMax = 2024;
const xScale = (v: number) => ((v - xMin) / (xMax - xMin)) * IW;

// Y scales
const yMinTop = -3.5, yMaxTop = 7;
const yScaleTop = (v: number) => IH_TOP - ((v - yMinTop) / (yMaxTop - yMinTop)) * IH_TOP;

const yMinBot = -3, yMaxBot = 3;
const yScaleBot = (v: number) => IH_BOT - ((v - yMinBot) / (yMaxBot - yMinBot)) * IH_BOT;

// Shared ticks
const xTicks = [2004, 2008, 2012, 2016, 2020, 2023].map(y => ({ value: y, label: String(y) }));
const yTicksTop = [-2, 0, 2, 4, 6].map(v => ({ value: v, label: `${v}%` }));
const yTicksBot = [-2, 0, 2].map(v => ({ value: v, label: `${v}` }));

const BAR_W = IW / (YEARS.length + 1);

export const ForecastErrorsChart: React.FC = () => {
    const frame = useCurrentFrame();
    const START = 45;

    const lineProgress = interpolate(frame, [90, 200],  [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const fillOpacity  = interpolate(frame, [150, 200], [0, 0.15], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const annotOpacity = interpolate(frame, [220, 260], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

    const BLUE  = COLORS.blue;
    const GOLD  = COLORS.gold;
    const MUTED = COLORS.textMuted;
    const RED   = '#e05c5c';
    const GREEN = '#5ce07a';

    const forecastPath = 'M ' + YEARS.map((y, i) => `${xScale(y)},${yScaleTop(FORECAST[i])}`).join(' L ');
    const actualPath   = 'M ' + YEARS.map((y, i) => `${xScale(y)},${yScaleTop(ACTUAL[i])}`).join(' L ');

    const fillPath =
        'M ' + YEARS.map((y, i) => `${xScale(y)},${yScaleTop(FORECAST[i])}`).join(' L ') +
        ' L ' + [...YEARS].reverse().map((y, ri) => `${xScale(y)},${yScaleTop(ACTUAL[YEARS.length - 1 - ri])}`).join(' L ') + ' Z';

    // Shared margin object (for ChartBase margin param — not used for offsets, only for startFrame)
    const sharedMargin = { top: 0, right: 0, bottom: 0, left: 0 };

    return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
            <defs>
                <clipPath id="fc-clip">
                    <rect x={0} y={-10} width={IW * lineProgress} height={IH_TOP + 20} />
                </clipPath>
            </defs>

            {/* ── TOP PANEL ── */}
            <g transform={`translate(${ML},${MT_top})`}>
                <ChartBase
                    margin={sharedMargin} startFrame={START}
                    xTicks={[]} yTicks={yTicksTop}
                    innerWidth={IW} innerHeight={IH_TOP}
                    xScale={xScale} yScale={yScaleTop}
                    gridLines={[-2, 0, 2, 4, 6]}
                />

                {/* Fill between forecast and actual */}
                <path d={fillPath} fill={RED} opacity={fillOpacity} clipPath="url(#fc-clip)" />

                <g clipPath="url(#fc-clip)">
                    <path d={forecastPath} fill="none" stroke={BLUE} strokeWidth={2.5} />
                    <path d={actualPath}   fill="none" stroke={GOLD} strokeWidth={2.5} />
                </g>

                {/* Legend — top-right */}
                <g opacity={annotOpacity}>
                    <rect x={IW - 145} y={4}  width={14} height={3} fill={BLUE} rx={1} />
                    <text x={IW - 126} y={9}  fill={BLUE} fontSize={11}>IMF Forecast</text>
                    <rect x={IW - 145} y={18} width={14} height={3} fill={GOLD} rx={1} />
                    <text x={IW - 126} y={23} fill={GOLD} fontSize={11}>Actual</text>
                </g>

                {/* GFC annotation */}
                <g opacity={annotOpacity}>
                    <line x1={xScale(2009)} y1={yScaleTop(-2.1)} x2={xScale(2009)} y2={yScaleTop(-3)} stroke={MUTED} strokeWidth={1} strokeDasharray="3 3" />
                    <text x={xScale(2009)} y={yScaleTop(-3.2)} fill={MUTED} fontSize={10} textAnchor="middle">GFC miss</text>
                </g>

                {/* COVID annotation */}
                <g opacity={annotOpacity}>
                    <line x1={xScale(2020)} y1={yScaleTop(-3.1)} x2={xScale(2020)} y2={yScaleTop(-3.2)} stroke={MUTED} strokeWidth={1} />
                    <text x={xScale(2020)} y={yScaleTop(-3.4)} fill={MUTED} fontSize={10} textAnchor="middle">COVID</text>
                </g>

                {/* Y label */}
                <text transform="rotate(-90)" x={-IH_TOP / 2} y={-65} textAnchor="middle" fill={MUTED} fontSize={12}>
                    GDP Growth (%)
                </text>
            </g>

            {/* ── BOTTOM PANEL ── */}
            <g transform={`translate(${ML},${TOP_H + GAP + MT_bot})`}>
                <ChartBase
                    margin={sharedMargin} startFrame={START + 30}
                    xTicks={xTicks} yTicks={yTicksBot}
                    innerWidth={IW} innerHeight={IH_BOT}
                    xScale={xScale} yScale={yScaleBot}
                    gridLines={[-2, 0, 2]}
                />

                {/* Bars */}
                {YEARS.map((y, i) => {
                    const barProgress = interpolate(frame, [120 + i * 5, 165 + i * 5], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
                    const err    = ERRORS[i];
                    const barColor = err > 0 ? RED : GREEN;
                    const barH   = Math.abs(yScaleBot(err) - yScaleBot(0)) * barProgress;
                    const barY   = err > 0 ? yScaleBot(0) - barH : yScaleBot(0);
                    return (
                        <rect
                            key={y}
                            x={xScale(y) - BAR_W * 0.4}
                            y={barY}
                            width={BAR_W * 0.8}
                            height={barH}
                            fill={barColor}
                            opacity={0.85}
                        />
                    );
                })}

                {/* Y label */}
                <text transform="rotate(-90)" x={-IH_BOT / 2} y={-65} textAnchor="middle" fill={MUTED} fontSize={12}>
                    Error (pp)
                </text>

                {/* X axis label */}
                <text x={IW / 2} y={IH_BOT + 44} textAnchor="middle" fill={MUTED} fontSize={13}>Year</text>
            </g>
        </svg>
    );
};
