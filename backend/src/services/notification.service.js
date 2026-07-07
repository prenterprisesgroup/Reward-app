const nodemailer = require("nodemailer");
const twilio = require("twilio");
const admin = require("firebase-admin");

const NotificationLog = require("../models/notification-log.model");
const NotificationTemplate = require("../models/notification-template.model");

class NotificationService {
  constructor() {
    this.mailTransporter = null;
    this.twilioClient = null;
    this.firebaseApp = null;
    this.initProviders();
  }

  initProviders() {
    // 1. Initialize Nodemailer (SMTP)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.mailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT == 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      });
    }

    // 2. Initialize Twilio (SMS)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID, 
        process.env.TWILIO_AUTH_TOKEN
      );
    }

    // 3. Initialize Firebase (Push)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON && !admin.apps.length) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } catch (error) {
        console.error("Failed to initialize Firebase Admin:", error.message);
      }
    }
  }

  /**
   * Replace template variables like {{companyName}} with real values.
   */
  renderTemplate(content, variables) {
    if (!content) return "";
    return content.replace(/{{(\w+)}}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  async sendEmail(recipientUser, templateId, variables) {
    return this._dispatch(recipientUser, "EMAIL", templateId, variables);
  }

  async sendSMS(recipientUser, templateId, variables) {
    return this._dispatch(recipientUser, "SMS", templateId, variables);
  }

  async sendPush(recipientUser, templateId, variables) {
    return this._dispatch(recipientUser, "PUSH", templateId, variables);
  }

  /**
   * Core dispatch function handles logging, rendering, and provider routing.
   */
  async _dispatch(recipientUser, channel, templateId, variables) {
    const template = await NotificationTemplate.findById(templateId);
    if (!template || template.status !== "ACTIVE") {
      throw new Error(`Template ${templateId} not found or inactive`);
    }

    if (template.type !== channel) {
      throw new Error(`Template ${templateId} is not configured for ${channel}`);
    }

    const log = new NotificationLog({
      recipient: recipientUser._id,
      channel,
      template: template._id,
      status: "PROCESSING"
    });
    await log.save();

    const renderedSubject = this.renderTemplate(template.subject, variables);
    const renderedBody = this.renderTemplate(template.body, variables);

    try {
      let providerResponse = null;

      if (channel === "EMAIL") {
        if (!this.mailTransporter) throw new Error("Email provider not configured");
        providerResponse = await this.mailTransporter.sendMail({
          from: process.env.SMTP_FROM || "no-reply@example.com",
          to: recipientUser.email,
          subject: renderedSubject,
          text: renderedBody,
          html: renderedBody.replace(/\n/g, "<br>")
        });
        log.provider = "SMTP";

      } else if (channel === "SMS") {
        if (!this.twilioClient) throw new Error("SMS provider not configured");
        providerResponse = await this.twilioClient.messages.create({
          body: renderedBody,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipientUser.phone
        });
        log.provider = "Twilio";

      } else if (channel === "PUSH") {
        if (!this.firebaseApp) throw new Error("Push provider not configured");
        if (!recipientUser.fcmToken) throw new Error("User missing FCM token");
        
        providerResponse = await admin.messaging().send({
          token: recipientUser.fcmToken,
          notification: {
            title: renderedSubject,
            body: renderedBody
          }
        });
        log.provider = "Firebase";
      }

      log.status = "DELIVERED";
      log.deliveredAt = new Date();
      log.providerResponse = providerResponse;
      await log.save();
      return log;

    } catch (error) {
      log.status = "FAILED";
      log.failureReason = error.message;
      await log.save();
      throw error;
    }
  }
}

module.exports = new NotificationService();
