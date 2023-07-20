import { FirebaseApp, initializeApp } from "firebase/app";
import {
  Messaging,
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";
import { Client, PushNotification } from "@twilio/conversations";

let app: FirebaseApp;
let messaging: Messaging;
let initialized = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app = initializeApp((window as any).firebaseConfig);
  messaging = getMessaging(app);
  initialized = true;
} catch {
  console.warn("Couldn't initialize firebase app");
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
  if (!initialized) {
    return;
  }

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
};

export const showNotification = (pushNotification: PushNotification): void => {
  if (!initialized) {
    return;
  }

  // TODO: remove when new version of sdk will be released
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const notificationTitle = pushNotification.data.conversationTitle || "";

  const notificationOptions = {
    body: pushNotification.body ?? "",
    icon: "favicon.ico",
  };

  const notification = new Notification(notificationTitle, notificationOptions);
  notification.onclick = (event) => {
    console.log("notification.onclick", event);
    event.preventDefault(); // prevent the browser from focusing the Notification's tab
    // TODO: navigate to the corresponding conversation
    notification.close();
  };
};
