const Effect = {
    NONE: 0,
    FLASH: 1,
    PULSE: 2
};

function Channel()
{
    this.connectPot = function( element, paramName )
    {
        if( ! paramName )
        {
            paramName = element;
            element = this.channelElement;
        }
        return element.connectAliasParam(this.potValue, paramName);
    }

    this.connectSelect = function( paramName )
    {
        return this.channelElement.connectAliasParam(this.padSelect, paramName);
    }

    this.connectSelectColor = function( paramName )
    {
        return this.channelElement.connectAliasParam(this.padSelectColor, paramName);
    }

    this.connectToggle = function( element, paramName )
    {
        if( ! paramName )
        {
            paramName = element;
            element = this.channelElement;
        }
        return element.connectAliasParam(this.padToggle, paramName);
    }

    this.updateSelectEffect = function()
    {
        if( this.channelElement.getParamValue('selected') )
            return this.padSelectEffect.setValue( Effect.PULSE );

        this.padSelectEffect.setValue( Effect.NONE );
    }

    this.updateToggle = function( color_off, color_on, effect )
    {
        if( this.padToggle.value == null )
        {
            this.padToggleColor.setValue(0);
            this.padToggleEffect.setValue( Effect.NONE );
            return;
        }

        this.padToggleColor.fromString( (this.padToggle.value) ? color_on : color_off );

        if( effect && this.padToggle.value )
        {
            this.padToggleEffect.setValue( effect );
        } else {
            this.padToggleEffect.setValue( Effect.NONE );
        }
    }

    this.setPotGeneric = function()
    {
        this.genericElement.connectAliasParam(this.potValue, 'value');
    }

    this.setToggleGeneric = function()
    {
        this.genericElement.connectAliasParam(this.padToggle, 'value');
    }

    this.setSelectGeneric = function()
    {
        this.genericElement.connectAliasParam(this.padSelect, 'value');
        this.genericElement.connectAliasParam(this.padSelectColor, 'value');
    }

    this.setPadGeneric = function()
    {
        this.setToggleGeneric();
        this.setSelectGeneric();
    }
}

function PadMode()
{
    this.effectParams;

    this.init = function( index, component )
    {
        this.index = index;
        this.component = component;
        this.handler = component.getHandler(index);
    }

    this.addRenderHandler = function( func )
    {
        if( ! this.renderHandlers )
            this.renderHandlers = [];
        this.renderHandlers.push( func.bind(this) );
    }

    this.render = function( host, root )
    {
        this.resetEffects();

        if( ! this.renderHandlers )
            return;

        for( let i = 0; i < this.renderHandlers.length; i++ )
            this.renderHandlers[i]( host, root );
    }

    this.addActiveRenderHandler = function( func )
    {
        if( ! this.activeRenderHandlers )
            this.activeRenderHandlers = [];
        this.activeRenderHandlers.push( func.bind(this) );
    }

    // Used for sub buttons like scene and their statees as they are statically defined
    this.activeRender = function( host, root )
    {
        // Reset the scene button
        host.modes.params.scene_button.color.setValue(0);
        host.modes.params.scene_button.effect.setValue(0);
        host.modes.params.ssm_button.color.setValue(0);
        host.modes.params.ssm_button.effect.setValue(0);

        if( ! this.activeRenderHandlers )
            return;

        for( let i = 0; i < this.activeRenderHandlers.length; i++ )
            this.activeRenderHandlers[i]( host, root );
    }

    this.setColor = function( pad, value )
    {
        if( value.charAt(0) == '#')
        {
            value = Color.hexToInt(value);
        }
        return this.component.setPadColor(pad, value);
    }

    this.toggle = function( pad, value, color_off, color_on )
    {
        this.component.setPadState(pad, true);
        return this.setColor(pad, (value) ? color_on : color_off );
    }

    this.setEffect = function( pad, effect )
    {
        this.effectParams[pad].setValue(effect);
    }

    this.resetEffects = function()
    {
        for( let i = 0; i < this.effectParams.length; i++ )
            this.effectParams[i].setValue( Effect.NONE );
    }
}

Modes.HuiMode = function( id, color, toggleColor, effect )
{
    this.id = id;
    this.color = color;
    this.toggleColor = toggleColor;
    this.effect = effect;
};
Modes.HuiModes = [
    new Modes.HuiMode('monitor', '#00A9FF', ['#00454F', '#00A9FF']),
    new Modes.HuiMode('arm', '#FF4C87', ['#202020','#FF4C87'], Effect.PULSE),
    new Modes.HuiMode('solo', '#FFE126', ['#392B00', '#FFE126']),
    new Modes.HuiMode('mute', '#874CFF', ['#0F0030', '#874CFF'])
];

function DevicePadMode(id)
{
    this.id = id;
};
Modes.DevicePadModes = [
    new DevicePadMode('custom'),
    new DevicePadMode('drum'),
    new DevicePadMode('session')
];

DevicePotMode = function(id)
{
    this.id = id;
};
Modes.DevicePotModes = [
    new DevicePotMode('custom'),
    new DevicePotMode('volume'),
    new DevicePotMode('device'),
    new DevicePotMode('pan'),
    new DevicePotMode('sendA'),
    new DevicePotMode('sendB')
];


SessionMode.EffectParams = [];
SessionMode.prototype = new PadMode();
function SessionMode(id, color, skip)
{
    this.id = id;
    this.color = color;
    this.skip = skip;

    this.effectParams = SessionMode.EffectParams;
};
Modes.SessionModes = [
    new SessionMode('stepedit', '#AAAA00'),
    new SessionMode('eventedit', '#AAAA00'),
    new SessionMode('setup', '#0000FF'),
    new SessionMode('bank', '#00FF00'),
    new SessionMode('hui', '#38FFCC'),
    new SessionMode('loopedit', 'aqua', true)
];

DrumMode.EffectParams = [];
DrumMode.prototype = new PadMode();
function DrumMode(id)
{
    this.id = id;
    this.effectParams = DrumMode.EffectParams;
};
Modes.DrumModes = [
    new DrumMode('play'),
    new DrumMode('repeat_menu'),
    new DrumMode('rate_trigger')
];

function Modes( hostComponent, bankCount )
{
    this.bankCount = bankCount;

    this.drumElement;
    this.sessionElement;
    this.userDefinedElement;

    let root = hostComponent.model.root;
    let paramList = hostComponent.paramList;
    this.params = {
        device_pad: paramList.addInteger(0, 126, "devicePadMode"),
        device_pot: paramList.addInteger(0, 126, "devicePotMode"),
        drum: paramList.addInteger(0, Modes.DrumModes.length - 1, "drumMode"),
        session: paramList.addInteger(0, Modes.SessionModes.length - 1, "sessionMode"),
        hui: paramList.addInteger(0, Modes.HuiModes.length - 1, "huiMode"),
        focus: paramList.addParam("padFocusMode"),
        display: paramList.addInteger(0, 2, "padDisplayMode"),
        scene_button: {
            color: paramList.addColor('sceneColor'),
            effect: paramList.addInteger(0, 2, 'sceneEffect')
        },
        ssm_button: {
            color: paramList.addColor('ssmColor'),
            effect: paramList.addInteger(0, 2, 'ssmEffect')
        }
    };

    // This assumes basic version instantiated
    if( ! bankCount )
        return;
    // add alias parameters for vpots, etc.
    let channelBankElement = root.find ("MixerElement/RemoteBankElement");
    this.channels = [];
    for(let i = 0; i < bankCount; i++)
    {
        let channel = new Channel();

        channel.genericElement = root.getGenericMapping().getElement(0).find ("knob[" + i + "]");
        channel.channelElement = channelBankElement.getElement(i);
        channel.sendsBankElement = channel.channelElement.find("SendsBankElement");

        channel.potValue = paramList.addAlias("potValue" + i);

        channel.padSelect = paramList.addAlias("padSelectValue" + i);
        channel.padSelectColor = paramList.addAlias("padSelectColorValue" + i);
        channel.padSelectEffect = paramList.addInteger(0, 2, "padSelectEffectValue" + i);

        channel.padToggle = paramList.addAlias("padToggleValue" + i);
        channel.padToggleColor = paramList.addColor("padToggleColorValue" + i);
        channel.padToggleEffect = paramList.addInteger(0, 2, "padToggleEffectValue" + i);

        this.channels.push(channel);
    }

    for( let i = 0; i < 16; i++ )
        DrumMode.EffectParams.push( paramList.addInteger(0, 2, "drumPadEffect["+i+"]") );
    for( let i = 0; i < 8; i++ )
        SessionMode.EffectParams.push( paramList.addInteger(0, 2, "sessionHigherPadEffect["+i+"]") );
    for( let i = 0; i < 8; i++ )
        SessionMode.EffectParams.push( paramList.addInteger(0, 2, "sessionLowerPadEffect["+i+"]") );

    this.lastTrackEditorType = PreSonus.HostUtils.kEditorTypeNone;

    this.setupDrumModes = function( _padElement, _repeatRates, _repeatRateAlias )
    {
        this.drumElement = _padElement;

        let padComponent = _padElement.component;
        padComponent.setPadColoringSupported(true);

        for(let i = 0; i < Modes.DrumModes.length; i++)
        {
            let mode = Modes.DrumModes[i];
            switch(mode.id)
            {
                case 'play':
                    {
                        padComponent.addHandlerForRole(PreSonus.PadSectionRole.kMusicInput);
                        this.params.display.setValue( 1, true );
                        padComponent.getHandler(i).setDisplayMode(PreSonus.MusicPadDisplayMode.kDimmedColors);
                        padComponent.getHandler(i).setPadColor(Color.References['default_bank']);
                        for(let ii = 0; ii < this.bankCount; ii++)
                            padComponent.getHandler(i).setBankColor(ii, Color.Bank[i]);
                    } break;
                case 'repeat_menu':
                    {
                        let commands = [];

                        PreSonus.PadSection.addCommand(commands, 6, "Note Repeat", "Quantize");
                        PreSonus.PadSection.addCommand(commands, 7, "Note Repeat", "Aftertouch");
                        mode.addRenderHandler( function(host, root) {
                            let ele = host.noteRepeatElement;
                            this.toggle(6, ele.getParamValue('quantize'), '#222200', '#00FF00');
                            this.toggle(7, ele.getParamValue('pressureHandling'), '#222200', '#00FF00');
                        });
                        padComponent.addCommandInputHandler(commands);
                    } break;
                case 'rate_trigger':
                    {
                        padComponent.addHandlerForRole(PreSonus.PadSectionRole.kRateTrigger);
                        padComponent.getHandler(i).setPadColor(Color.References['rate_trigger']);
                        for( let key in _repeatRates)
                            padComponent.setPadRate(key, _repeatRates[key]);
                    } break;
                default:
                    padComponent.addNullHandler();
                    break;
            }

            // Global Initiations for Drum Modes
            mode.init(i, padComponent);
        }
    }

    this.setupSessionModes = function( _padElement, _userDefined, _bankMenuElement )
    {
        this.sessionElement = _padElement;
        this.userDefinedElement = _userDefined;

        let padComponent = _padElement.component;
        padComponent.setPadColoringSupported(true);
        _userDefined.component.setPadColoringSupported(true);

        let i = 0;
        for( let key in Color.PRESONUS_SNAP )
        {
            if( i++ % 2 ) continue;
            _userDefined.component.addPadPaletteColor('#' + Color.convert(key).hex );
        }

        for( let i in Color.SnapColors )
            _userDefined.component.addPadPaletteColor(Color.SnapColors[i]);

        for(let i = 0; i < Modes.SessionModes.length; i++)
        {
            let mode = Modes.SessionModes[i];
            switch(mode.id)
            {
                case 'stepedit':
                    padComponent.addHandlerForRole(PreSonus.PadSectionRole.kStepEdit);
                    padComponent.getHandler(i).setPadColor(Color.References['command']);
                    break;

                case 'eventedit':
                    {
                        let commands = [];
                        PreSonus.PadSection.addCommand (commands, 10, "Edit", "Duplicate", 0, null, '#E2D762');
                        PreSonus.PadSection.addCommand (commands, 15, "Edit", "Delete", 0, null, '#FF0000');
                        // NOTE: macro command names contain the base64-encoded macro filename (e.g. "Vel +10")
                        PreSonus.PadSection.addCommand (commands, 6, "Macros", "Macro VmVsIC0xMA==", 0, null, '#448800');
                        PreSonus.PadSection.addCommand (commands, 7, "Macros", "Macro VmVsICsxMA==", 0, null, '#00AA00');

                        padComponent.addCommandInputHandler(commands);
                        padComponent.getHandler(i).setPadColor(Color.References['command']);
                    } break;

                case 'setup':
                    {
                        let commands = [];
                        let userCommands = [];

                        // make first 8 pads user-assignable
                        for(let ii = 0; ii < 8; ii++)
                            PreSonus.PadSection.addCommand(userCommands, ii, "", "", PreSonus.PadSection.kCommandItemUserAssignable);
                        _userDefined.component.addCommandInputHandler(userCommands);
                        // We activate userdefined commands her as the xml will only enable this component in setup mode
                        _userDefined.component.setActiveHandler(0);

                        PreSonus.PadSection.addCommand(commands, 8, "Transport", "Tap Tempo", PreSonus.PadSection.kCommandItemDirect, null, '#0000FF');

                        PreSonus.PadSection.addCommand(commands, 10, "Edit", "Duplicate", 0, null, '#E2D762');

                        PreSonus.PadSection.addCommand(commands, 12, "Transport", "Click");
                        PreSonus.PadSection.addCommand(commands, 13, "Transport", "Precount");

                        PreSonus.PadSection.addCommand(commands, 15, "Edit", "Delete", 0, null, '#FF0000');

                        mode.addRenderHandler( function(host, root) {
                            this.setEffect(8, Effect.PULSE);
                            this.setEffect(15, Effect.FLASH);

                            let ele = host.metronomeElement;
                            this.toggle(12, ele.getParamValue('clickOn'), '#222200', '#00FF00');
                            this.toggle(13, ele.getParamValue('precount'), '#222200', '#00FF00');
                        });

                        padComponent.addCommandInputHandler(commands);
                        padComponent.getHandler(i).setPadColor(Color.References['command']);
                    } break;
                case 'bank':
                    {
                        let items = [];
                        for(let ii = 0; ii < this.bankCount; ii++)
                            items.push ({"padIndex": ii, "value": ii, "color": Color.Bank[ii]});

                        padComponent.addMenuHandler(items, _bankMenuElement);
                        padComponent.getHandler(i).setPadColor(Color.References['default_bank']);
                    } break;
                case 'loopedit':
                    {
                        let commands = [];
                        PreSonus.PadSection.addCommand(commands, 0, "Zoom", "Zoom to Loop", 0, null, '#00FFFF');

						PreSonus.PadSection.addCommand(commands, 1, "Transport", "Loop Follows Selection", 0, null, '#005500');

                        PreSonus.PadSection.addCommand(commands, 6, "Transport", "Shift Loop Backwards");
                        PreSonus.PadSection.addCommand(commands, 7, "Transport", "Shift Loop");

                        PreSonus.PadSection.addCommand(commands, 8, "Transport", "Set Loop Start", 0, null, '#00AA00');
                        PreSonus.PadSection.addCommand(commands, 9, "Transport", "Rewind Bar", 'autorepeat', null, '#0000FF');
                        PreSonus.PadSection.addCommand(commands, 14, "Transport", "Forward Bar", 'autorepeat', null, '#0000FF');
                        PreSonus.PadSection.addCommand(commands, 15, "Transport", "Set Loop End", 0, null, '#FF0000');

                        padComponent.addCommandInputHandler(commands);
                        padComponent.getHandler(i).setPadColor(Color.References['command']);

                        mode.addActiveRenderHandler( function(host, root) {
                            host.modes.params.scene_button.effect.setValue(Effect.PULSE);
                        });
                    } break;
                default:
                    padComponent.addNullHandler();
                    break;
            }
            // Global Initiations For Session Modes
            mode.init(i, padComponent);
            mode.addActiveRenderHandler( function(host, root) {
                if( host.modes.getCurrentDevicePadMode().id == 'session' )
                    host.modes.params.scene_button.color.fromString(mode.color);
            });
        }
    }

    this.storeState = function()
    {
        this.store = {
            drum: this.getCurrentDrumMode(),
            session: this.getCurrentSessionMode(),
            device_pad: this.getCurrentDevicePadMode(),
        };
    }

    this.restoreState = function()
    {
        if( this.store )
        {
            this.setDevicePadMode(this.store.device_pad.id);
            this.setSessionMode(this.store.session.id);
            this.setDrumMode(this.store.drum.id);
            this.store = null;
        }
    }

    /**
    * Helper to ensure index is assigned to mode object
    **/
    this._getModeByIndex = function( modeArr, i )
    {
        if( ! modeArr[i].index )
            modeArr[i].index = i;
        return modeArr[i];
    }

    this.getModeById = function( modeArr, id )
    {
        for( let i = 0; i < modeArr.length; i++ )
        {
            if( modeArr[i].id == id )
                return this._getModeByIndex(modeArr, i);
        }
    }

    this.getNextMode = function( modeArr, fromIndex, checkSkip )
    {
        fromIndex++;
        if( fromIndex > modeArr.length - 1 )
            fromIndex = 0;

        if( checkSkip && modeArr[fromIndex].skip )
            return this.getNextMode( modeArr, fromIndex, checkSkip );

        return this._getModeByIndex(modeArr, fromIndex);
    }

    this.getDevicePadMode = function( id )
    {
        return this.getModeById( Modes.DevicePadModes, id );
    }

    this.getCurrentDevicePadMode = function()
    {
        return this._getModeByIndex(Modes.DevicePadModes, this.params.device_pad.value);
    }

    this.setDevicePadMode = function( id )
    {
        let index = this.getDevicePadMode( id ).index;
        this.params.device_pad.setValue( index, true );
    }

    this.getDevicePotMode = function( id )
    {
        return this.getModeById( Modes.DevicePotModes, id );
    }

    this.getCurrentDevicePotMode = function()
    {
        return this._getModeByIndex(Modes.DevicePotModes, this.params.device_pot.value);
    }

    this.setDevicePotMode = function( id )
    {
        let index = this.getDevicePotMode( id ).index;
        this.params.device_pot.setValue( index, true );
    }

    this.isSessionMode = function()
    {
        return this.getCurrentDevicePadMode().id == 'session';
    }

    this.getSessionMode = function( id )
    {
        return this.getModeById( Modes.SessionModes, id );
    }

    this.getCurrentSessionMode = function()
    {
        return this._getModeByIndex(Modes.SessionModes, this.params.session.value);
    }

    this.setSessionMode = function( id )
    {
        let mode = this.getSessionMode( id );

        if( mode.id == 'stepedit' || mode.id == 'eventedit' )
        {
            if( this.lastTrackEditorType == PreSonus.HostUtils.kEditorTypePattern )
            {
                index = this.getSessionMode('stepedit').index;
            } else {
                index = this.getSessionMode('eventedit').index;
            }
            this.params.session.setValue( index, true );
            Host.GUI.Commands.deferCommand("View", "Editor", false, Host.Attributes(["State", true]));
            return;
        }

        this.params.session.setValue( mode.index, true );
    }

    this.activateSessionHandler = function()
    {
        let mode = this.getCurrentSessionMode();
        this.sessionElement.component.setActiveHandler(mode.index);
        this.userDefinedElement.component.suspendProcessing( mode.id != 'setup' );
    }

    this.toggleNextSessionMode = function()
    {
        let indexFrom = this.params.session.value;
        if( indexFrom == 0 )
            indexFrom = 1;

        let mode = this.getNextMode( Modes.SessionModes, indexFrom, true );
        this.setSessionMode( mode.id );
    }

    this.isDrumMode = function()
    {
        return this.getCurrentDevicePadMode().id == 'drum';
    }

    this.getDrumMode = function( id )
    {
        return this.getModeById( Modes.DrumModes, id );
    }

    this.getCurrentDrumMode = function()
    {
        return this._getModeByIndex(Modes.DrumModes, this.params.drum.value);
    }

    this.setDrumMode = function( id )
    {
        let index = this.getDrumMode( id ).index;
        this.params.drum.setValue( index, true );
    }

    this.activateDrumHandler = function()
    {
        this.drumElement.component.setActiveHandler(this.params.drum.value);
    }

    this.setPadFocusWhenPressed = function( active )
    {
        this.getDrumMode('play').handler.setFocusPadWhenPressed(active);
    }

    this.getHuiMode = function( id )
    {
        return this.getModeById( Modes.HuiModes, id );
    }

    this.getCurrentHuiMode = function()
    {
        return this._getModeByIndex(Modes.HuiModes, this.params.hui.value);
    }

    this.setHuiMode = function( id )
    {
        let index = this.getHuiMode( id ).index;
        this.params.hui.setValue( index, true );
    }

    this.toggleNextHuiMode = function()
    {
        let mode = this.getNextMode( Modes.HuiModes, this.params.hui.value );
        this.setHuiMode( mode.id );
    }

    this.setModifierActive = function(active)
    {
        this.drumElement.component.setModifierActive(active);
        this.sessionElement.component.setModifierActive(active);
    }

    this.setFullVelocityMode = function(active)
    {
        this.drumElement.component.setFullVelocityMode(active)
    }

    this.setCurrentBank = function(bank)
    {
        this.drumElement.component.setCurrentBank(bank);
        this.sessionElement.component.setCurrentBank(bank);
    }

    this.setPadDisplayMode = function( mode )
    {
        let modes = [
            PreSonus.MusicPadDisplayMode.kNoColors,
            PreSonus.MusicPadDisplayMode.kDimmedColors,
            PreSonus.MusicPadDisplayMode.kBrightColors,
        ];

        this.params.display.setValue( mode, true );
        this.getDrumMode('play').handler.setDisplayMode(modes[mode]);
    }

    this.toggleNextPadDisplayMode = function()
    {
        let nextMode = this.params.display.value + 1;
        if( nextMode > 2 )
            nextMode = 0;
        this.setPadDisplayMode(nextMode);
    }
}
