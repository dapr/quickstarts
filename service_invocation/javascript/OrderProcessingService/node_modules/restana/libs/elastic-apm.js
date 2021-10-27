'use strict'

const apm = require('./apm-base')

/**
 * Elastic APM custom instrumentation
 *
 * Supported features:
 * - route names
 */
module.exports = (options) => apm(options)
