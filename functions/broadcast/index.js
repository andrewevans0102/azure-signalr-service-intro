module.exports = async function (context, req) {
    const payload = req.body.payload;
    context.bindings.signalRMessages = [{
        "target": "newMessage",
        "arguments": [ payload ]
    }]

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: payload
    };
}