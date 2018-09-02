"use strict";

// importing AWS sdk
import SES from "aws-sdk/clients/ses";
import MailManager from "./src/mailer";
import ResponseBuilder from "./src/ResponseBuilder";

const mailer = new MailManager(new SES({region: "us-east-1"})); //set AWS.SES as our mailer

// The function to send SES email message
exports.sendEmail = (event, context, callback) => {
	//region Validate POST
	let honeyPotField = "qms-email-check",
	    reqfields = ["bodyData", "toEmailAddresses", "sourceEmail"];
	    
	if (
		!(
			// Define valid response, body in event with required fields
			("body" in event) && (reqfields.every((p) => p in event.body && event.body[p] !== ""))
		)
	) {
		//Missing params
		let response = ResponseBuilder(
		    400,
		    `Missing required parameters. Required fields include: ${reqfields.join(", ")}`,
		    {
			    code: "InvalidParameterException",
			    retryable: true
		    }
		);
		console.log(response);
		callback(null, response);
	}
	//endregion Validate POST
	
	if (honeyPotField in event.body && event.body[honeyPotField] !== "") {
    	    let response = ResponseBuilder(
    		    400,
    		    "Invalid request",
    		    {
    			    code: "InvalidParameterException",
    			    retryable: true
    		    }
    		);
    		
    		console.log(response);
		    callback(null, response);
	}
	
	// region define email object
	let emailParams = {
		Destination: {
			BccAddresses: event.body.bccEmailAddresses || [],
			CcAddresses: event.body.ccEmailAddresses  || [],
			ToAddresses: event.body.toEmailAddresses
		},
		Message: {
			Body: {
				Html: {
					Data: event.body.bodyData,
					Charset: event.body.bodyCharset || "UTF-8"
				}
			},
			Subject: {
				Data: event.body.subjectData || "",
				Charset: event.body.subjectCharset  || "UTF-8"
			}
		},
		Source: event.body.sourceEmail,
		ReplyToAddresses: event.body.replyToAddresses || [event.body.toEmailAddresses]
	};
	// endregion define email object
	
	
	// region send mail
	mailer.deliver(emailParams, function (err, data) {
		let response = ResponseBuilder(200, "Mail sent successfully", err); //If error it will overwrite success
		callback(null, response);
	});
	// endregion send mail
};