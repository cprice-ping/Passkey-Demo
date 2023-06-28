import got from "got";
import fetch from "node-fetch";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Obtains an "SDK token" that is passed into the widget to execute the flow policy.
// The session token is passed in via 'global.sessionToken' to make it available to the flow.
// exports.getSdkToken = async (sessionToken) => {
export async function getSdkToken(sessionToken, policyId) {
  const requestBody = {
    policyId: policyId
  };
  
  if (sessionToken) {
    requestBody.global = { sessionToken };
  }
  
  //console.log("RequestBody :", requestBody)
  const response = await got({
    url: `${process.env.ORCHESTRATEAPIROOT}/v1/company/${process.env.envId}/sdktoken`,
    method: 'post',
    headers: {
      "X-SK-API-KEY": process.env.dvApiKey,
      "Content-Type": "application/json"
    },
    //body: JSON.stringify(requestBody)
    json: requestBody
  }).json()

  //console.log(response)
  return response.access_token
} 

// Retrieves the session identified by the provided token.
export async function getSession(sessionToken) {

  const accessToken = await getWorkerToken();

  const response = await got({
    url: `${process.env.APIROOT}/v1/environments/${process.env.envId}/sessions/me`,
    method: 'get',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Cookie': `ST=${sessionToken}`
    }
  }).json();
  
  //console.log("getSession Response: ", response)
  
  return response;
}

// Updates the session identified by the provided token.
export async function updateSession(sessionToken, session) {
  const accessToken = await getWorkerToken();
  
  const response = await got({
    url: `${process.env.APIROOT}/v1/environments/${process.env.envId}/sessions/me`,
    method: 'put',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Cookie': `ST=${sessionToken}`,
      'content-type': 'application/json'
    },
    json: session
  }).json()
  .catch(err => console.log("updateSession Error: ", err.code))
  
  //console.log("updateSession: ", response)
  
  return response;
}

export async function createMfaDevice(userId, deviceBody){
  
  const accessToken = await getWorkerToken();

  var requestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(deviceBody)
  };

  const url = process.env.APIROOT+"/v1/environments/"+process.env.ENVID+"/users/"+userId+"/devices"
  
  const response = await fetch(url, requestOptions)
    .then(response => response.text())
    .then(result => {
        return result;
      })
    .catch(error => console.log('error', error));
  
  return response
}

export async function activateMfaDevice(userId, deviceId, activateDeviceBody){
  
  const accessToken = await getWorkerToken();

  var requestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/vnd.pingidentity.device.activate+json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(activateDeviceBody)
  };

  const url = process.env.APIROOT+"/v1/environments/"+process.env.ENVID+"/users/"+userId+"/devices/"+deviceId
  
  const response = await fetch(url, requestOptions)
    .then(response => response.text())
    .then(result => {
        return result;
      })
    .catch(error => console.log('error', error));
  
  return response
}

export async function createMfaDeviceAuthentication(userId){
  
  const accessToken = await getWorkerToken();

  var requestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      user: {
        id: userId
      }
    })
  };

  const url = process.env.AUTHROOT+"/"+process.env.ENVID+"/deviceAuthentications"
  
  const response = await fetch(url, requestOptions)
    .then(response => response.text())
    .then(result => {
        return result;
      })
    .catch(error => console.log('error', error));
  
  return response
}

export async function validateMfaDeviceAuthentication(deviceAuthId, validateBody){
  
  const accessToken = await getWorkerToken();

  var requestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/vnd.pingidentity.assertion.check+json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(validateBody)
  };

  const url = process.env.AUTHROOT+"/"+process.env.ENVID+"/deviceAuthentications/"+deviceAuthId
  
  const response = await fetch(url, requestOptions)
    .then(response => response.text())
    .then(result => {
        return result;
      })
    .catch(error => console.log('error', error));
  
  return response
}

// Obtains an access token for the PingOne worker application used to retrieve/update sessions.
// This is a naive implementation that gets a token every time.
// It could be improved to cache the token and only get a new one when it is expiring.
const getWorkerToken = async () => {
  
  var urlencoded = new URLSearchParams();
  urlencoded.append("grant_type", "client_credentials");
  
  const response = await fetch(`${process.env.AUTHROOT}/${process.env.ENVID}/as/token`,
    {
      method: 'post',
      body: urlencoded,
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': "Basic " + btoa(process.env.WORKERID+":"+process.env.WORKERSECRET)
    }
  })
  .then(res => res.json())
  .then(data => { return data })
  .catch(err => console.log("P1 Token Error: ", err))
  
  return response.access_token;
}