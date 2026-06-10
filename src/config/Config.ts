const STORAGE_PREFIX = 'solkost_spider_';
const k = (key: string) => STORAGE_PREFIX + key;

export var RIGHT_HANDED_MODE_ACTIVE: boolean;
export var RIGHT_HANDED_MODE_IDX: number;
export var SOUND_ACTIVE: boolean = false;
export var NIGHT_MODE_ACTIVE: number = 0; // 0=light wood, 1=dark wood, 2=solid green
export const NIGHT_MODE_COUNT = 3;
export var DRAG_ACTIVE: boolean = true;
export var SUIT_MODE: number = 1;

export var SHOW_SYSTEM_NOTICE: boolean = true;

export function loadDefaultSettings(isMobile: boolean = false)
{
    if (RIGHT_HANDED_MODE_ACTIVE == undefined || RIGHT_HANDED_MODE_ACTIVE == null)
    {
        RIGHT_HANDED_MODE_ACTIVE = false;
        RIGHT_HANDED_MODE_IDX = RIGHT_HANDED_MODE_ACTIVE ? 1 : 0;
    }

    if (SUIT_MODE == undefined || SUIT_MODE == null)
    {
        SUIT_MODE = 1; // Default to 1-suit mode if not set
    }
}

// Toggle and save suit mode
export function setSuitMode(params: number)
{
    if ([1, 2, 4].includes(params)) // Ensure valid suit mode
    {
        SUIT_MODE = params;
        localStorage.setItem(k('SUIT_MODE'), JSON.stringify(params));
    }
}

export function getSuitMode()
{
    return SUIT_MODE;
}

// Load saved settings from localStorage
export function loadSettings()
{
    const rightHandedMode = localStorage.getItem(k('RIGHT_HANDED_MODE_ACTIVE'));
    if (rightHandedMode !== null)
    {
        RIGHT_HANDED_MODE_ACTIVE = JSON.parse(rightHandedMode);
    }

    const rightHandedModeIdx = localStorage.getItem(k('RIGHT_HANDED_MODE_IDX'));
    if (rightHandedModeIdx !== null)
    {
        RIGHT_HANDED_MODE_IDX = JSON.parse(rightHandedModeIdx);
    }

    const soundActive = localStorage.getItem(k('SOUND_ACTIVE'));
    if (soundActive !== null)
    {
        SOUND_ACTIVE = JSON.parse(soundActive);
    }

    const nightMode = localStorage.getItem(k('NIGHT_MODE_ACTIVE'));
    if (nightMode !== null)
    {
        const parsed = JSON.parse(nightMode);
        // legacy boolean → numeric (true→1, false→0)
        NIGHT_MODE_ACTIVE = typeof parsed === 'boolean' ? (parsed ? 1 : 0) : parsed;
    }

    const suitMode = localStorage.getItem(k('SUIT_MODE'));
    if (suitMode !== null)
    {
        SUIT_MODE = JSON.parse(suitMode);
    }

    const showSystemNotice = localStorage.getItem(k('SHOW_SYSTEM_NOTICE'));
    if (showSystemNotice !== null)
    {
        SHOW_SYSTEM_NOTICE = JSON.parse(showSystemNotice);
    }
}

export function toggleRightHandedActive(params: boolean)
{
    RIGHT_HANDED_MODE_ACTIVE = params;
    RIGHT_HANDED_MODE_IDX = params ? 1 : 0;
    localStorage.setItem(k('RIGHT_HANDED_MODE_ACTIVE'), JSON.stringify(params));
    localStorage.setItem(k('RIGHT_HANDED_MODE_IDX'), JSON.stringify(RIGHT_HANDED_MODE_IDX));
}

export function toggleSoundActive(params: boolean)
{
    SOUND_ACTIVE = params;
    localStorage.setItem(k('SOUND_ACTIVE'), JSON.stringify(params));
}

export function cycleNightMode()
{
    NIGHT_MODE_ACTIVE = (NIGHT_MODE_ACTIVE + 1) % NIGHT_MODE_COUNT;
    localStorage.setItem(k('NIGHT_MODE_ACTIVE'), JSON.stringify(NIGHT_MODE_ACTIVE));
}

export function setDragActive(val: boolean)
{
    DRAG_ACTIVE = val;
}

export function setShowSytemNotice(val: boolean)
{
    SHOW_SYSTEM_NOTICE = val;
    localStorage.setItem(k('SHOW_SYSTEM_NOTICE'), JSON.stringify(val));
}
