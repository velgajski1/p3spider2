export var RIGHT_HANDED_MODE_ACTIVE: boolean;
export var RIGHT_HANDED_MODE_IDX: number;
export var AUTOFINISH_MODE_ACTIVE: boolean = true;
export var SOUND_ACTIVE: boolean = true;
export var BG_INDEX: number = 0;
export var DRAG_ACTIVE: boolean = true;
export var SUIT_MODE: number = 1;

export var SHOW_SYSTEM_NOTICE: boolean = true;

export function loadDefaultSettings(isMobile: boolean = false)
{

    if (RIGHT_HANDED_MODE_ACTIVE == undefined || RIGHT_HANDED_MODE_ACTIVE == null)
    {
        if (isMobile)
        {
            RIGHT_HANDED_MODE_ACTIVE = false;
        } else
        {
            RIGHT_HANDED_MODE_ACTIVE = false;
        }
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
        localStorage.setItem('SUIT_MODE', JSON.stringify(params));
    }
}

export function getSuitMode()
{
    return SUIT_MODE;
}

// Load saved settings from localStorage
export function loadSettings()
{
    const rightHandedMode = localStorage.getItem('RIGHT_HANDED_MODE_ACTIVE');
    if (rightHandedMode !== null)
    {
        RIGHT_HANDED_MODE_ACTIVE = JSON.parse(rightHandedMode);
    }

    const rightHandedModeIdx = localStorage.getItem('RIGHT_HANDED_MODE_IDX');
    if (rightHandedModeIdx !== null)
    {
        RIGHT_HANDED_MODE_IDX = JSON.parse(rightHandedModeIdx);
    }

    const autofinishMode = localStorage.getItem('AUTOFINISH_MODE_ACTIVE');
    if (autofinishMode !== null)
    {
        AUTOFINISH_MODE_ACTIVE = JSON.parse(autofinishMode);
    }

    const soundActive = localStorage.getItem('SOUND_ACTIVE');
    if (soundActive !== null)
    {
        SOUND_ACTIVE = JSON.parse(soundActive);
    }

    const bgIndex = localStorage.getItem('BG_INDEX');
    if (bgIndex !== null)
    {
        BG_INDEX = JSON.parse(bgIndex);
    }

    const suitMode = localStorage.getItem('SUIT_MODE');
    if (suitMode !== null)
    {
        SUIT_MODE = JSON.parse(suitMode);
    }



    // SUIT_MODE = 1;


}


export function toggleRightHandedActive(params: boolean)
{
    RIGHT_HANDED_MODE_ACTIVE = params;
    RIGHT_HANDED_MODE_IDX = params ? 1 : 0;
    localStorage.setItem('RIGHT_HANDED_MODE_ACTIVE', JSON.stringify(params));
    localStorage.setItem('RIGHT_HANDED_MODE_IDX', JSON.stringify(RIGHT_HANDED_MODE_IDX));
}

export function toggleAutofinishActive(params: boolean)
{
    AUTOFINISH_MODE_ACTIVE = params;
    localStorage.setItem('AUTOFINISH_MODE_ACTIVE', JSON.stringify(params));
}

export function toggleSoundActive(params: boolean)
{
    SOUND_ACTIVE = params;
    localStorage.setItem('SOUND_ACTIVE', JSON.stringify(params));
}

export function setBgIdx(params: number)
{
    BG_INDEX = params;
    localStorage.setItem('BG_INDEX', JSON.stringify(params));
}

export function setDragActive(val: boolean)
{
    DRAG_ACTIVE = val;
}

export function getBGINDEX()
{
    return BG_INDEX
}

export function setShowSytemNotice(val: boolean)
{
    SHOW_SYSTEM_NOTICE = val;
}
