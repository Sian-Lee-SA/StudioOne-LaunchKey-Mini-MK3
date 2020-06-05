/**
 * @Author: Sian Croser <Sian-Lee-SA>
 * @Date:   2020-05-27T21:56:33+09:30
 * @Email:  CQoute@gmail.com
 * @Filename: LaunchKeyMKIIIMidiDevice.js
 * @Last modified by:   Sian Croser <Sian-Lee-SA>
 * @Last modified time: 2020-05-28T11:05:58+09:30
 * @License: GPL-3
 */

// include SDK files from host
include_file("resource://com.presonus.musicdevices/sdk/midiprotocol.js");
include_file("resource://com.presonus.musicdevices/sdk/controlsurfacedevice.js");
include_file("Debug.js");
include_file("Color.js");

const kDebug = new Debug;

ColorLEDHandler.prototype = new ControlHandler ();
function ColorLEDHandler (name, status, address)
{
    this.name = name;
    this.status = status;
    this.address = address;
    this.effect = 0;
    this.state = 1;
    this.color;
    this.value = 0x00;

    this.setState = function( _state )
    {
        this.state = _state;
        this.update();
    }

    this.setEffect = function( _effect )
    {
        this.sendMidi( this.status, this.address, 0x00 );

        this.effect = _effect;
        this.update();
    }

    this.sendValue = function( _value, _flags )
    {
        this.color = new Color( _value );
        // kDebug.log( this.name +': '+color.toString());
        this.value = this.color.midi;
        this.update();
    }

    this.update = function()
    {
        let midi = ( this.state ) ? this.value : 0x00;
        this.sendMidi( this.status|this.effect, this.address, midi );
    }
}

ColorEffectHandler.prototype = new ControlHandler ();
function ColorEffectHandler(name, handler)
{
    this.name = name;
    this.handler = handler;

    this.sendValue = function ( _value, _flags )
    {
        this.handler.setEffect( _value );
    }
}

ColorStateHandler.prototype = new ControlHandler();
function ColorStateHandler( name, handler )
{
    this.name = name;
    this.handler = handler;
    this.handler.setState(0);

    this.sendValue = function( value, flags )
    {
        this.handler.setState( value );
    }
}

MonoLEDHandler.prototype = new ControlHandler ();
function MonoLEDHandler (name, address)
{
    this.name = name;
    this.address = address;

    this.sendValue = function ( _value, _flags )
    {
        this.value = _value;
        this.sendMidi( 0xBF, this.address, this.value );
    }
}

LaunchKeyMKIIIMidiDevice.prototype = new ControlSurfaceDevice ();
function LaunchKeyMKIIIMidiDevice ()
{
    this.handlers = {};

    this.enableInControlMode = function( bool )
    {
        this.sendMidi (0x9F, 0x0C, (bool) ? 0x7F : 0x00);
    }

    this.heartbeatHUIMode = function()
    {
        // this.enableInControlMode(false);
        this.sendMidi(0x90, 0x00, 0x00);
    }

    this.onInit = function (hostDevice)
    {
        ControlSurfaceDevice.prototype.onInit.call (this, hostDevice);

        kDebug.device = this;
        this.debugLog = true;
    }

    this.createHandler = function (name, attributes)
    {
        // additional handlers created on the fly via <Handler> in XML
        let className = attributes.getAttribute("class");
        let address = parseInt( attributes.getAttribute("address") );


        let handler = null;
        switch( className )
        {
            case "ColorLEDHandler":
                let status = parseInt( attributes.getAttribute("status") );
                handler = new ColorLEDHandler( name, status, address );
                break;
            case "ColorEffectHandler":
                handler = new ColorEffectHandler( name, this.handlers[name.replace('Effect','LED')] );
                break;
            case "ColorStateHandler":
                handler = new ColorStateHandler( name, this.handlers[name.replace('State','LED')] );
                break;
            case "MonoLEDHandler":
                handler = new MonoLEDHandler( name, address );
                break;
        }

        if(!handler)
            return false;

        this.handlers[name] = handler;

        this.addHandler (handler);

        return true;
    }

    this.onIdle = function (time)
    {
        // this.heartbeatHUIMode();
    }

    this.onMidiOutConnected = function (state)
    {
        ControlSurfaceDevice.prototype.onMidiOutConnected.call (this, state);

        if(state)
        {
            this.log("Starting LaunchKey MKIII")
            this.enableInControlMode( true );
            this.hostDevice.invalidateAll ();
        }
    }

    this.onExit = function ()
    {
        // Transmit native mode off message
        this.enableInControlMode( false );
        ControlSurfaceDevice.prototype.onExit.call (this);
    }
}

// factory entry called by host
function createLaunchKeyDeviceInstance ()
{
    return new LaunchKeyMKIIIMidiDevice;
}
