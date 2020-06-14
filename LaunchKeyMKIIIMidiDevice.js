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

ButtonHandler.prototype = new ControlHandler ();
function ButtonHandler(name, status, address)
{
    this.name = name;
    this.status = status;
    this.address = address;
}

ButtonHoldHandler.prototype = new ControlHandler ();
function ButtonHoldHandler(name, status, address)
{
    this.name = name;
    this.status = status;
    this.address = address;
    this.altControl = null;

    this.timeout = 500;
    this.activeTime = 0;
    this.isPressed = false;
    this.isHeld = false;

    this.onIdle = function(time)
    {
        if( ! this.isPressed || this.isHeld )
            return;

        if( ! this.activeTime )
            this.activeTime = time;

        if( time > this.activeTime + this.timeout )
        {
            this.updateValue(1);
            this.isHeld = true;
        }
    }

    this.bindControlHandler = function( control )
    {
        this.altControl = control;
    }

    this.reset = function()
    {
        this.isPressed = false;
        this.isHeld = false;
        this.activeTime = 0;
    }

    this.receiveMidi = function( status, address, value )
    {
        if( status != this.status || address != this.address )
            return false;

        // If the button press is release before reaching the timeout
        // then return false to allow another handler to handle the midi event
        if( ! value && ! this.isHeld )
        {
            this.altControl.updateValue(1);
            this.altControl.updateValue(0);
            this.reset();
            return true;
        }

        // Button value of 0 will be a release
        if( ! value )
        {
            if( this.isHeld )
                this.updateValue(0);
            else
                this.altControl.updateValue(0);
            this.reset();
        } else {
            this.isPressed = true;
        }

        return true;
    }
}

LaunchKeyMK3ExtendedMidiDevice.prototype = new ControlSurfaceDevice ();
function LaunchKeyMK3ExtendedMidiDevice()
{
    this.handlers = {};

    this.idleListeners = [];

    this.enableInControlMode = function( bool )
    {
        this.sendMidi(0x9F, 0x0C, (bool) ? 0x7F : 0x00);
    }

    this.onInit = function (hostDevice)
    {
        ControlSurfaceDevice.prototype.onInit.call (this, hostDevice);

        this.debugLog = true;
        new Debug(this);
    }

    this.createHandler = function (name, attributes)
    {
        function getAttr( name )
        {
            let attr = attributes.getAttribute(name);
            if( ! attr )
                return null;

            if( typeof attr == 'string' )
                return parseInt( attr.replace('#', '0x') );
            return attr;
        };

        let handler = null;
        switch( attributes.getAttribute("class") )
        {
            case "ColorLEDHandler":
                handler = new ColorLEDHandler( name, getAttr('status'), getAttr('address') );
                break;
            case "ColorEffectHandler":
                handler = new ColorEffectHandler( name, this.handlers[name.replace('Effect','LED')] );
                break;
            case "ColorStateHandler":
                handler = new ColorStateHandler( name, this.handlers[name.replace('State','LED')] );
                break;
            case "MonoLEDHandler":
                handler = new MonoLEDHandler( name, getAttr('address') );
                break;
            case "ButtonHoldHandler":
                handler = new ButtonHoldHandler(name, getAttr('status'), getAttr('address'));
                this.idleListeners.push(handler);
                this.addReceiveHandler(handler);
                break;
            case "ButtonHandler":
                handler = new ButtonHandler(name, getAttr('status'), getAttr('address'));
                let bind = attributes.getAttribute('bind');
                this.handlers[bind].bindControlHandler(handler);
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
        for( let i = 0; i < this.idleListeners.length; i++ )
            this.idleListeners[i].onIdle(time);
    }

    this.onMidiOutConnected = function (state)
    {
        ControlSurfaceDevice.prototype.onMidiOutConnected.call (this, state);

        if(state)
        {
            this.log("Starting LaunchKey MK3 Extended");
            // Reset Pads
            this.enableInControlMode( false );
            this.enableInControlMode( true );
            this.sendMidi(0xBF, 0x03, 0x01);
            this.hostDevice.invalidateAll ();
        }
    }

    this.onExit = function ()
    {
        // Transmit native mode off message
        this.sendMidi(0xBF, 0x03, 0x01);
        this.enableInControlMode( false );

        ControlSurfaceDevice.prototype.onExit.call (this);
    }
}

// factory entry called by host
function createLaunchKeyMK3ExtendedDeviceInstance ()
{
    return new LaunchKeyMK3ExtendedMidiDevice;
}
