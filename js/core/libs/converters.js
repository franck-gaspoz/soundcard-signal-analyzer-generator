// converters functions

function parseRgba(s) {
    var t = s
        .replace('rgba(', '')
        .replace(')', '')
        .replace(' ', '')
        .split(',')
    return {
        r: Number(t[0]),
        g: Number(t[1]),
        b: Number(t[2]),
        a: Number(t[3])
    }
}

function addLight(c, d) {
    c += d
    if (c < 0) c = 0
    if (c > 255) c = 255
    return c
}

function toRgba(r, g, b, a) {
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
}

function vround7(v) {
    return parseFloat(v.toFixed(7));
}

function vround(v) {
    return parseFloat(v.toFixed(5));
}

function tround(t) {
    return !Number.isFinite(t) ? null : parseFloat(t.toFixed(3));
}

function pround(t) {
    return !Number.isFinite(t) ? null : parseFloat(t.toFixed(2));
}

function fround(t) {
    return !Number.isFinite(t) ? null : parseFloat(t.toFixed(1))
}

function milli(n) {
    return n * 1000;
}

// @TODO: NOT USED 
// -1..1 -> 0..256
function float32ToByteRange(channel, f) {
    const v = valueToVolt(channel, f);
    return v * 128 / settings.audioInput.vScale + 128;
}

// normalize to -1 ... 1 ? (input calibration. 255 <=> x Volts)
function float32ToVolt(f) {
    //return f; // -1 .. 1 ?
    return f / 1.5;     // -1.5 .. 1.5 ?
}
function voltToText(v) {
    if (v == null || v == undefined || isNaN(v)) return Number.NaN;
    if (v == Number.MAX_VALUE || v == Number.MIN_VALUE)
        return '?'

    const z = vround(v);
    return z;
}

function valueToVolt(channel, value) {
    switch (channel.sourceId) {
        case Source_Id_AudioInput:
            return float32ToVolt(value) * settings.audioInput.vScale;
        case Source_Id_Generator:
            // range -1..1 where 1 is sound max on output
            return value * settings.output.vScale
        case Source_Id_Math:
            // range -1..1 where 1 is sound max on output
            return value * settings.output.vScale
        default:
            return value
    }
    return 0
}
