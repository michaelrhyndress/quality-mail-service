"use strict";

const responseBuilder = (status, message, overrides) => {
        return Object.assign({}, {
			"message": message,
			"statusCode": status,
			"time": new Date()
		}, overrides);
};

export default responseBuilder;