# Passkey Demo

This is a basic static HTML page that handles the browser-side WebAuthN calls using information from PingOne MFA devices

## Registration

1. Create a new FIDO Platform device in P1 MFA
2. Enter the response
3. Hit Register to trigger the WebAuthN call to enroll
4. Send browser data to ActivateDevice endpoint in P1 MFA

## Authentication

1. Create a new DeviceAuthentication request in P1 MFA
2. Enter the response to this app
3. Click the Authenticate button to trigger WebAuthN
4. Pass browser data to P1 MFA to complete request

# Connecting to your own P1 Env

The P1 MFA calls are made to a specific P1 Environment, and require a Worker App to retrieve a token used for the calls.

The `.env` file in this repo contain the details used by the app for this connection.

Remix this application and edit the values to match your configuration:

```
ENVID={{Your P1 Environment}}
WORKERID={{Your Worker App ID}}
WORKERSECRET={{Your Worker App Secret}}
AUTHROOT=https://auth.pingone.com
APIROOT=https://api.pingone.com
ORCHESTRATEAPIROOT=https://orchestrate-api.pingone.com
```

Use any UserID from this environment to Register a Passkey and authenticate with it
