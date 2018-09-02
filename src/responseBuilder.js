"use strict";

export default function responseBuilder(status, message, overrides) {
        return Object.assign({}, {
			"message": message,
			"statusCode": status,
			"time": new Date()
		}, overrides);
}