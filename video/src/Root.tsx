import React from 'react';
import { Composition } from 'remotion';
import { EconomicsVideo } from './Video';

import script from '../data/script.json';

const FPS = 30;

const lastScene = script[script.length - 1];
const totalFrames = lastScene.globalStart + lastScene.duration;

export const RemotionRoot: React.FC = () => {
    return (
        <Composition
            id="EconomicsVideo"
            component={EconomicsVideo}
            durationInFrames={totalFrames}
            fps={FPS}
            width={1920}
            height={1080}
        />
    );
};
