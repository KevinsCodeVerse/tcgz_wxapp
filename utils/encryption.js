const rsa = require('./rsa')
const JSEncrypt = new rsa.JSEncrypt()
const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCiVpDqm3OUlg5PD6nlenP9uTWok3CxQWcb7Sab7Q72W5Wx5fo8VJjcoUhMd83izHWCO2i4MdK7ElES5r8B9PjgVoxlS4XN+k/lZ4+8XhY4xDgkFLd1weY3NK1XLMhWrynjjbuK/N8pQ/JXvAi/OAkzDfHYi7C7/2zXKNLKi7AdwQIDAQAB'

JSEncrypt.setPublicKey(publicKey)
const cryptStr = function (str) {
  return JSEncrypt.encryptLong(str)
}
module.exports = {
  cryptStr
}