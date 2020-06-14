# About

This repo is a modified device control for LaunchKey Mini Mk3 to be used with PreSonus Studio One. This is heavily borrowed from the PreSonus ATOM controller and resembles many of the actions and controls that ATOM offers. The development of this code is not affiliated with PreSonus or Novation and had be crafted during my own spare time. A lot of the process was through trial and error while referencing other devices code and guessing/assuming what does what. There is no official documentation from PreSonus for an api; or at least publicly available. There is also little to no community support or effort with this kind of development so a lot of functions from this code relies heavily on hackable workarounds yet I had tried to keep it as simple and clean as possible.

### Legend

| Symbol                                        | Meaning                              |
| --------------------------------------------- | ------------------------------------ |
| ![shift-button](./resources/shift-button.png) | Any table following this will execute such commands / actions while the shift button is being held down  |
| ![shift-button](./resources/scene-hold-button.png) | Any table following this will execute such commands / actions while the scene button is being held down. The scene button will pulse green to indicate that the scene modifier is active  |

# Basic mode

Selecting the standard Midi Port for LaunchKey MK3 Basic allows for the use of the touch controls as separate functions depending on channel selected. You will have to use different channels to those defined below if you wish to use the pitch or modulation with your instruments.

| Channel | Touch Control    | Command                                                          |
| ------- |:---------------- | ---------------------------------------------------------------- |
| **15**  | Modulation       | Master Fader                                                     |
| **15**  | Pitch		     | Move transport Cursor left or right								|
| **16**  | Pitch            | Navigate next or previous event                                	|
| **16**  | Modulation       | Navigate up or down (swipe down will navigate up and vise-versa) |
| **16**  | Pitch Double Tap | Deselect All  													|

![shift-button](./resources/shift-button.png)

| Channel | Touch Control  | Command                                |
| ------- |:-------------- | -------------------------------------- |
| **16**  | Pitch          | Extend selected events left or right   |
| **16**  | Modulation     | Extend track selection                 |

![scene-hold-button](./resources/scene-hold-button.png)

| Channel | Touch Control  | Command          |
| ------- |:-------------- | ---------------- |
| **16**  | Pitch          | Zoom Horizontal  |
| **16**  | Modulation     | Zoom Vertical    |

# Extended Mode

Selecting Midi Port 2 (Both In and Out) for LaunchKey Mini MK3 Extended will give advanced controls for the DAW. Using ARP mode will act as normal as this is internally controlled. Holding ARP and using the corresponding knobs will also act natively. Fixed Chord, Octave and Transpose controls are also natively controlled.

### Global Commands

| Button                                          | Action                            |
|:-----------------------------------------------:| --------------------------------- |
| ![play-button](./resources/play-button.png)     | Toggles between play and stop     |
| ![record-button](./resources/record-button.png) | Toggle Recording                  |


![shift-button](./resources/shift-button.png)

| Button                                                  | Action                            |
|:-------------------------------------------------------:| --------------------------------- |
| ![play-button](./resources/play-button.png)             | Toggles Loop *(the button will light 50% if loop is enabled)* |
| ![record-button](./resources/record-button.png)         | Toggles Track Arm & Monitor for selected track *(the button will light 50% if the selected track is armed)* |
| ![arp-button](./resources/arp-button.png)               | If loop is enabled then return time cursor to loop start otherwise set cursor to zero |

![scene-hold-button](./resources/scene-hold-button.png)

| Button                                                  | Action                                                   |
|:-------------------------------------------------------:| -------------------------------------------------------- |
| ![play-button](./resources/play-button.png)             | Activates Loop Edit Mode see [Loop Editor](#Loop-Editor) |
| ![record-button](./resources/record-button.png)         | Undo                                                     |

# Extended Device Modes
Holding down shift will light up the pads to a mode selection *(this is a native LaunchKey control)*. Selecting a different mode allows for different controls. The three pad modes are Session, Drum and Custom. Custom mode is set using the Novation component software.

The Session mode has separate scenes that's mostly relative to a session sense. Session Mode Scenes consists of Edit, Setup, Bank Menu and HUI.

The Drum mode is more geared towards playing an instrument. The pads will light up differently depending on the instrument and event type etc. Activating the Note Repeat single mode will light the left half of the pad representing a Repeat Rate. The first 4 knobs in Note Repeat mode will change Rate, Quantize, Gate and Aftertouch.

## Drum Mode
Drum mode acts as a standard drum pad. Like the ATOM controller, drum mode will represent the pad colors to those on Impact XT.

| Button                                                  | Action                                     |
|:-------------------------------------------------------:| ------------------------------------------ |
| ![scene-button](./resources/scene-button_sm.png)        | Toggle Full Velocity *(the button will pulse purple if activated)*  |
| ![stop-solo-mute-button](./resources/ssm-button_sm.png) | Toggle Note Repeat *(the button will light blue when activated)*    |

![shift-button](./resources/shift-button.png)

| Button                                                  | Action                                     |
|:-------------------------------------------------------:| ------------------------------------------ |
| ![fixedchord-button](./resources/fixedchord-button.png) | Changes the pad lighting mode *(the button will light up reflecting the lighting mode; Off, Dimmed and Bright)* |
| ![stop-solo-mute-button](./resources/ssm-button_sm.png) | Toggle Note Repeat Single Mode             |

## Custom Mode
Use Novation's component software to assign your own custom midi controls to this mode

## Session Mode
Session mode consists of 4 different scenes. Each scene consists of different controls that's relevant for the scene. Each scene mode lights up a color on the scene button that corresponds to the scene selected.

> To change scenes, simply press the scene button.

![scene-button](./resources/scene-button.png)

---

![Edit Scene](https://via.placeholder.com/24/AAAA00/000000?text=+)
#### Edit Scene
This scene will display a mode relevant to the capabilities of the selected track or clip. When this scene is active then the editor view will automatically display and focus.

1. Pattern sequence mode will act as a step sequencer. The pads will color to the key track color while making on values and accent values a different variation to said color. Holding down SSM then selecting a pad will place an accent for that step.

1. Keyboard mode changes the pad's to emulate a keyboard.

1. Standard edit mode will give generic commands on pads 7, 8, 11 and 16

| Pad   | Color                                                     | Command               |
| ----- |:---------------------------------------------------------:| --------------------- |
| 7     | ![+](https://via.placeholder.com/24/888800/000000?text=+) | Velocity Increase     |
| 8     | ![+](https://via.placeholder.com/24/00FF00/000000?text=+) | Velocity Decrease     |
| 11    | ![+](https://via.placeholder.com/24/CCCCCC/000000?text=+) | Duplicate             |
| 16    | ![+](https://via.placeholder.com/24/FF0000/000000?text=+) | Delete                |


![shift-button](./resources/shift-button.png)

| Button                                                  | Action                                      |
|:-------------------------------------------------------:| ------------------------------------------- |
| ![stop-solo-mute-button](./resources/ssm-button_sm.png) | Toggle Show Instrument For Selected track   |

![scene-hold-button](./resources/scene-hold-button.png)

| Button                                                  | Action                                      |
|:-------------------------------------------------------:| ------------------------------------------- |
| ![stop-solo-mute-button](./resources/ssm-button_sm.png) | Toggles the Edit view on or off             |

In step edit mode, holding down the scene button will add accents to the pad steps

>  _Tip_: If using basic device then change the channel to 16 (shift + transpose) which will allow you to change the selected sequence by using the touch modulation.

---

![Loop Editor Scene](https://via.placeholder.com/24/00FFFF/000000?text=+)
#### Loop Editor

Loop editor is activated by holding scene + play

| Pad   | Color                                                     | Command                       |
| ----- |:---------------------------------------------------------:| ----------------------------- |
| 1     | ![+](https://via.placeholder.com/24/00FFFF/000000?text=+) | Zoom To Loop Selection        |
| 2     | ![+](https://via.placeholder.com/24/005500/000000?text=+) | Toggle Loop Follows Selection |
| 7     | ![+](https://via.placeholder.com/24/00FFFF/000000?text=+) | Shift Loop Selection Left     |
| 8     | ![+](https://via.placeholder.com/24/00FFFF/000000?text=+) | Shift Loop Selection Right    |
| 9     | ![+](https://via.placeholder.com/24/00AA00/000000?text=+) | Set Loop Start                |
| 10    | ![+](https://via.placeholder.com/24/0000FF/000000?text=+) | Transport Cursor Back         |
| 15    | ![+](https://via.placeholder.com/24/0000FF/000000?text=+) | Transport Cursor Forward      |
| 16    | ![+](https://via.placeholder.com/24/FF0000/000000?text=+) | Set Loop End                  |

> Due to the lack of documentations for any api for studio one, I'm unable to find a good way to get host variables like the Toggle Follows Selection etc. If I can find a solution then I'll be able to change the pad lighting depending on the value

---

![Setup Scene](https://via.placeholder.com/24/0000FF/000000?text=+)
#### Setup Scene

Setup scene gives generic setup commands. User assignable commands can be assigned to the top row pads. Open the device assignment view and right click the pads to assign a command. You can then click the pad and assign a color to that pad.

| Pad                                          | On Color                                                  | Off Color                                                 | Command     |
|:--------------------------------------------:|:---------------------------------------------------------:|:---------------------------------------------------------:| ----------- |
| 9                                            | ![+](https://via.placeholder.com/24/0000FF/000000?text=+) |                                                           | Tap Tempo   |
| 11                                           | ![+](https://via.placeholder.com/24/CCCCCC/000000?text=+) |                                                           | Duplicate   |
| 13                                           | ![+](https://via.placeholder.com/24/00FF00/000000?text=+) | ![+](https://via.placeholder.com/24/888800/000000?text=+) | Metronome   |
| 14                                           | ![+](https://via.placeholder.com/24/008800/000000?text=+) | ![+](https://via.placeholder.com/24/888800/000000?text=+) | Metronome Pre-Record  |
| 16                                           | ![+](https://via.placeholder.com/24/FF0000/000000?text=+) |                                                           | Delete      |

###### Pot / Knob Controls

> Device pot control needs to be either Device, Volume, Pan or Send. Custom uses Basic port which doesn't register for Extended Mode.

| Knob  | Value Type | Action       |
|:-----:| ---------- | ------------ |
| 1     | Absolute   | Change Tempo |

---

![Bank Scene](https://via.placeholder.com/24/00FF00/000000?text=+)
#### Bank Scene

Bank scene allows selection of a specific bank for selected devices. Banks are color coded from pad 1-8

---

![HUI Scene](https://via.placeholder.com/24/38FFCC/000000?text=+)
#### HUI Scene

HUI scene is like a mixer console. Triggering SSM will change the lower toggle rows for the columned track to be either Monitor, Record Arm, Solo or Mute. A lighter color on the lower pad means the toggle is off for that track while a darker color is toggled on. The pads and knobs are organised in columns and each column is assigned to a track bank.

> This scene automatically displays the console view

![stop-solo-mute-button](./resources/ssm-button.png)

| Color                                                     | Toggle      |
|:---------------------------------------------------------:| ----------- |
| ![+](https://via.placeholder.com/24/00A9FF/000000?text=+) | Monitor     |
| ![+](https://via.placeholder.com/24/FF4C87/000000?text=+) | Record Arm  |
| ![+](https://via.placeholder.com/24/FFE126/000000?text=+) | Solo        |
| ![+](https://via.placeholder.com/24/874CFF/000000?text=+) | Mute        |

![scene-hold-button](./resources/scene-hold-button.png)

| Button                                                  | Action                                      |
|:-------------------------------------------------------:| ------------------------------------------- |
| ![stop-solo-mute-button](./resources/ssm-button_sm.png) | Toggles the Console view on or off          |

The upper row allows for track selection which also is colored based on the track color. If the track for that pad is selected then the pad will pulse.

###### Pot / Knob Controls

Changing the device pot mode to either volume or pan will set the knobs to that mode for the track column bank.

###### Track Bank Scrolling

Holding down the scene button will change the lower pads to scroll bank mode with the far right being scroll right and far left being scroll left.

![scene-hold-button](./resources/scene-hold-button.png)

| Color                                                     | Action      |
|:---------------------------------------------------------:| ----------- |
| ![+](https://via.placeholder.com/24/008800/000000?text=+) | Step Scroll |
| ![+](https://via.placeholder.com/24/00FF00/000000?text=+) | Page Scroll |
