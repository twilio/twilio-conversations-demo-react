importScripts('https://www.gstatic.com/firebasejs/9.6.3/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.3/firebase-messaging.js');
importScripts('firebase-config.js');

if (firebaseConfig) {
  firebase.initializeApp(firebaseConfig);
  console.log(`${new Date().toJSON()}  [firebase-messaging-sw] Initialized messaging`);

  firebase.messaging().setBackgroundMessageHandler(payload => {
    console.log(`${new Date().toJSON()}  [firebase-messaging-sw] Received background message`, payload);
    const notificationTitle = payload.data.twi_message_type;
    const notificationOptions = {
      body: payload.data.twi_body,
      icon: 'favicon.ico'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.log(`${new Date().toJSON()}  [firebase-messaging-sw] No firebase configuration found!`);
}
