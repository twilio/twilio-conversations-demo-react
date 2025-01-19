import { FirebaseApp, initializeApp } from "firebase/app";
import {
  Messaging,
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";
import { Client, PushNotification } from "@twilio/conversations";

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let initialized = false;

// Only initialize if we have the config
const firebaseConfig = (window as any).firebaseConfig;
if (firebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    initialized = true;
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
  }
} else {
  console.warn(
    "Firebase config not found. Push notifications will be disabled."
  );
}

export const initFcmServiceWorker = async (): Promise<void> => {
  if (!initialized) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "firebase-messaging-sw.js"
    );
    console.log("ServiceWorker registered with scope:", registration.scope);
  } catch (e) {
    console.log("ServiceWorker registration failed:", e);
  }
};

export const subscribeFcmNotifications = async (
  convoClient: Client
): Promise<void> => {
  if (!initialized || !messaging) {
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("FcmNotifications: can't request permission:", permission);
      return;
    }

    const fcmToken = await getToken(messaging);
    if (!fcmToken) {
      console.log("FcmNotifications: can't get fcm token");
      return;
    }

    console.log("FcmNotifications: got fcm token", fcmToken);
    await convoClient.setPushRegistrationId("fcm", fcmToken);
    onMessage(messaging, (payload) => {
      console.log("FcmNotifications: push received", payload);
      if (convoClient) {
        convoClient.handlePushNotification(payload);
      }
    });
  } catch (error) {
    console.warn("Failed to subscribe to FCM notifications:", error);
  }
};

export const showNotification = (pushNotification: PushNotification): void => {
  if (!initialized) {
    return;
  }

  try {
    // TODO: remove when new version of sdk will be released
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const notificationTitle = pushNotification.data.conversationTitle || "";

    const notificationOptions = {
      body: pushNotification.body ?? "",
      icon: "favicon.ico",
    };

    const notification = new Notification(
      notificationTitle,
      notificationOptions
    );
    notification.onclick = (event) => {
      console.log("notification.onclick", event);
      event.preventDefault(); // prevent the browser from focusing the Notification's tab
      // TODO: navigate to the corresponding conversation
      notification.close();
    };
  } catch (error) {
    console.warn("Failed to show notification:", error);
  }
};
