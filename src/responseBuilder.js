"use strict";

export const ResponseBuilder = (status, message, overrides) => {
        return Object.assign({}, {
			"message": message,
			"statusCode": status,
			"time": new Date()
		}, overrides);
};
