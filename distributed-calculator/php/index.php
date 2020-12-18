<?php

use Dapr\Runtime;

require_once __DIR__.'/vendor/autoload.php';

Runtime::register_method('percentage', function(...$args) {
    $operandOne = $args['operandOne'];

    trigger_error("$operandOne / 100", E_USER_WARNING);

    return $operandOne / 100.0;
});

header('Content-Type: application/json');
$result = Runtime::get_handler_for_route($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI'])();
http_response_code($result['code']);
if (isset($result['body'])) {
    echo $result['body'];
}
