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
include_file("Debug.js");
include_file("Modes.js");

LaunchKeyMK3BasicComponent.prototype = new ControlSurfaceComponent ();
function LaunchKeyMK3BasicComponent ()
{

    this.interfaces = [Host.Interfaces.IObserver,
                       Host.Interfaces.IParamObserver];

    this.onInit = function (hostComponent)
    {
        ControlSurfaceComponent.prototype.onInit.call (this, hostComponent);

        this.debugLog =             true;
        new Debug(this);

        this.model = 	            hostComponent.model;

        let paramList = 		    hostComponent.paramList;
        this.shiftModifier = 	    paramList.addParam("shiftModifier");
        this.sceneHold = 	        paramList.addParam("sceneHold");
        this.devicePadMode = 	    paramList.addInteger(0, 126, "devicePadMode");
        this.sessionMode = 			paramList.addInteger(0, kLastPadMode, "sessionMode");
        this.drumMode = 			paramList.addInteger(0, kLastPadMode, "drumMode");
        this.huiMode =              paramList.addInteger(0, HuiModes.length - 1, "huiMode");

        Host.Signals.advise("LaunchkeyMK3", this);
    }

    this.paramChanged = function (param)
    {
        log(param);
    }

    this.notify = function(subject, msg)
    {
        if( msg.id == 'paramChanged')
        {
            if( this[msg.getArg(0).name] )
                this[msg.getArg(0).name].setValue(msg.getArg(0).value, true);
        }
    }
}

// factory entry called by host
function createLaunchKeyMK3BasicComponentInstance()
{
    return new LaunchKeyMK3BasicComponent;
}
