 async function registerOnClick() {
  
  // Set Result Titles - Register
  document.getElementById('firstCallTitle').innerHTML="P1 MFA - Create Device <span id='firstCallStatus'></span>"
  document.getElementById('browserResultTitle').innerText="Browser - Register()"
  document.getElementById('secondCallTitle').innerHTML="P1 MFA - Activate Device <span id='secondCallStatus'></span>"
  
  // Clear any prior results
  document.getElementById('firstCall').innerText=""
  document.getElementById('browserResult').innerText=""
  document.getElementById('secondCall').innerText=""
  
  // Calls the server to perform the P1 MFA Create Device call - https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-create-mfa-user-device-fido2
  // P1 MFA returns the publicKeyCredentialCreationOptions value
  const passkeyCreate = await fetch("/registerPasskey", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: document.getElementById("floatInputUserID").value,
      hostname: window.location.hostname,
      envDetails: await getEnvDetails()
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("firstCallStatus").innerHTML=" (<code>status: "+data.status+"</code>)"
      document.getElementById("firstCall").innerHTML="<pre>"+JSON.stringify(data, null, 2)+"</pre>";
      return data;
    });

  //Call WebAuthN (webauthn.js) Register() function with the publicKeyCredentialCreationOptions
  const passkeyValue = await Register(passkeyCreate.publicKeyCredentialCreationOptions).then(
    (value) => {
      document.getElementById("browserResult").innerHTML="<pre>"+JSON.stringify(value, null, 2)+"</pre>";
      return value;
    })
    .catch(err => document.getElementById("browserResult").innerHTML="<pre>"+err+"</pre>");

  // The local Register() response includes the attestation used to active the device
  // P1 MFA needs this added to the `activation` object in the Device Activation call - https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-check-assertion-fido-device
  const passkeyActivate = await fetch("/activatePasskey", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deviceId: passkeyCreate.id,
      userId: document.getElementById("floatInputUserID").value,
      activation: {
        origin: "https://" + window.location.hostname,
        attestation: passkeyValue,
      },
      envDetails: await getEnvDetails()
    }),
  })
    .then((res) => res.json())
    .then(
      (data) =>
      {
        document.getElementById("secondCallStatus").innerHTML=" (<code>status: "+data.status+"</code>)"
        document.getElementById("secondCall").innerHTML="<pre>"+JSON.stringify(data, null, 2)+"</pre>"
      }
    );
}

async function authenticateOnClick() {

    // Set Result Titles - Register
    document.getElementById('firstCallTitle').innerHTML = "P1 MFA - Create Device Authentication <span id='firstCallStatus'></span>";
    document.getElementById('browserResultTitle').innerText = "Browser - Authenticate()";
    document.getElementById('secondCallTitle').innerHTML = "P1 MFA - Return Assertion <span id='secondCallStatus'></span>";

    // Clear any prior results
    document.getElementById('firstCall').innerText = "";
    document.getElementById('browserResult').innerText = "";
    document.getElementById('secondCall').innerText = "";

    try {
        // Calls the server to perform the P1 MFA Create DeviceAuthentication call
        const passkeyAuthenticateResponse = await fetch("/authenticatePasskey", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                envDetails: await getEnvDetails(),
                userId: document.getElementById("floatInputUserID").value,
            }),
        });

        const passkeyAuthenticateData = await passkeyAuthenticateResponse.json();
        document.getElementById("firstCallStatus").innerHTML = ` (<code>status: ${passkeyAuthenticateData.status}</code>)`;
        document.getElementById("firstCall").innerHTML = `<pre>${JSON.stringify(passkeyAuthenticateData, null, 2)}</pre>`;

        // Call WebAuthN (webauthn.js) Authenticate() function
        const authenticateValue = await Authenticate(passkeyAuthenticateData.publicKeyCredentialRequestOptions);
        document.getElementById("browserResult").innerHTML = `<pre>${JSON.stringify(authenticateValue, null, 2)}</pre>`;

        // The local Authenticate() response includes the assertion used to activate the device
        // The returned assertion gets passed to P1 MFA Check Assertion call
        const validatePasskeyResponse = await fetch("/validateAssertion", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                deviceId: passkeyAuthenticateData.id,
                origin: "https://" + window.location.hostname,
                assertion: authenticateValue,
                envDetails: await getEnvDetails()
            }),
        });

        const validatePasskeyData = await validatePasskeyResponse.json();
        document.getElementById("secondCallStatus").innerHTML = `(<code>status: ${validatePasskeyData.status}</code>)`;
        document.getElementById("secondCall").innerHTML = `<pre>${JSON.stringify(validatePasskeyData, null, 2)}</pre>`;

    } catch (error) {
        console.error("An error occurred:", error);
        document.getElementById("browserResult").innerHTML = `<pre>Error: ${error.message || error}</pre>`;
        // Optionally update other status indicators to show failure
        document.getElementById("firstCallStatus").innerHTML = " (<code class='text-danger'>failed</code>)";
        document.getElementById("secondCallStatus").innerHTML = " (<code class='text-danger'>failed</code>)";
    }
}

async function getEnvDetails(){
  return {
      envId: document.getElementById("floatInputEnv").value,
      region: document.getElementById("regionSelect").value,
      workerId: document.getElementById("floatInputWorkerId").value,
      workerSecret: document.getElementById("floatInputWorkerSecret").value
  }
    
}
