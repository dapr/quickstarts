#!/usr/bin/env php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dapr\Client\DaprClient;

$store = 'statestore';

$client = DaprClient::clientBuilder()->build();

// Wait for the Dapr sidecar to become healthy
while (!$client->isDaprHealthy()) {
    sleep(1);
}

for ($i = 1; $i < 100; $i++) {
    $orderId = (string) $i;
    $order = ['orderId' => $orderId];

    // Save state into the state store
    $client->saveState(storeName: $store, key: $orderId, value: $order);
    echo 'Saving Order: ' . json_encode($order) . PHP_EOL;

    // Get state from the state store
    $result = $client->getState(storeName: $store, key: $orderId, asType: 'array');
    echo 'Result after get: ' . json_encode($result) . PHP_EOL;

    // Delete state from the state store
    $client->deleteState(storeName: $store, key: $orderId);
    echo 'Deleting Order: ' . json_encode($order) . PHP_EOL;

    sleep(1);
}
