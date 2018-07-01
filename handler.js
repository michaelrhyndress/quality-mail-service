'use strict';

// importing AWS sdk
import AWS from 'aws-sdk';
import MailManager from './src/mailer';
import request from 'request';
import config from './config.json';

AWS.config.update({
	accessKeyId: config.aws.accessKeyId,
	secretAccessKey: config.aws.secretAccessKey,
	region: config.aws.region
});

const mailer = new MailManager(new AWS.SES()); //set AWS.SES as our mailer

// The function to send SES email message
exports.sendEmail = (event, context, callback) => {
	let reqfields = ['bodyData', 'toEmailAddresses', 'sourceEmail']
	//Validate POST
	if (
		!(
			// Define valid response, body in event with required fields
			('body' in event) && (reqfields.every((p) => p in event.body && event.body[p] !== ""))
		)
	) {
		//Not a valid response
		callback(new Error(`Missing required parameters. Required fields include: ${reqfields.join(', ')}`));
		// callback(null, {
		// 	errorType : "InvalidParameterException",
		// 	statusCode : 400,
		// 	errorMessage : `Missing required parameters. Required fields include: ${reqfields.join(', ')}`
		// });
		
	}
	
	//Fields
	let bccEmailAddresses = event.body.bccEmailAddresses || [];
	let ccEmailAddresses = event.body.ccEmailAddresses  || [];
	let toEmailAddresses = event.body.toEmailAddresses;
	let bodyData = event.body.bodyData;
	let bodyCharset = event.body.bodyCharset || 'UTF-8';
	let subjectData = event.body.subjectData || '';
	let subjectCharset = event.body.subjectCharset  || 'UTF-8';
	let sourceEmail = event.body.sourceEmail;
	let replyToAddresses = event.body.replyToAddresses || [toEmailAddresses];

	// The parameters for sending mail using sendEmail()
	let emailParams = {
		Destination: {
			BccAddresses: bccEmailAddresses,
			CcAddresses: ccEmailAddresses,
			ToAddresses: toEmailAddresses
		},
		Message: {
			Body: {
				Text: {
					Data: bodyData,
					Charset: bodyCharset
				}
			},
			Subject: {
				Data: subjectData,
				Charset: subjectCharset
			}
		},
		Source: sourceEmail,
		ReplyToAddresses: replyToAddresses
	};
	
	mailer.deliver(emailParams, function (err, data) {
		if (err) {
			console.log(err, err.stack);
			callback(err);
		} else {
			console.log("Mail delivered successfully!");
			console.log(data);
		}
	});
	
	// the response to send back after email success.
	callback(null, {
		statusCode: 200,
		body: 'Mail sent successfully',
		headers: {
			'Content-Type': 'application/json',
		}
	});	
};