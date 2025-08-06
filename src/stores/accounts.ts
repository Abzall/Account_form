import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Account, AccountType, AccountLabel } from '@/types/account'

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([])

  // Загружаем данные из localStorage при инициализации
  const loadAccounts = () => {
    const saved = localStorage.getItem('accounts')
    if (saved) {
      try {
        const parsedAccounts = JSON.parse(saved)
        // Обеспечиваем корректную структуру данных
        accounts.value = parsedAccounts.map((account: Account) => ({
          id: account.id || generateId(),
          labels: Array.isArray(account.labels) ? account.labels : [],
          type: account.type || 'Локальная',
          login: account.login || '',
          password: account.password || '',
          isValid: account.isValid || false,
          errors: account.errors || {}
        }))
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error)
        accounts.value = []
      }
    }
  }

  // Сохраняем данные в localStorage
  const saveAccounts = () => {
    localStorage.setItem('accounts', JSON.stringify(accounts.value))
  }

  // Генерируем уникальный ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Преобразуем строку меток в массив объектов
  const parseLabels = (labelsString: string): AccountLabel[] => {
    if (!labelsString.trim()) return []
    return labelsString
      .split(';')
      .map(label => label.trim())
      .filter(label => label.length > 0)
      .map(label => ({ text: label }))
  }

  // Валидация учетной записи
  const validateAccount = (account: Account): boolean => {
    account.errors = {}
    let isValid = true

    // Валидация логина
    if (!account.login.trim()) {
      account.errors.login = 'Логин обязателен'
      isValid = false
    } else if (account.login.length > 100) {
      account.errors.login = 'Логин не должен превышать 100 символов'
      isValid = false
    }

    // Валидация пароля для локальных записей
    if (account.type === 'Локальная') {
      if (!account.password) {
        account.errors.password = 'Пароль обязателен для локальных записей'
        isValid = false
      } else if (account.password.length > 100) {
        account.errors.password = 'Пароль не должен превышать 100 символов'
        isValid = false
      }
    }

    account.isValid = isValid
    return isValid
  }

  // Добавление новой учетной записи
  const addAccount = () => {
    const newAccount: Account = {
      id: generateId(),
      labels: [],
      type: 'Локальная',
      login: '',
      password: '',
      isValid: false,
      errors: {}
    }
    accounts.value.push(newAccount)
    saveAccounts()
  }

  // Удаление учетной записи
  const removeAccount = (id: string) => {
    const index = accounts.value.findIndex(account => account.id === id)
    if (index !== -1) {
      accounts.value.splice(index, 1)
      saveAccounts()
    }
  }

  // Обновление меток
  const updateLabels = (id: string, labelsString: string) => {
    const account = accounts.value.find(acc => acc.id === id)
    if (account) {
      account.labels = parseLabels(labelsString)
      saveAccounts()
    }
  }

  // Обновление типа записи
  const updateType = (id: string, type: AccountType) => {
    const account = accounts.value.find(acc => acc.id === id)
    if (account) {
      account.type = type
      if (type === 'LDAP') {
        account.password = null
      } else {
        account.password = ''
      }
      validateAccount(account)
      saveAccounts()
    }
  }

  // Обновление логина
  const updateLogin = (id: string, login: string) => {
    const account = accounts.value.find(acc => acc.id === id)
    if (account) {
      account.login = login
      validateAccount(account)
      saveAccounts()
    }
  }

  // Обновление пароля
  const updatePassword = (id: string, password: string) => {
    const account = accounts.value.find(acc => acc.id === id)
    if (account) {
      account.password = password
      validateAccount(account)
      saveAccounts()
    }
  }

  // Получение строки меток для отображения в поле ввода
  const getLabelsString = (account: Account): string => {
    if (!account.labels || !Array.isArray(account.labels)) {
      return ''
    }
    return account.labels.map(label => label.text).join('; ')
  }

  // Инициализация при загрузке
  loadAccounts()

  return {
    accounts,
    addAccount,
    removeAccount,
    updateLabels,
    updateType,
    updateLogin,
    updatePassword,
    getLabelsString,
    validateAccount
  }
})
