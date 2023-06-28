// Start of WebAuthN API scripting
var authAbortController = window.PublicKeyCredential
  ? new AbortController()
  : null;
var authAbortSignal = window.PublicKeyCredential
  ? authAbortController.signal
  : null;

window.abortWebAuthnSignal = function abortWebAuthnSignal() {
  authAbortController.abort();
  authAbortController = new AbortController();
  authAbortSignal = authAbortController.signal;
};

window.IsWebAuthnSupported = function IsWebAuthnSupported() {
  if (!window.PublicKeyCredential) {
    console.log("Web Authentication API is not supported on this browser.");
    return false;
  }
  return true;
};

window.isWebAuthnPlatformAuthenticatorAvailable =
  function isWebAuthnPlatformAuthenticatorAvailable() {
    var timer;
    var p1 = new Promise(function (resolve) {
      timer = setTimeout(function () {
        console.log("isWebAuthnPlatformAuthenticatorAvailable - Timeout");
        resolve(false);
      }, 1000);
    });
    var p2 = new Promise(function (resolve) {
      if (
        IsWebAuthnSupported() &&
        window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
      ) {
        resolve(
          window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(
            function (err) {
              console.log(err);
              return false;
            }
          )
        );
      } else {
        resolve(false);
      }
    });
    return Promise.race([p1, p2]).then(function (res) {
      clearTimeout(timer);
      console.log("isWebAuthnPlatformAuthenticatorAvailable - " + res);
      return res;
    });
  };

window.WebAuthnPlatformRegistration = function WebAuthnPlatformRegistration(
  publicKeyCredentialCreationOptions
) {
  return new Promise(function (resolve, reject) {
    isWebAuthnPlatformAuthenticatorAvailable().then(function (result) {
      if (result) {
        resolve(Register(publicKeyCredentialCreationOptions));
      }
      reject(Error("UnSupportedBrowserError"));
    });
  });
};

function Register(publicKeyCredentialCreationOptions) {
  return new Promise(function (resolve, reject) {
    var options = JSON.parse(publicKeyCredentialCreationOptions);
    var publicKeyCredential = {};
    publicKeyCredential.rp = options.rp;
    publicKeyCredential.user = options.user;
    publicKeyCredential.user.id = new Uint8Array(options.user.id);
    publicKeyCredential.challenge = new Uint8Array(options.challenge);
    publicKeyCredential.pubKeyCredParams = options.pubKeyCredParams;
    // Optional parameters
    if ("timeout" in options) {
      publicKeyCredential.timeout = options.timeout;
    }
    if ("excludeCredentials" in options) {
      publicKeyCredential.excludeCredentials = credentialListConversion(
        options.excludeCredentials
      );
    }
    if ("authenticatorSelection" in options) {
      publicKeyCredential.authenticatorSelection =
        options.authenticatorSelection;
    }
    if ("attestation" in options) {
      publicKeyCredential.attestation = options.attestation;
    }
    if ("extensions" in options) {
      publicKeyCredential.extensions = options.extensions;
    }
    console.log(publicKeyCredential);
    navigator.credentials
      .create({ publicKey: publicKeyCredential, signal: authAbortSignal })
      .then(function (newCredentialInfo) {
        // Send new credential info to server for verification and registration.
        console.log(newCredentialInfo);
        var publicKeyCredential = {};
        if ("id" in newCredentialInfo) {
          publicKeyCredential.id = newCredentialInfo.id;
        }
        if ("type" in newCredentialInfo) {
          publicKeyCredential.type = newCredentialInfo.type;
        }
        if ("rawId" in newCredentialInfo) {
          publicKeyCredential.rawId = toBase64Str(newCredentialInfo.rawId);
        }
        if (!newCredentialInfo.response) {
          throw "Missing 'response' attribute in credential response";
        }
        var response = {};
        response.clientDataJSON = toBase64Str(
          newCredentialInfo.response.clientDataJSON
        );
        response.attestationObject = toBase64Str(
          newCredentialInfo.response.attestationObject
        );
        publicKeyCredential.response = response;
        resolve(JSON.stringify(publicKeyCredential));
      })
      .catch(function (err) {
        // No acceptable authenticator or user refused consent. Handle appropriately.
        console.log(err);
        reject(Error(err.name));
      });
  });
}

function credentialListConversion(list) {
  var credList = [];
  for (var i = 0; i < list.length; i++) {
    var cred = {
      type: list[i].type,
      id: new Uint8Array(list[i].id),
    };
    if (list[i].transports) {
      cred.transports = list[i].transports;
    }
    credList.push(cred);
  }
  return credList;
}

function toBase64Str(bin) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(bin)));
}

window.WebAuthnPlatformAuthentication = function WebAuthnPlatformAuthentication(
  publicKeyCredentialRequestOptions
) {
  return new Promise(function (resolve, reject) {
    isWebAuthnPlatformAuthenticatorAvailable().then(function (result) {
      if (result) {
        resolve(Authenticate(publicKeyCredentialRequestOptions));
      }
      reject(Error("UnSupportedBrowserError"));
    });
  });
};

function Authenticate(publicKeyCredentialRequestOptions) {
  return new Promise(function (resolve, reject) {
    var options = JSON.parse(publicKeyCredentialRequestOptions);
    var publicKeyCredential = {};
    publicKeyCredential.challenge = new Uint8Array(options.challenge);
    if ("allowCredentials" in options) {
      publicKeyCredential.allowCredentials = credentialListConversion(
        options.allowCredentials
      );
    }
    if ("rpId" in options) {
      publicKeyCredential.rpId = options.rpId;
    }
    if ("timeout" in options) {
      publicKeyCredential.timeout = options.timeout;
    }
    if ("userVerification" in options) {
      publicKeyCredential.userVerification = options.userVerification;
    }
    // console.log(publicKeyCredential);
    navigator.credentials
      .get({ publicKey: publicKeyCredential })
      .then(function (assertion) {
        var publicKeyCredential = {};
        if ("id" in assertion) {
          publicKeyCredential.id = assertion.id;
        }
        if ("rawId" in assertion) {
          publicKeyCredential.rawId = toBase64Str(assertion.rawId);
        }
        if ("type" in assertion) {
          publicKeyCredential.type = assertion.type;
        }
        var response = {};
        response.clientDataJSON = toBase64Str(
          assertion.response.clientDataJSON
        );
        response.authenticatorData = toBase64Str(
          assertion.response.authenticatorData
        );
        response.signature = toBase64Str(assertion.response.signature);
        response.userHandle = toBase64Str(assertion.response.userHandle);
        publicKeyCredential.response = response;

        resolve(JSON.stringify(publicKeyCredential));
      })
      .catch(function (err) {
        // No acceptable authenticator or user refused consent. Handle appropriately.
        console.log(err);
        reject(Error(err.name));
      });
  });
}

const isWebAuthnSupported = () => {
  if (!window.PublicKeyCredential) {
    return false;
  }
  return true;
};

function getCompatibility() {
  return isWebAuthnPlatformAuthenticatorAvailable()
    .then((result) => {
      if (result) {
        return "FULL";
      } else if (isWebAuthnSupported()) {
        return "SECURITY_KEY_ONLY";
      } else {
        return "NONE";
      }
    })
    .catch(() => {
      if (isWebAuthnSupported()) {
        return "SECURITY_KEY_ONLY";
      } else {
        return "NONE";
      }
    });
}
