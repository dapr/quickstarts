#!/usr/bin/env php
<?php

$base_url = (getenv('BASE_URL') ?: 'http://localhost') . ':' . (getenv('DAPR_HTTP_PORT') ?: '3500');
$pubsub_name = 'orderpubsub';
$topic = 'orders';

function http_request(string $method, string $url, ?string $body = null): int
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => $body,
    ]);
    curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    return $status;
}

echo "Publishing to baseURL: $base_url, Pubsub Name: $pubsub_name, Topic: $topic" . PHP_EOL;

// Wait for the Dapr sidecar to become healthy before publishing
while (http_request('GET', "$base_url/v1.0/healthz") !== 204) {
    sleep(1);
}

for ($i = 1; $i < 10; $i++) {
    $order = ['orderId' => $i];

    // Publish an event/message to Dapr via HTTP POST
    http_request('POST', "$base_url/v1.0/publish/$pubsub_name/$topic", json_encode($order));

    echo 'Published data: ' . json_encode($order) . PHP_EOL;
    sleep(1);
}
