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

module.exports = {
  cap: cap
};
