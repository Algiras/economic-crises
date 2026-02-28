import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from './theme';

import { SectionBumper } from './components/SectionBumper';
import { ChartSlide } from './components/ChartSlide';
import { QuoteSlide } from './components/QuoteSlide';
import { StatSlide } from './components/StatSlide';
import { CreditsSlide } from './components/CreditsSlide';
import { TitleCard } from './components/TitleCard';
import { SeriesOpener, EPISODE_OPENER_FRAMES } from './components/SeriesOpener';
import { FilmGrain } from './components/FilmGrain';
import { ColorGrade } from './components/ColorGrade';
import { Letterbox } from './components/Letterbox';
import { LightLeak } from './components/LightLeak';

export interface EpisodeVideoProps {
    scriptData: any[];
    episodeNumber: number;
    episodeTitle: string;
    episodeSubtitle: string;
}

const ChapterDipOverlay: React.FC<{ boundaries: number[] }> = ({ boundaries }) => {
    const frame = useCurrentFrame();
    const opacity = boundaries.reduce((max, boundary) => {
        const dist = Math.abs(frame - boundary);
        if (dist > 10) return max;
        return Math.max(max, interpolate(dist, [0, 10], [1, 0], { extrapolateRight: 'clamp' }));
    }, 0);
    if (opacity === 0) return null;
    return <AbsoluteFill style={{ backgroundColor: 'black', opacity, zIndex: 50, pointerEvents: 'none' }} />;
};

export const EpisodeVideo: React.FC<EpisodeVideoProps> = ({ scriptData, episodeNumber, episodeTitle, episodeSubtitle }) => {
    // Intro chapter is skipped visually — subtract its duration so content starts right after opener
    const introChapter = scriptData.find((ch: any) => ch.id === 'intro');
    const introOffset = introChapter?.duration ?? 0;
    const contentFrom = EPISODE_OPENER_FRAMES - introOffset;

    const chapterBoundaries = scriptData
        .filter(ch => ch.id !== 'intro')
        .map(ch => ch.globalStart + contentFrom);

    return (
        <AbsoluteFill style={{ background: COLORS.bgEpisode }}>
            <Audio
                src={staticFile('audio/bgm.wav')}
                volume={0.07}
                loop
            />
            <FilmGrain />
            <ColorGrade />
            <Letterbox />
            <ChapterDipOverlay boundaries={chapterBoundaries} />
            <LightLeak boundaries={chapterBoundaries} />

            {/* Branded series opener at the start of every episode */}
            <Sequence from={0} durationInFrames={EPISODE_OPENER_FRAMES}>
                <SeriesOpener short episodeNumber={episodeNumber} episodeTitle={episodeTitle} episodeSubtitle={episodeSubtitle} />
            </Sequence>

            {/* Episode content — shifted so first real chapter starts right after opener */}
            <Sequence from={contentFrom}>
                <AbsoluteFill>
                    {scriptData.map((chapter) => {
                        // intro chapter is covered by the SeriesOpener — skip it
                        if (chapter.id === 'intro') return null;

                        if (chapter.id === 'credits') {
                            const slide = chapter.subSlides[0] as any;
                            return (
                                <Sequence key="credits" from={chapter.globalStart} durationInFrames={chapter.duration}>
                                    {slide.audioSrc && <Audio src={staticFile(slide.audioSrc)} />}
                                    <CreditsSlide />
                                </Sequence>
                            );
                        }

                        return (
                            <Sequence key={chapter.id} from={chapter.globalStart} durationInFrames={chapter.duration}>
                                <ChapterSegment chapter={chapter} episodeNumber={episodeNumber} episodeTitle={episodeTitle} />
                            </Sequence>
                        );
                    })}
                </AbsoluteFill>
            </Sequence>
        </AbsoluteFill>
    );
};

// Frames to wait before starting narration — lets the visual transition settle
const AUDIO_DELAY = 12;

const ChapterSegment: React.FC<{ chapter: any; episodeNumber?: number; episodeTitle?: string }> = ({ chapter, episodeNumber, episodeTitle }) => {
    let offset = 0;
    return (
        <AbsoluteFill style={{ background: COLORS.bgEpisode }}>
            {chapter.subSlides.map((slide: any, idx: number) => {
                const from = offset;
                offset += slide.duration;
                const audioSrc = slide.audioPath || slide.audioSrc || null;
                return (
                    <Sequence key={`s-${idx}`} from={from} durationInFrames={slide.duration} layout="absolute-fill">
                        {audioSrc && (
                            <Sequence from={AUDIO_DELAY}>
                                <Audio src={staticFile(audioSrc)} />
                            </Sequence>
                        )}
                        <SlideRenderer slide={{ ...slide, _slideIndex: idx }} episodeNumber={episodeNumber} episodeTitle={episodeTitle} />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};

const SlideRenderer: React.FC<{ slide: any; episodeNumber?: number; episodeTitle?: string }> = ({ slide, episodeNumber, episodeTitle }) => {
    switch (slide.type) {
        case 'intro':
            return <TitleCard />;
        case 'bumper':
            return <SectionBumper partNumber="CHAPTER" partTitle={slide.title} color={COLORS.blue} />;
        case 'chart':
            return <ChartSlide chartSrc={slide.chartSrc} chartType={slide.chartType} title={slide.title} source={slide.source} slideIndex={slide._slideIndex} episodeNumber={episodeNumber} episodeTitle={episodeTitle} />;
        case 'quote':
            return <QuoteSlide quote={slide.text} bgImage={slide.bgImage} wordTimings={slide.wordTimings} slideIndex={slide._slideIndex} />;
        case 'stat':
            return <StatSlide stat={slide.value} description={slide.label} bgImage={slide.bgImage} slideIndex={slide._slideIndex} />;
        case 'credits':
            return <CreditsSlide />;
        default:
            return null;
    }
};
