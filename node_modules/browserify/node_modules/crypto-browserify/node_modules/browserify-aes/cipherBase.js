var Transform = require('stream').Transform
var inherits = require('inherits')

module.exports = CipherBase
inherits(CipherBase, Transform)
function CipherBase () {
  Transform.call(this)
  this._base64Cache = new Buffer('')
}
CipherBase.prototype.update = function (data, inputEnc, outputEnc) {
  if (typeof data === 'string') {
    data = new Buffer(data, inputEnc)
  }
  var outData = this._update(data)
  if (outputEnc) {
    outData = this._toString(outData, outputEnc)
  }
  return outData
}
CipherBase.prototype._transform = function (data, _, next) {
  this.push(this._update(data))
  next()
}
CipherBase.prototype._flush = function (next) {
  try {
    this.push(this._final())
  } catch(e) {
    return next(e)
  }
  next()
}
CipherBase.prototype.final = function (outputEnc) {
  var outData = this._final() || new Buffer('')
  if (outputEnc) {
    outData = this._toString(outData, outputEnc, true)
  }
  return outData
}

CipherBase.prototype._toString = function (value, enc, final) {
  if (enc !== 'base64') {
    return value.toString(enc)
  }
  this._base64Cache = Buffer.concat([this._base64Cache, value])
  var out
  if (final) {
    out = this._base64Cache
    this._base64Cache = null
    return out.toString('base64')
  }
  var len = this._base64Cache.length
  var overhang = len % 3
  if (!overhang) {
    out = this._base64Cache
    this._base64Cache = new Buffer('')
    return out.toString('base64')
  }
  var newLen = len - overhang
  if (!newLen) {
    return ''
  }

  out = this._base64Cache.slice(0, newLen)
  this._base64Cache = this._base64Cache.slice(-overhang)
  return out.toString('base64')
}
