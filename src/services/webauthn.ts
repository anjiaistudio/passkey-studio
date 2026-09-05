interface ConditionalPublicKeyCredentialConstructor {
  isConditionalMediationAvailable?:
    () => Promise<boolean>;
}

type ConditionalCredentialRequestOptions =
  CredentialRequestOptions & {
    mediation: "conditional";
  };

export function isPasskeySupported():
boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !==
      "undefined" &&
    typeof navigator.credentials !==
      "undefined"
  );
}

export async function
isConditionalMediationSupported():
Promise<boolean> {
  if (!isPasskeySupported()) {
    return false;
  }

  const credentialConstructor =
    PublicKeyCredential as unknown as
      ConditionalPublicKeyCredentialConstructor;

  if (
    typeof credentialConstructor
      .isConditionalMediationAvailable !==
    "function"
  ) {
    return false;
  }

  try {
    return await credentialConstructor
      .isConditionalMediationAvailable();
  } catch {
    return false;
  }
}

export async function
isPlatformAuthenticatorAvailable():
Promise<boolean> {
  if (!isPasskeySupported()) {
    return false;
  }

  if (
    typeof PublicKeyCredential
      .isUserVerifyingPlatformAuthenticatorAvailable !==
    "function"
  ) {
    return false;
  }

  try {
    return await PublicKeyCredential
      .isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

function normalizeBase64Url(
  value: string
): string {
  const paddingAmount =
    (4 - (value.length % 4)) % 4;

  return (
    value
      .replace(/-/g, "+")
      .replace(/_/g, "/") +
    "=".repeat(paddingAmount)
  );
}

export function base64urlToBuffer(
  value: string
): Uint8Array {
  const normalized =
    normalizeBase64Url(value);

  const binary =
    window.atob(normalized);

  const bytes =
    new Uint8Array(binary.length);

  for (
    let index = 0;
    index < binary.length;
    index += 1
  ) {
    bytes[index] =
      binary.charCodeAt(index);
  }

  return bytes;
}

export function bufferToBase64Url(
  value: ArrayBuffer
): string {
  const bytes =
    new Uint8Array(value);

  let binary = "";

  for (
    let index = 0;
    index < bytes.byteLength;
    index += 1
  ) {
    binary += String.fromCharCode(
      bytes[index]
    );
  }

  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
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
  options: Record<string, any>
): Promise<PublicKeyCredential> {
  if (!isPasskeySupported()) {
    throw new Error(
      "WebAuthn is not supported by this browser."
    );
  }

  const credential =
    await navigator.credentials.create({
      publicKey:
        parseCreationOptions(options),
    });

  if (!credential) {
    throw new Error(
      "The browser did not return a credential."
    );
  }

  return credential as PublicKeyCredential;
}

export function credentialToJSON(
  credential: PublicKeyCredential
) {
  const response =
    credential.response as
      AuthenticatorAttestationResponse;

  const transports =
    typeof response.getTransports ===
    "function"
      ? response.getTransports()
      : [];

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
          response.clientDataJSON
        ),

      attestationObject:
        bufferToBase64Url(
          response.attestationObject
        ),

      transports,
    },

    clientExtensionResults:
      credential
        .getClientExtensionResults(),

    authenticatorAttachment:
      credential
        .authenticatorAttachment,
  };
}

export function parseAuthenticationOptions(
  options: Record<string, any>
): PublicKeyCredentialRequestOptions {
  const allowCredentials =
    options.allowCredentials?.map(
      (
        credential:
          PublicKeyCredentialDescriptor & {
            id: string;
          }
      ) => ({
        ...credential,

        id: base64urlToBuffer(
          credential.id
        ),
      })
    );

  return {
    ...options,

    challenge:
      base64urlToBuffer(
        options.challenge
      ),

    allowCredentials,
  } as PublicKeyCredentialRequestOptions;
}

export async function getPasskeyAssertion(
  options: Record<string, any>
): Promise<PublicKeyCredential> {
  if (!isPasskeySupported()) {
    throw new Error(
      "WebAuthn is not supported by this browser."
    );
  }

  const credential =
    await navigator.credentials.get({
      publicKey:
        parseAuthenticationOptions(
          options
        ),
    });

  if (!credential) {
    throw new Error(
      "The browser did not return an assertion."
    );
  }

  return credential as PublicKeyCredential;
}

export async function
getConditionalPasskeyAssertion(
  options: Record<string, any>,
  signal: AbortSignal
): Promise<PublicKeyCredential> {
  if (!isPasskeySupported()) {
    throw new Error(
      "WebAuthn is not supported by this browser."
    );
  }

  const requestOptions:
    ConditionalCredentialRequestOptions = {
      publicKey:
        parseAuthenticationOptions(
          options
        ),

      mediation: "conditional",

      signal,
    };

  const credential =
    await navigator.credentials.get(
      requestOptions
    );

  if (!credential) {
    throw new Error(
      "The browser did not return an assertion."
    );
  }

  return credential as PublicKeyCredential;
}

export function assertionToJSON(
  credential: PublicKeyCredential
) {
  const response =
    credential.response as
      AuthenticatorAssertionResponse;

  return {
    id: credential.id,

    rawId:
      bufferToBase64Url(
        credential.rawId
      ),

    type: credential.type,

    response: {
      authenticatorData:
        bufferToBase64Url(
          response.authenticatorData
        ),

      clientDataJSON:
        bufferToBase64Url(
          response.clientDataJSON
        ),

      signature:
        bufferToBase64Url(
          response.signature
        ),

      userHandle:
        response.userHandle
          ? bufferToBase64Url(
              response.userHandle
            )
          : null,
    },

    authenticatorAttachment:
      credential
        .authenticatorAttachment,

    clientExtensionResults:
      credential
        .getClientExtensionResults(),
  };
}