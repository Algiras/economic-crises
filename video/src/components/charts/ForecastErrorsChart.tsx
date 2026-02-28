import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { ChartBase } from './ChartBase';
import { COLORS } from '../../theme';
import { ChartDimensions } from '../ChartSlide';

const YEARS    = Array.from({ length: 20 }, (_, i) => 2004 + i);
const FORECAST = [4.9, 4.7, 5.1, 5.2, 5.0, 3.0, -0.5, 4.2, 4.1, 3.9,
                  3.5, 3.5, 3.6, 3.7, 3.8, 3.6, 3.3,  6.0, 4.4, 3.5];
const ACTUAL   = [4.4, 4.8, 5.4, 5.7, 3.9, -0.1, -2.1, 5.4, 3.9, 3.6,
                  3.5, 3.4, 3.3, 3.2, 3.2,  2.8, 2.8, -3.1, 6.2, 3.2];
const ERRORS   = FORECAST.map((f, i) => f - ACTUAL[i]);

const ML = 78, MR = 30;
const xMin = 2003.5, xMax = 2024;
const yMinTop = -3.5, yMaxTop = 7;
const yMinBot = -3,   yMaxBot = 3;

const xTicks    = [2004, 2008, 2012, 2016, 2020, 2023].map(y => ({ value: y, label: String(y) }));
const yTicksTop = [-2, 0, 2, 4, 6].map(v => ({ value: v, label: `${v}%` }));
const yTicksBot = [-2, 0, 2].map(v => ({ value: v, label: `${v}` }));

export const ForecastErrorsChart: React.FC<ChartDimensions> = ({ width: W, height: H }) => {
    const IW = W - ML - MR;

    // Top panel 62%, bottom 34%, gap 4%
    const TOP_H  = Math.round(H * 0.62);
    const GAP    = Math.round(H * 0.04);
    const BOT_H  = H - TOP_H - GAP;

    const MT_top = 22, MB_top = 10;
    const MT_bot = 6,  MB_bot = 50;
    const IH_TOP = TOP_H - MT_top - MB_top;
    const IH_BOT = BOT_H - MT_bot - MB_bot;

    const xScale     = (v: number) => ((v - xMin) / (xMax - xMin)) * IW;
    const yScaleTop  = (v: number) => IH_TOP - ((v - yMinTop) / (yMaxTop - yMinTop)) * IH_TOP;
    const yScaleBot  = (v: number) => IH_BOT - ((v - yMinBot) / (yMaxBot - yMinBot)) * IH_BOT;

    const BAR_W = IW / (YEARS.length + 1);

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

    const sharedMargin = { top: 0, right: 0, bottom: 0, left: 0 };

    const forecastPath = 'M ' + YEARS.map((y, i) => `${xScale(y)},${yScaleTop(FORECAST[i])}`).join(' L ');
    const actualPath   = 'M ' + YEARS.map((y, i) => `${xScale(y)},${yScaleTop(ACTUAL[i])}`).join(' L ');
    const fillPath =
        'M ' + YEARS.map((y, i) => `${xScale(y)},${yScaleTop(FORECAST[i])}`).join(' L ') +
        ' L ' + [...YEARS].reverse().map((y, ri) => `${xScale(y)},${yScaleTop(ACTUAL[YEARS.length - 1 - ri])}`).join(' L ') + ' Z';

    return (
        <svg width={W} height={H} style={{ display: 'block' }}>
            <defs>
                <clipPath id="fc-clip">
                    <rect x={0} y={-10} width={IW * lineProgress} height={IH_TOP + 20} />
                </clipPath>
            </defs>

            {/* TOP PANEL */}
            <g transform={`translate(${ML},${MT_top})`}>
                <ChartBase margin={sharedMargin} startFrame={START}
                    xTicks={[]} yTicks={yTicksTop}
                    innerWidth={IW} innerHeight={IH_TOP}
                    xScale={xScale} yScale={yScaleTop}
                    gridLines={[-2, 0, 2, 4, 6]}
                />
                <path d={fillPath} fill={RED} opacity={fillOpacity} clipPath="url(#fc-clip)" />
                <g clipPath="url(#fc-clip)">
                    <path d={forecastPath} fill="none" stroke={BLUE} strokeWidth={2.5} />
                    <path d={actualPath}   fill="none" stroke={GOLD} strokeWidth={2.5} />
                </g>
                {/* Legend */}
                <g opacity={annotOpacity}>
                    <rect x={IW - 140} y={4}  width={14} height={3} fill={BLUE} rx={1} />
                    <text x={IW - 121} y={9}  fill={BLUE} fontSize={11}>IMF Forecast</text>
                    <rect x={IW - 140} y={18} width={14} height={3} fill={GOLD} rx={1} />
                    <text x={IW - 121} y={23} fill={GOLD} fontSize={11}>Actual</text>
                </g>
                {/* GFC annotation */}
                <g opacity={annotOpacity}>
                    <line x1={xScale(2009)} y1={yScaleTop(-2.1)} x2={xScale(2009)} y2={yScaleTop(-3)}
                        stroke={MUTED} strokeWidth={1} strokeDasharray="3 3" />
                    <text x={xScale(2009)} y={yScaleTop(-3.2)} fill={MUTED} fontSize={10} textAnchor="middle">GFC miss</text>
                </g>
                <text transform="rotate(-90)" x={-IH_TOP / 2} y={-62} textAnchor="middle" fill={MUTED} fontSize={12}>GDP Growth (%)</text>
            </g>

            {/* BOTTOM PANEL */}
            <g transform={`translate(${ML},${TOP_H + GAP + MT_bot})`}>
                <ChartBase margin={sharedMargin} startFrame={START + 30}
                    xTicks={xTicks} yTicks={yTicksBot}
                    innerWidth={IW} innerHeight={IH_BOT}
                    xScale={xScale} yScale={yScaleBot}
                    gridLines={[-2, 0, 2]}
                />
                {YEARS.map((y, i) => {
                    const bp  = interpolate(frame, [120 + i * 5, 165 + i * 5], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
                    const err = ERRORS[i];
                    const bH  = Math.abs(yScaleBot(err) - yScaleBot(0)) * bp;
                    const bY  = err > 0 ? yScaleBot(0) - bH : yScaleBot(0);
                    return (
                        <rect key={y}
                            x={xScale(y) - BAR_W * 0.4} y={bY}
                            width={BAR_W * 0.8} height={bH}
                            fill={err > 0 ? RED : GREEN} opacity={0.85}
                        />
                    );
                })}
                <text transform="rotate(-90)" x={-IH_BOT / 2} y={-62} textAnchor="middle" fill={MUTED} fontSize={12}>Error (pp)</text>
                <text x={IW / 2} y={IH_BOT + 42} textAnchor="middle" fill={MUTED} fontSize={13}>Year</text>
            </g>
        </svg>
    );
};
