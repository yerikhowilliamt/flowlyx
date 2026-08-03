export interface Setting {
  id: string;
  key: string;
  value: string;
  type: 'STRING' | 'BOOLEAN' | 'JSON' | 'NUMBER';
  group: 'GENERAL' | 'SYSTEM' | 'SECURITY';
  description?: string | null;
  isPublic: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSettingPayload {
  key: string;
  value: string;
  type: 'STRING' | 'BOOLEAN' | 'JSON' | 'NUMBER';
  group: 'GENERAL' | 'SYSTEM' | 'SECURITY';
  description?: string;
  isPublic?: boolean;
}

export interface UpdateSettingPayload {
  key?: string;
  value?: string;
  type?: 'STRING' | 'BOOLEAN' | 'JSON' | 'NUMBER';
  group?: 'GENERAL' | 'SYSTEM' | 'SECURITY';
  description?: string;
  isPublic?: boolean;
}
