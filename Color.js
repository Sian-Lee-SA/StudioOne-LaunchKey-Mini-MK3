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
    0,
    1973790,
    8355711,
    16777215,
    16731212,
    16711680,
    5832704,
    2105376, // Moved to 71
    16760172,
    16733184,
    5840128,        // 10
    2562816,
    16777036,
    16776960,
    5855488,
    1644800,
    8978252,
    5570304,
    1923328,
    1321728,
    5046092,        // 20
    65280,
    22784,
    6400,
    5046110,
    65305,
    22797,
    6402,
    5046152,
    65365,
    22813,          // 30
    7954,
    5046199,
    65433,
    22837,
    6418,
    5030911,
    43519,
    16722,
    4121,
    5015807,        // 40
    22015,
    7513,
    2073,
    5000447,
    255,
    89,
    25,
    8867071,
    5505279,
    1638500,        // 50
    983088,
    16731391,
    16711935,
    5832793,
    1638425,
    16731271,
    16711764,
    5832733,
    2228243,
    16717056,       // 60
    10040576,
    7950592,
    4416512,
    211200,
    22325,
    21631,
    255,
    17743,
    2425036,
    8355711,        // 70
    1638400, // Moved to 7
    16711680,
    12451629,
    11529478,
    6618889,
    1084160,
    65415,
    43519,
    11007,
    4129023,        // 80
    7995647,
    11672189,
    4202752,
    16730624,
    8970502,
    7536405,
    65280,
    3931942,
    5898097,
    3735500,        // 90
    5999359,
    3232198,
    8880105,
    13835775,
    16711773,
    16744192,
    12169216,
    9502464,
    8609031,
    3746560,        // 100
    1330192,
    872504,
    1381674,
    1450074,
    6896668,
    11010058,
    14569789,
    14182940,
    16769318,
    10412335,       // 110
    6796559,
    1973808,
    14483307,
    8454077,
    10131967,
    9332479,
    4210752,
    7697781,
    14745599,
    10485760,       // 120
    3473408,
    1757184,
    475648,
    12169216,
    4141312,
    11755264,
    4920578
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

Color.to32Bit = function( value )
{
    // 7 bit per color channel
    let alpha = (value >> 24) & 0xFF;
    let r = (value >> 1) & 0x7F;
    let g = (value >> 9) & 0x7F;
    let b = (value >> 17) & 0x7F;

    let rgb = ( Math.floor(r / 127 * 255) );
    rgb = (rgb << 8) + ( Math.floor(g / 127 * 255) );
    rgb = (rgb << 8) + ( Math.floor(b / 127 * 255) );
    return {
        red: r,
        green: g,
        blue: b,
        integer: rgb
    };
}

function Color( _v ) {

    this.find_nearest_color = function( goal )
    {
        // function hex_to_channels(color_in_hex) {
        //     return [
        //         (color_in_hex & 16711680) >> 16,
        //         (color_in_hex & 65280) >> 8,
        //         color_in_hex & 255
        //     ];
        // }
        //
        // function squared_distance(color) {
        //     // return sum([ (a - b) ** 2 for a, b in zip(hex_to_channels(src_hex_color, hex_to_channels(color[1]))
        //     //            ])
        // }

        table = Color.RGB_COLOR_TABLE.slice(0);
        table.sort(function(a, b) {
            return a - b;
        });

        const closest = table.reduce(function(prev, curr) {
            return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
        });

        // return closest;
        // if( ! closest )
        //     return 0;

        return Color.RGB_COLOR_TABLE.indexOf( closest );
        // rgb_groups = RGB_COLOR_TABLE;

        // return min(rgb_table, key=squared_distance)[0]
        // return hex_to_channels( this.value );
    }

    this.determineMidiValue = function( value )
    {
        if( value == -1 )
            return 0;

        if( value > -1 && value < 128 ) {
            return value;
        }

        let _value = Color.to32Bit(value).integer;

        if(Color.PRESONUS_SNAP[Math.abs(value)]) {
            return Color.PRESONUS_SNAP[Math.abs(value)];
        }
        if( Color.RGB_COLOR_TABLE.indexOf(_value) != -1 ) {
            return Color.RGB_COLOR_TABLE.indexOf(_value);
        }
        return this.find_nearest_color( _value );
    }

    this.val = (_v == -1) ? 0 : _v;
    this.midi = this.determineMidiValue(_v);
}
