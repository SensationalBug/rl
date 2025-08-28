export const maps = [
    {
        id: 'tierra',
        name: 'La Tierra',
        backgroundColor: '#1a3a1a', // Dark Green
        waveTimeline: [
            { time: 0, type: 'zombie', rate: 100 },
            { time: 45, type: 'bat', rate: 90 },
            { time: 90, type: 'zombie', rate: 60 },
        ]
    },
    {
        id: 'sol',
        name: 'El Sol',
        backgroundColor: '#c25a00', // Orange
        waveTimeline: [
            { time: 0, type: 'zombie', rate: 90 },
            { time: 30, type: 'bat', rate: 75 },
            { time: 60, type: 'zombie', rate: 50 },
            { time: 120, type: 'bat', rate: 45 },
        ]
    },
    {
        id: 'sistema-solar',
        name: 'Sistema Solar',
        backgroundColor: '#4d4d6e', // Dark Blue-Gray
        waveTimeline: [
            { time: 0, type: 'zombie', rate: 80 },
            { time: 0, type: 'bat', rate: 120 },
            { time: 60, type: 'zombie', rate: 45 },
            { time: 120, type: 'bat', rate: 40 },
        ]
    },
    {
        id: 'via-lactea',
        name: 'Vía Láctea',
        backgroundColor: '#3c1b4a', // Dark Purple
        waveTimeline: [
            { time: 0, type: 'zombie', rate: 60 },
            { time: 0, type: 'bat', rate: 100 },
            { time: 45, type: 'zombie', rate: 30 },
            { time: 90, type: 'bat', rate: 30 },
        ]
    },
    {
        id: 'gran-muralla',
        name: 'Gran Muralla H-C Boreal',
        backgroundColor: '#6b2e2e', // Dark Red
        waveTimeline: [
            { time: 0, type: 'zombie', rate: 45 },
            { time: 0, type: 'bat', rate: 75 },
            { time: 30, type: 'zombie', rate: 25 },
            { time: 60, type: 'bat', rate: 25 },
        ]
    },
    {
        id: 'andromeda',
        name: 'Andrómeda',
        backgroundColor: '#0f4d4d', // Dark Teal
        waveTimeline: [
            { time: 0, type: 'zombie', rate: 30 },
            { time: 0, type: 'bat', rate: 60 },
            { time: 30, type: 'zombie', rate: 20 },
            { time: 60, type: 'bat', rate: 20 },
        ]
    },
    {
        id: 'red-cosmica',
        name: 'Red Cósmica',
        backgroundColor: '#5e5e5e', // Gray
        waveTimeline: [
            { time: 0, type: 'zombie', rate: 20 },
            { time: 0, type: 'bat', rate: 45 },
            { time: 20, type: 'zombie', rate: 15 },
            { time: 40, type: 'bat', rate: 15 },
        ]
    },
    {
        id: 'gran-atractor',
        name: 'El Gran Atractor',
        backgroundColor: '#1a1a1a', // Near Black
        waveTimeline: [
            { time: 0, type: 'zombie', rate: 15 },
            { time: 0, type: 'bat', rate: 30 },
            { time: 15, type: 'zombie', rate: 10 },
            { time: 30, type: 'bat', rate: 10 },
        ]
    }
];
