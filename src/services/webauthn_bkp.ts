export function isPasskeySupported() {
  return !!window.PublicKeyCredential;
}

function base64urlToBuffer(
  value: string
): Uint8Array {

  const padding =
    "=".repeat(
      (4 - (value.length % 4)) % 4
    );

  const base64 =
    (value + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const binary =
    atob(base64);

  return Uint8Array.from(
    binary,
    c => c.charCodeAt(0)
  );
}

export function parseCreationOptions(
  options: any
) {

  return {
    ...options,

    challenge:
      base64urlToBuffer(
        options.challenge
      ),

    user: {
      ...options.user,

      id:
        base64urlToBuffer(
          options.user.id
        )
    },

    excludeCredentials:
      options.excludeCredentials?.map(
        (credential: any) => ({
          ...credential,

          id:
            base64urlToBuffer(
              credential.id
            ),
        })
      ),
  };
}

export async function createPasskey(
  options: any
) {

  const credential =
    await navigator.credentials.create({
      publicKey:
        parseCreationOptions(
          options
        ),
    });

  return credential;
}
function bufferToBase64Url(
  buffer: ArrayBuffer
) {

  const bytes =
    new Uint8Array(buffer);

  let str = "";

  bytes.forEach(
    b => str +=
      String.fromCharCode(b)
  );

  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function credentialToJSON(credential: any) {

  return {
    id: credential.id,

    rawId:
      bufferToBase64Url(
        credential.rawId
      ),

    type: credential.type,

    response: {

      clientDataJSON:
        bufferToBase64Url(
          credential.response
            .clientDataJSON
        ),

      attestationObject:
        bufferToBase64Url(
          credential.response
            .attestationObject
        ),
    },

    clientExtensionResults:
      credential.getClientExtensionResults(),

    authenticatorAttachment:
      credential.authenticatorAttachment,
  };
}

// function optionalBase64UrlToBuffer(
//   value: string | null | undefined
// ): Uint8Array | null {
//   if (!value) {
//     return null;
//   }

//   return base64urlToBuffer(value);
// }


export function parseAuthenticationOptions(
  options: any
): PublicKeyCredentialRequestOptions {
  return {
    ...options,

    challenge: base64urlToBuffer(
      options.challenge
    ),

    allowCredentials:
      options.allowCredentials?.map(
        (credential: any) => ({
          ...credential,
          id: base64urlToBuffer(
            credential.id
          ),
        })
      ),
  };
}


export async function getPasskeyAssertion(
  options: any
): Promise<PublicKeyCredential> {
  const credential =
    await navigator.credentials.get({
      publicKey:
        parseAuthenticationOptions(options),
    });

  if (!credential) {
    throw new Error(
      "The browser did not return a credential"
    );
  }

  return credential as PublicKeyCredential;
}


export function assertionToJSON(
  credential: PublicKeyCredential
) {
  const response =
    credential.response as AuthenticatorAssertionResponse;

  return {
    id: credential.id,

    rawId: bufferToBase64Url(
      credential.rawId
    ),

    type: credential.type,

    response: {
      authenticatorData: bufferToBase64Url(
        response.authenticatorData
      ),

      clientDataJSON: bufferToBase64Url(
        response.clientDataJSON
      ),

      signature: bufferToBase64Url(
        response.signature
      ),

      userHandle: response.userHandle
        ? bufferToBase64Url(
            response.userHandle
          )
        : null,
    },

    authenticatorAttachment:
      credential.authenticatorAttachment,

    clientExtensionResults:
      credential.getClientExtensionResults(),
  };
}

interface ConditionalPublicKeyCredentialConstructor {
  isConditionalMediationAvailable?: () => Promise<boolean>;
}

export async function isConditionalMediationSupported():
Promise<boolean> {
  if (!window.PublicKeyCredential) {
    return false;
  }

  const constructor =
    PublicKeyCredential as unknown as
      ConditionalPublicKeyCredentialConstructor;

  if (
    typeof constructor
      .isConditionalMediationAvailable !==
    "function"
  ) {
    return false;
  }

  try {
    return await constructor
      .isConditionalMediationAvailable();
  } catch {
    return false;
  }
}

export async function getConditionalPasskeyAssertion(
  options: any,
  signal: AbortSignal
): Promise<PublicKeyCredential> {
  const credential =
    await navigator.credentials.get({
      publicKey:
        parseAuthenticationOptions(options),
      mediation: "conditional",
      signal,
    });

  if (!credential) {
    throw new Error(
      "The browser did not return a credential"
    );
  }

  return credential as PublicKeyCredential;
}