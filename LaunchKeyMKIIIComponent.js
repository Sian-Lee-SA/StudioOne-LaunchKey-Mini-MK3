/**
 * @Author: Sian Croser <Sian-Lee-SA>
 * @Date:   2020-05-27T21:56:33+09:30
 * @Email:  CQoute@gmail.com
 * @Filename: LaunchKeyMKIIIComponent.js
 * @Last modified by:   Sian Croser <Sian-Lee-SA>
 * @Last modified time: 2020-05-28T10:02:56+09:30
 * @License: GPL-3
 */

const kPadCount = 16;
const kBankCount = 8;

include_file("resource://com.presonus.musicdevices/sdk/controlsurfacecomponent.js");
include_file("resource://com.presonus.musicdevices/sdk/musicprotocol.js");
include_file("Debug.js");
include_file("Color.js");
include_file("Modes.js");

LaunchKeyMK3ExtendedComponent.prototype = new ControlSurfaceComponent ();
function LaunchKeyMK3ExtendedComponent()
{
    this.onInit = function (hostComponent)
    {
        ControlSurfaceComponent.prototype.onInit.call (this, hostComponent);

        this.debugLog =             true;
        new Debug(this);

        this.model = 	            hostComponent.model;
        let root = 		            this.model.root;

        // Elements
        this.padSessionSection =    root.find("PadSessionSectionElement");
        this.padDrumSection =       root.find("PadDrumSectionElement");
        this.padUserDefinedSection =       root.find("PadUserDefinedSectionElement");

        this.focusChannelElement =  root.find("MixerElement").find("FocusBankElement").getElement (0);
        this.noteRepeatElement =    root.find("NoteRepeatElement");

        // Params
        let paramList = 		    hostComponent.paramList;
        this.modes = new Modes( paramList, kBankCount );

        this.shiftModifier = 	    paramList.addParam("shiftModifier");
        this.sceneHold = 	        paramList.addParam("sceneHold");

        this.sessionModeColor =     paramList.addColor('sessionModeColor');
        this.huiColor =             paramList.addColor("huiColor");
        this.huiLowerColorOn =      paramList.addColor("huiLowerColorOn");
        this.huiLowerColorOff =     paramList.addColor("huiLowerColorOff");

        this.fullVelocityMode =     paramList.addParam("fullVelocityMode");
        this.bankMenu =             paramList.addInteger(0, kBankCount-1, "bankMenu");
        this.repeatRateAlias =      paramList.addAlias("repeatRate");
        this.editorModeActive =     paramList.addParam("editorModeActive");

        this.bankMenuColor =        paramList.addColor("bankButtonColor");
        this.updateBankMenuColor();

        this.modes.setupDrumModes( this.padDrumSection, [
            NoteRepeat.k4thPpq,
            NoteRepeat.k8thPpq,
            NoteRepeat.k16thPpq,
            NoteRepeat.k32thPpq,
            NoteRepeat.k4thTPpq,
            NoteRepeat.k8thTPpq,
            NoteRepeat.k16thTPpq,
            NoteRepeat.k32thTPpq
        ] );
        this.modes.setupSessionModes( this.padSessionSection, this.padUserDefinedSection, this.bankMenu );

        for( let key in Color.Values )
            paramList.addInteger(Color.Values[key], Color.Values[key], key);

        paramList.addInteger(0x00, 0x00, 'MONO_OFF');
        paramList.addInteger(0x3F, 0x3F, 'MONO_HALF');
        paramList.addInteger(0x7F, 0x7F, 'MONO_FULL');

        paramList.addInteger(0, 0, "EFFECT_NONE");
        paramList.addInteger(1, 1, "EFFECT_BLINK");
        paramList.addInteger(2, 2, "EFFECT_PULSE");

        paramList.addColor("loopColor").fromString('aqua');
        paramList.addColor("padFocusOnColor").fromString("orange");
        paramList.addColor("padFocusOffColor").fromString("blue");

        HostUtils.enableEngineEditNotifications(this, true);

        Host.Signals.advise(this.padDrumSection.component, this);
        Host.Signals.advise(this.padSessionSection.component, this);
    }


    this.onHuiMixerConnect = function()
    {
        this.modes.setDevicePadMode('drum');
        this.modes.setDrumMode('play');
        this.modes.setPadFocusWhenPressed(true);

        this.modes.setSessionMode('hui');

        this.modes.setHuiMode('monitor');

        this.renderDrumMode();
        this.renderSessionMode();
    }

    this.paramChanged = function(param)
    {
        Host.Signals.signal("LaunchKeyMK3", 'paramChanged', param);

        switch( param )
        {
            case this.modes.params.device_pad:
                let padMode = this.modes.getCurrentDevicePadMode()[1];
                if(padMode.name != 'session')
                    this.editorModeActive.value = false;
                break;

            case this.sceneHold:
                return this.modes.setModifierActive(param.value);

            case this.modes.params.focus:
                return this.modes.setPadFocusWhenPressed(param.value);

            case this.modes.params.drum:
                return this.renderDrumMode();

            case this.modes.params.session:
                return this.renderSessionMode();

            case this.modes.params.hui:
                return this.renderHuiMode();

            case this.fullVelocityMode:
                return this.modes.setFullVelocityMode(param.value);

            case this.bankMenu:
                return this.modes.setCurrentBank(param.value);
        }
    }

    this.togglePadDisplayMode = function(state)
    {
        if( ! state )
            return;

        this.modes.toggleNextPadDisplayMode();
    }


    this.onScenePressed = function(state)
    {
        if( ! state )
            return;

        let mode = this.modes.getCurrentDevicePadMode()[1];
        switch( mode.name )
        {
            case 'session':
                if( this.modes.getCurrentSessionMode()[1].name == 'loopedit' )
                    return this.onToggleLoopEditMode( true );
                return this.modes.toggleNextSessionMode();
            case 'drum':
                return;
            case 'custom':
                return;
        }
    }

    this.onTrackEditorChanged = function(editor)
    {
        let mode = this.modes.getCurrentSessionMode()[1];
        let editorType = HostUtils.getEditorType(editor);

        this.modes.lastTrackEditorType = editorType; // remember last track editor type

        if(mode.name == 'stepedit' || mode.name == 'eventedit')
        {
            if(editorType == HostUtils.kEditorTypePattern)
                this.modes.setSessionMode('stepedit');
            else if(editorType == HostUtils.kEditorTypeMusic)
                this.modes.setSessionMode('eventedit');
        }
    }

    this.openEditorAndFocus = function(state)
    {
        if( ! state )
            return;
        HostUtils.openEditorAndFocus (this, this.focusChannelElement, HostUtils.kInstrumentEditor, true);
    }

    this.onToggleLoopEditMode = function(state)
    {
        if( ! state )
            return;

        if( this.modes.getCurrentSessionMode()[1].name == 'loopedit' )
        {
            return this.modes.restoreState();
        }

        this.modes.storeState();
        this.modes.setDevicePadMode('session');
        this.modes.setSessionMode('loopedit');
    }

    this.onHuiModePressed = function(value)
    {
        if( ! value )
            return;
        this.modes.toggleNextHuiMode();
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

        let shiftPressed = this.shiftModifier.value;
        let repeatActive = this.noteRepeatElement.getParamValue (NoteRepeat.kActive);
        let spreadActive = this.noteRepeatElement.getParamValue (NoteRepeat.kSpread);

        if(shiftPressed)
        {
            if(spreadActive)
                this.noteRepeatElement.setParamValue (NoteRepeat.kSpread, false);
            else
                this.noteRepeatElement.setParamValue (NoteRepeat.kActive, !repeatActive);
        }
        else
        {
            if(repeatActive)
            {
                this.noteRepeatElement.setParamValue (NoteRepeat.kActive, false);
                this.noteRepeatElement.setParamValue (NoteRepeat.kSpread, false);
            }
            else
            {
                this.noteRepeatElement.setParamValue (NoteRepeat.kActive, true);
                this.noteRepeatElement.setParamValue (NoteRepeat.kSpread, true);
            }
        }
    }

    this.onActivateNoteRepeat = function (value)
    {
        if( value )
        {
            if( this.noteRepeatElement.getParamValue(NoteRepeat.kSpread) )
                this.modes.setDrumMode('rate_trigger');
            return;
        }

        if(this.modes.getCurrentDrumMode()[1].name == 'rate_trigger')
            return this.modes.setDrumMode('play');
    }

    this.onSpreadModeChanged = function (value)
    {
        if( value )
        {
            if( this.noteRepeatElement.getParamValue(NoteRepeat.kActive) )
                this.modes.setDrumMode('rate_trigger');
            return;
        }

        if(this.modes.getCurrentDrumMode()[1].name == 'rate_trigger')
            return this.modes.setDrumMode('play');
    }

    this.renderDrumMode = function()
    {
        this.modes.activateDrumHandler();
    }

    this.renderSessionMode = function ()
    {
        let mode = this.modes.getCurrentSessionMode()[1];

        this.sessionModeColor.fromString(mode.color);

        switch(mode.name)
        {
            case 'bank':
                this.bankMenu.value = this.padSessionSection.component.getCurrentBank (); // make sure value is up-to-date
                break;
            case 'hui':
                Host.GUI.Commands.deferCommand("View", "Console", false, Host.Attributes(["State", true]));
                break;
        }

        this.modes.activateSessionHandler();

        // Hui Mode needs to be updated after the handler has changed as they would override
        if( mode.name == 'hui' )
            this.renderHuiMode();

        this.editorModeActive.value = ( mode.name == 'eventedit' || mode.name == 'stepedit' );
    }

    this.renderHuiMode = function()
    {
        let hui = this.modes.getCurrentHuiMode()[1];

        for( let i = 0; i < kPadCount; i++ )
            this.padSessionSection.component.setPadState(i, 1);

        this.huiColor.fromString( hui.color );
        this.huiLowerColorOff.fromString( hui.toggleColor[0] );
        this.huiLowerColorOn.fromString( hui.toggleColor[1] );
    }

    this.notify = function (subject, msg)
    {
        log(subject + ': ' + msg.id);
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
        let bankColor = Color.Bank[bankIndex];
        let bankIndex = d.getCurrentBank();
        let bankColor = Color.Bank[bankIndex];
        this.bankMenuColor.fromString (bankColor);
    }

    this.onExit = function ()
    {
        Host.Signals.unadvise(this.padSessionSection.component, this);
        Host.Signals.unadvise(this.padDrumSection.component, this);

        this.modes.setDevicePadMode('drum');

        HostUtils.enableEngineEditNotifications (this, false);

        ControlSurfaceComponent.prototype.onExit.call (this);
    }
}

// factory entry called by host
function createLaunchKeyMK3ExtendedComponentInstance ()
{
    return new LaunchKeyMK3ExtendedComponent;
}
