import React, { useEffect } from "react";
import { bindActionCreators } from "redux";
import { useDispatch, useSelector } from "react-redux";

import { ToasterPush, useToaster } from "@twilio-paste/core";
import { Toaster } from "@twilio-paste/toast";

import { actionCreators, AppState } from "../store";

const Notifications: React.FC = () => {
  const toaster = useToaster();
  const notifications = useSelector((state: AppState) => state.notifications);
  const dispatch = useDispatch();
  const { removeNotifications } = bindActionCreators(actionCreators, dispatch);

  useEffect(() => {
    if (!notifications.length) {
      return;
    }
    notifications.forEach((notification) => {
      const value: ToasterPush = {
        ...notification,
        id: notification.id?.toString(), // convert number to string.
      };
      toaster.push(value);
    });
    removeNotifications(notifications.length);
  }, [notifications]);

  return <Toaster {...toaster} />;
};

export default Notifications;
