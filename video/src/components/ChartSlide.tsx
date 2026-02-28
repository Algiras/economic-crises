import { FONT } from '../fonts';
import React from 'react';
import { Img, interpolate, useCurrentFrame, useVideoConfig, spring, staticFile, AbsoluteFill } from 'remotion';
import { COLORS, SHADOWS } from '../theme';
import { useFadeOut, useKenBurns } from '../hooks/useAnimation';
import { AnimatedBgImage } from './AnimatedBgImage';
import { DebtGdpChart } from './charts/DebtGdpChart';
import { InflationTargetChart } from './charts/InflationTargetChart';
import { ForecastErrorsChart } from './charts/ForecastErrorsChart';
import { ComplexityIndexChart } from './charts/ComplexityIndexChart';
import { BehavioralBiasesChart } from './charts/BehavioralBiasesChart';

interface ChartSlideProps {
    chartSrc: string;
    chartType?: string;
    title: string;
    source?: string;
    bgImage?: string;
    slideIndex?: number;
    episodeNumber?: number;
    episodeTitle?: string;
}

export interface ChartDimensions { width: number; height: number }

type ChartComponent = React.FC<ChartDimensions>;

const CHART_MAP: Record<string, ChartComponent> = {
    debt_gdp:          DebtGdpChart,
    inflation_target:  InflationTargetChart,
    forecast_errors:   ForecastErrorsChart,
    complexity_index:  ComplexityIndexChart,
    behavioral_biases: BehavioralBiasesChart,
};

// Fixed vertical sizes (px) for layout arithmetic
const LETTERBOX     = 56;   // top + bottom bars
const PAD_H         = 60;   // top 28 + bottom 32
const EPISODE_LABEL = 52;   // spacer that clears the episode label
const TITLE_H       = 50;   // title font 34 + breathing room
const TITLE_MB      = 12;
const SOURCE_H      = 32;   // source line + margin

export const ChartSlide: React.FC<ChartSlideProps> = ({
    chartSrc,
    chartType,
    title,
    source,
    bgImage = 'bg_interest_chart.jpg',
    slideIndex = 0,
    episodeNumber,
    episodeTitle,
}) => {
    const frame = useCurrentFrame();
    const { fps, width: vw, height: vh } = useVideoConfig();

    const { scale: bgScale, panX: bgPanX, panY: bgPanY } = useKenBurns(undefined, slideIndex);

    const epLabelOpacity = interpolate(frame, [0, 20],  [0, 1], { extrapolateRight: 'clamp' });
    const titleOpacity   = interpolate(frame, [15, 45], [0, 1], { extrapolateRight: 'clamp' });
    const titleY         = spring({ frame, fps, from: 20, to: 0, durationInFrames: 40, delay: 15 });
    const chartOpacity   = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: 'clamp' });
    const chartScale     = spring({ frame, fps, from: 0.8, to: 1, durationInFrames: 60, delay: 10, config: { damping: 12 } });
    const fadeOutOpacity = useFadeOut();

    // Exact pixel budget for the chart
    const sidePad   = 50;
    const chartW    = vw - sidePad * 2;
    const nonChartH = LETTERBOX * 2 + PAD_H + EPISODE_LABEL + TITLE_H + TITLE_MB + (source ? SOURCE_H : 0);
    const chartH    = vh - nonChartH;

    const AnimatedChart = chartType ? CHART_MAP[chartType] : undefined;

    return (
        <AbsoluteFill style={{
            backgroundColor: COLORS.bgSlide,
            fontFamily: FONT,
            opacity: fadeOutOpacity,
            overflow: 'hidden',
        }}>
            <AnimatedBgImage src={bgImage} scale={bgScale} panX={bgPanX} panY={bgPanY} opacity={0.4} vignetteStrength="heavy" />

            <div style={{
                zIndex: 1,
                position: 'absolute',
                top: LETTERBOX,
                bottom: LETTERBOX,
                left: sidePad,
                right: sidePad,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                {/* Episode label — top left */}
                {(episodeNumber != null || episodeTitle) && (
                    <div style={{
                        position: 'absolute',
                        top: 12,
                        left: 0,
                        opacity: epLabelOpacity,
                        color: COLORS.textMuted,
                        fontSize: 15,
                        fontWeight: 600,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                    }}>
                        {episodeNumber != null ? `Episode ${episodeNumber}` : ''}
                        {episodeNumber != null && episodeTitle ? ' · ' : ''}
                        {episodeTitle ?? ''}
                    </div>
                )}

                {/* Spacer below episode label */}
                <div style={{ height: EPISODE_LABEL, flexShrink: 0 }} />

                {/* Title */}
                <div style={{
                    opacity: titleOpacity,
                    transform: `translateY(${titleY}px)`,
                    textAlign: 'center',
                    marginBottom: TITLE_MB,
                    flexShrink: 0,
                    width: '100%',
                }}>
                    <h2 style={{
                        color: COLORS.gold,
                        fontSize: 34,
                        fontWeight: 800,
                        margin: 0,
                        letterSpacing: -0.5,
                        textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                    }}>
                        {title}
                    </h2>
                </div>

                {/* Chart — exact pixel size, no CSS scaling surprises */}
                {AnimatedChart ? (
                    <div style={{
                        borderRadius: 12,
                        overflow: 'hidden',
                        boxShadow: SHADOWS.cardDrop,
                        width: chartW,
                        height: chartH,
                        backgroundColor: COLORS.bgEpisode,
                        border: '1px solid rgba(255,255,255,0.08)',
                        flexShrink: 0,
                    }}>
                        <AnimatedChart width={chartW} height={chartH} />
                    </div>
                ) : (
                    <div style={{
                        opacity: chartOpacity,
                        transform: `scale(${chartScale})`,
                        borderRadius: 12,
                        overflow: 'hidden',
                        boxShadow: SHADOWS.cardDrop,
                        width: chartW,
                        height: chartH,
                        border: '1px solid rgba(255,255,255,0.1)',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <Img
                            src={staticFile(chartSrc)}
                            style={{ width: '100%', display: 'block', filter: 'brightness(1.1) contrast(1.1)' }}
                        />
                    </div>
                )}

                {/* Source */}
                {source && (
                    <p style={{
                        opacity: titleOpacity,
                        color: '#7f8c8d',
                        fontSize: 14,
                        marginTop: 8,
                        marginBottom: 0,
                        fontStyle: 'italic',
                        fontWeight: 500,
                        flexShrink: 0,
                    }}>
                        Source: {source}
                    </p>
                )}
            </div>
        </AbsoluteFill>
    );
};
