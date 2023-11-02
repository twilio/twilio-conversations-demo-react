import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { ReduxMessage } from "./../store/reducers/messageListReducer";
import * as _ from "lodash";

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo(userTimezone);

function formatMessageTime(
  dateString: Date,
  lastMessage: boolean,
  on: boolean
) {
  const date = new Date(dateString);
  const currentDate = new Date();

  if (lastMessage && currentDate.toDateString() !== date.toDateString()) {
    // If it's not the same day, show date.
    return date.toDateString();
  } else if (currentDate.getTime() - date.getTime() >= 3 * 60 * 60 * 1000) {
    // If it's older than 3 hours, return time based on the 'on' const
    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (on) {
      // 24-hour format
      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      return `${formattedHours}:${formattedMinutes}`;
    } else {
      // 12-hour format
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = (hours % 12 || 12).toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      return `${formattedHours}:${formattedMinutes} ${ampm}`;
    }
  } else {
    // Otherwise, use the TimeAgo library to format the relative time
    return timeAgo.format(date);
  }
}

export function getMessageTime(message: ReduxMessage, on: boolean) {
  const dateCreated = message.dateCreated;

  if (!dateCreated) {
    return "";
  }

  return formatMessageTime(dateCreated, false, on);
}

export function getLastMessageTime(messages: ReduxMessage[], on: boolean) {
  const lastMessageDate = _.last(messages)?.dateCreated;

  if (!lastMessageDate) {
    return "";
  }

  return formatMessageTime(lastMessageDate, true, on);
}

export function getFirstMessagePerDate(messages: ReduxMessage[]) {
  // Group messages by dateCreated
  const messagesByDate: Record<string, typeof messages> = {};

  for (const message of messages) {
    if (message.dateCreated) {
      const dateKey = message.dateCreated.toDateString();
      if (!messagesByDate[dateKey]) {
        messagesByDate[dateKey] = [message];
      } else {
        const existingMessage = messagesByDate[dateKey][0];
        if (
          existingMessage &&
          existingMessage.dateCreated &&
          message.dateCreated < existingMessage.dateCreated
        ) {
          messagesByDate[dateKey] = [message];
        }
      }
    }
  }

  // Extract sid values from the earliest messages per day
  const earliestSidsPerDay: string[] = [];
  for (const dateKey in messagesByDate) {
    earliestSidsPerDay.push(messagesByDate[dateKey][0].sid);
  }

  return earliestSidsPerDay;
}
