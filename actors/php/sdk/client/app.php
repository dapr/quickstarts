#!/usr/bin/env php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dapr\Actors\ActorReference;
use Dapr\Client\DaprClient;

$actorType = 'SmokeDetectorActor';
$deviceId = '2';

$client = DaprClient::clientBuilder()->build();

// Wait for the Dapr sidecar to become healthy
while (!$client->isDaprHealthy()) {
    sleep(1);
}

$data = ['status' => 'Ready', 'location' => 'Second Floor'];

// Call the actor until it is reachable through the placement service
$attempts = 0;
do {
    try {
        $response = $client->invokeActorMethod(
            httpMethod: 'PUT',
            actor: new ActorReference($deviceId, $actorType),
            method: 'setData',
            parameter: $data,
            as: 'string'
        );
        break;
    } catch (Throwable $exception) {
        if (++$attempts >= 15) {
            throw $exception;
        }
        sleep(2);
    }
} while (true);

echo "Calling setData on $actorType:$deviceId..." . PHP_EOL;
echo "Got response: $response" . PHP_EOL;

$stored = $client->invokeActorMethod(
    httpMethod: 'PUT',
    actor: new ActorReference($deviceId, $actorType),
    method: 'getData'
);

echo "Device $deviceId state: Location: {$stored['location']}, Status: {$stored['status']}" . PHP_EOL;
