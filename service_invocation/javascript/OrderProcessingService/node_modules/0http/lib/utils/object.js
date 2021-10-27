const forEach = (obj, cb) => {
  const keys = Object.keys(obj)
  for (let i = 0, length = keys.length; i < length; i++) {
    cb(obj[keys[i]], keys[i])
  }
}

module.exports = {
  forEach
}
