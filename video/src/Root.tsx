import React from 'react';
import { Composition } from 'remotion';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { EpisodeVideo } from './EpisodeVideo';

import ep1Script from '../data/ep1_script.json';
import ep2Script from '../data/ep2_script.json';
import ep3Script from '../data/ep3_script.json';
import ep4Script from '../data/ep4_script.json';
import ep5Script from '../data/ep5_script.json';
import ep6Script from '../data/ep6_script.json';

const FPS = 30;

function totalFrames(script: any[]) {
    const last = script[script.length - 1];
    return last.globalStart + last.duration;
}

const EPISODES = [
    { id: 'Episode1', script: ep1Script, num: 1, title: 'The Great Depression',        subtitle: '1929–1939' },
    { id: 'Episode2', script: ep2Script, num: 2, title: 'The 1970s Stagflation',        subtitle: '1973–1982' },
    { id: 'Episode3', script: ep3Script, num: 3, title: 'The Asian Financial Crisis',   subtitle: '1997–1998' },
    { id: 'Episode4', script: ep4Script, num: 4, title: 'The Global Financial Crisis',  subtitle: '2008–2012' },
    { id: 'Episode5', script: ep5Script, num: 5, title: 'The COVID-19 Economic Shock',  subtitle: '2020' },
    { id: 'Episode6', script: ep6Script, num: 6, title: 'The Great Inflation',          subtitle: '2021–2023' },
];

export const RemotionRoot: React.FC = () => {
    return (
        <>
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
        </>
    );
};
