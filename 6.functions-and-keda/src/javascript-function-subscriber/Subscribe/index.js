module.exports = async function (context, req) {
    context.log('JavaScript Subscription HTTP trigger function processed a request.');
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: [
            "myTopic"
        ]
    };
};