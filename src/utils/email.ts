import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import fs from 'fs'
import path from 'path'
import { envConfig } from '~/constants/config'
import { EMAIL_MESSAGES } from '~/constants/messages'
// Create SES service object.
const sesClient = new SESClient({
  region: envConfig.awsRegion,
  credentials: {
    secretAccessKey: envConfig.awsSecretAccessKey,
    accessKeyId: envConfig.awsAccessKeyId
  }
})

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

export const sendEmail = (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: envConfig.sesFromAddress,
    toAddresses: toAddress,
    body,
    subject
  })
  return sesClient.send(sendEmailCommand)
}

const verifyEmailTemplate = fs.readFileSync(path.resolve('src/templates/verify-email.html'), 'utf8')
export const sendVerifyEmail = (toAddress: string, email_verify_token: string) => {
  const subject = EMAIL_MESSAGES.SUBJECT_VERIFY_EMAIL
  const body = verifyEmailTemplate
    .replace('{{link}}', `${envConfig.clientUrl}/verify-email?token=${email_verify_token}`)
    .replace('{{title}}', EMAIL_MESSAGES.TITLE_VERIFY_EMAIL)
    .replace('{{content}}', EMAIL_MESSAGES.CONTENT_VERIFY_EMAIL)
    .replace('{{buttonLink}}', 'Verify Email')
  return sendEmail(toAddress, subject, body)
}

export const sendEmailForgotPassword = (toAddress: string, forgot_password_token: string) => {
  const subject = EMAIL_MESSAGES.SUBJECT_RESET_PASSWORD
  const body = verifyEmailTemplate
    .replace('{{link}}', `${envConfig.clientUrl}/forgot-password/?token=${forgot_password_token}`)
    .replace('{{title}}', EMAIL_MESSAGES.TITLE_RESET_PASSWORD)
    .replace('{{content}}', EMAIL_MESSAGES.CONTENT_RESET_PASSWORD)
    .replace('{{buttonLink}}', 'Reset Password')
  return sendEmail(toAddress, subject, body)
}
