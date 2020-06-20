// Control Surface SDK
// Copyright (c)2016 PreSonus Software Ltd.
//
// Filename    : controlsurfacedevice.js
// Description : Utilities for JavaScript Control Surface implementation
//
//************************************************************************************************

/** Flags for control values. */
ControlValue =
{
	kBipolar: 1<<8,	// value is bipolar
	kDisabled: 1<<9	// value is disabled
}

/** Time formats used by host. */
TimeFormat =
{
	kSeconds: 0,
	kSamples: 1,
	kMusical: 2,
	kFrames: 3
}

//************************************************************************************************
// ControlHandler
/**
	A control handler does the low-level MIDI translation for controls on a device front panel like
	buttons, encoders, faders, etc. The high-level control surface model usually deals with normalized
	values or strings. The host provides a set of standard control handlers for common MIDI messages.
	This class can be used to implement device-specific MIDI encodings.
*/
//************************************************************************************************

ControlHandler = function ()
{
	//this.name = "";
	//this.device = null;
	//this.handlerIndex = -1;
}

/** Called by host to send value to hardware - implement in your derived script class. */
ControlHandler.prototype.sendValue = function (value, flags)
{
}

/** Call in your script implementation to update value on host side. */
ControlHandler.prototype.updateValue = function (value)
{
	this.device.hostDevice.updateValue (this.handlerIndex, value);
}

/** Force host to retransmit current value - will lead to sendValue(). */
ControlHandler.prototype.invalidate = function ()
{
	this.device.hostDevice.invalidate (this.handlerIndex);
}

/** Internal function used inside onMidiEvent() to dispatch event to handler if registered for receiving.
	Call updateValue() from within after MIDI decoding. */
ControlHandler.prototype.receiveMidi = function (status, data1, data2)
{
	return false;
}

/** Send simple MIDI event. */
ControlHandler.prototype.sendMidi = function (status, data1, data2)
{
	this.device.sendMidi (status, data1, data2);
}

/** Get preallocated buffer for sending SysEx. */
ControlHandler.prototype.getSendBuffer = function ()
{
	return this.device.sysexSendBuffer;
}

/** Send SysEx buffer. */
ControlHandler.prototype.sendSysex = function (sysexBuffer)
{
	this.device.sendSysex (sysexBuffer);
}

/** Internal function to trim text before sending to an LCD. */
ControlHandler.prototype.trimText = function (text, maxLength, padding)
{
	return this.device.hostDevice.trimText (text, maxLength, padding);
}

//************************************************************************************************
// ControlSurfaceDevice
/** Base class for control surface MIDI device. */
//************************************************************************************************

ControlSurfaceDevice = function ()
{
	//this.hostDevice = null;
	this.midiOutConnected = false;
	this.receiveHandlers = [];
	this.sysexSendBuffer = new SysexBuffer;
	this.debugLog = false;
}

//////////////////////////////////////////////////////////////////////////////////////////////////
// Notifications from host
//////////////////////////////////////////////////////////////////////////////////////////////////

/** Called by host when device is created. Register your control handlers in derived script class. */
ControlSurfaceDevice.prototype.onInit = function (hostDevice)
{
	this.hostDevice = hostDevice;
}

/** Called by host when device is being destroyed. */
ControlSurfaceDevice.prototype.onExit = function ()
{
	this.hostDevice = null;
}

/** Called by host when MIDI output is connected or disconnected. */
ControlSurfaceDevice.prototype.onMidiOutConnected = function (state)
{
	this.midiOutConnected = state;
}

/* Optional: Called by host periodically
ControlSurfaceDevice.prototype.onIdle = function (time)
{
}
*/

/** Called by host when new simple MIDI event is received. Return false for default processing in host. */
ControlSurfaceDevice.prototype.onMidiEvent = function (status, data1, data2)
{
	for(let i in this.receiveHandlers)
	{
		let handler = this.receiveHandlers[i];
		if(handler.receiveMidi (status, data1, data2))
			return true;
	}
	return false;
}

/* Optional: Called by host when SysEx event is received. Data is a Uint8Array.
ControlSurfaceDevice.prototype.onSysexEvent = function (data, length)
{
	return false;
}*/

//////////////////////////////////////////////////////////////////////////////////////////////////
// Internal helper functions
//////////////////////////////////////////////////////////////////////////////////////////////////

/** Register a control handler. */
ControlSurfaceDevice.prototype.addHandler = function (handler)
{
	handler.device = this;
	handler.handlerIndex = this.hostDevice.addHandler (handler.name, handler);
}

/** Register a control handler for receiving. */
ControlSurfaceDevice.prototype.addReceiveHandler = function (handler)
{
	this.addHandler (handler);
	this.receiveHandlers.push (handler);
}

/** Send simple MIDI event. */
ControlSurfaceDevice.prototype.sendMidi = function (status, data1, data2)
{
	this.hostDevice.sendMidiEvent (status, data1, data2);
}

/** Send SysEx buffer. */
ControlSurfaceDevice.prototype.sendSysex = function (sysexBuffer)
{
	this.hostDevice.sendSysexEvent (sysexBuffer.data, sysexBuffer.length);
}

/** Output debug message. */
ControlSurfaceDevice.prototype.log = function (message)
{
	if(this.debugLog)
		this.hostDevice.log (message);
}
�//************************************************************************************************
//
// Control Surface SDK
// Copyright (c)2016 PreSonus Software Ltd.
//
// Filename    : controlsurfacecomponent.js
// Description : Utilities for JavaScript Control Surface implementation
//
//************************************************************************************************

// Channel bank names
function Banks ()
{}
Banks.kAll = "AllBank";
Banks.kUser = "RemoteBank";
Banks.AudioInput = "Type:AudioInput";
Banks.AudioOutput = "Type:AudioOutput";
Banks.kAudioTrack = "Type:AudioTrack";
Banks.kAudioSynth = "Type:AudioSynth";
Banks.kAudioBus = "Type:AudioGroup";
Banks.AudioFX = "Type:AudioEffect";
Banks.kAudioVCA = "Type:AudioVCA";

// Global/focus mapping
function RemapHint ()
{}
RemapHint.kFocus = "focus";
RemapHint.kGlobal = "global";

// Pad section roles
function PadSectionRole ()
{}
PadSectionRole.kMusicInput = "musicinput";
PadSectionRole.kStepEdit = "stepedit";
PadSectionRole.kRateTrigger = "ratetrigger";

// Pad options
function PadSection ()
{}
PadSection.kMenuUseListAccess = "listaccess";
PadSection.kMenuUseMusicInput = "musicinput";
PadSection.kCommandItemDirect = "direct";
PadSection.kCommandItemUserAssignable = "userassignable";

PadSection.addCommand = function (commands, padIndex, category, name, flags, zone, color)
{
	commands.push ({"padIndex": padIndex, "category": category, "name": name, "flags": flags, "zone": zone, "color": color});
}

// Pad section notifications
PadSection.kCurrentBankChanged = "currentBankChanged";

// Music input pad handler display mode
function MusicPadDisplayMode ()
{}
MusicPadDisplayMode.kBrightColors = "brightcolors";
MusicPadDisplayMode.kDimmedColors = "dimmedcolors";
MusicPadDisplayMode.kNoColors = "nocolors";

// Host parameter names
function ParamID ()
{}

// Channel
ParamID.kLabel = "label";
ParamID.kSelect = "selected";
ParamID.kMultiSelectMode = "multiselect";
ParamID.kColor = "color";
ParamID.kNumber = "number";
ParamID.kVolume = "volume";
ParamID.kPan = "pan";
ParamID.kRecord = "recordArmed";
ParamID.kAutoMode = "automationMode";
ParamID.kInsertBypass = "Inserts/bypassAll";

// Inserts
ParamID.kInsertName = "@owner/deviceName";
ParamID.kInsertEdit = "@owner/edit";

// Sends
ParamID.kSendPort = "sendPort";
ParamID.kSendLevel = "sendlevel";

// ControlLink
ParamID.kFocusBypass = "@global/Editor/focusBypass";
ParamID.kFocusAutoMode = "@global/Editor/focusAutomationMode";
ParamID.kTitle = "title";
ParamID.kValue = "value";

// Macro Controls
ParamID.kMacroTitle = "title";
ParamID.kMacroValue = "pilot";

// Note Repeat
function NoteRepeat ()
{}

function calcBeatLength (denominator, triplet)
{
	if(denominator == 0)
		return 0;
	let typeFactor = triplet ? (2.0 / 3.0) : 1.0;
	return (4.0 / denominator) * typeFactor;
}

NoteRepeat.kActive = "active";
NoteRepeat.kSpread = "spread";
NoteRepeat.kSpreadNote = "spreadnote";
NoteRepeat.kSpreadNoteSymbolic = "spreadnotesymbolic";
NoteRepeat.kRate = "rate"; // rate parameter
NoteRepeat.k2thPpq = calcBeatLength (2);
NoteRepeat.k2thTPpq = calcBeatLength (2, true);
NoteRepeat.k4thPpq = calcBeatLength (4);
NoteRepeat.k4thTPpq = calcBeatLength (4, true);
NoteRepeat.k8thPpq = calcBeatLength (8);
NoteRepeat.k8thTPpq = calcBeatLength (8, true);
NoteRepeat.k16thPpq = calcBeatLength (16);
NoteRepeat.k16thTPpq = calcBeatLength (16, true);
NoteRepeat.k32thPpq = calcBeatLength (32);
NoteRepeat.k32thTPpq = calcBeatLength (32, true);
NoteRepeat.k64thPpq = calcBeatLength (64);
NoteRepeat.k64thTPpq = calcBeatLength (64, true);

//************************************************************************************************
// Host Utilities
//************************************************************************************************

function HostUtils ()
{}

HostUtils.kEditorSignals = "CCL.EditorRegistry";
HostUtils.kEditorActivated = "EditorActivated";

HostUtils.kEngineEditingSignals = "Engine.Editing";
HostUtils.kTrackEditorChanged = "TrackEditorChanged";

HostUtils.kEditorTypeNone = "";
HostUtils.kEditorTypeArrangement = "TrackListComponent";
HostUtils.kEditorTypeMusic = "MusicEditor";
HostUtils.kEditorTypeAudio = "AudioEditor";
HostUtils.kEditorTypePattern = "MusicPatternEventEditor";

/** Enable/disable notifications when active editor changes. */
HostUtils.enableEditorNotifications = function (observer, state)
{
	if(state)
		Host.Signals.advise (HostUtils.kEditorSignals, observer);
	else
		Host.Signals.unadvise (HostUtils.kEditorSignals, observer);
}

/** Enable/disable engine edit notifications. */
HostUtils.enableEngineEditNotifications = function (observer, state)
{
	if(state)
		Host.Signals.advise (HostUtils.kEngineEditingSignals, observer);
	else
		Host.Signals.unadvise (HostUtils.kEngineEditingSignals, observer);
}

HostUtils.getEditorType = function (editor)
{
	return editor ? editor.nativeClassName : HostUtils.kEditorTypeNone;
}

HostUtils.kBrowserZone = "BrowserZone";

/** Focus workspace frame in host application. */
HostUtils.focusWorkspaceFrame = function (frameName, deferred)
{
	if(deferred)
		Host.GUI.Commands.deferCommand ("View", "Focus Frame", false, Host.Attributes (["Frame", frameName]));
	else
		Host.GUI.Commands.interpretCommand ("View", "Focus Frame", false, Host.Attributes (["Frame", frameName]));
}

/** Turn mouse-over mode for recent parameter on/off. */
HostUtils.setParamMouseOverEnabled = function (state)
{
	let args = [];
	args.push ("State");
	args.push (state);
	Host.GUI.Commands.interpretCommand ("Automation", "Mouse-Over", false, Host.Attributes (args));
}

/** Select next/previous device in rack. */
HostUtils.selectNextDevice = function (component, bankElement, offset)
{
	// figure out which slot is open the hard way...
	let slotIndex = -1;
	let slotCount = bankElement.getElementCount ();
	for(let i = 0; i < slotCount; i++)
		if(bankElement.getElement (i).getParamValue (ParamID.kInsertEdit))
		{
			slotIndex = i;
			break;
		}

	slotIndex += offset;
	if(slotIndex >= 0 && slotIndex < slotCount)
	{
		let slotElement = bankElement.getElement (slotIndex);
		if(slotElement.isConnected ())
			HostUtils.openEditorAndFocus (component, slotElement);
	}

	/* LATER TODO:
	if(offset > 0)
		bankElement.invokeMethod ("interpretCommand", "Devices", "Next Device in Rack");
	else
		bankElement.invokeMethod ("interpretCommand", "Devices", "Previous Device in Rack");
	*/
}

HostUtils.kInstrumentEditor = "Instrument";

/** Open device editor and set ControlLink focus. */
HostUtils.openEditorAndFocus = function (component, element, context, toggle)
{
	element.invokeMethod ("openEditor", context, toggle);

	if(context == HostUtils.kInstrumentEditor) // special handling for synths
		element.invokeChildMethod ("mainSynthSlot", "interpretCommand", "Select Client", component.hostComponent.classID);
	else
		element.invokeMethod ("interpretCommand", "Select Client", component.hostComponent.classID);
}

/** Make channel visible in host GUI. */
HostUtils.makeChannelVisible = function (channelElement)
{
	channelElement.invokeMethod ("focus");
}

//************************************************************************************************
// ControlSurfaceComponent
//************************************************************************************************

ControlSurfaceComponent = function ()
{
	this.interfaces = [Host.Interfaces.IObserver,
					   Host.Interfaces.IParamObserver];

	this.debugLog = false;
}

ControlSurfaceComponent.prototype.onInit = function (hostComponent)
{
	this.hostComponent = hostComponent;
}

ControlSurfaceComponent.prototype.onExit = function ()
{
	this.hostComponent = null;
}

ControlSurfaceComponent.prototype.log = function (message)
{
	if(this.debugLog)
		Host.Console.writeLine (message);
}

// IObserver
ControlSurfaceComponent.prototype.notify = function (subject, msg)
{
}

// IParamObserver
ControlSurfaceComponent.prototype.paramChanged = function (param)
{
}

//************************************************************************************************
// PadSectionHandler
//************************************************************************************************

PadSectionHandler = function ()
{
	this.interfaces = []; // required by host
}

PadSectionHandler.prototype.onActivate = function (state)
{
}

PadSectionHandler.prototype.onPadPressed = function (padIndex, state, modifiers)
{
}
//************************************************************************************************
//
// Control Surface SDK
// Copyright (c)2016 PreSonus Software Ltd.
//
// Filename    : midiprotocol.js
// Description : MIDI Protocol Definitions
//
//************************************************************************************************

/** MIDI status. */
Midi =
{
	kNoteOff: 0x80,
	kNoteOn: 0x90,
	kPolyPressure: 0xA0,
	kController: 0xB0,
	kProgramChange: 0xC0,
	kAfterTouch: 0xD0,
	kPitchBend: 0xE0
}

/** Maximum size for SysexBuffer. */
const kMaxSysexLength = 512;

//************************************************************************************************
// SysexBuffer
//************************************************************************************************

function SysexBuffer ()
{
    this.data = new Uint8Array (kMaxSysexLength);
    this.length = 0;

	/** Begin SysEx message with given header. */
    this.begin = function (header)
    {
		this.data[0] = 0xF0;
		this.length = 1;
		for(let i in header)
			this.data[this.length++] = header[i];
    }

	/** End SysEx message. */
	this.end = function ()
	{
		this.push (0xF7);
	}

 	/** Append 7-bit value. */
   this.push = function (byteValue)
    {
        this.data[this.length++] = byteValue;
    }

 	/** Append ASCII string. */
	this.appendAscii = function (text)
	{
		for(let i = 0; i < text.length; i++)
		{
			let c = text.charCodeAt (i);
			if(c <= 0x7F)
				this.push (c);
		}
	}
}

//************************************************************************************************
//
// Control Surface SDK
// Copyright (c)2016 PreSonus Software Ltd.
//
// Filename    : musicprotocol.js
// Description : Music Protocol Definitions
//
//************************************************************************************************

function Music ()
{}

Music.kPitchC0 = 24;
Music.kPitchC1 = 36;
Music.kNumPitches = 128;

Music.padIndexToSymbolicPitch = function (padIndex)
{
	return (Music.kPitchC1 + padIndex) % Music.kNumPitches;
}

Music.symbolicPitchToPadIndex = function (pitch)
{
	let idx = pitch - Music.kPitchC1;
	return idx < 0 ? idx + Music.kNumPitches : idx;
}
