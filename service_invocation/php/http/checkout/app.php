#!/usr/bin/env php
<?php

$base_url = (getenv('BASE_URL') ?: 'http://localhost') . ':' . (getenv('DAPR_HTTP_PORT') ?: '3500');

function http_request(string $method, string $url, ?string $body = null, array $headers = []): int
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => $body,
    ]);
    curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    return $status;
}

// Wait for the Dapr sidecar to become healthy
while (http_request('GET', "$base_url/v1.0/healthz") !== 204) {
    sleep(1);
}

for ($i = 1; $i < 20; $i++) {
    $order = ['orderId' => $i];

    // Invoking a service: the dapr-app-id header tells the sidecar to
    // proxy this request to the order-processor app
    http_request('POST', "$base_url/orders", json_encode($order), [
        'Content-Type: application/json',
        'dapr-app-id: order-processor',
    ]);

    echo 'Order passed: ' . json_encode($order) . PHP_EOL;
    sleep(1);
}
