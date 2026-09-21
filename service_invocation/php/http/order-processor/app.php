#!/usr/bin/env php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Psr\Http\Message\ServerRequestInterface;
use React\Http\HttpServer;
use React\Http\Message\Response;
use React\Socket\SocketServer;

$appPort = getenv('APP_PORT') ?: '8001';

$http = new HttpServer(function (ServerRequestInterface $request) {
    // The checkout service invokes this endpoint through its Dapr sidecar
    if ($request->getMethod() === 'POST' && $request->getUri()->getPath() === '/orders') {
        $order = json_decode((string) $request->getBody(), true);
        echo 'Order received : ' . json_encode($order) . PHP_EOL;
        return new Response(200, ['Content-Type' => 'application/json'], '{"success":true}');
    }

    return new Response(404);
});

$http->listen(new SocketServer('0.0.0.0:' . $appPort));
echo "Order processor listening on port $appPort" . PHP_EOL;
