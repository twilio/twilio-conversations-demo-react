import {
  NotificationsType,
  NotificationVariantType,
} from "./store/reducers/notificationsReducer";
import { NOTIFICATION_TIMEOUT, UNEXPECTED_ERROR_MESSAGE } from "./constants";

export const getTypingMessage = (typingData: string[]): string =>
  typingData.length > 1
    ? `${typingData.length + " participants are typing..."}`
    : `${typingData[0] + " is typing..."}`;

export const pushNotification = (
  messages: { variant: NotificationVariantType; message: string }[],
  func?: (messages: NotificationsType) => void
): void => {
  if (func) {
    func(
      messages.map(({ variant, message }) => ({
        variant,
        message,
        id: new Date().getTime(),
        dismissAfter: NOTIFICATION_TIMEOUT,
      }))
    );
  }
};

export const successNotification = ({
  message,
  addNotifications,
}: {
  message: string;
  addNotifications?: (messages: NotificationsType) => void;
}): void => {
  if (!addNotifications) {
    return;
  }
  pushNotification(
    [
      {
        message,
        variant: "success",
      },
    ],
    addNotifications
  );
};

export const unexpectedErrorNotification = (
  addNotifications?: (messages: NotificationsType) => void
): void => {
  if (!addNotifications) {
    return;
  }
  pushNotification(
    [
      {
        message: UNEXPECTED_ERROR_MESSAGE,
        variant: "error",
      },
    ],
    addNotifications
  );
};

export const handlePromiseRejection = async (
  func: () => void,
  addNotifications?: (messages: NotificationsType) => void
): Promise<void> => {
  if (!addNotifications) {
    return;
  }
  try {
    await func();
  } catch {
    unexpectedErrorNotification(addNotifications);
    return Promise.reject(UNEXPECTED_ERROR_MESSAGE);
  }
};
