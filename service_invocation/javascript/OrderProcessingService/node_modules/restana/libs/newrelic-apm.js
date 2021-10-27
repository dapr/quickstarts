'use strict'

const apm = require('./apm-base')

/**
 * New Relic APM custom instrumentation
 *
 * Supported features:
 * - route names
 */
module.exports = (options) => apm(options)
