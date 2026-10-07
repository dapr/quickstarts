#!/usr/bin/env php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dapr\Client\DaprClient;

$client = DaprClient::clientBuilder()->build();

// Wait for the Dapr sidecar to become healthy before publishing
while (!$client->isDaprHealthy()) {
    sleep(1);
}

for ($i = 1; $i < 10; $i++) {
    $order = ['orderId' => $i];

    // Publish an event/message using the Dapr PHP SDK
    $client->publishEvent(
        pubsubName: 'orderpubsub',
        topicName: 'orders',
        data: $order,
    );

    echo 'Published data: ' . json_encode($order) . PHP_EOL;
    sleep(1);
}
