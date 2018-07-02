'use strict';

// importing AWS sdk
import AWS from 'aws-sdk';
import MailManager from './src/mailer';
import request from 'request';
// import config from './config.json';

// AWS.config.update({
// 	accessKeyId: config.aws.accessKeyId,
// 	secretAccessKey: config.aws.secretAccessKey,
// 	region: config.aws.region
// });

const mailer = new MailManager(new AWS.SES()); //set AWS.SES as our mailer

// The function to send SES email message
exports.sendEmail = (event, context, callback) => {
	
	//region Validate POST
	let reqfields = ['bodyData', 'toEmailAddresses', 'sourceEmail'];
	
	if (
		!(
			// Define valid response, body in event with required fields
			('body' in event) && (reqfields.every((p) => p in event.body && event.body[p] !== ""))
		)
	) {
		
		//Missing params
		callback(null, {
			"message": `Missing required parameters. Required fields include: ${reqfields.join(', ')}`,
			"code": "InvalidParameterException",
			"statusCode": 400,
			"retryable": true
		});		
	}
	//endregion Validate POST
	
	
	// region define email object
	let emailParams = {
		Destination: {
			BccAddresses: event.body.bccEmailAddresses || [],
			CcAddresses: event.body.ccEmailAddresses  || [],
			ToAddresses: event.body.toEmailAddresses
		},
		Message: {
			Body: {
				Text: {
					Data: event.body.bodyData,
					Charset: event.body.bodyCharset || 'UTF-8'
				}
			},
			Subject: {
				Data: event.body.subjectData || '',
				Charset: event.body.subjectCharset  || 'UTF-8'
			}
		},
		Source: event.body.sourceEmail,
		ReplyToAddresses: event.body.replyToAddresses || [event.body.sourceEmail]
	};
	// endregion define email object
	
	
	// region send mail
	mailer.deliver(emailParams, function (err, data) {
		callback(null, err || {
			statusCode: 200,
			message: 'Mail sent successfully',
		});
	});
	// endregion send mail
};