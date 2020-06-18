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
        this.padUserDefinedSection = root.find("PadUserDefinedSectionElement");

        this.windowManagerElement = root.find("WindowManagerElement");
        this.focusChannelElement =  root.find("MixerElement/FocusBankElement").getElement(0);
        this.channelBankElement =  root.find("MixerElement/RemoteBankElement");
        this.noteRepeatElement =    root.find("NoteRepeatElement");
        this.transportPanelElement = root.find("TransportPanelElement");
        this.metronomeElement =     root.find("MetronomeElement");

        // Params
        let paramList = 		    hostComponent.paramList;
        this.modes = new Modes( hostComponent, kBankCount );

        this.shiftModifier = 	    paramList.addParam("shiftModifier");
        this.sceneHold = 	        paramList.addParam("sceneHold");

        this.playLED = 	            paramList.addInteger(0, 0x7F, "playLED");
        this.recordLED = 	        paramList.addInteger(0, 0x7F, "recordLED");

        this.fullVelocityMode =     paramList.addParam("fullVelocityMode");
        this.bankMenu =             paramList.addInteger(0, kBankCount-1, "bankMenu");
        this.repeatRateAlias =      paramList.addAlias("repeatRate");
        this.repeatQuantizeAlias =  paramList.addAlias("repeatQuantize");
        this.editorModeActive =     paramList.addParam("editorModeActive");

        this.bankMenuColor =        paramList.addColor("bankButtonColor");
        this.updateBankMenuColor();

        // add parameter for bank selection
        this.bankList = paramList.addList("bankList");
        this.bankList.appendString(Banks.kAll);
        this.bankList.appendString(Banks.kAudioTrack);
        this.bankList.appendString(Banks.kAudioBus);
        this.bankList.appendString(Banks.kUser);

        this.modes.setupDrumModes( this.padDrumSection, [
            NoteRepeat.k4thPpq,
            NoteRepeat.k8thPpq,
            NoteRepeat.k16thPpq,
            NoteRepeat.k32thPpq,
            NoteRepeat.k4thTPpq,
            NoteRepeat.k8thTPpq,
            NoteRepeat.k16thTPpq,
            NoteRepeat.k32thTPpq
        ], this.repeatRateAlias );
        this.modes.setupSessionModes( this.padSessionSection, this.padUserDefinedSection, this.bankMenu );

        for( let key in Color.Values )
            paramList.addInteger(Color.Values[key], Color.Values[key], key);

        paramList.addInteger(0x00, 0x00, 'MONO_OFF');
        paramList.addInteger(0x3F, 0x3F, 'MONO_HALF');
        paramList.addInteger(0x7F, 0x7F, 'MONO_FULL');

        paramList.addInteger(0, 0, "EFFECT_NONE");
        paramList.addInteger(1, 1, "EFFECT_BLINK");
        paramList.addInteger(2, 2, "EFFECT_PULSE");

        HostUtils.enableEngineEditNotifications(this, true);
        Host.Signals.advise(this.padDrumSection.component, this);
        Host.Signals.advise(this.padSessionSection.component, this);
    };

    // Using this as the Initiation
    this.onHuiMixerConnect = function()
    {
        this.modes.setDevicePadMode('drum');
        this.modes.setDevicePotMode('device');
        this.modes.setDrumMode('play');
        this.modes.setPadFocusWhenPressed(true);

        this.modes.setSessionMode('hui');

        this.modes.setHuiMode('monitor');

        this.renderDrumMode();
        this.renderSessionMode();
    };

    this.paramChanged = function(param)
    {
        Host.Signals.signal("LaunchKeyMK3", 'paramChanged', param);

        switch( param )
        {
            case this.modes.params.device_pad:
                this.renderDrumMode();
                this.renderSessionMode();
                break;

            case this.modes.params.device_pot:
                return this.updateChannels();

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

            case this.bankList:
                this.channelBankElement.selectBank(this.bankList.string);
                this.onHuiScrollOptions( this.sceneHold.value );
                return;

        }
    };

    this.togglePadDisplayMode = function(state)
    {
        if( ! state )
            return;
        this.modes.toggleNextPadDisplayMode();
    };

    this.onScenePressed = function(state)
    {
        if( ! state || this.shiftModifier.value )
            return;

        let mode = this.modes.getCurrentDevicePadMode();
        switch( mode.id )
        {
            case 'session':
                if( this.modes.getCurrentSessionMode().id == 'loopedit' )
                    return this.onToggleLoopEditMode( true );
                return this.modes.toggleNextSessionMode();
            case 'drum':
                return;
            case 'custom':
                return;
        }
    };

    /**
     * Known params Editor|Console|Browser|TransportPanel
     * @param  {bool}   state     Whether button is down or up
     */
    this.onToggleWindow = function(state)
    {
        if( ! state )
            return;

        if( this.windowManagerElement.getParamValue('Editor') )
        {
            return this.windowManagerElement.setParamValue('Console', 1);
        }
        if( this.windowManagerElement.getParamValue('Console') )
        {
            return this.windowManagerElement.setParamValue('Console', 0);
        }

        return this.windowManagerElement.setParamValue('Editor', 1);
    };

    this.onTrackEditorChanged = function(editor)
    {
        let mode = this.modes.getCurrentSessionMode();
        let editorType = HostUtils.getEditorType(editor);

        this.modes.lastTrackEditorType = editorType; // remember last track editor type

        if(mode.id == 'stepedit' || mode.id == 'eventedit')
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

        if( this.modes.getCurrentSessionMode().id == 'loopedit' )
        {
            return this.modes.restoreState();
        }

        this.modes.storeState();
        this.modes.setDevicePadMode('session');
        this.modes.setSessionMode('loopedit');
    }

    this.onHuiModePressed = function(state)
    {
        if( ! state )
            return;
        this.modes.toggleNextHuiMode();
        this.updateChannels();
    }

    this.onConnectNoteRepeat = function()
    {
        this.noteRepeatElement.connectAliasParam(this.repeatRateAlias, NoteRepeat.kRate);
        this.noteRepeatElement.connectAliasParam(this.repeatQuantizeAlias, 'quantize');

        // init pad mode based on note repeat settings
        let repeatActive = this.noteRepeatElement.getParamValue(NoteRepeat.kActive);
        this.onActivateNoteRepeat(repeatActive);
    }

    this.onNoteRepeatButtonPressed = function (state)
    {
        if( ! state || this.modes.getCurrentDevicePadMode().id != 'drum' )
            return;

        let shiftPressed = this.shiftModifier.value;
        let repeatActive = this.noteRepeatElement.getParamValue (NoteRepeat.kActive);
        let spreadActive = this.noteRepeatElement.getParamValue (NoteRepeat.kSpread);

        if(!shiftPressed)
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

        } else if(this.modes.getCurrentDrumMode().id == 'rate_trigger') {
            this.modes.setDrumMode('play');
        }
        this.renderDrumMode();
    }

    this.onSpreadModeChanged = function (value)
    {
        if( value )
        {
            if( this.noteRepeatElement.getParamValue(NoteRepeat.kActive) )
                this.modes.setDrumMode('rate_trigger');
            return;
        }

        if(this.modes.getCurrentDrumMode().id == 'rate_trigger')
            return this.modes.setDrumMode('play');
    }

    this.onNoteRepeatSceneHold = function( value )
    {
        if( this.modes.getCurrentDevicePadMode().id != 'drum' || ! this.noteRepeatElement.getParamValue('active') )
            return;

        if( value )
        {
            return this.modes.setDrumMode('repeat_menu');
        }
        return this.modes.setDrumMode('play');
    }


    this.renderGlobals = function()
    {
        let play = 0;
        let record = 0;

        if( this.transportPanelElement.getParamValue('loop') )
            play = 0x05;

        if( this.transportPanelElement.getParamValue('start') )
            play = 0x7F;

        if( this.focusChannelElement.getParamValue('recordArmed') )
            record = 0x05;

        if( this.transportPanelElement.getParamValue('record') )
            record = 0x7F;

        this.playLED.setValue(play, true);
        this.recordLED.setValue(record, true);
    }

    this.renderDrumMode = function()
    {
        this.modes.activateDrumHandler();
        this.modes.getCurrentDrumMode().render(this, this.model.root);

        if( this.modes.isDrumMode() )
        {
            this.modes.getCurrentDrumMode().activeRender(this, this.model.root);
            if( this.noteRepeatElement.getParamValue(NoteRepeat.kActive) )
            {
                this.modes.params.scene_button.color.fromString('#0000FF');
            }

            this.modes.params.ssm_button.effect.setValue(Effect.PULSE);
            if( this.fullVelocityMode.value )
            {
                this.modes.params.ssm_button.color.fromString('purple');
            } else {
                this.modes.params.ssm_button.color.setValue(0);
            }
        }

        this.updateChannels();
    }

    this.renderSessionMode = function ()
    {
        let mode = this.modes.getCurrentSessionMode();

        switch(mode.id)
        {
            case 'bank':
                this.bankMenu.value = this.padSessionSection.component.getCurrentBank (); // make sure value is up-to-date
                break;
            case 'hui':
                Host.GUI.Commands.deferCommand("View", "Console", false, Host.Attributes(["State", true]));
                break;
        }

        this.modes.activateSessionHandler();

        if( this.modes.getCurrentDevicePadMode().id == 'session' )
            this.editorModeActive.value = mode.id == 'eventedit' || mode.id == 'stepedit' ;

        this.modes.getCurrentSessionMode().render(this, this.model.root);

        if( this.modes.isSessionMode() )
        {
            this.modes.getCurrentSessionMode().activeRender(this, this.model.root);
            // Render here as above method resets sub buttons
            if( mode.id == 'hui' )
                this.renderHuiMode();
        }

        this.updateChannels();
    }

    this.renderHuiMode = function()
    {
        let hui = this.modes.getCurrentHuiMode();

        for( let i = 0; i < kPadCount; i++ )
            this.padSessionSection.component.setPadState(i, 1);
        this.modes.params.ssm_button.color.fromString( hui.color );
    }

    this.onHuiScrollOptions = function(state)
    {
        let mode = this.modes.getCurrentSessionMode();
        if( state )
        {
            for( let i = 0; i < this.modes.channels.length; i++ )
            {
                this.modes.channels[i].setToggleGeneric();
                this.modes.channels[i].padToggleColor.setValue(0);
                this.modes.channels[i].padToggleEffect.setValue( Effect.NONE );
            }

            this.modes.channels[0].padToggleColor.fromString('#00FF00');
            this.modes.channels[1].padToggleColor.fromString('#002200');
            this.modes.channels[6].padToggleColor.fromString('#002200');
            this.modes.channels[7].padToggleColor.fromString('#00FF00');

            for( let i = 2; i < 6; i++ )
                this.modes.channels[i].padToggleColor.fromString(( this.bankList.value == i - 2 ) ? '#00FFFF' : '#003333');
        } else {
            this.updateChannels();
        }
    }

    this.updateChannels = function()
    {
        // Reset all pots to genereic
        for( let i = 0; i < kBankCount; i++ )
        {
            this.modes.channels[i].setPadGeneric();
            this.modes.channels[i].setPotGeneric();
        }

        if( this.modes.isDrumMode() )
        {
            if( this.noteRepeatElement.getParamValue(NoteRepeat.kActive) )
            {
                this.modes.channels[0].connectPot( this.noteRepeatElement, 'rate' );
                this.modes.channels[2].connectPot( this.noteRepeatElement, 'gate' );
            }
        }

        if( this.modes.isSessionMode() )
        {
            switch( this.modes.getCurrentSessionMode().id )
            {
                case 'setup':
                    this.modes.channels[0].connectPot( this.transportPanelElement, 'tempo' );
                    break;

                case 'hui':
                    for(let i = 0; i < this.modes.channels.length; i++)
                        this.updateChannel(i);
                    break;

            }
        }
    };

    this.updateChannel = function(i)
    {
        if( this.modes.getCurrentSessionMode().id != 'hui' )
            return;

        let channel = this.modes.channels[i];
        let potMode = this.modes.getCurrentDevicePotMode();
        let huiMode = this.modes.getCurrentHuiMode();

        channel.connectSelect( 'selected' );
        channel.connectSelectColor( 'color' );
        channel.updateSelectEffect();

        switch( potMode.id )
        {
            case 'volume':
                channel.connectPot( 'volume' );
                break;
            case 'pan':
                channel.connectPot( 'pan' );
                break;
            case 'sendA':
                channel.connectPot( channel.sendsBankElement.getElement(0), "sendlevel");
                break;
            case 'sendB':
                channel.connectPot( channel.sendsBankElement.getElement(1), "sendlevel");
                break;
        }

        // If scene hold is true then bankScrolling is active
        if( this.sceneHold.value )
            return;

        switch( huiMode.id )
        {
            case 'monitor':
                channel.connectToggle( 'monitor' );
                break;
            case 'arm':
                channel.connectToggle( 'recordArmed' );
                break;
            case 'solo':
                channel.connectToggle( 'solo' );
                break;
            case 'mute':
                channel.connectToggle( 'mute' );
                break;
        }
        channel.updateToggle( huiMode.toggleColor[0], huiMode.toggleColor[1], huiMode.effect );
    };

    this.notify = function(subject, msg)
    {
        // log(subject + ': ' + msg.id);
        if(msg.id == HostUtils.kTrackEditorChanged)
            this.onTrackEditorChanged( msg.getArg (0) );

        else if(msg.id == PadSection.kCurrentBankChanged)
            this.updateBankMenuColor();
    };

    this.updateBankMenuColor = function()
    {
        let c = this.padSessionSection.component;
        let d = this.padDrumSection.component;
        let bankIndex = c.getCurrentBank();
        let bankColor = Color.Bank[bankIndex];
        let bankIndex = d.getCurrentBank();
        let bankColor = Color.Bank[bankIndex];
        this.bankMenuColor.fromString (bankColor);
    };

    this.onExit = function ()
    {
        Host.Signals.unadvise(this.padSessionSection.component, this);
        Host.Signals.unadvise(this.padDrumSection.component, this);

        this.modes.setDevicePadMode('drum');

        HostUtils.enableEngineEditNotifications (this, false);

        ControlSurfaceComponent.prototype.onExit.call (this);
    };
}

// factory entry called by host
function createLaunchKeyMK3ExtendedComponentInstance ()
{
    return new LaunchKeyMK3ExtendedComponent;
}
