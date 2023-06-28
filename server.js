// NodeJS imports
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

import got from "got";

import * as pingOneClient from "./src/pingOneClient.js"

import crypto from "crypto"

// External libraries
import Fastify from "fastify";
import fetch from "node-fetch";

// Initialize variables that are no longer available by default in Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Require the fastify framework and instantiate it
const fastify = Fastify({
  // Set this to true for detailed logging
  logger: false,
  ignoreTrailingSlash: true,
  trustProxy: true
});

// Setup our static files
fastify.register(import("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});

// fastify-formbody lets us parse incoming forms
fastify.register(import("@fastify/formbody"));

// fastify-cookie lets us handle cookies
fastify.register(import("@fastify/cookie"));

/************************
* PingOne MFA 
************************/
fastify.post("/registerPasskey", async (req, reply) => {
  
  const passkeyDevice = {
    "type": "FIDO2",
    "rp": {
        "id": req.headers['x-forwarded-host'],
        "name": "Passkey Demo"
    }
  }
  
  const registerResponse = await pingOneClient.createMfaDevice(req.body.userId, passkeyDevice)
  reply.send(registerResponse)
})

fastify.post("/activatePasskey", async (req, reply) => {
  
  const activateResponse = await pingOneClient.activateMfaDevice(req.body.userId, req.body.deviceId, req.body.activation)
  // console.log(activateResponse)
  reply.send(activateResponse)
})

fastify.post("/authenticatePasskey", async (req, reply) => {
  
  const authenticateResponse = await pingOneClient.createMfaDeviceAuthentication(req.body.userId)
  // console.log(activateResponse)
  reply.send(authenticateResponse)
})

fastify.post("/validateAssertion", async (req, reply) => {
  
  const deviceValidation = {
    "origin": req.body.origin,
    "assertion": req.body.assertion,
    "compatibility" : "FULL"
  }
  
  const assertionResponse = await pingOneClient.validateMfaDeviceAuthentication(req.body.deviceId, deviceValidation)
  // console.log(activateResponse)
  reply.send(assertionResponse)
})

// Run the server and report out to the logs
fastify.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
  }
);