"use strict";

// importing AWS sdk
import SES from "aws-sdk/clients/ses";
import MailManager from "./src/mailer";
import responseBuilder from "./src/responseBuilder";

const mailer = new MailManager(new SES({region: "us-east-1"})); //set AWS.SES as our mailer

// The function to send SES email message
exports.sendEmail = (event, context, callback) => {
    if (!"body" in event) {
        //Missing params
        response = responseBuilder(
            400,
            "Bad Request",
            {
                code: "InvalidParameterException",
                retryable: true
            }
        );
        callback(null, response);
    }

    //region recaptcha
    // var recaptchaField = "g-recaptcha-response",
    //     disableRecaptchaKey = process.env.G_RECAPTCHA_IGNORE_KEY,
    //     recaptchaValidationKey = process.env.G_RECAPTCHA_SECRET_ACCESS_KEY;

    //Ignore recaptcha if override key supplied
    // if (!"recaptchaValidationKey" in event.body ||
    //     event.body[recaptchaValidationKey] !== recaptchaValidationKey)
    // {
    //     //Ensure recaptcha valid
    //     if (!"recaptchaField" in event.body || event.body[recaptchaField] !== "") {
            
    //     }
    // }
    //endregion recaptcha

    //region Validate POST
    var honeyPotField = "qms-email-check",
        reqfields = ["bodyData", "toEmailAddresses", "sourceEmail"];

    // Define valid response, body in event with required fields
    if (!reqfields.every((p) => p in event.body && event.body[p] !== "")) {
        //Missing params
        let response = responseBuilder(
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
        let response = responseBuilder(
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
        let response = responseBuilder(200, "Mail sent successfully", err);
        callback(null, response);
    });
    // endregion send mail
};