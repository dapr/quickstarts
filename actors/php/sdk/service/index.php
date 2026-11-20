<?php

require_once __DIR__ . '/../vendor/autoload.php';

$app = \Dapr\App::create(configure: fn(\DI\ContainerBuilder $builder) => $builder->addDefinitions([
    'dapr.actors' => [\SmartDevice\SmokeDetectorActor::class],
]));

$app->start();
