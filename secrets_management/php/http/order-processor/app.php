#!/usr/bin/env php
<?php

$base_url = (getenv('BASE_URL') ?: 'http://localhost') . ':' . (getenv('DAPR_HTTP_PORT') ?: '3500');
$store = 'localsecretstore';
$secretName = 'secret';

// Get secret from a local secret store via HTTP GET
$ch = curl_init("$base_url/v1.0/secrets/$store/$secretName");
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true]);
$secret = (string) curl_exec($ch);
curl_close($ch);

echo 'Fetched Secret: ' . $secret . PHP_EOL;
