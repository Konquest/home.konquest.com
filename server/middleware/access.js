module.exports = function (req, res, next) {
  if (req.get('access-key') !== process.env.ACCESS_KEY) {
    return res
      .status(403)
      .end()
  }
  next()
}
