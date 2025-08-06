export interface AccountLabel {
  text: string
}

export type AccountType = 'LDAP' | 'Локальная'

export interface Account {
  id: string
  labels: AccountLabel[]
  type: AccountType
  login: string
  password: string | null
  isValid: boolean
  errors: {
    login?: string
    password?: string
  }
}

export interface AccountFormData {
  labels: string
  type: AccountType
  login: string
  password: string
} 
