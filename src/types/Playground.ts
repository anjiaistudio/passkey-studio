export type AuthenticatorAttachmentOption =
  | ""
  | "platform"
  | "cross-platform";

export type ResidentKeyOption =
  | "discouraged"
  | "preferred"
  | "required";

export type UserVerificationOption =
  | "discouraged"
  | "preferred"
  | "required";

export type AttestationOption =
  | "none"
  | "indirect"
  | "direct"
  | "enterprise";

export interface RegistrationPlaygroundConfiguration {
  userId: string;

  nickname: string;

  authenticatorAttachment: AuthenticatorAttachmentOption;

  residentKey: ResidentKeyOption;

  userVerification: UserVerificationOption;

  attestation: AttestationOption;

  algorithms: number[];
}

export interface RegistrationOptionsApiResponse {
  challenge_id: string;

  public_key: Record<string, unknown>;
}

export interface RegistrationVerificationApiResponse {
  credential_record_id: string;

  credential_id: string;

  user_id: string;

  nickname: string;

  sign_count: number;

  device_type: string | null;

  backup_eligible: boolean;

  backup_state: boolean;

  message: string;
}


  export type AuthenticationCeremonyMode =
  | "username_first"
  | "username_less"
  | "conditional";

export interface AuthenticationPlaygroundConfiguration {
  ceremonyMode: AuthenticationCeremonyMode;

  userId: string;

  userVerification:
    UserVerificationOption;
}

export interface AuthenticationOptionsApiResponse {
  challenge_id: string;

  public_key: Record<string, unknown>;
}

export interface AuthenticationVerificationApiResponse {
  authenticated: boolean;

  user_id: string;

  username?: string;

  display_name?: string;

  credential_record_id: string;

  nickname: string;

  sign_count: number;

  message: string;
}

export interface InspectorCredentialSummary {
  id: string;

  user_id: string;

  username: string;

  display_name: string;

  nickname: string;

  authenticator_name: string;

  aaguid: string;

  credential_device_type: string;

  credential_count: number | null;

  created_at: string;

  last_used_at: string | null;
}

// Detail fields beyond the summary are best-effort; the page falls
// back to "Unknown" for anything the backend does not send.
export interface InspectorCredentialDetail
  extends InspectorCredentialSummary {
  credential_id?: string;

  authenticator_attachment?:
    string | null;

  authenticator_vendor?:
    string | null;

  attestation_format?:
    string | null;

  transports?: string[];

  flags?: string[];

  backup_eligible?: boolean;

  backup_state?: boolean;

  user_verification_policy?:
    string | null;

  resident_key_policy?:
    string | null;

  sign_count?: number;

  revoked?: boolean;
}