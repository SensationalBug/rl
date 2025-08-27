import { enemyTypes } from './enemies.js';

export const waveTimeline = [
    { time: 0, type: enemyTypes.zombie, rate: 60 }, // A zombie every second
    { time: 30, type: enemyTypes.bat, rate: 45 },   // A bat every half-second starts at 1 min
    { time: 60, type: enemyTypes.zombie, rate: 30 },
];
