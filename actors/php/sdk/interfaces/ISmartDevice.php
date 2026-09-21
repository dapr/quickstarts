<?php

namespace SmartDevice\Interfaces;

use Dapr\Actors\Attributes\DaprType;

#[DaprType('SmokeDetectorActor')]
interface ISmartDevice
{
    public function setData(array $data): string;

    public function getData(): array;

    public function soundAlarm(): void;

    public function clearAlarm(): void;
}
