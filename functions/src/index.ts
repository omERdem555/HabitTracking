import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";

import * as admin from "firebase-admin";

setGlobalOptions({ maxInstances: 10 });

// ---- INIT FIREBASE ADMIN ----
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();


// ----------------------------------------------------
// TEST PUSH ENDPOINT (Phase 3.1 validation)
// ----------------------------------------------------
export const sendTestPush = onRequest(async (req, res) => {
  const token = req.query.token as string;

  if (!token) {
    res.status(400).send("token required");
    return;
  }

  try {
    const response = await messaging.send({
      token,
      notification: {
        title: "Test Push",
        body: "FCM backend çalışıyor",
      },
    });

    logger.info("Push sent", response);

    res.status(200).send({ success: true, response });
  } catch (error) {
    logger.error("Push error", error);
    res.status(500).send(error);
  }
});


// ----------------------------------------------------
// DEVICE REGISTER (Phase 3.3 base endpoint)
// ----------------------------------------------------
export const registerDevice = onRequest(async (req, res) => {
  const { deviceId, token } = req.body || {};

  if (!deviceId || !token) {
    res.status(400).send("deviceId and token required");
    return;
  }

  try {
    await db.collection("devices").doc(deviceId).set({
      token,
      enabled: true,
      lastSeen: Date.now(),
    });

    res.status(200).send({ success: true });
  } catch (error) {
    logger.error("Register error", error);
    res.status(500).send(error);
  }
});


// ----------------------------------------------------
// CRON PLACEHOLDER (Phase 3.4 later)
// ----------------------------------------------------
// export const sendDailyReminders = ...