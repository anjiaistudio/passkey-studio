export interface Passkey {

  id: string;

  user_id: string;

  nickname: string;

  sign_count: number;

  transports?: string;

  device_type?: string;

  backup_eligible: boolean;

  backup_state: boolean;

  created_at?: string;
}