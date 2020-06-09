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

const kDebug = new Debug;

TouchHandler.prototype = new ControlHandler();
function TouchHandler(name, channel)
{
    this.name = name;
    this.status = 0xB0;
    this.channel = channel - 1;
    this.address = 1;

    this.lastValue = 0;
    this.counter = 0;

    this.receiveMidi = function(status, address, value)
    {
        if( status != (this.status|this.channel) || address != this.address )
            return false;

        this.counter += ( value > this.lastValue ) ? 1 : -1;
        this.lastValue = value;

        if( Math.abs(this.counter) < 10 )
            return true;

        // Divide by 10 as counter could be positive or negative
        // Giving a result of 1 or -1
        this.updateValue(this.counter / 10);

        this.counter = 0;
        return true;
    }
};

LaunchKeyMK3BasicDevice.prototype = new ControlSurfaceDevice ();
function LaunchKeyMK3BasicDevice()
{
    this.handlers = {};

    this.onInit = function(hostDevice)
    {
        ControlSurfaceDevice.prototype.onInit.call (this, hostDevice);

        kDebug.device = this;
        this.debugLog = true;
    }

    this.createHandler = function (name, attributes)
    {
        // additional handlers created on the fly via <Handler> in XML
        let className = attributes.getAttribute("class");


        let handler = null;
        switch( className )
        {
            case "TouchHandler":
                let ch = parseInt( attributes.getAttribute("channel") );
                handler = new TouchHandler(name, ch);
                break;
        }

        if(!handler)
            return false;

        this.handlers[name] = handler;

        this.addReceiveHandler(handler);

        return true;
    }

    this.onIdle = function(time)
    {
    }

    this.onMidiOutConnected = function(state)
    {
        ControlSurfaceDevice.prototype.onMidiOutConnected.call (this, state);

        if(state)
        {
            this.log("Starting LaunchKey MK3 Basic");
            this.hostDevice.invalidateAll ();
        }
    }

    this.onExit = function ()
    {
        ControlSurfaceDevice.prototype.onExit.call (this);
    }
}

// factory entry called by host
function createLaunchKeyMK3BasicDeviceInstance ()
{
    return new LaunchKeyMK3BasicDevice;
}
