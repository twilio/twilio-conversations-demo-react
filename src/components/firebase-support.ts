import firebase from "firebase/compat/app";
import "firebase/compat/messaging";

export const initFcmServiceWorker = async () => {
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
