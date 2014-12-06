/**
 * return new value in bounds of min and max
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function cap(val, min, max) {
  // cap x values
  val = Math.max(val, min);
  val = Math.min(val, max);
  return val;
}

/**
 * return number as string lefthand filled with zeros
 * @param number number
 * @param width number
 * @return string
 */
function zeroFill (number, width) {
  var s = number.toString();
  while (s.length < width) {
    s = "0" + s;
  }
  return s;
}

module.exports = {
  cap: cap,
  zeroFill: zeroFill
};
