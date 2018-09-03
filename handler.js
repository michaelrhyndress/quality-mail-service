"use strict";

// importing AWS sdk
import SES from "aws-sdk/clients/ses";
import MailManager from "./src/mailer";
import responseBuilder from "./src/responseBuilder";

const mailer = new MailManager(new SES({region: "us-east-1"})); //set AWS.SES as our mailer

// The function to send SES email message
exports.sendEmail = (event, context, callback) => {
    //region Validate POST
    let honeyPotField = "qms-email-check";
    let reqfields = ["bodyData", "toEmailAddresses", "sourceEmail"];
    let response;
    
    // Define valid response, body in event with required fields
    if (!("body" in event &&
        reqfields.every((p) => p in event.body && event.body[p] !== "")))
    {
        //Missing params
        response = responseBuilder(
            400,
            `Missing required parameters. Required fields include: ${reqfields.join(", ")}`,
            {
                code: "InvalidParameterException",
                retryable: true
            }
        );
        callback(null, response);
    }
    //endregion Validate POST

    if (honeyPotField in event.body && event.body[honeyPotField] !== "") {
        response = responseBuilder(
            400,
            "Invalid request",
            {
                code: "InvalidParameterException",
                retryable: false
            }
            );
        callback(null, response);
    }

    // region define email object
    let emailParams = {
        Destination: {
            BccAddresses: event.body.bccEmailAddresses || [],
            CcAddresses: event.body.ccEmailAddresses || [],
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
                Charset: event.body.subjectCharset || "UTF-8"
            }
        },
        Source: event.body.sourceEmail,
        ReplyToAddresses: event.body.replyToAddresses || [event.body.toEmailAddresses]
    };
    // endregion define email object

    // region send mail
    mailer.deliver(emailParams, function (err, data) {
        //If error it will overwrite success
        response = responseBuilder(200, "Mail sent successfully", err);
        callback(null, response);
    });
    // endregion send mail
};