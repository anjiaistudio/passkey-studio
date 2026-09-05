import { api } from "./axios";
import type {
RegistrationOptionsApiResponse,
RegistrationPlaygroundConfiguration,
RegistrationVerificationApiResponse,
InspectorCredentialSummary,
InspectorCredentialDetail,
} from "../types/Playground";

import type {
  AuthenticationOptionsApiResponse,
  AuthenticationPlaygroundConfiguration,
  AuthenticationVerificationApiResponse,
} from "../types/Playground";

export const generateRegistrationOptions =
  async (userId: string) => {

    const response = await api.post(
      "/passkeys/registration/options",
      {
        user_id: userId,

        nickname: "Windows Hello",

        authenticator_attachment:
          "platform",

        resident_key: "required",

        user_verification: "required",

        attestation: "none",

        algorithms: [
          -7,
          -257
        ],
      }
    );

    return response.data;
  };

  export const verifyRegistration =
  async (
    challengeId: string,
    credential: any
  ) => {

    const response = await api.post(
      "/passkeys/registration/verify",
      {
        challenge_id: challengeId,

        nickname: "Windows Hello",

        credential,
      }
    );

    return response.data;
  };


export async function getPasskeys(
  userId: string
) {
  const response =
    await api.get(
      `/passkeys/user/${userId}`
    );

  return response.data;
}

export async function renamePasskey(
  id: string,
  nickname: string
) {
  const response =
    await api.patch(
      `/passkeys/${id}`,
      {
        nickname
      }
    );

  return response.data;
}

export async function deletePasskey(
  id: string
) {
  const response =
    await api.delete(
      `/passkeys/${id}`
    );

  return response.data;
}

export interface AuthenticationOptionsResponse {
  challenge_id: string;
  public_key: PublicKeyCredentialRequestOptionsJSON;
}

export interface AuthenticationVerifyResponse {
  authenticated: boolean;
  user_id: string;
  credential_record_id: string;
  nickname: string;
  sign_count: number;
  message: string;
}

export async function generateAuthenticationOptions(
  userId: string
): Promise<AuthenticationOptionsResponse> {
  const response = await api.post(
    "/passkeys/authentication/options",
    {
      user_id: userId,
      user_verification: "required",
    }
  );

  return response.data;
}

export async function verifyAuthentication(
  challengeId: string,
  credential: unknown
): Promise<AuthenticationVerifyResponse> {
  const response = await api.post(
    "/passkeys/authentication/verify",
    {
      challenge_id: challengeId,
      credential,
    }
  );

  return response.data;
}
export interface DiscoverableAuthenticationOptionsResponse {
  challenge_id: string;
  public_key: Record<string, any>;
}

export interface DiscoverableAuthenticationVerifyResponse {
  authenticated: boolean;
  user_id: string;
  username: string;
  display_name: string;
  credential_record_id: string;
  nickname: string;
  sign_count: number;
  message: string;
}


export async function generateDiscoverableAuthenticationOptions():
Promise<DiscoverableAuthenticationOptionsResponse> {
  const response = await api.post(
    "/passkeys/authentication/discoverable/options",
    {
      user_verification: "required",
      ceremony_type: "username_less",
    }
  );

  return response.data;
}


export async function verifyDiscoverableAuthentication(
  challengeId: string,
  credential: unknown
): Promise<DiscoverableAuthenticationVerifyResponse> {
  const response = await api.post(
    "/passkeys/authentication/discoverable/verify",
    {
      challenge_id: challengeId,
      credential,
    }
  );

  return response.data;
}

export async function generateConditionalAuthenticationOptions():
Promise<DiscoverableAuthenticationOptionsResponse> {
  const response = await api.post(
    "/passkeys/authentication/discoverable/options",
    {
      user_verification: "required",
      ceremony_type: "conditional",
    }
  );

  return response.data;
}



export interface AuthenticationOptionsResponse {
  challenge_id: string;

  public_key: PublicKeyCredentialRequestOptionsJSON;
}

export interface AuthenticationVerifyResponse {
  authenticated: boolean;

  user_id: string;

  credential_record_id: string;

  nickname: string;

  sign_count: number;

  message: string;
}

export interface DiscoverableAuthenticationOptionsResponse {
  challenge_id: string;

  public_key: Record<string, any>;
}

export interface DiscoverableAuthenticationVerifyResponse {
  authenticated: boolean;

  user_id: string;

  username: string;

  display_name: string;

  credential_record_id: string;

  nickname: string;

  sign_count: number;

  message: string;
}


/*
 * Registration playground
 */

export async function generatePlaygroundRegistrationOptions(
  configuration:
    RegistrationPlaygroundConfiguration
): Promise<RegistrationOptionsApiResponse> {
  const response = await api.post(
    "/passkeys/registration/options",
    {
      user_id:
        configuration.userId,

      nickname:
        configuration.nickname,

      authenticator_attachment:
        configuration
          .authenticatorAttachment ||
        null,

      resident_key:
        configuration.residentKey,

      user_verification:
        configuration.userVerification,

      attestation:
        configuration.attestation,

      algorithms:
        configuration.algorithms,
    }
  );

  return response.data;
}

export async function verifyPlaygroundRegistration(
  challengeId: string,
  nickname: string,
  credential: unknown
): Promise<RegistrationVerificationApiResponse> {
  const response = await api.post(
    "/passkeys/registration/verify",
    {
      challenge_id: challengeId,
      nickname,
      credential,
    }
  );

  return response.data;
}

export async function generatePlaygroundAuthenticationOptions(
  configuration:
    AuthenticationPlaygroundConfiguration
): Promise<AuthenticationOptionsApiResponse> {
  if (
    configuration.ceremonyMode ===
    "username_first"
  ) {
    const response = await api.post(
      "/passkeys/authentication/options",
      {
        user_id: configuration.userId,

        user_verification:
          configuration.userVerification,
      }
    );

    return response.data;
  }

  const response = await api.post(
    "/passkeys/authentication/discoverable/options",
    {
      user_verification:
        configuration.userVerification,

      ceremony_type:
        configuration.ceremonyMode,
    }
  );

  return response.data;
}


export async function verifyPlaygroundAuthentication(
  configuration:
    AuthenticationPlaygroundConfiguration,
  challengeId: string,
  credential: unknown
): Promise<AuthenticationVerificationApiResponse> {
  const endpoint =
    configuration.ceremonyMode ===
    "username_first"
      ? "/passkeys/authentication/verify"
      : "/passkeys/authentication/discoverable/verify";

  const response = await api.post(
    endpoint,
    {
      challenge_id: challengeId,
      credential,
    }
  );

  return response.data;
}

/*
 * Credential inspector playground
 */

export async function getInspectorCredentials():
Promise<InspectorCredentialSummary[]> {
  const response = await api.get(
    "/passkeys/inspector"
  );

  return response.data;
}

export async function getInspectorCredentialDetail(
  id: string
): Promise<InspectorCredentialDetail> {
  const response = await api.get(
    `/passkeys/${id}/inspector`
  );

  return response.data;
}
