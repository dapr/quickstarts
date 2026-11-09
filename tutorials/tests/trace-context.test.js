//
// Copyright 2026 The Dapr Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//     http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const traceparent = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';

async function testHandler(tutorial, incomingHeaders, persistSucceeds) {
    const routes = {};
    const calls = [];
    const app = {
        use() {},
        get(route, handler) { routes['GET ' + route] = handler; },
        post(route, handler) { routes['POST ' + route] = handler; },
        listen() {}
    };
    const express = () => app;
    express.json = () => () => {};
    const filename = path.join(__dirname, '..', tutorial, 'node', 'app.js');
    vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
        require(name) {
            if (name === 'express') return express;
            if (name === 'body-parser') return { json: express.json };
            if (name === 'isomorphic-fetch') return {};
            throw new Error('Unexpected dependency: ' + name);
        },
        process: { env: {} },
        console: { log() {} },
        async fetch(url, options) {
            calls.push({ url, options });
            return { ok: persistSucceeds };
        }
    }, { filename });

    const order = { orderId: '42' };
    const response = {
        statusCode: undefined,
        status(code) { this.statusCode = code; return this; },
        send() {}
    };
    await routes['POST /neworder']({ body: { data: order }, headers: incomingHeaders }, response);
    assert.equal(calls.length, 1);
    const { url, options } = calls[0];
    assert.equal(url, 'http://localhost:3500/v1.0/state/statestore');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['Content-Type'], 'application/json');
    assert.equal(options.headers.traceparent, incomingHeaders.traceparent);
    assert.equal(Object.hasOwnProperty.call(options.headers, 'traceparent'), !!incomingHeaders.traceparent);
    assert.equal(options.headers.authorization, undefined);
    assert.deepEqual(JSON.parse(options.body), [{ key: 'order', value: order }]);
    assert.equal(response.statusCode, persistSucceeds ? 200 : 500);
}

(async () => {
    for (const tutorial of ['hello-world', 'hello-kubernetes']) {
        await testHandler(tutorial, { traceparent, authorization: 'unrelated-header' }, true);
        await testHandler(tutorial, {}, true);
        await testHandler(tutorial, { traceparent }, false);
        console.log(tutorial + ': trace propagation, missing header, and persistence failure passed');
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
