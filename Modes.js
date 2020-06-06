// pad section modes
const kPlayMode = 0;
const kSetupMode = 1;
const kLoopEditMode = 2;
const kEventEditMode = 3;
const kInstrumentEditMode = 4;
const kBankMenuMode = 5;
const kRepeatMenuMode = 6;
const kPitchMenuMode = 7;
const kRateTriggerMode = 8;
const kStepEditMode = 9;
const kHUIMode = 10;
const kRestorePlayMode = 11; // restores either kPlayMode or kRateTriggerMode
const kLastPadMode = kRestorePlayMode;

function HuiMode( name, color, toggleColor )
{
    this.name = name;
    this.color = color;
    this.toggleColor = toggleColor;
};
const HuiModes = [
    new HuiMode('monitor', '#00A9FF', ['#00454F', '#00A9FF']),
    new HuiMode('arm', '#FF4C87', ['#202020','#FF4C87']),
    new HuiMode('solo', '#FFE126', ['#392B00', '#FFE126']),
    new HuiMode('mute', '#874CFF', ['#0F0030', '#874CFF'])
];

function DevicePadMode(name)
{
    this.name = name;
};
const DevicePadModes = [
    new DevicePadMode('custom'),
    new DevicePadMode('drum'),
    new DevicePadMode('session')
];

function DevicePotMode(name)
{
    this.name = name;
};
const DevicePotModes = [
    new DevicePotMode('custom'),
    new DevicePotMode('volume'),
    new DevicePotMode('device'),
    new DevicePotMode('pan'),
    new DevicePotMode('send')
];

function SessionMode(name, index, color )
{
    this.name = name;
    this.index = index;
    this.color = color;
};
const SessionModes = [
    new SessionMode('edit', [kLoopEditMode, kEventEditMode, kInstrumentEditMode, kStepEditMode], '#AAAA00'),
    new SessionMode('setup', kSetupMode, '#0000FF'),
    new SessionMode('bank', kBankMenuMode, '#00FF00'),
    new SessionMode('hui', kHUIMode, '#38FFCC')
];

function loopIncrementedFromArray( array, index, returnValue )
{
    index++;
    if( index > array.length - 1 )
        index = 0;

    if( returnValue )
        return array[index];

    return index;
}

function findSessionModeFromIndex( index )
{
    for( let i = 0; i < SessionModes.length; i++ )
    {
        if( SessionModes[i].index instanceof Array )
        {
            if( SessionModes[i].index.indexOf(index) != -1 )
                return SessionModes[i];
        }
        if( SessionModes[i].index == index )
        {
            return SessionModes[i];
        }
    }
    return null;
}
