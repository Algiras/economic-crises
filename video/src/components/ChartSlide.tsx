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

const CHART_MAP: Record<string, React.FC> = {
    debt_gdp: DebtGdpChart,
    inflation_target: InflationTargetChart,
    forecast_errors: ForecastErrorsChart,
    complexity_index: ComplexityIndexChart,
    behavioral_biases: BehavioralBiasesChart,
};

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
    const { fps } = useVideoConfig();

    const { scale: bgScale, panX: bgPanX, panY: bgPanY } = useKenBurns(undefined, slideIndex);

    // Episode label fades in frames 0–20
    const epLabelOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

    // Chart title slides up frames 15–45
    const titleOpacity = interpolate(frame, [15, 45], [0, 1], { extrapolateRight: 'clamp' });
    const titleY = spring({ frame, fps, from: 20, to: 0, durationInFrames: 40, delay: 15 });

    // Chart content entrance frames 10–40 (for static fallback)
    const chartOpacity = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: 'clamp' });
    const chartScale = spring({ frame, fps, from: 0.8, to: 1, durationInFrames: 60, delay: 10, config: { damping: 12 } });

    const fadeOutOpacity = useFadeOut();

    const AnimatedChart = chartType ? CHART_MAP[chartType] : undefined;

    return (
        <AbsoluteFill style={{
            backgroundColor: COLORS.bgSlide,
            fontFamily: FONT,
            opacity: fadeOutOpacity,
            overflow: 'hidden',
        }}>
            {/* 1. Cinematic Background */}
            <AnimatedBgImage src={bgImage} scale={bgScale} panX={bgPanX} panY={bgPanY} opacity={0.4} vignetteStrength="heavy" />

            {/* 2. Content Layer */}
            <div style={{
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                padding: '30px 50px 40px',
                position: 'relative',
            }}>
                {/* Episode label — top left */}
                {(episodeNumber != null || episodeTitle) && (
                    <div style={{
                        position: 'absolute',
                        top: 30,
                        left: 60,
                        opacity: epLabelOpacity,
                        color: COLORS.textMuted,
                        fontSize: 16,
                        fontWeight: 600,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                    }}>
                        {episodeNumber != null ? `Episode ${episodeNumber}` : ''}
                        {episodeNumber != null && episodeTitle ? ' · ' : ''}
                        {episodeTitle ?? ''}
                    </div>
                )}

                {/* Chart title */}
                <div style={{
                    opacity: titleOpacity,
                    transform: `translateY(${titleY}px)`,
                    textAlign: 'center',
                    marginBottom: 16,
                }}>
                    <h2 style={{
                        color: COLORS.gold,
                        fontSize: 38,
                        fontWeight: 800,
                        margin: 0,
                        letterSpacing: -1,
                        textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                    }}>
                        {title}
                    </h2>
                </div>

                {/* Chart */}
                {AnimatedChart ? (
                    <div style={{
                        borderRadius: 16,
                        overflow: 'hidden',
                        boxShadow: SHADOWS.cardDrop,
                        width: '100%',
                        backgroundColor: '#0d1b2a',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        <AnimatedChart />
                    </div>
                ) : (
                    <div style={{
                        opacity: chartOpacity,
                        transform: `scale(${chartScale})`,
                        borderRadius: 16,
                        overflow: 'hidden',
                        boxShadow: SHADOWS.cardDrop,
                        maxWidth: 1000,
                        width: '100%',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                        <Img
                            src={staticFile(chartSrc)}
                            style={{
                                width: '100%',
                                display: 'block',
                                filter: 'brightness(1.1) contrast(1.1)',
                            }}
                        />
                    </div>
                )}

                {source && (
                    <p style={{
                        opacity: titleOpacity,
                        color: '#7f8c8d',
                        fontSize: 18,
                        marginTop: 30,
                        fontStyle: 'italic',
                        fontWeight: 500,
                    }}>
                        Source: {source}
                    </p>
                )}
            </div>
        </AbsoluteFill>
    );
};
