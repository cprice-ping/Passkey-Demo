async function registerOnClick() {
  const passkeyCreate = await fetch("/registerPasskey", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: document.getElementById("userId").value,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("createDevice").innerHTML =
        "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
      return data;
    });

  publicKeyCredentialCreationOptions =
    passkeyCreate.publicKeyCredentialCreationOptions;

  const passkeyValue = await Register(publicKeyCredentialCreationOptions).then(
    (value) => {
      document.getElementById("registerResult").innerHTML =
        "<pre>" + JSON.stringify(value, null, 2) + "</pre>";
      return value;
    }
  );

  const passkeyActivate = await fetch("/activatePasskey", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deviceId: passkeyCreate.id,
      userId: document.getElementById("userId").value,
      activation: {
        origin: "https://" + window.location.hostname,
        attestation: passkeyValue,
      },
    }),
  })
    .then((res) => res.json())
    .then(
      (data) =>
        (document.getElementById("activateDevice").innerHTML =
          "<pre>" + JSON.stringify(data, null, 2) + "</pre>")
    );

  document.getElementById("registerCard").classList.toggle("d-none");
}

async function authenticateOnClick() {
  const passkeyAuthenticate = await fetch("/authenticatePasskey", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: document.getElementById("userId").value,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("startStatus").innerHTML = "(<code>status: "+data.status+"</code>)"
      document.getElementById("createDeviceAuthentication").innerHTML =
        "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
      return data;
    });

  const authenticateValue = await Authenticate(
    passkeyAuthenticate.publicKeyCredentialRequestOptions
  ).then((value) => {
    document.getElementById("authenticateResult").innerHTML =
      "<pre>" + JSON.stringify(value, null, 2) + "</pre>";
    return value;
  });

  const validatePasskey = await fetch("/validateAssertion", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deviceId: passkeyAuthenticate.id,
      origin: "https://" + window.location.hostname,
      assertion: authenticateValue,
    }),
  })
    .then((res) => res.json())
    .then(
      (data) => {
        document.getElementById("endStatus").innerHTML = "(<code>status: "+data.status+"</code>)"
        document.getElementById("validateAssertion").innerHTML =
          "<pre>" + JSON.stringify(data, null, 2) + "</pre>"
      }
    );

  document.getElementById("authenticateCard").classList.toggle("d-none");
}
