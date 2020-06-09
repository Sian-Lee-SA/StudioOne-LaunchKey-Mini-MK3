# About

This repo is a modified device control for LaunchKey Mini Mk3 to be used with PreSonus Studio One. This is heavily borrowed from the PreSonus ATOM controller and resembles many of the actions and controls that ATOM offers.

# Basic mode

Selecting the standard Midi Port for LaunchKey MK3 Basic allows for the use of the touch pads to be used as Master Volume and Navigation

| Channel | Device Control | Command                |
| ------- |:-------------- | ---------------------- |
| **15**  | Modulation     | Master Fader           |
| **16**  | Modulation     | Navigation Up and Down |


# Extended Mode

Selecting Midi Port 2 for LaunchKey MK3 Extended will give advanced controls for the DAW. Using ARP mode will act as normal as this is internally controlled, holding arp and using the corresponding knobs will also act normally for the arp functions. This is also the same with Fixed Chord and octave. The shift modifier will skip the internal controls for said buttons and functions.

###### Global Commands

| Button    | Action                            |
| --------- | --------------------------------- |
| Play      | Toggles between play and stop     |
| Record    | Toggle Recording                  |

*Shift Modifier (Holding down the shift button)*

| Button    | Action                            |
| --------- | --------------------------------- |
| Play      | If loop is enabled then return time cursor to loop start otherwise set cursor to zero     |
| Record    | Toggle Recording                  |

## Device Modes
Selecting device modes is the same as the standard for the device. Holding down shift will light up the pads to a mode selection. Selecting a different mode allows for different controls.

#### Drum Mode
Drum mode acts as a standard drum pad. Like the ATOM controller, drum mode will represent the pad colors to those on Impact XL.

*Shift Modifier (Holding down the shift button)*

| Button    | Action                            |
| --------- | --------------------------------- |
| Scene     | Toggle Full Velocity              |
| SSM       | Toggle NoteRepeat                 |
| ARP       | Changes the pad lighting mode     |

#### Custom Mode
Use Novation's component software to assign your own custom midi controls to this mode

#### Session Mode
Session mode consists of 5 different scenes. Each scene consists of different controls thats relevant for the scene. Each scene mode lights up a color on the scene button that corresponds to the scene selected. To change scenes, simply press the scene button.


###### ![Edit Scene](https://via.placeholder.com/24/AAAA00/000000?text=+) Edit Scene
This scene will display a mode relevant to the capabilities of the selected track or clip.

1. Pattern sequence mode will act as a step sequencer. The pads will color to the key track color while making on values and accent values a different variation to said color.

1. Standard edit mode will give generic commands on pads 7, 8, 11 and 16

| Pad   | Color                                                     | Command               |
| ----- |:---------------------------------------------------------:| --------------------- |
| 7     | ![+](https://via.placeholder.com/24/888800/000000?text=+) | Velocity Increase     |
| 8     | ![+](https://via.placeholder.com/24/00FF00/000000?text=+) | Velocity Decrease     |
| 11    | ![+](https://via.placeholder.com/24/CCCCCC/000000?text=+) | Duplicate             |
| 16    | ![+](https://via.placeholder.com/24/FF0000/000000?text=+) | Delete                |

---

###### ![Setup Scene](https://via.placeholder.com/24/0000FF/000000?text=+) Setup Scene

Setup scene give generic setup commands. User assignable commands can be assigned to the top row pads.

| Pad   | On Color                                                  | Off Color                                                 | Command               |
| ----- |:---------------------------------------------------------:|:---------------------------------------------------------:| --------------------- |
| 9     | ![+](https://via.placeholder.com/24/0000FF/000000?text=+) |                                                           | Tap Tempo             |
| 11    | ![+](https://via.placeholder.com/24/CCCCCC/000000?text=+) |                                                           | Duplicate             |
| 13    | ![+](https://via.placeholder.com/24/00FF00/000000?text=+) | ![+](https://via.placeholder.com/24/888800/000000?text=+) | Metronome             |
| 14    | ![+](https://via.placeholder.com/24/008800/000000?text=+) | ![+](https://via.placeholder.com/24/888800/000000?text=+) | Metronome Pre-Record  |
| 16    | ![+](https://via.placeholder.com/24/FF0000/000000?text=+) |                                                           | Delete                |
| SSM   | ![+](https://via.placeholder.com/24/00FFFF/000000?text=+) | ![+](https://via.placeholder.com/24/000000/000000?text=+) | Loop Toggle           |

---

###### ![Bank Scene](https://via.placeholder.com/24/00FF00/000000?text=+) Bank Scene

Bank scene allows selection of a specific bank for selected devices

---

###### ![HUI Scene](https://via.placeholder.com/24/38FFCC/000000?text=+) HUI Scene

HUI scene is like a mixer console. Triggering SSM will change the lower toggle rows for the columned track to be either Monitor, Record Arm, Solo and Mute. A lighter color means off while a darker color is on. The pads and knobs as organised in columns and each column is assigned to a track bank.

| Color                                                     | Toggle      |
|:---------------------------------------------------------:| ----------- |
| ![+](https://via.placeholder.com/24/00A9FF/000000?text=+) | Monitor     |
| ![+](https://via.placeholder.com/24/FF4C87/000000?text=+) | Record Arm  |
| ![+](https://via.placeholder.com/24/FFE126/000000?text=+) | Solo        |
| ![+](https://via.placeholder.com/24/874CFF/000000?text=+) | Mute        |

The upper row allows for track selection which also is colored based on the track color. If the track for that pad is selected then the pad will pulse.

###### Knobs

Changing the device pot mode to either volume or pan will set the knobs to that mode for the track column bank.

###### Bank Scrolling
Holding down the scene button will change the lower pads to scroll mode with the far right being right and far left being left.

| Color                                                     | Action      |
|:---------------------------------------------------------:| ----------- |
| ![+](https://via.placeholder.com/24/008800/000000?text=+) | Step Scroll |
| ![+](https://via.placeholder.com/24/00FF00/000000?text=+) | Page Scroll |
