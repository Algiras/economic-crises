import React from 'react';

export const Letterbox: React.FC = () => (
    <>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 56, background: '#000', zIndex: 200, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 56, background: '#000', zIndex: 200, pointerEvents: 'none' }} />
    </>
);
