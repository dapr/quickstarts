#!/usr/bin/env php
<?php

$base_url = (getenv('BASE_URL') ?: 'http://localhost') . ':' . (getenv('DAPR_HTTP_PORT') ?: '3500');
$store = 'statestore';

function http_request(string $method, string $url, ?string $body = null): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => $body,
    ]);
    $response = (string) curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    return [$status, $response];
}

// Wait for the Dapr sidecar to become healthy
while (http_request('GET', "$base_url/v1.0/healthz")[0] !== 204) {
    sleep(1);
}

for ($i = 1; $i < 100; $i++) {
    $orderId = (string) $i;
    $order = ['orderId' => $orderId];
    $state = json_encode([['key' => $orderId, 'value' => $order]]);

    // Save state into the state store via HTTP POST
    http_request('POST', "$base_url/v1.0/state/$store", $state);
    echo 'Saving Order: ' . json_encode($order) . PHP_EOL;

    // Get state from the state store via HTTP GET
    [, $result] = http_request('GET', "$base_url/v1.0/state/$store/$orderId");
    echo 'Getting Order: ' . $result . PHP_EOL;

    // Delete state from the state store via HTTP DELETE
    http_request('DELETE', "$base_url/v1.0/state/$store", $state);
    echo 'Deleted Order: ' . json_encode($order) . PHP_EOL;

    sleep(1);
}
