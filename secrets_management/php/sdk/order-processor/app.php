#!/usr/bin/env php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dapr\Client\DaprClient;

$store = 'localsecretstore';
$secretName = 'secret';

$client = DaprClient::clientBuilder()->build();

// Get secret from a local secret store
$secret = $client->getSecret(storeName: $store, key: $secretName);

echo 'Fetched Secret: ' . json_encode($secret) . PHP_EOL;
