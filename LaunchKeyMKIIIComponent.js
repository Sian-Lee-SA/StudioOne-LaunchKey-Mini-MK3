/**
 * @Author: Sian Croser <Sian-Lee-SA>
 * @Date:   2020-05-27T21:56:33+09:30
 * @Email:  CQoute@gmail.com
 * @Filename: LaunchKeyMKIIIComponent.js
 * @Last modified by:   Sian Croser <Sian-Lee-SA>
 * @Last modified time: 2020-05-28T10:02:56+09:30
 * @License: GPL-3
 */
// include SDK files from host
include_file("resource://com.presonus.musicdevices/sdk/controlsurfacecomponent.js");
include_file("resource://com.presonus.musicdevices/sdk/musicprotocol.js");
include_file("Debug.js");
include_file("Color.js");
include_file("Modes.js");

const kDebug = new Debug;

const kPadCount = 16;
const kBankCount = 8;

// labeled pad positions
const PadIndex =
{
    SetupMode: {
        Browser: 0,
        Tempo: 8,
        MetronomeClick: 12,
        MetronomePreCount: 13
    },
    LoopEditMode: {
        LoopBackwards: 6,
        LoopForward: 7
    },
    EventEditMode: {
        VelocityDec: 6,
        VelocityInc: 7
    },
    Global: {
        Duplicate: 10,
        Delete: 15
    }
}

// repeat rates (pad 0 - 7)
let padRepeatRates =
[
    NoteRepeat.k4thPpq,
    NoteRepeat.k8thPpq,
    NoteRepeat.k16thPpq,
    NoteRepeat.k32thPpq,
    NoteRepeat.k4thTPpq,
    NoteRepeat.k8thTPpq,
    NoteRepeat.k16thTPpq,
    NoteRepeat.k32thTPpq
];

// colors
const kDefaultBankColor = "#00FFFF";
const kPadCommandColor = "#00FFFF";
const kRateTriggerColor = "orange";
const kRepeatMenuColor = "blue";

let bankColors =
[
    "#0020FF",
    "lime",
    "yellow",
    "purple",
    "orangered",
    "cyan",
    "crimson",
    "#FF7210"
];

let padSnapColors =
[
    "red",
    "orangered",
    "yellow",
    "greenyellow",
    "green",
    "blue",
    "aqua",
    "magenta",
    "darkviolet",
    "gray"
]

LaunchKeyMKIIIMidiComponent.prototype = new ControlSurfaceComponent ();
function LaunchKeyMKIIIMidiComponent ()
{
    this.getPadMode = function () { return this.padMode.value; }
    this.setPadMode = function (mode) { this.padMode.setValue(mode, true); }

    this.getSessionMode = function () { return this.sessionMode.value; }
    this.setSessionMode = function (mode) {
        this.sessionMode.setValue(mode, true);
    }

    this.setDrumMode = function (mode) { this.drumMode.setValue(mode, true); }

    this.onInit = function (hostComponent)
    {
        ControlSurfaceComponent.prototype.onInit.call (this, hostComponent);

        this.debugLog =             true;
        kDebug.device =             this;

        this.model = 	            hostComponent.model;
        let root = 		            this.model.root;

        // Elements
        this.padSessionSection =    root.find("PadSessionSectionElement");
        this.padDrumSection =       root.find("PadDrumSectionElement");

        this.focusChannelElement =  root.find("MixerElement").find("FocusBankElement").getElement (0);

        this.noteRepeatElement =    root.find("NoteRepeatElement");

        // Params
        let paramList = 		    hostComponent.paramList;

        this.shiftModifier = 	    paramList.addParam("shiftModifier");
        this.subModifier =          paramList.addParam("subModifier");

        this.devicePadMode = 	    paramList.addInteger(0, 126, "devicePadMode");
        this.devicePotMode = 	    paramList.addInteger(0, DevicePotModes.length - 1, "devicePotMode");

        this.sessionMode = 			paramList.addInteger(0, kLastPadMode, "sessionMode");
        this.sessionModeColor =     paramList.addColor('sessionModeColor');
        this.drumMode = 			paramList.addInteger(0, kLastPadMode, "drumMode");
        this.huiMode =              paramList.addInteger(0, HuiModes.length - 1, "huiMode");
        this.huiColor =             paramList.addColor("huiColor");
        this.huiLowerColorOn =      paramList.addColor("huiLowerColorOn");
        this.huiLowerColorOff =     paramList.addColor("huiLowerColorOff");


        this.padFocusMode = 	    paramList.addParam("padFocusMode");
        this.padDisplayMode =       paramList.addInteger(0, 2, "padDisplayMode");

        this.fullVelocityMode =     paramList.addParam("fullVelocityMode");
        this.bankMenu =             paramList.addInteger(0, kBankCount-1, "bankMenu");
        this.pitchMenu =            paramList.addInteger(0, kPadCount-1, "pitchMenu");
        this.repeatRateAlias =      paramList.addAlias("repeatRate");
        this.editorModeActive =     paramList.addParam("editorModeActive");

        this.bankMenuColor =        paramList.addColor("bankButtonColor");
        this.updateBankMenuColor();

        // setup pad section
        let c = this.padSessionSection.component;
        c.setPadColoringSupported(true);

        let i = 0;
        for( let key in Color.PRESONUS_SNAP )
        {
            if( i++ % 2 ) continue;
            c.addPadPaletteColor('#' + Color.convert(key).hex );
        }

        for(i in padSnapColors)
            c.addPadPaletteColor (padSnapColors[i]);

        let d = this.padDrumSection.component;
        d.setPadColoringSupported(true);

        for( let key in Color.Values )
            paramList.addInteger(Color.Values[key], Color.Values[key], key);

        kDebug.log(HostUtils);

        paramList.addInteger(0x00, 0x00, 'MONO_OFF');
        paramList.addInteger(0x3F, 0x3F, 'MONO_HALF');
        paramList.addInteger(0x7F, 0x7F, 'MONO_FULL');

        paramList.addInteger(0, 0, "EFFECT_NONE");
        paramList.addInteger(1, 1, "EFFECT_BLINK");
        paramList.addInteger(2, 2, "EFFECT_PULSE");

        paramList.addColor("loopColor").fromString('aqua');
        paramList.addColor("padFocusOnColor").fromString("orange");
        paramList.addColor("padFocusOffColor").fromString("blue");

        for(let mode = 0; mode <= kLastPadMode; mode++)
        {
            switch(mode)
            {
                case kPlayMode:
                    {
                        c.addHandlerForRole(PadSectionRole.kStepEdit);
                        d.addHandlerForRole(PadSectionRole.kMusicInput);
                        this.togglePadDisplayMode(true, 1);
                        d.getHandler(mode).setPadColor(kDefaultBankColor);
                        for(let i = 0; i < kBankCount; i++)
                            d.getHandler(mode).setBankColor(i, bankColors[i]);
                    }
                    break;

                case kSetupMode:
                    {
                        let commands = [];
                        // make first 8 pads user-assignable
                        for(let i = 0; i < 8; i++)
                            PadSection.addCommand (commands, i, "", "", PadSection.kCommandItemUserAssignable);

                        // fixed setup pads as labeled on device
                        // PadSection.addCommand(commands, PadIndex.SetupMode.Browser, "Browser", "Show Instruments", 0, HostUtils.kBrowserZone, Colors.yellowSteps[1]);
                        PadSection.addCommand(commands, PadIndex.SetupMode.Tempo, "Transport", "Tap Tempo", PadSection.kCommandItemDirect, null, '#0000FF');

                        PadSection.addCommand(commands, PadIndex.Global.Duplicate, "Edit", "Duplicate", 0, null, '#E2D762');

                        PadSection.addCommand(commands, PadIndex.SetupMode.MetronomeClick, "Transport", "Click");
                        PadSection.addCommand(commands, PadIndex.SetupMode.MetronomePreCount, "Transport", "Precount");

                        PadSection.addCommand(commands, PadIndex.Global.Delete, "Edit", "Delete", 0, null, '#FF0000');

                        c.addCommandInputHandler(commands);
                        c.getHandler(mode).setPadColor(kPadCommandColor);
                    }
                    break;

                case kLoopEditMode:
                    {
                        let commands = [];
                        PadSection.addCommand(commands, 0, "Zoom", "Zoom to Loop", 0, null, '#00FFFF');

                        PadSection.addCommand(commands, 6, "Transport", "Shift Loop Backwards");
                        PadSection.addCommand(commands, 7, "Transport", "Shift Loop");

                        PadSection.addCommand(commands, 8, "Transport", "Set Loop Start", 0, null, '#00AA00');
                        PadSection.addCommand(commands, 9, "Transport", "Rewind Bar", 'autorepeat', null, '#0000FF');
                        PadSection.addCommand(commands, 14, "Transport", "Forward Bar", 'autorepeat', null, '#0000FF');
                        PadSection.addCommand(commands, 15, "Transport", "Set Loop End", 0, null, '#FF0000');

                        c.addCommandInputHandler(commands);
                        c.getHandler(mode).setPadColor(kPadCommandColor);
                    }
                    break;

                case kEventEditMode:
                    {
                        let commands = [];
                        PadSection.addCommand (commands, PadIndex.Global.Duplicate, "Edit", "Duplicate", 0, null, '#E2D762');
                        PadSection.addCommand (commands, PadIndex.Global.Delete, "Edit", "Delete", 0, null, '#FF0000');
                        // NOTE: macro command names contain the base64-encoded macro filename (e.g. "Vel +10")
                        PadSection.addCommand (commands, PadIndex.EventEditMode.VelocityDec, "Macros", "Macro VmVsIC0xMA==", 0, null, '#448800');
                        PadSection.addCommand (commands, PadIndex.EventEditMode.VelocityInc, "Macros", "Macro VmVsICsxMA==", 0, null, '#00AA00');

                        c.addCommandInputHandler (commands);
                        c.getHandler(mode).setPadColor(kPadCommandColor);
                    }
                    break;

                case kBankMenuMode:
                    {
                        let items = [];
                        for(let i = 0; i < kBankCount; i++)
                            items.push ({"padIndex": i, "value": i, "color": bankColors[i]});

                        c.addMenuHandler (items, this.bankMenu);
                        c.getHandler(mode).setPadColor(kDefaultBankColor);
                    }
                    break;

                case kRepeatMenuMode:
                        c.addMenuHandler (padRepeatRates, this.repeatRateAlias, PadSection.kMenuUseListAccess);
                        c.getHandler (mode).setPadColor (kRepeatMenuColor);
                    break;

                case kPitchMenuMode:
                    {
                        let items = [];
                        for(let i = 0; i < kPadCount; i++)
                            items.push (i);
                        c.addMenuHandler (items, this.pitchMenu, PadSection.kMenuUseMusicInput);
                        c.getHandler (mode).setPadColor (kDefaultBankColor);
                    }
                    break;

                case kRateTriggerMode:
                    c.addHandlerForRole(PadSectionRole.kRateTrigger);
                    c.getHandler (mode).setPadColor (kRateTriggerColor);
                    for(i in padRepeatRates)
                        c.setPadRate (i, padRepeatRates[i]);
                    break;

                case kStepEditMode:
                    c.addHandlerForRole(PadSectionRole.kStepEdit);
                    c.getHandler(mode).setPadColor(kPadCommandColor);
                    break;

                default :
                    c.addNullHandler ();
                    break;
            }
        }

        this.devicePadMode.setValue(2, true); // Drum Mode
        this.padFocusMode.setValue(1, true);

        this.setSessionMode(kHUIMode);
        this.updateSessionMode();

        d.setActiveHandler(kPlayMode);


        this.lastTrackEditorType = HostUtils.kEditorTypeNone;

        HostUtils.enableEngineEditNotifications(this, true);

        Host.Signals.advise(c, this);
        Host.Signals.advise(d, this);
    }

    this.paramChanged = function(param)
    {

        switch( param )
        {
            case this.devicePadMode:
                let padMode = DevicePadModes[this.devicePadMode.value];
                if(padMode.name != 'session')
                    this.editorModeActive.value = false;
                break;

            case this.subModifier:
                this.padDrumSection.component.setModifierActive(param.value);
                this.padSessionSection.component.setModifierActive(param.value);
                return;

            case this.padFocusMode:
                return this.padDrumSection.component
                            .getHandler(kPlayMode)
                            .setFocusPadWhenPressed(param.value);

            case this.sessionMode:
                // Reset modifier incase it was toggles in another scene
                // NOTE stepedit has a latching subModifier
                this.subModifier.setValue(0, true);
                return this.updateSessionMode();



            case this.huiMode:
                return this.updateHuiMode();

            case this.fullVelocityMode:
                return this.padDrumSection.component.setFullVelocityMode(param.value);

            case this.bankMenu:
                this.padDrumSection.component.setCurrentBank(param.value);
                this.padSessionSection.component.setCurrentBank(param.value);
                return;
        }
    }

    this.togglePadDisplayMode = function(state, _value)
    {
        // Checks if button is a positive value as releasing button sends 0x00
        if( ! state )
            return;

        let modes = [
            MusicPadDisplayMode.kNoColors,
            MusicPadDisplayMode.kDimmedColors,
            MusicPadDisplayMode.kBrightColors,
        ];

        let value = ( _value ) ? _value : this.padDisplayMode.value + 1;
        if( value > 2 )
            value = 0;

        this.padDisplayMode.setValue( value, true );

        this.padDrumSection.component
                .getHandler(kPlayMode)
                .setDisplayMode(modes[value]);
    }

    this.onEditorButtonPressed = function(state)
    {
        if( ! state )
            return;

        mode = this.lastTrackEditorType == HostUtils.kEditorTypePattern ? kStepEditMode : kEventEditMode;
        this.setSessionMode(mode);

        Host.GUI.Commands.deferCommand("View", "Editor", false, Host.Attributes(["State", true]));
    }

    this.onScenePressed = function(value)
    {
        if( !value )
            return;

        let padMode = DevicePadModes[this.devicePadMode.value];
        switch( padMode.name )
        {
            case 'session':
                let currentSessionMode = findSessionModeFromIndex( this.getSessionMode() );
                if( ! currentSessionMode )
                    return this.setSessionMode(kSetupMode);

                let nextMode = loopIncrementedFromArray( SessionModes, SessionModes.indexOf(currentSessionMode), true );

                if( nextMode.name == 'edit' )
                    return this.onEditorButtonPressed(true);

                return this.setSessionMode(nextMode.index);

            case 'drum':
                return;

            case 'custom':
                return;
        }
    }

    this.onTrackEditorChanged = function (editor)
    {
        let mode = this.getSessionMode();
        let editorType = HostUtils.getEditorType(editor);

        this.lastTrackEditorType = editorType; // remember last track editor type

        if(mode == kStepEditMode || mode == kEventEditMode)
        {
            if(editorType == HostUtils.kEditorTypePattern)
                this.setSessionMode(kStepEditMode);
            else if(editorType == HostUtils.kEditorTypeMusic)
                this.setSessionMode(kEventEditMode);
        }
    }

    this.openEditorAndFocus = function(state)
    {
        if( ! state )
            return;
        HostUtils.openEditorAndFocus (this, this.focusChannelElement, HostUtils.kInstrumentEditor, true);
    }

    this.onToggleEditMode = function(state)
    {
        if( ! state )
            return;

        switch( this.sessionMode.value )
        {
            case kStepEditMode:
            case kEventEditMode:
                return this.setSessionMode(kLoopEditMode);
            case kLoopEditMode:
                return this.setSessionMode(kPitchMenuMode);
            case kPitchMenuMode:
                return this.onEditorButtonPressed(true);
        }

    }

    this.onConnectNoteRepeat = function ()
    {
        this.noteRepeatElement.connectAliasParam(this.repeatRateAlias, NoteRepeat.kRate);

        // init pad mode based on note repeat settings
        let repeatActive = this.noteRepeatElement.getParamValue(NoteRepeat.kActive);
        this.onActivateNoteRepeat(repeatActive);
    }

    this.onNoteRepeatButtonPressed = function (state)
    {
        if( ! state )
            return;

        let repeatActive = this.noteRepeatElement.getParamValue(NoteRepeat.kActive);

        this.noteRepeatElement.setParamValue(NoteRepeat.kActive, !repeatActive);
        this.noteRepeatElement.setParamValue(NoteRepeat.kSpread, !repeatActive);

    }

    this.onNoteRepeatSpreadPressed = function (state)
    {
        if( ! state )
            return;

        let spreadActive = this.noteRepeatElement.getParamValue(NoteRepeat.kSpread);
        // let repeatActive = this.noteRepeatElement.getParamValue(NoteRepeat.kActive);

        this.noteRepeatElement.setParamValue (NoteRepeat.kSpread, !spreadActive);
    }

    this.onActivateNoteRepeat = function (value)
    {
        if( ! value )
            return;

        if(this.noteRepeatElement.getParamValue(NoteRepeat.kSpread))
            this.setSessionMode(kRateTriggerMode);
    }

    this.onSpreadModeChanged = function (value)
    {
        if( ! value )
            return;

        if( this.noteRepeatElement.getParamValue(NoteRepeat.kActive) )
            this.setSessionMode(kRateTriggerMode);
    }

    this.updateSessionMode = function ()
    {
        let mode = this.getSessionMode();

        let session = findSessionModeFromIndex(mode);
        this.sessionModeColor.fromString(session.color);

        // select pad section handler
        let c = this.padSessionSection.component;
        switch(mode)
        {
            case kBankMenuMode:
                this.bankMenu.value = c.getCurrentBank (); // make sure value is up-to-date
                break;

            case kPitchMenuMode:
                {
                    let pitch = this.noteRepeatElement.getParamValue (NoteRepeat.kSpreadNote);
                    let keyboardMode = c.isKeyboardMode ();
                    let padIndex = 0;
                    if(keyboardMode)
                        padIndex = pitch % 12;
                    else
                        padIndex = Music.symbolicPitchToPadIndex (pitch) % kPadCount;
                    this.pitchMenu.value = padIndex;
                }
                break;
            case kHUIMode:
                Host.GUI.Commands.deferCommand("View", "Console", false, Host.Attributes(["State", true]));
                break;
        }

        c.setActiveHandler(mode);

        if( mode == kHUIMode )
            this.updateHuiMode();

        this.editorModeActive.value = mode == kEventEditMode || mode == kStepEditMode;
    }

    this.updateHuiMode = function()
    {
        let hui = HuiModes[this.huiMode.value];

        for( let i = 0; i < kPadCount; i++ )
            this.padSessionSection.component.setPadState(i, 1);

        this.huiColor.fromString( hui.color );
        this.huiLowerColorOff.fromString( hui.toggleColor[0] );
        this.huiLowerColorOn.fromString( hui.toggleColor[1] );
    }

    this.onHuiModePressed = function(value)
    {
        if( ! value )
            return;

        let mode = loopIncrementedFromArray(HuiModes, this.huiMode.value);
        this.huiMode.setValue( mode, true );
    }

    this.onHuiMixerConnect = function()
    {
        this.huiMode.setValue( 0, true );
        this.updateHuiMode();
    }

    this.notify = function (subject, msg)
    {
        if(msg.id == HostUtils.kTrackEditorChanged)
            this.onTrackEditorChanged( msg.getArg (0) );

        else if(msg.id == PadSection.kCurrentBankChanged)
            this.updateBankMenuColor();
    }

    this.updateBankMenuColor = function()
    {
        let c = this.padSessionSection.component;
        let d = this.padDrumSection.component;
        let bankIndex = c.getCurrentBank();
        let bankColor = bankColors[bankIndex];
        let bankIndex = d.getCurrentBank();
        let bankColor = bankColors[bankIndex];
        this.bankMenuColor.fromString (bankColor);
    }

    this.onExit = function ()
    {
        Host.Signals.unadvise(this.padSessionSection.component, this);
        Host.Signals.unadvise(this.padDrumSection.component, this);

        HostUtils.enableEngineEditNotifications (this, false);

        ControlSurfaceComponent.prototype.onExit.call (this);
    }
}

// factory entry called by host
function createInstance ()
{
    return new LaunchKeyMKIIIMidiComponent;
}
