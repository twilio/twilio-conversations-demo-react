import firebase from "firebase/compat/app";
import "firebase/compat/messaging";
import { Client, PushNotification } from "@twilio/conversations";

export const initFcmServiceWorker = async (): Promise<void> => {
  firebase.initializeApp((window as any).firebaseConfig);

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
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.log("FcmNotifications: can't request permission:", permission);
    return;
  }

  const messaging = firebase.messaging();
  const fcmToken = await messaging.getToken();
  if (!fcmToken) {
    console.log("FcmNotifications: can't get fcm token");
    return;
  }

  console.log("FcmNotifications: got fcm token", fcmToken);
  convoClient.setPushRegistrationId("fcm", fcmToken);
  messaging.onMessage((payload) => {
    console.log("FcmNotifications: push received", payload);
    if (convoClient) {
      convoClient.handlePushNotification(payload);
    }
  });
};

export const showNotification = (pushNotification: PushNotification): void => {
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
