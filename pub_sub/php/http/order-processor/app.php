#!/usr/bin/env php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Psr\Http\Message\ServerRequestInterface;
use React\Http\HttpServer;
use React\Http\Message\Response;
use React\Socket\SocketServer;

$app_port = getenv('APP_PORT') ?: '6021';

// Register Dapr pub/sub subscriptions
$subscriptions = [
    ['pubsubname' => 'orderpubsub', 'topic' => 'orders', 'route' => 'orders'],
];

$http = new HttpServer(function (ServerRequestInterface $request) use ($subscriptions) {
    $path = $request->getUri()->getPath();

    // Dapr calls this endpoint at startup to discover subscriptions
    if ($request->getMethod() === 'GET' && $path === '/dapr/subscribe') {
        echo 'Dapr pub/sub is subscribed to: ' . json_encode($subscriptions) . PHP_EOL;
        return new Response(
            200,
            ['Content-Type' => 'application/json'],
            json_encode($subscriptions)
        );
    }

    // Dapr delivers messages for the "orders" subscription to this route
    if ($request->getMethod() === 'POST' && $path === '/orders') {
        $event = json_decode((string) $request->getBody(), true);
        echo 'Subscriber received : ' . $event['data']['orderId'] . PHP_EOL;
        return new Response(
            200,
            ['Content-Type' => 'application/json'],
            '{"success":true}'
        );
    }

    return new Response(404);
});

$http->listen(new SocketServer('0.0.0.0:' . $app_port));
echo "Order processor listening on port $app_port" . PHP_EOL;
