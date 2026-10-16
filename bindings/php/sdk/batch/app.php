#!/usr/bin/env php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dapr\Client\BindingRequest;
use Dapr\Client\DaprClient;
use Psr\Http\Message\ServerRequestInterface;
use React\Http\HttpServer;
use React\Http\Message\Response;
use React\Socket\SocketServer;

$appPort = getenv('APP_PORT') ?: '5002';
$cronBindingName = 'cron';
$sqlBindingName = 'sqldb';

$client = DaprClient::clientBuilder()->build();

// Triggered by the Dapr cron input binding
$http = new HttpServer(function (ServerRequestInterface $request) use ($cronBindingName, $sqlBindingName, $client) {
    if ($request->getMethod() === 'POST' && $request->getUri()->getPath() === "/$cronBindingName") {
        echo 'Processing batch..' . PHP_EOL;

        $orders = json_decode(file_get_contents(__DIR__ . '/../../../orders.json'), true);

        foreach ($orders['orders'] as $orderLine) {
            $sqlCmd = sprintf(
                "insert into orders (orderid, customer, price) values (%s, '%s', %s)",
                $orderLine['orderid'],
                $orderLine['customer'],
                $orderLine['price']
            );

            echo $sqlCmd . PHP_EOL;

            // Insert order using the Dapr output binding
            $client->invokeBinding(
                new BindingRequest(bindingName: $sqlBindingName, operation: 'exec', data: '', metadata: ['sql' => $sqlCmd])
            );
        }

        echo 'Finished processing batch' . PHP_EOL;

        return new Response(200, ['Content-Type' => 'application/json'], '{"success":true}');
    }

    return new Response(404);
});

$http->listen(new SocketServer('0.0.0.0:' . $appPort));
echo "Batch service listening on port $appPort" . PHP_EOL;
