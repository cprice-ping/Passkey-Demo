# Passkey Demo

This is a basic static HTML page that handles the browser-side WebAuthN calls using information from PingOne MFA devices

## Registration
1) Create a new FIDO Platform device in P1 MFA
2) Enter the response
3) Hit Register to trigger the WebAuthN call to enroll
4) Send browser data to ActivateDevice endpoint in P1 MFA

## Authentication
1) Create a new DeviceAuthentication request in P1 MFA
2) Enter the response to this app
3) Click the Authenticate button to trigger WebAuthN
4) Pass browser data to P1 MFA to complete request