function fastAbs(value) {
  // funky bitwise, equal Math.abs
  return (value ^ (value >> 31)) - (value >> 31)
}

function threshold(value) {
  return (value > 0x15) ? 0xFF : 0
}

export function differenceAccuracy(target, data1, data2) {
  if (data1.length != data2.length) return null
  var i = 0
  while (i < (data1.length * 0.25)) {
    var average1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3
    var average2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3
    var diff = threshold(fastAbs(average1 - average2))
    target.pixels[4 * i] = diff
    target.pixels[4 * i + 1] = diff
    target.pixels[4 * i + 2] = diff
    target.pixels[4 * i + 3] = 0xFF
    ++i
  }
}

