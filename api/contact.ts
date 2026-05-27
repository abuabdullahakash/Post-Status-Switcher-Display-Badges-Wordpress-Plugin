import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

let firebaseApp;
let db;

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  let firebaseConfig: any = {};
  
  if (fs.existsSync(configPath)) {
    const localConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY || localConfig.apiKey,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || localConfig.projectId,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || localConfig.storageBucket,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId,
      appId: process.env.VITE_FIREBASE_APP_ID || localConfig.appId,
    };
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, localConfig.firestoreDatabaseId);
  } else if (process.env.VITE_FIREBASE_API_KEY) {
    // Fallback to pure environment variables if the JSON file doesn't exist
    firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
    };
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
  }
} catch (e) {
  console.warn("Firebase configuration could not be loaded on Vercel.", e);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (!db) {
    return res.status(500).json({ error: "Firebase DB not initialized. Cannot process message." });
  }

  try {
    const contactId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const contactDoc = {
      id: contactId,
      name,
      email,
      subject: subject || "No Subject",
      message,
      status: "new",
      createdAt: new Date().toISOString()
    };

    const docRef = doc(db, "contacts", contactId);
    await setDoc(docRef, contactDoc);

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
          port: smtpPort,
          secure: true,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

        const adminMailOptions = {
          from: `"${name} via Support Form" <${smtpUser}>`,
          to: adminEmailConfigured,
          replyTo: email,
          subject: `[Support Ticket] ${subject || "New Inquiry"} - ${name}`,
          text: `New support dispatch received from contact form:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`
        };

        await transporter.sendMail(adminMailOptions);
        emailSent = true;

        if (smtpSettings.autoReplyTemplate) {
          let replySubject = smtpSettings.autoReplySubject || "Thank you for contacting us!";
          replySubject = replySubject.replace("{ticketID}", contactId);

          let replyBody = smtpSettings.autoReplyTemplate
            .replace(/{name}/g, name)
            .replace(/{email}/g, email);
          
          const formattedReplyBodyHtml = replyBody.replace(/\n/g, '<br/>');

          const customerMailOptions = {
            from: `"${smtpSettings.siteName || 'Support'}" <${smtpUser}>`,
            to: email,
            subject: replySubject,
            text: replyBody,
            html: `<div style="font-family: inherit; font-size: 14px; max-width: 600px;">${formattedReplyBodyHtml}</div>`
          };
          
          await transporter.sendMail(customerMailOptions);
        }

      } catch (mailErr: any) {
        console.error("SMTP Error on Vercel:", mailErr);
        emailError = mailErr.message;
      }
    }

    return res.status(201).json({
      success: true,
      message: "Message recorded.",
      id: contactId,
      emailSent,
      ...(emailError && { smtpError: emailError })
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
