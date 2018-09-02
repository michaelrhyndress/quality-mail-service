"use strict";

export default function responseBuilder(status, message, overrides) {
    return Object.assign({}, {
        statusCode: status || 200,
        body: {
            "message": message,
            "time": new Date()
        },
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" // Required for CORS support
        }
    }, overrides);
}