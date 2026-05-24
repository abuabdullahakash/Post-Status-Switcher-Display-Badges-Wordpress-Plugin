import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Read Firebase configuration
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  const localConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || localConfig.apiKey,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || localConfig.projectId,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || localConfig.storageBucket,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId,
    appId: process.env.VITE_FIREBASE_APP_ID || localConfig.appId,
  };

  const firebaseApp = initializeApp(firebaseConfig);
  const db = getFirestore(firebaseApp, localConfig.firestoreDatabaseId);

  // Enable JSON body requests
  app.use(express.json());

  // API Route - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "PostStatus Features Backend" });
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

  // Vite preview / frontend serving configuration
  if (process.env.NODE_ENV !== "production") {
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

startServer();
