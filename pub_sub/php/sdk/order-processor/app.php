#!/usr/bin/env php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dapr\PubSub\CloudEvent;
use Dapr\PubSub\Subscription;
use Nyholm\Psr7\Response;
use Psr\Http\Message\ServerRequestInterface;
use React\Http\HttpServer;
use React\Socket\SocketServer;

$appPort = getenv('APP_PORT') ?: '6002';

// Register Dapr pub/sub subscriptions
$subscriptions = [
    new Subscription(pubsubname: 'orderpubsub', topic: 'orders', route: 'orders'),
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
        $event = CloudEvent::parse((string) $request->getBody());
        echo 'Subscriber received : ' . $event->data['orderId'] . PHP_EOL;
        return new Response(
            200,
            ['Content-Type' => 'application/json'],
            '{"success":true}'
        );
    }

    return new Response(404);
});

$http->listen(new SocketServer('0.0.0.0:' . $appPort));
echo "Order processor listening on port $appPort" . PHP_EOL;
