# Conversations Demo Web Application Overview

SDK version of this demo app: ![](https://img.shields.io/badge/SDK%20version-1.2.3-blue.svg)

The latest available SDK version of this demo app: ![](https://img.shields.io/badge/SDK%20version-2.0.0-green.svg)

## Getting Started

Welcome to the Conversations Demo Web application.  This application demonstrates a basic Conversations client application with the ability to create and join conversations, add other participants into the conversations and exchange messages.

What you'll minimally need to get started:

- A clone of this repository
- [A way to create a Conversations Service Instance and generate client tokens](https://www.twilio.com/docs/conversations/identity)

## Building

### Set the value of `REACT_APP_ACCESS_TOKEN_SERVICE_URL`

Set the value of `REACT_APP_ACCESS_TOKEN_SERVICE_URL` in the `.env` file to point to a valid Access-Token server.
So your Access-Token server should provide a valid token for valid credentials by URL:

 ```
$REACT_APP_ACCESS_TOKEN_SERVICE_URL?identity=<USER_PROVIDED_USERNAME>&password=<USER_PROVIDED_PASSWORD>
 ```

And return HTTP 401 in case of invalid credentials.

If an `.env` file doesn't exist, create one with the following contents:
```
REACT_APP_ACCESS_TOKEN_SERVICE_URL=http://example.com/get-token/
```

NOTE: No need for quotes around the URL, they will be added automatically.

### For testing purposes, it is possible to create a simple token generator using a Twilio function:

1. Create a new function in [Twilio functions](https://www.twilio.com/console/functions/manage) using template `Blank`
2. On the next, line add `/token-service` to the `PATH`. Copy the whole `PATH` and use it as `REACT_APP_ACCESS_TOKEN_SERVICE_URL` (see above)
3. Uncheck the **Check for valid Twilio signature** checkbox
4. Insert the following code:
```
// If you do not want to pay for other people using your Twilio service for their benefit,
// generate user and password pairs different from what is presented here
let users = {
    user00: "", !!! SET NON-EMPTY PASSWORD AND REMOVE THIS NOTE, THIS GENERATOR WILL NOT WORK WITH EMPTY PASSWORD !!!
    user01: ""  !!! SET NON-EMPTY PASSWORD AND REMOVE THIS NOTE, THIS GENERATOR WILL NOT WORK WITH EMPTY PASSWORD !!!
};

let response = new Twilio.Response();
let headers = {
    'Access-Control-Allow-Origin': '*',
  };

exports.handler = function(context, event, callback) {
    response.setHeaders(headers);
    if (!event.identity || !event.password) {
        response.setStatusCode(401);
        response.setBody("No credentials");
        callback(null, response);
        return;
    }

    if (users[event.identity] != event.password) {
        response.setStatusCode(401);
        response.setBody("Wrong credentials");
        callback(null, response);
        return;
    }
    
    let AccessToken = Twilio.jwt.AccessToken;
    let token = new AccessToken(
      context.ACCOUNT_SID,
      context.TWILIO_API_KEY,
      context.TWILIO_API_SECRET, {
        identity: event.identity,
        ttl: 3600
      });

    let grant = new AccessToken.ChatGrant({ serviceSid: context.SERVICE_SID });
    grant.pushCredentialSid = context.PUSH_CREDENTIAL_SID; 
    token.addGrant(grant);
    response.setStatusCode(200);
    response.setBody(token.toJwt());

    callback(null, response);
};
```
5. Save the function
6. Open [Configure](https://www.twilio.com/console/functions/configure) page and setup values for the following `Environment Variables`:
7. SERVICE_SID
- Open [Conversational Messaging](https://www.twilio.com/console/conversations/configuration/defaults)
- Select `View Service` near the `Default Conversation Service`
- Copy the `Service SID`
- Also navigate to `Push configuration` and enable all types of notifications for receiving FCM messages
8. TWILIO_API_KEY and TWILIO_API_SECRET
- Create an API KEY [here](https://www.twilio.com/console/chat/project/api-keys)
9. PUSH_CREDENTIAL_SID
- Create new push credentials [here](https://www.twilio.com/console/conversations/push-credentials) using `Server key` from `Firebase Cloud Messaging`

### Build

- Run `yarn` to fetch project dependencies.
- Run `yarn build` to fetch Twilio SDK files and build the application.

### Run application

- Run `yarn` to fetch project dependencies.
- Run `yarn start` to run the application locally.

## License

MIT
