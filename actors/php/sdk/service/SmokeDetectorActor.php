<?php

namespace SmartDevice;

use Dapr\Actors\Actor;
use Dapr\Actors\ActorState;
use Dapr\Actors\Attributes\DaprType;
use SmartDevice\Interfaces\ISmartDevice;

class SmartDeviceState extends ActorState
{
    public string $status = '';
    public string $location = '';
}

#[DaprType('SmokeDetectorActor')]
class SmokeDetectorActor extends Actor implements ISmartDevice
{
    public function __construct(string $id, private SmartDeviceState $state)
    {
        parent::__construct($id);
    }

    public function setData(array $data): string
    {
        $this->state->status = $data['status'];
        $this->state->location = $data['location'];

        return 'Success';
    }

    public function getData(): array
    {
        return [
            'status' => $this->state->status,
            'location' => $this->state->location,
        ];
    }

    public function soundAlarm(): void
    {
        $this->state->status = 'Alarm';
    }

    public function clearAlarm(): void
    {
        $this->state->status = 'Ready';
    }
}
