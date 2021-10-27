var XMLHttpRequest = require('xhr2');
var result = new XMLHttpRequest()


var main = function() {
    for(var i=0;i<1;i++) {
        sleep(5000);
        var orderId = Math.floor(Math.random() * (1000 - 1) + 1);
        var uri = 'http://localhost:6001/order/' + orderId;
        result.open('GET', uri, true)
        result.send()
        result.onload = () => {
            console.log('Order processed for order id ' + orderId);
            console.log(result);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();