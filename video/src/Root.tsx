import React from 'react';
import { Composition, Still } from 'remotion';
import './fonts';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { EpisodeVideo } from './EpisodeVideo';
import { Thumbnail } from './components/Thumbnail';
import { SeriesIntroVideo, SERIES_INTRO_TOTAL } from './SeriesIntroVideo';
import { EPISODE_OPENER_FRAMES } from './components/SeriesOpener';
import { EPISODE_LIST } from './constants/episodes';

import ep1Script from '../data/ep1_script.json';
import ep2Script from '../data/ep2_script.json';
import ep3Script from '../data/ep3_script.json';
import ep4Script from '../data/ep4_script.json';
import ep5Script from '../data/ep5_script.json';
import ep6Script from '../data/ep6_script.json';
import ep7Script from '../data/ep7_script.json';
import ep8Script from '../data/ep8_script.json';
import ep9Script from '../data/ep9_script.json';
import ep10Script from '../data/ep10_script.json';
import ep11Script from '../data/ep11_script.json';
import ep12Script from '../data/ep12_script.json';
import ep13Script from '../data/ep13_script.json';
import ep14Script from '../data/ep14_script.json';
import ep15Script from '../data/ep15_script.json';
import ep16Script from '../data/ep16_script.json';
import ep17Script from '../data/ep17_script.json';

const FPS = 30;

function totalFrames(script: any[]) {
    const last = script[script.length - 1];
    const intro = script.find((ch: any) => ch.id === 'intro');
    const introOffset = intro?.duration ?? 0;
    return EPISODE_OPENER_FRAMES + (last.globalStart + last.duration) - introOffset;
}

// Scripts indexed by episode num (1-based), mapped to their JSON imports
const EPISODE_SCRIPTS: Record<number, any> = {
    1:  ep17Script,
    2:  ep16Script,
    3:  ep11Script,
    4:  ep7Script,
    5:  ep1Script,
    6:  ep2Script,
    7:  ep12Script,
    8:  ep13Script,
    9:  ep8Script,
    10: ep3Script,
    11: ep9Script,
    12: ep14Script,
    13: ep15Script,
    14: ep4Script,
    15: ep10Script,
    16: ep5Script,
    17: ep6Script,
};

const EPISODES = EPISODE_LIST.map((ep) => ({
    id: `Episode${ep.num}`,
    script: EPISODE_SCRIPTS[ep.num],
    num: ep.num,
    title: ep.title,
    subtitle: ep.subtitle,
}));

export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* Series intro / Episode 0 */}
            <Composition
                id="Episode0"
                component={SeriesIntroVideo}
                durationInFrames={SERIES_INTRO_TOTAL}
                fps={FPS}
                width={1920}
                height={1080}
                defaultProps={{}}
            />

            {EPISODES.map((ep) => (
                <Composition
                    key={ep.id}
                    id={ep.id}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    component={EpisodeVideo as any}
                    durationInFrames={totalFrames(ep.script as any[])}
                    fps={FPS}
                    width={1920}
                    height={1080}
                    defaultProps={{
                        scriptData: ep.script,
                        episodeNumber: ep.num,
                        episodeTitle: ep.title,
                        episodeSubtitle: ep.subtitle,
                    }}
                />
            ))}
            {EPISODES.map((ep) => (
                <Still
                    key={`Thumbnail${ep.id}`}
                    id={`Thumbnail${ep.id}`}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    component={Thumbnail as any}
                    width={1280}
                    height={720}
                    defaultProps={{
                        episodeNumber: ep.num,
                        episodeTitle: ep.title,
                        episodeSubtitle: ep.subtitle,
                    }}
                />
            ))}
        </>
    );
};
