#!/usr/bin/env php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dapr\Client\DaprClient;
use Dapr\Configuration\ConfigurationUpdate;
use Nyholm\Psr7\Response;
use Psr\Http\Message\ServerRequestInterface;
use React\EventLoop\Loop;
use React\EventLoop\TimerInterface;
use React\Http\HttpServer;
use React\Socket\SocketServer;

$appPort = getenv('APP_PORT') ?: '6001';
$store = 'configstore';
$keys = ['orderId1', 'orderId2'];

$client = DaprClient::clientBuilder()->build();

// The sidecar pushes configuration updates to this app's /configuration/<store> route
$http = new HttpServer(function (ServerRequestInterface $request) use ($store) {
    if ($request->getMethod() === 'POST' && str_starts_with($request->getUri()->getPath(), "/configuration/$store")) {
        $update = ConfigurationUpdate::parse((string) $request->getBody());
        foreach ($update->items as $key => $item) {
            echo "Configuration update $key : {$item->value}" . PHP_EOL;
        }
        return new Response(200, ['Content-Type' => 'application/json'], '{"status":"OK"}');
    }

    return new Response(404);
});

$http->listen(new SocketServer('0.0.0.0:' . $appPort));

$waiter = Loop::addPeriodicTimer(1.0, function (TimerInterface $timer) use ($client, $store, $keys) {
    // Wait for the Dapr sidecar to become healthy
    if (!$client->isDaprHealthy()) {
        return;
    }
    Loop::cancelTimer($timer);

    // Get config items from the config store
    foreach ($keys as $key) {
        $items = $client->getConfiguration(storeName: $store, keys: [$key]);
        echo "Configuration for $key : {$items[$key]->value}" . PHP_EOL;
    }

    // Subscribe to configuration updates
    $id = $client->subscribeConfiguration(storeName: $store, keys: $keys);
    echo "Subscription ID is $id" . PHP_EOL;

    Loop::addTimer(20.0, function () use ($client, $store, $id) {
        // Unsubscribe from configuration updates
        if ($client->unsubscribeConfiguration(storeName: $store, id: $id)) {
            echo 'App unsubscribed from config changes' . PHP_EOL;
        } else {
            echo 'Error unsubscribing from config updates' . PHP_EOL;
        }
        exit(0);
    });
});
