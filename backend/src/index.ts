import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ maxInstances: 10 });

/**
 * Device registration endpoint (FCM token registry)
 */
export const registerDevice = onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const { token, platform = "web", timezone } = req.body;

    if (!token) {
      res.status(400).json({ error: "Missing token" });
      return;
    }

    // deterministic device id (token hash substitute)
    const deviceId = Buffer.from(token).toString("base64url");

    const deviceRef = db.collection("devices").doc(deviceId);

    const now = admin.firestore.FieldValue.serverTimestamp();

    const doc = await deviceRef.get();

    if (doc.exists) {
      await deviceRef.update({
        token,
        lastSeen: now,
        platform,
        timezone: timezone ?? null,
      });
    } else {
      await deviceRef.set({
        token,
        createdAt: now,
        lastSeen: now,
        platform,
        timezone: timezone ?? null,
      });
    }

    res.status(200).json({
      success: true,
      deviceId,
    });

  } catch (err) {
    logger.error("registerDevice error", err);
    res.status(500).json({ error: "Internal error" });
    return;
  }
});