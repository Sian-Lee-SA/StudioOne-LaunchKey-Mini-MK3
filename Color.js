/**
 * @Author: Sian Croser <Sian-Lee-SA>
 * @Date:   2020-05-28T06:38:27+09:30
 * @Email:  CQoute@gmail.com
 * @Filename: Color.js
 * @Last modified by:   Sian Croser <Sian-Lee-SA>
 * @Last modified time: 2020-05-28T10:05:04+09:30
 * @License: GPL-3
 */

Color.Mono = {
     OFF: 0x00,
     HALF: 0x3F,
     ON: 0x7F
};
Color.Values = {
     BLACK: 0,
     DARK_GREY: 1,
     GREY: 2,
     WHITE: 3,
     WHITE_HALF: 1,
     RED: 5,
     RED_HALF: 7,
     OFF_WHITE: 8,
     ORANGE: 9,
     ORANGE_HALF: 11,
     CREAM: 12,
     AMBER: 96,
     AMBER_HALF: 14,
     DARK_YELLOW: 17,
     DARK_YELLOW_HALF: 19,
     GREEN: 21,
     GREEN_HALF: 27,
     MINT: 29,
     MINT_HALF: 31,
     LIGHT_BLUE: 37,
     LIGHT_BLUE_HALF: 39,
     SKY_BLUE: 40,
     BLUE: 41,
     BLUE_HALF: 43,
     DARK_BLUE: 49,
     DARK_BLUE_HALF: 51,
     VIOLET: 52,
     PURPLE: 53,
     PURPLE_HALF: 55,
     AQUA: 77,
     DARK_ORANGE: 84,
     PALE_GREEN: 87,
     PALE_GREEN_HALF: 89,
     YELLOW: 97,
     YELLOW_HALF: 125,

     YELLOW_DIMMED: 125,
     RED_DIMMED: 121,
     SKY_BLUE_DIMMED: 43
};

Color.RGB_COLOR_TABLE = [
    // BANK 1
    0,
    1973790,        // #1E1E1E
    8355711,        // #7F7F7F
    16777215,       // #FFFFFF
    16731212,       // #FF4C4C lighter than represented
    16711680,       // #FF0000
    5832704,        // #590000
    1638400,
    16760172,       // #FFBD6C Whiter
    16733184,       // #FF5400
    5840128,        // #591D00
    2562816,        // #271B00
    16777036,       // #FFFF4C
    16776960,       // #FFFF00
    5855488,        // #595900
    1644800,        // #191900

    // BANK 2 (16)
    8978252,        // #88FF4C      rgb(147, 223, 94)
    5570304,        // #54FF00
    1923328,        // #1D5900
    1321728,        // #142B00
    5046092,        // #4CFF4C
    65280,          // #00FF00
    22784,          // #005900
    6400,           // #001900
    5046110,        // #4CFF5E
    65305,          // #00FF19
    22797,          // #00590D
    6402,           // #001902
    5046152,        // #4CFF88
    65365,          // #00FF55
    22813,          // #00591D
    7954,           // #001F12

    // BANK 3 (32)
    5046199,        // #4CFFB7
    65433,          // #00FF99
    22837,          // #005935
    6418,           // #001912
    5030911,        // #4CC3FF
    43519,          // #00A9FF
    16722,          // #004152
    4121,           // #001019
    5015807,        // #4C88FF
    22015,          // #0055FF
    7513,           // #001D59
    2073,           // #000819
    5000447,        // #4C4CFF
    255,            // #0000FF
    89,             // #000059
    25,             // #000019

    // BANK 4 (48)
    8867071,        // #874CFF
    5505279,        // #5400FF
    1638500,        // #190064
    983088,         // #0F0030
    16731391,       // #FF4CFF
    16711935,       // #FF00FF
    5832793,        // #590059
    1638425,        // #190019
    16731271,       // #FF4C87
    16711764,       // #FF0054
    5832733,        // #59001D
    2228243,        // #220013
    16717056,       // #FF1500
    10040576,       // #993500
    7950592,        // #795100
    4416512,        // #436400

    // BANK 5 (64)
    211200,         // #033900
    22325,          // #005735
    21631,          // #00547F
    255,            // #0000FF
    17743,          // #00454F
    2425036,        // #2500CC
    8355711,        // #7F7F7F
    2105376,        // #202020
    16711680,       // #FF0000
    12451629,       // #BDFF2D
    11529478,       // #AFED06
    6618889,        // #64FF09
    1084160,        // #108B00
    65415,          // #00FF87
    43519,          // #00A9FF
    11007,          // #002AFF

    // BANK 6 (80)
    4129023,        // #3F00FF
    7995647,        // #7A00FF
    11672189,       // #B21A7D
    4202752,        // #402100
    16730624,       // #FF4A00
    8970502,        // #88E106
    7536405,        // #72FF15
    65280,          // #00FF00
    3931942,        // #3BFF26
    5898097,        // #59FF71
    3735500,        // #38FFCC
    5999359,        // #5B8AFF
    3232198,        // #3151C6
    8880105,        // #877FE9
    13835775,       // #D31DFF
    16711773,       // #FF005D

    // BANK 7 (96)
    16744192,       // #FF7F00
    12169216,       // #B9B000
    9502464,        // #90FF00
    8609031,        // #835D07
    3746560,        // #392B00
    1330192,        // #144C10
    872504,         // #0D5038
    1381674,        // #15152A
    1450074,        // #16205A
    6896668,        // #693C1C
    11010058,       // #A8000A
    14569789,       // #DE513D
    14182940,       // #D86A1C
    16769318,       // #FFE126
    10412335,       // #9EE12F
    6796559,        // #67B50F

    // BANK 8 (112)
    1973808,        // #1E1E30
    14483307,       // #DCFF6B
    8454077,        // #80FFBD
    10131967,       // #9A99FF
    9332479,        // #8E66FF
    4210752,        // #404040
    7697781,        // #757575
    14745599,       // #E0FFFF
    10485760,       // #A00000
    3473408,        // #350000
    1757184,        // #1AD000
    475648,         // #074200
    12169216,       // #B9B000
    4141312,        // #3F3100
    11755264,       // #B35F00
    4920578         // #4B1502
];

Color.PRESONUS_SNAP = {
    // LIGHT VARIANTS
    7960954: 2,
	15461356: 1,
    // Green
	11943029: 17,
	16114412: 19,
    // Green Yellow
	12985139: 111,
	16244450: 63,
    // Yellow
	12850183: 13,
	16243931: 15,
    // Yellow Orange
	14103817: 109,
	16376283: 62,
    // Orange
	14244107: 126,
	16443356: 125,
    // Orange Red
	12357644: 108,
	16117724: 11,

    // DARKER VARIANTS
	11489460: 21,
	15984117: 23,

	12471685: 25,
	16180718: 27,

	13382977: 85,
	16310756: 100,

	13248264: 97,
	16310235: 63,

	16665610: 126,
	16770524: 125,

	16675596: 9,
	16771804: 11,

	14790157: 127,
	16511964: 11,

    // ALTERNATIVES

	10075924: 107,
	15791837: 71,
    // Purple
	4437844: 57,
	14939623: 59,

	4041090: 81,
	14873582: 71,

	4166820: 49,
	14938099: 51,

	813498: 41,
	14412278: 43,

	2439607: 37,
	14672630: 39,

	6707913: 33,
	15329272: 35,

	11788566: 5,
	16055261: 7,

	5232483: 53,
	15071721: 55,

	4769177: 69,
	15005681: 71,

	4828864: 45,
	15004663: 47,

	1734592: 79,
	14543863: 66,

	4084673: 78,
	14935799: 43,

	7825616: 77,
	15460857: 68
};

Color.convert = function( value )
{
    let r = value & 0xFF;
    let g = (value >> 8) & 0xFF;
    let b = (value >> 16) & 0xFF;

    let h = [r.toString(16), g.toString(16), b.toString(16)];
    for( let i = 0; i < 3; i++ )
    {
        if( h[i].length == 1 )
            h[i] = '0'+h[i];
    }
    let hex = h.join('');

    return {
        red: r,
        green: g,
        blue: b,
        hex: hex,
        int: parseInt('0x'+hex)
    };
}

Color.intToRGB = function(int)
{
    if( ! int )
        return [ 0, 0, 0 ];
    return [
        (int & 16711680) >> 16,
        (int & 65280) >> 8,
        int & 255
    ];
}

function Color( _v ) {

    this.original_value = _v;
    this.converted_values;
    this.midi;

    this.toString = function()
    {
        return JSON.stringify(
            {
                values: this.converted_values,
                midi: this.midi,
                orgValue: this.original_value
            }
        );
    }

    this.find_nearest_color = function( goal )
    {
        if( Color.RGB_COLOR_TABLE.indexOf(goal.int) != -1 ) {
            return Color.RGB_COLOR_TABLE.indexOf(goal.int);
        }

        table = Color.RGB_COLOR_TABLE.slice(0);

        const closest = table.reduce(function(prev, curr) {

            let rgb_c = Color.intToRGB(curr);
            let rgb_p = Color.intToRGB(prev);

            current_value = Math.abs(goal.red - rgb_c[0]) + Math.abs(goal.green - rgb_c[1]) + Math.abs(goal.blue - rgb_c[2]);
            prev_value = Math.abs(goal.red - rgb_p[0]) + Math.abs(goal.green - rgb_p[1]) + Math.abs(goal.blue - rgb_p[2]);

            return ( Math.abs(current_value) < Math.abs(prev_value) ) ? curr : prev;
        });


        return Color.RGB_COLOR_TABLE.indexOf( closest );
    }

    this.determineMidiValue = function( value )
    {
        if( value == -1 )
            return 0;

        if( value > -1 && value < 128 ) {
            return value;
        }

        this.converted_values = Color.convert(value);

        if(Color.PRESONUS_SNAP[Math.abs(value)]) {
            return Color.PRESONUS_SNAP[Math.abs(value)];
        }

        return this.find_nearest_color(this.converted_values);
    }

    this.midi = this.determineMidiValue(this.original_value);
}
