const { Signale } = require('signale')

module.exports =  new Signale({
  scope: 'speedtest',
  logLevel: process.env.LOG_LEVEL || "info",
  types: {
    info: {
      badge: 'ℹ️',
      color: 'cyan',
      label: 'info',
      logLevel: 'info'
    },
    socket: {
      badge: '⚡',
      color: 'cyanBright',
      label: 'socket',
      logLevel: 'info'
    },
    request: {
      badge: '->',
      color: 'gray',
      label: 'request',
      logLevel: 'info'
    }
  }
})