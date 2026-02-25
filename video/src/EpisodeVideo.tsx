import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion';

import { SectionBumper } from './components/SectionBumper';
import { ChartSlide } from './components/ChartSlide';
import { QuoteSlide } from './components/QuoteSlide';
import { CreditsSlide } from './components/CreditsSlide';
import { TitleCard } from './components/TitleCard';

export interface EpisodeVideoProps {
    scriptData: any[];
    episodeNumber: number;
    episodeTitle: string;
    episodeSubtitle: string;
}

export const EpisodeVideo: React.FC<EpisodeVideoProps> = ({ scriptData }) => {
    return (
        <AbsoluteFill style={{ background: '#0d1b2a' }}>
            <Audio
                src={staticFile('audio/bgm.wav')}
                volume={0.07}
                loop
            />

            {scriptData.map((chapter) => {
                if (chapter.id === 'intro') {
                    const slide = chapter.subSlides[0] as any;
                    return (
                        <Sequence key="intro" from={chapter.globalStart} durationInFrames={chapter.duration}>
                            {slide.audioSrc && <Audio src={staticFile(slide.audioSrc)} />}
                            <TitleCard episodeNumber={chapter.episode} episodeTitle={chapter.episodeMeta?.title} episodeSubtitle={chapter.episodeMeta?.subtitle} />
                        </Sequence>
                    );
                }

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
                        <ChapterSegment chapter={chapter} />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};

const ChapterSegment: React.FC<{ chapter: any }> = ({ chapter }) => {
    return (
        <AbsoluteFill style={{ background: '#0d1b2a', position: 'relative' }}>
            {chapter.subSlides.map((slide: any, idx: number) => {
                return (
                    <Sequence key={idx} from={slide.start} durationInFrames={slide.duration}>
                        {slide.chunk_id && slide.audio_exists ? (
                            <Audio src={staticFile(`audio/chunks/${slide.chunk_id}.wav`)} />
                        ) : null}
                        {slide.audioSrc ? (
                            <Audio src={staticFile(slide.audioSrc)} />
                        ) : null}
                        <SlideRenderer slide={slide} />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};

const SlideRenderer: React.FC<{ slide: any }> = ({ slide }) => {
    switch (slide.type) {
        case 'intro':
            return <TitleCard />;
        case 'bumper':
            return <SectionBumper partNumber="CHAPTER" partTitle={slide.title} color="#4e9ff0" />;
        case 'chart':
            return <ChartSlide chartSrc={slide.chartSrc} title={slide.title} />;
        case 'quote':
            return <QuoteSlide quote={slide.text} bgImage={slide.bgImage} wordTimings={slide.wordTimings} />;
        case 'credits':
            return <CreditsSlide />;
        default:
            return null;
    }
};
