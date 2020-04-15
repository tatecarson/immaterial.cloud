export function map (value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
}

// from total-serialism:
// https://github.com/tmhglnd/total-serialism/blob/798e2bf3492cdee4e2ab2737099b527aaab0296d/src/gen-basic.js#L87
// changed to allow hi to lo arrays
export function spreadInclusiveFloat (len = 1, lo = len, hi = 0) {
  // generate array
  var arr = new Array(len)
  for (var i = 0; i < len; i++) {
    arr[i] = (i / (len - 1)) * (hi - lo) + lo
  }
  return arr
}

Number.prototype.pad = function (size) {
  var s = String(this)
  while (s.length < (size || 2)) {
    s = '0' + s
  }
  return s
};

export function randomDigits (length) {
  return Math.floor(100000 + Math.random() * 900000).pad(length)
}

console.log(randomDigits(6))