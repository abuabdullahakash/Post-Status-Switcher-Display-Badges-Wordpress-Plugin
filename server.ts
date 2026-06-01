import express from "express";
import path from "path";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import nodemailer from "nodemailer";

const app = express();

// Read Firebase configuration safely
let firebaseApp, db;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const localConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY || localConfig.apiKey,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || localConfig.projectId,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || localConfig.storageBucket,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId,
      appId: process.env.VITE_FIREBASE_APP_ID || localConfig.appId,
    };
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, localConfig.firestoreDatabaseId);
  }
} catch (e) {
  console.warn("Firebase configuration could not be loaded gracefully on init.", e);
}

// In-memory rate limiting map for contact submissions to protect against spam bots
const ipRateLimits = new Map<string, number[]>();

// Enable JSON body requests
app.use(express.json());

// API Route - Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "PostStatus Features Backend", vercel: process.env.VERCEL === "1" });
});

  // API Route - Auto Publish Features (POST method, secured by Token)
  const API_KEY = process.env.AUTO_PUBLISH_API_KEY || "ps_agent_key_9cf4a29a";

  app.post("/api/features", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "Missing or malformed Authorization header. Expected format: 'Bearer <YOUR_SECRET_KEY>'" 
      });
    }

    const token = authHeader.split(" ")[1];
    if (token !== API_KEY) {
      return res.status(403).json({ 
        error: "Forbidden", 
        message: "The provided API Key/Token is invalid." 
      });
    }

    const {
      title,
      description,
      useCase,
      iconName,
      color,
      active,
      order,
      testimonialQuote,
      testimonialAuthor,
      testimonialRole,
      realWorldCase1Title,
      realWorldCase1Subtitle,
      realWorldCase1Desc,
      realWorldCase1Tag,
      realWorldCase2Title,
      realWorldCase2Subtitle,
      realWorldCase2Desc,
      realWorldCase2Tag,
      realWorldCase3Title,
      realWorldCase3Subtitle,
      realWorldCase3Desc,
      realWorldCase3Tag,
      videoUrl,
      videoPoster,
      gallery,
      galleryCaptions
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ 
        error: "Bad Request", 
        message: "Missing required fields. 'title' and 'description' are mandatory." 
      });
    }

    // Prepare unique Feature document
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    // Fallback generator for custom id
    const customId = `feature-${slug || Date.now()}`;

    const newFeature = {
      id: customId,
      title,
      description,
      useCase: useCase || "Special Feature Added",
      iconName: iconName || "Sparkles",
      color: color || "from-blue-500 to-indigo-500",
      active: active !== undefined ? active : true,
      order: Number(order) || Math.floor(Date.now() / 100000),
      ...(testimonialQuote && { testimonialQuote }),
      ...(testimonialAuthor && { testimonialAuthor }),
      ...(testimonialRole && { testimonialRole }),
      ...(realWorldCase1Title && { realWorldCase1Title }),
      ...(realWorldCase1Subtitle && { realWorldCase1Subtitle }),
      ...(realWorldCase1Desc && { realWorldCase1Desc }),
      ...(realWorldCase1Tag && { realWorldCase1Tag }),
      ...(realWorldCase2Title && { realWorldCase2Title }),
      ...(realWorldCase2Subtitle && { realWorldCase2Subtitle }),
      ...(realWorldCase2Desc && { realWorldCase2Desc }),
      ...(realWorldCase2Tag && { realWorldCase2Tag }),
      ...(realWorldCase3Title && { realWorldCase3Title }),
      ...(realWorldCase3Subtitle && { realWorldCase3Subtitle }),
      ...(realWorldCase3Desc && { realWorldCase3Desc }),
      ...(realWorldCase3Tag && { realWorldCase3Tag }),
      ...(videoUrl && { videoUrl }),
      ...(videoPoster && { videoPoster }),
      ...(gallery && { gallery: Array.isArray(gallery) ? gallery : [gallery] }),
      ...(galleryCaptions && { galleryCaptions: Array.isArray(galleryCaptions) ? galleryCaptions : [galleryCaptions] }),
      pendingApproval: "create",
      updatedAt: new Date().toISOString()
    };

    try {
      // Direct integration into Firestore features collection
      const docRef = doc(db, "features", customId);
      await setDoc(docRef, newFeature);

      return res.status(201).json({
        success: true,
        message: "Feature publication request received successfully and queued for approval! Your website administrator has been notified.",
        featureId: customId,
        feature: newFeature
      });
    } catch (err: any) {
      console.error("Firestore Integration Error:", err);
      return res.status(500).json({ 
        error: "Internal Server Error", 
        message: "Failed to save the feature details to Firestore.",
        details: err.message 
      });
    }
  });

  // API Route - Update Existing Feature (PUT method, secured by Token)
  app.put("/api/features/:id", async (req, res) => {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "Missing or malformed Authorization header. Expected format: 'Bearer <YOUR_SECRET_KEY>'" 
      });
    }

    const token = authHeader.split(" ")[1];
    if (token !== API_KEY) {
      return res.status(403).json({ 
        error: "Forbidden", 
        message: "The provided API Key/Token is invalid." 
      });
    }

    if (!id) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Feature ID parameter is missing in URL."
      });
    }

    // Capture fields to update
    const updateData: any = {};
    const fields = [
      "title", "description", "useCase", "iconName", "color", "active", "order",
      "testimonialQuote", "testimonialAuthor", "testimonialRole",
      "realWorldCase1Title", "realWorldCase1Subtitle", "realWorldCase1Desc", "realWorldCase1Tag",
      "realWorldCase2Title", "realWorldCase2Subtitle", "realWorldCase2Desc", "realWorldCase2Tag",
      "realWorldCase3Title", "realWorldCase3Subtitle", "realWorldCase3Desc", "realWorldCase3Tag",
      "videoUrl", "videoPoster", "gallery", "galleryCaptions"
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if ((field === "gallery" || field === "galleryCaptions") && !Array.isArray(req.body[field])) {
          updateData[field] = [req.body[field]];
        } else if (field === "order") {
          updateData[field] = Number(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "No valid fields provided for update."
      });
    }

    try {
      const docRef = doc(db, "features", id);
      await setDoc(docRef, {
        pendingApproval: "update",
        pendingUpdateData: updateData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return res.status(200).json({
        success: true,
        message: `Feature update proposal received for Feature ID: '${id}'. Queued for administrator approval.`,
        pendingFields: updateData
      });
    } catch (err: any) {
      console.error("Firestore Update Error:", err);
      return res.status(500).json({ 
          error: "Internal Server Error", 
          message: "Failed to queue feature update in Firestore.",
          details: err.message 
      });
    }
  });

  // API Route - Direct Support & Contact form dispatch (Stores to Firestore & sends real-time SMTP emails)
  app.post("/api/contact", async (req, res) => {
    const { 
      name, 
      email, 
      subject, 
      message, 
      websiteVerification, 
      faxNumberInput, 
      numA, 
      numB, 
      userAnswer,
      inquiryType,
      moduleTitle,
      moduleCategory,
      moduleDesc 
    } = req.body;

    const isCustomModule = inquiryType === "custom_module";
    const activeMessage = isCustomModule ? (moduleDesc || message) : message;

    // 1. IP Rate Limiting (Memory-based)
    const clientIp = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown-ip") as string;
    const now = Date.now();
    const timeframe = 10 * 60 * 1000; // 10 minutes

    let clientSubmissions = ipRateLimits.get(clientIp) || [];
    // Filter entries older than 10 minutes
    clientSubmissions = clientSubmissions.filter(ts => now - ts < timeframe);

    if (clientSubmissions.length >= 3) {
      return res.status(429).json({
        error: "Too Many Requests",
        message: "Spam block triggered. Excessive form submissions detected. Please wait 10 minutes before sending another inquiry."
      });
    }

    clientSubmissions.push(now);
    ipRateLimits.set(clientIp, clientSubmissions);

    // 2. Validation Checks
    if (!name || !email || !activeMessage) {
      return res.status(400).json({
        error: "Bad Request",
        message: isCustomModule 
          ? "Missing required fields: please enter your Name, Email, and Module Description." 
          : "Missing required contact fields: 'name', 'email', and 'message' are mandatory."
      });
    }

    if (name.trim().length < 3) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Your name is too short. Please provide a real name (min 3 characters)."
      });
    }

    if (activeMessage.trim().length < 15) {
      return res.status(400).json({
        error: "Bad Request",
        message: isCustomModule
          ? "Your module description is too short. Please write at least 15 characters to explain your requirements."
          : "Your message detail is too short. Please write at least 15 characters to explain your request."
      });
    }

    // 3. Math Captcha Verification (Skip for custom module proposals for smoother user experience)
    if (!isCustomModule) {
      if (numA === undefined || numB === undefined || userAnswer === undefined) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Missing security captcha verification code. Please complete the security equation field."
        });
      }

      const expectedAnswer = Number(numA) + Number(numB);
      if (Number(userAnswer) !== expectedAnswer) {
        return res.status(400).json({
          error: "Captcha Verification Failed",
          message: "Incorrect math security captcha answer. Please solve the dynamic puzzle again."
        });
      }
    }

    // 4. Honeypot check (Silent Bypass)
    if (websiteVerification || faxNumberInput) {
      console.warn(`[SPAM PREVENTION] Honeypot triggered. Silent bypass executed for IP: ${clientIp}`);
      return res.status(201).json({
        success: true,
        message: "Message recorded and dispatched successfully!",
        contactId: `contact-discard-${Date.now()}`,
        smtpDispatched: true
      });
    }

    // 5. Keyword Spam Analyzer & Excessive links checking (Silent Bypass)
    let isKeywordSpam = false;
    const spamKeywords = ["poker", "casino", "viagra", "crypto invest", "seo rank", "maximize leads", "increase traffic", "forex trade", "passive income", "earn money from home", "betting site"];
    const lowercaseMessage = activeMessage.toLowerCase();
    
    for (const kw of spamKeywords) {
      if (lowercaseMessage.includes(kw)) {
        isKeywordSpam = true;
        break;
      }
    }

    const urlPattern = /https?:\/\/[^\s]+/g;
    const urlsCount = (activeMessage.match(urlPattern) || []).length;
    if (urlsCount > 1 || isKeywordSpam) {
      console.warn(`[SPAM PREVENTION] Message flagged as Spam (URLs count: ${urlsCount}, keyword spam: ${isKeywordSpam}). Silent bypass applied.`);
      return res.status(201).json({
        success: true,
        message: "Message recorded and dispatched successfully!",
        contactId: `contact-discard-${Date.now()}`,
        smtpDispatched: true
      });
    }

    // Legitimate non-spam message - process and save to firesore & dispatch notifier email
    const contactId = `contact-${Date.now()}`;
    const contactDoc: any = {
      id: contactId,
      name,
      email,
      subject: isCustomModule ? `[Module Proposal] ${moduleTitle}` : (subject || "Technical Inquiry"),
      message: activeMessage,
      createdAt: new Date().toISOString(),
      inquiryType: inquiryType || "contact",
      status: "new",
      isFavorite: false,
      // Add server-side secret validation token to pass security rules checks
      serverDispatchSecret: "PostStatusServerBypassToken2026"
    };

    if (isCustomModule) {
      contactDoc.moduleTitle = moduleTitle || "";
      contactDoc.moduleCategory = moduleCategory || "";
      contactDoc.moduleDesc = moduleDesc || "";
    }

    try {
      // 1. Save entry to Firestore database for persistent admin records
      const docRef = doc(db, "contacts", contactId);
      await setDoc(docRef, contactDoc);

      // 2. Fetch Settings from Firestore for SMTP details and Auto-Responder
      let smtpSettings: any = {};
      try {
        const settingsDocRef = doc(db, 'settings', 'global');
        const settingsSnap = await getDoc(settingsDocRef);
        if (settingsSnap.exists()) {
          smtpSettings = settingsSnap.data();
        }
      } catch (e) {
        console.warn("Failed to fetch SMTP settings:", e);
      }

      // 3. Dispatch real-time SMTP notification using nodemailer
      // For Gmail using App Password, host is typically smtp.gmail.com
      const smtpHost = "smtp.gmail.com";
      const smtpPort = 465;
      const smtpUser = smtpSettings.smtpEmail || process.env.SMTP_USER;
      const smtpPass = smtpSettings.smtpAppPassword || process.env.SMTP_PASS;

      let emailSent = false;
      let emailError = null;

      const adminEmailConfigured = smtpSettings.adminNotificationEmail || smtpSettings.adminEmail || "abuabdullahakash@gmail.com";

      if (smtpUser && smtpPass) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(smtpPort),
            secure: true,
            auth: {
              user: smtpUser,
              pass: smtpPass
            }
          });

          // A. Send Notification to Admin
          const adminMailOptions = {
            from: `"${name} via Support Form" <${smtpUser}>`,
            to: adminEmailConfigured,
            replyTo: email,
            subject: isCustomModule 
              ? `[Module Proposal] ${moduleTitle || "New Custom Module"} - ${name}` 
              : `[Support Ticket] ${subject || "New Inquiry"} - ${name}`,
            text: isCustomModule
              ? `New custom module proposal received from website:\n\n` +
                `Proposed By: ${name} (${email})\n` +
                `Module Name: ${moduleTitle}\n` +
                `Category Node: ${moduleCategory}\n\n` +
                `Workflow Description:\n${moduleDesc || activeMessage}\n\n` +
                `--- System Notification ---\n` +
                `This email was dispatched from your PostStatus Admin dashboard contact page.\n` +
                `Database ID: ${contactId}`
              : `New support dispatch received from contact form:\n\n` +
                `Sender: ${name} (${email})\n` +
                `Subject: ${subject}\n\n` +
                `Message:\n${message}\n\n` +
                `--- System Notification ---\n` +
                `This email was dispatched from your PostStatus Admin dashboard contact page.\n` +
                `Database ID: ${contactId}`,
            html: `
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fafafa;">
                <div style="border-bottom: 2px solid ${isCustomModule ? '#ec4899' : '#3b82f6'}; padding-bottom: 15px; margin-bottom: 20px;">
                  <h2 style="color: #1e293b; margin: 0; font-size: 22px;">${isCustomModule ? 'New Custom Module Proposal' : 'New Contact Form Dispatch'}</h2>
                  <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Inquiry tracked under Ticket ID: <strong>#${contactId}</strong></p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                  <tr>
                    <td style="padding: 8px 0; color: #475569; font-weight: bold; width: 120px;">Sender Name:</td>
                    <td style="padding: 8px 0; color: #0f172a;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #475569; font-weight: bold;">Sender Email:</td>
                    <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #475569; font-weight: bold;">Category:</td>
                    <td style="padding: 8px 0; color: #0f172a;">
                      <span style="background-color: ${isCustomModule ? '#fdf2f8' : '#eff6ff'}; color: ${isCustomModule ? '#9d174d' : '#1e40af'}; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">
                        ${isCustomModule ? `Custom Module: ${moduleCategory}` : subject}
                      </span>
                    </td>
                  </tr>
                </table>

                <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                  <h4 style="color: #475569; margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">${isCustomModule ? `Workflow Specifications` : 'Message Body'}</h4>
                  <p style="color: #334155; line-height: 1.6; margin: 0; white-space: pre-wrap; font-size: 14px;">${isCustomModule ? (moduleDesc || activeMessage) : message}</p>
                </div>

                <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center;">
                  <p style="font-size: 11px; color: #94a3b8; margin: 0;">This email was sent dynamically via PostStatus Plugin's integrated Node.js platform.</p>
                </div>
              </div>
            `
          };

          await transporter.sendMail(adminMailOptions);
          emailSent = true;
          console.log(`[SMTP SUCCESS] Admin mail delivered to "${adminEmailConfigured}" from "${email}"`);

          // B. Send Auto-Reply to Customer
          let autoReplyTemplateSelected = isCustomModule 
            ? (smtpSettings.customAutoReplyTemplate || "") 
            : (smtpSettings.autoReplyTemplate || "");
          let autoReplySubjectSelected = isCustomModule 
            ? (smtpSettings.customAutoReplySubject || "") 
            : (smtpSettings.autoReplySubject || "");

          // Robust Fallbacks if not set in UI or empty
          if (!autoReplyTemplateSelected) {
            if (isCustomModule) {
              autoReplyTemplateSelected = "Hello {name},\n\nThank you for submitting a custom feature module proposal! We have successfully registered your interest.\n\nProposed Module: {moduleTitle}\nTarget Category: {moduleCategory}\n\nWorkflow Description:\n{moduleDesc}\n\nOur engineering team has received the specifications of the status switcher workflow you described. We will analyze the implementation and contact you shortly at {email} with a development update.\n\nBest regards,\nThe {siteName} Team";
              if (!autoReplySubjectSelected) {
                autoReplySubjectSelected = "[Module Proposal Registered] Your request for \"{moduleTitle}\" is serialized!";
              }
            } else {
              autoReplyTemplateSelected = "Hello {name},\n\nThank you for reaching out to us! We have successfully received your support inquiry.\n\nSubject: {subject}\n\nOur team is reviewing your message and will respond to you shortly at {email}.\n\nTicket ID: #{ticketID}\n\nBest regards,\nThe {siteName} Team";
              if (!autoReplySubjectSelected) {
                autoReplySubjectSelected = "We have received your support ticket! (Ticket #{ticketID})";
              }
            }
          }

          if (autoReplyTemplateSelected) {
            let replySubject = autoReplySubjectSelected || (isCustomModule ? "Thank you for your proposal!" : "Thank you for contacting us!");
            replySubject = replySubject
              .replace(/{ticketID}/g, contactId)
              .replace(/{moduleTitle}/g, moduleTitle || "")
              .replace(/{moduleCategory}/g, moduleCategory || "")
              .replace(/{subject}/g, subject || "Technical Inquiry")
              .replace(/{name}/g, name);

            let replyBody = autoReplyTemplateSelected
              .replace(/{name}/g, name)
              .replace(/{email}/g, email)
              .replace(/{ticketID}/g, contactId)
              .replace(/{subject}/g, subject || "Technical Inquiry")
              .replace(/{moduleTitle}/g, moduleTitle || "")
              .replace(/{moduleCategory}/g, moduleCategory || "")
              .replace(/{moduleDesc}/g, activeMessage)
              .replace(/{siteName}/g, smtpSettings.siteName || "PostStatus");
            
            // Format HTML safely, convert line breaks so it formats properly in email
            const formattedReplyBodyHtml = replyBody.replace(/\n/g, '<br/>');

            const customerMailOptions = {
              from: `"${smtpSettings.siteName || 'Support'}" <${smtpUser}>`,
              to: email,
              subject: replySubject,
              text: replyBody, // fallback
              html: `
                <div style="font-family: inherit; font-size: 14px; color: #1e293b; max-width: 600px;">
                  ${formattedReplyBodyHtml}
                </div>
              `
            };
            
            await transporter.sendMail(customerMailOptions);
            console.log(`[SMTP SUCCESS] Auto-reply delivered to customer "${email}"`);
          }

        } catch (mailErr: any) {
          console.error("[SMTP ERROR] Mail Dispatch Failed:", mailErr);
          emailError = mailErr.message;
        }
      } else {
        // Fallback: SMTP not configured, simulate success and print blueprint log
        console.warn(`[SMTP NOTIFICATION MOCK] Send contact notification mockup:`);
        console.warn(`\tTo: ${adminEmailConfigured}`);
        console.warn(`\tFrom: ${email}`);
        console.warn(`\tSubject: ${isCustomModule ? `[Module Proposal] ${moduleTitle}` : subject}`);
        console.warn(`\tBody: ${isCustomModule ? `Module: ${moduleTitle}\nCategory: ${moduleCategory}\nDescription: ${activeMessage}` : message}`);
        console.warn(`[REASON] No active SMTP valid credentials configured in Database Settings (or .env).`);
      }

      return res.status(201).json({
        success: true,
        message: "Message recorded and dispatched successfully!",
        contactId,
        smtpDispatched: emailSent,
        ...(emailError && { smtpError: emailError })
      });

    } catch (dbErr: any) {
      console.error("Database Contact Entry Failure:", dbErr);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Could not record contact dispatch transaction in Firestore database.",
        details: dbErr.message
      });
    }
  });

// Standalone Server Initialization (Used locally and in standard Docker/Node environments)
// In Vercel serverless environments, VERCEL=1 is set automatically, and it uses the exported app handler instead.
if (process.env.VERCEL !== "1") {
  async function startLocalServer() {
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    // Vite preview / frontend serving configuration
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[POST STATUS EXPRESS SERVER] Running on host 0.0.0.0:${PORT}`);
    });
  }

  startLocalServer();
}

// Export the Express Application specifically for Vercel Serverless Function support
export default app;
