import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({maxInstances: 10});

/**
 * Device registration endpoint (FCM token registry)
 */
export const registerDevice = onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(405).json({error: "Method Not Allowed"});
      return;
    }

    const {
      token,
      userId,
      platform = "web",
      timezone,
      language = "tr",
      notificationSettings = {
        enabled: false,
        startHour: 9,
        endHour: 21,
        intervalHours: 4,
      },
    } = req.body;

    if (!token) {
      res.status(400).json({error: "Missing token"});
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
        userId: userId ?? null,
        lastSeen: now,
        platform,
        timezone: timezone ?? null,
        language,
        notificationSettings,
      });
    } else {
      await deviceRef.set({
        token,
        userId: userId ?? null,
        createdAt: now,
        lastSeen: now,
        platform,
        timezone: timezone ?? null,
        language,
        notificationSettings,
      });
    }

    res.status(200).json({
      success: true,
      deviceId,
    });
  } catch (err) {
    logger.error("registerDevice error", err);
    res.status(500).json({error: "Internal error"});
    return;
  }
});
