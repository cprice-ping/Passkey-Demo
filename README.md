# Important Note: FIDO/WebAuthn and localhost

FIDO/WebAuthn registration and authentication will **not work** on `localhost` or non-public domains. You must host this app on a public domain (or use HTTPS with a valid certificate) for Passkey flows to work in most browsers.

If you need to test locally, consider using a tunneling service like [ngrok](https://ngrok.com/) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) to expose your local server to the internet with HTTPS.
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

**Note:** This demo does not use `.env` files. All environment details (Environment ID, Worker ID, Worker Secret, Region, etc.) are entered via the HTML form in the browser UI.

## Install & Run (Docker)

1. Build the Docker image:
	```sh
	docker build -t passkey-demo .
	```

2. Run the container:
	```sh
	docker run -p 5555:5555 passkey-demo
	```

3. Open your browser to `http://localhost:5555` (or your server's public IP) and use the form to enter your PingOne environment details and test Passkey registration/authentication.

## Install & Run (Local)

1. Install dependencies:
	```sh
	npm install
	```

2. Start the server:
	```sh
	node server.js
	```

3. Open your browser to `http://localhost:5555` and use the form as above.
