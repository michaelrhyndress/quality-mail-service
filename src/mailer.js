'use strict';

export default class MailManager {
	constructor(mailer) {
		this.mailer = mailer
	}

	deliver(email, callback) {
		// call sendEmail on provided mailer taking the emailParams and callback
		this.mailer.sendEmail(email, callback);
	}
}