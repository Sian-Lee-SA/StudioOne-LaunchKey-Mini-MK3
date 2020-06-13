
Modes.HuiMode = function( name, color, toggleColor )
{
    this.name = name;
    this.color = color;
    this.toggleColor = toggleColor;
};
Modes.HuiModes = [
    new Modes.HuiMode('monitor', '#00A9FF', ['#00454F', '#00A9FF']),
    new Modes.HuiMode('arm', '#FF4C87', ['#202020','#FF4C87']),
    new Modes.HuiMode('solo', '#FFE126', ['#392B00', '#FFE126']),
    new Modes.HuiMode('mute', '#874CFF', ['#0F0030', '#874CFF'])
];

Modes.DevicePadMode = function(name)
{
    this.name = name;
};
Modes.DevicePadModes = [
    new Modes.DevicePadMode('custom'),
    new Modes.DevicePadMode('drum'),
    new Modes.DevicePadMode('session')
];

Modes.DevicePotMode = function(name)
{
    this.name = name;
};
Modes.DevicePotModes = [
    new Modes.DevicePotMode('custom'),
    new Modes.DevicePotMode('volume'),
    new Modes.DevicePotMode('device'),
    new Modes.DevicePotMode('pan'),
    new Modes.DevicePotMode('send')
];

Modes.SessionMode = function(name, color, skip)
{
    this.name = name;
    this.color = color;
    this.skip = skip;
};
Modes.SessionModes = [
    new Modes.SessionMode('stepedit', '#AAAA00'),
    new Modes.SessionMode('eventedit', '#AAAA00'),
    new Modes.SessionMode('setup', '#0000FF'),
    new Modes.SessionMode('bank', '#00FF00'),
    new Modes.SessionMode('hui', '#38FFCC'),
    new Modes.SessionMode('loopedit', 'aqua', true)
];

Modes.DrumMode = function(name)
{
    this.name = name;
};
Modes.DrumModes = [
    new Modes.DrumMode('play'),
    new Modes.DrumMode('rate_trigger')
];

function Modes( paramList, bankCount )
{
    this.bankCount = bankCount;

    this.drumElement;
    this.sessionElement;

    this.params = {
        device_pad: paramList.addInteger(0, 126, "devicePadMode"),
        device_pot: paramList.addInteger(0, Modes.DevicePotModes.length - 1, "devicePotMode"),
        drum: paramList.addInteger(0, Modes.DrumModes.length - 1, "drumMode"),
        session: paramList.addInteger(0, Modes.SessionModes.length - 1, "sessionMode"),
        hui: paramList.addInteger(0, Modes.HuiModes.length - 1, "huiMode"),
        focus: paramList.addParam("padFocusMode"),
        display: paramList.addInteger(0, 2, "padDisplayMode")
    };

    this.lastTrackEditorType = HostUtils.kEditorTypeNone;

    this.setupDrumModes = function( _padElement, _repeatRates )
    {
        this.drumElement = _padElement;

        let padComponent = _padElement.component;
        padComponent.setPadColoringSupported(true);

        for(let i = 0; i < Modes.DrumModes.length; i++)
        {
            let mode = Modes.DrumModes[i];
            switch(mode.name)
            {
                case 'play':
                    {
                        padComponent.addHandlerForRole(PadSectionRole.kMusicInput);
                        this.setPadDisplayMode(1); // Dimmed
                        padComponent.getHandler(i).setPadColor(Color.References['default_bank']);
                        for(let ii = 0; ii < this.bankCount; ii++)
                            padComponent.getHandler(i).setBankColor(ii, Color.Bank[i]);
                    } break;
                case 'repeat_menu':
                    {
                        padComponent.addMenuHandler(_repeatRates, this.repeatRateAlias, PadSection.kMenuUseListAccess);
                        padComponent.getHandler(i).setPadColor(Color.References['repeat_menu']);
                    } break;
                case 'rate_trigger':
                    {
                        padComponent.addHandlerForRole(PadSectionRole.kRateTrigger);
                        padComponent.getHandler(i).setPadColor(Color.References['rate_trigger']);
                        for( let key in _repeatRates)
                            padComponent.setPadRate(key, _repeatRates[key]);
                    } break;
                default:
                    padComponent.addNullHandler();
                    break;
            }
        }
    }

    this.setupSessionModes = function( _padElement, _bankMenuElement )
    {
        this.sessionElement = _padElement;

        let padComponent = _padElement.component;
        padComponent.setPadColoringSupported(true);

        // let i = 0;
        // for( let key in Color.PRESONUS_SNAP )
        // {
        //     if( i++ % 2 ) continue;
        //     padComponent.addPadPaletteColor('#' + Color.convert(key).hex );
        // }
        //
        // for( let i in Color.SnapColors )
        //     padComponent.addPadPaletteColor(Color.SnapColors[i]);

        for(let i = 0; i < Modes.SessionModes.length; i++)
        {
            switch(Modes.SessionModes[i].name)
            {
                case 'stepedit':
                    padComponent.addHandlerForRole(PadSectionRole.kStepEdit);
                    padComponent.getHandler(i).setPadColor(Color.References['command']);
                    break;

                case 'eventedit':
                    {
                        let commands = [];
                        PadSection.addCommand (commands, 10, "Edit", "Duplicate", 0, null, '#E2D762');
                        PadSection.addCommand (commands, 15, "Edit", "Delete", 0, null, '#FF0000');
                        // NOTE: macro command names contain the base64-encoded macro filename (e.g. "Vel +10")
                        PadSection.addCommand (commands, 6, "Macros", "Macro VmVsIC0xMA==", 0, null, '#448800');
                        PadSection.addCommand (commands, 7, "Macros", "Macro VmVsICsxMA==", 0, null, '#00AA00');

                        padComponent.addCommandInputHandler(commands);
                        padComponent.getHandler(i).setPadColor(Color.References['command']);
                    } break;

                case 'setup':
                    {
                        let commands = [];
                        // make first 8 pads user-assignable
                        for(let ii = 0; ii < 8; ii++)
                            PadSection.addCommand(commands, ii, "", "", PadSection.kCommandItemUserAssignable);

                        PadSection.addCommand(commands, 8, "Transport", "Tap Tempo", PadSection.kCommandItemDirect, null, '#0000FF');

                        PadSection.addCommand(commands, 10, "Edit", "Duplicate", 0, null, '#E2D762');

                        PadSection.addCommand(commands, 12, "Transport", "Click");
                        PadSection.addCommand(commands, 13, "Transport", "Precount");

                        PadSection.addCommand(commands, 15, "Edit", "Delete", 0, null, '#FF0000');

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
                        PadSection.addCommand(commands, 0, "Zoom", "Zoom to Loop", 0, null, '#00FFFF');

						PadSection.addCommand(commands, 1, "Transport", "Loop Follows Selection", 0, null, '#005500');

                        PadSection.addCommand(commands, 6, "Transport", "Shift Loop Backwards");
                        PadSection.addCommand(commands, 7, "Transport", "Shift Loop");

                        PadSection.addCommand(commands, 8, "Transport", "Set Loop Start", 0, null, '#00AA00');
                        PadSection.addCommand(commands, 9, "Transport", "Rewind Bar", 'autorepeat', null, '#0000FF');
                        PadSection.addCommand(commands, 14, "Transport", "Forward Bar", 'autorepeat', null, '#0000FF');
                        PadSection.addCommand(commands, 15, "Transport", "Set Loop End", 0, null, '#FF0000');

                        padComponent.addCommandInputHandler(commands);
                        padComponent.getHandler(i).setPadColor(Color.References['command']);
                    } break;
                default:
                    padComponent.addNullHandler();
                    break;
            }
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
            this.setDevicePadMode(this.store.device_pad[1].name);
            this.setSessionMode(this.store.session[1].name);
            this.setDrumMode(this.store.drum[1].name);
            this.store = null;
        }
    }

    this.searchForIndexByName = function( modeArr, name )
    {
        for( let i = 0; i < modeArr.length; i++ )
        {
            if( modeArr[i].name == name )
                return i;
        }
    }

    this.getModeByName = function( modeArr, name )
    {
        for( let i = 0; i < modeArr.length; i++ )
        {
            if( modeArr[i].name == name )
                return [i, modeArr[i]];
        }
    }

    this.getNextMode = function( modeArr, fromIndex, checkSkip )
    {
        fromIndex++;
        if( fromIndex > modeArr.length - 1 )
            fromIndex = 0;

        if( checkSkip && modeArr[fromIndex].skip )
            return this.getNextMode( modeArr, fromIndex, checkSkip );

        return [fromIndex, modeArr[fromIndex]];
    }

    this.getCurrentDevicePadMode = function()
    {
        return [this.params.device_pad.value, Modes.DevicePadModes[this.params.device_pad.value]];
    }

    this.setDevicePadMode = function( name )
    {
        let index = this.searchForIndexByName( Modes.DevicePadModes, name );
        this.params.device_pad.setValue( index, true );
    }

    this.getCurrentSessionMode = function()
    {
        return [this.params.session.value, Modes.SessionModes[this.params.session.value]];
    }

    this.setSessionMode = function( name )
    {
        let mode = this.getModeByName( Modes.SessionModes, name );

        if( mode[1].name == 'stepedit' || mode[1].name == 'eventedit' )
        {
            if( this.lastTrackEditorType == HostUtils.kEditorTypePattern )
            {
                index = this.searchForIndexByName('stepedit');
            } else {
                index = this.searchForIndexByName('eventedit');
            }
            this.params.session.setValue( index, true );
            Host.GUI.Commands.deferCommand("View", "Editor", false, Host.Attributes(["State", true]));
            return;
        }

        this.params.session.setValue( mode[0], true );
    }

    this.activateSessionHandler = function()
    {
        this.sessionElement.component.setActiveHandler(this.params.session.value);
    }

    this.toggleNextSessionMode = function()
    {
        let indexFrom = this.params.session.value;
        if( indexFrom == 0 )
            indexFrom = 1;

        let mode = this.getNextMode( Modes.SessionModes, indexFrom, true )[1];
        this.setSessionMode( mode.name );
    }

    this.getCurrentDrumMode = function()
    {
        return [this.params.drum.value, Modes.DrumModes[this.params.drum.value]];
    }

    this.setDrumMode = function( name )
    {
        let index = this.searchForIndexByName( Modes.DrumModes, name );
        this.params.drum.setValue( index, true );
    }

    this.activateDrumHandler = function()
    {
        this.drumElement.component.setActiveHandler(this.params.drum.value);
    }

    this.setPadFocusWhenPressed = function( active )
    {
        this.getHandler('drum', 'play')
                    .setFocusPadWhenPressed(active);
    }

    this.getCurrentHuiMode = function()
    {
        return [this.params.hui.value, Modes.HuiModes[this.params.hui.value]];
    }

    this.setHuiMode = function( name )
    {
        let index = this.searchForIndexByName( Modes.HuiModes, name );
        this.params.hui.setValue( index, true );
    }

    this.toggleNextHuiMode = function()
    {
        let mode = this.getNextMode( Modes.HuiModes, this.params.hui.value )[1];
        this.setHuiMode( mode.name );
    }

    this.getHandler = function( padMode, name )
    {
        if( padMode == 'drum' )
            return this.drumElement.component.getHandler( this.searchForIndexByName( Modes.DrumModes, name ) );

        if( padMode == 'session' )
            return this.sessionElement.component.getHandler( this.searchForIndexByName( Modes.SessionModes, name ) );
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
            MusicPadDisplayMode.kNoColors,
            MusicPadDisplayMode.kDimmedColors,
            MusicPadDisplayMode.kBrightColors,
        ];

        this.params.display.setValue( mode, true );
        this.getHandler('drum', 'play')
                .setDisplayMode(modes[mode]);
    }

    this.toggleNextPadDisplayMode = function()
    {
        let nextIndex = this.getNextMode([
                MusicPadDisplayMode.kNoColors,
                MusicPadDisplayMode.kDimmedColors,
                MusicPadDisplayMode.kBrightColors,
            ], this.params.display.value )[0];
        this.setPadDisplayMode(nextIndex);
    }
}
