"use strict";

export default function responseBuilder(status, message, overrides) {
    return Object.assign({}, {
        statusCode: status || 200,
        "message": message,
        "time": new Date()
    }, overrides);
}