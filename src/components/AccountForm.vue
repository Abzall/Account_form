<template>
  <div class="account-form">
    <!-- Заголовок и кнопка добавления -->
    <div class="header">
      <h1>Учётные записи</h1>
             <el-button
         type="primary"
         :icon="Plus"
         @click="addAccountHandler"
         class="add-button"
       >
        Добавить
      </el-button>
    </div>

    <!-- Информационный блок -->
    <el-alert
      title=""
      type="info"
      :closable="false"
      show-icon
      class="info-block"
    >
      <template #default>
        Для указания нескольких меток для одной пары логин/пароль исрользуйте разделитель ;
      </template>
    </el-alert>

    <!-- Таблица учетных записей -->
    <div class="accounts-table">
      <el-table :data="accounts" style="width: 100%">
        <!-- Заголовки таблицы -->
        <el-table-column prop="labels" label="Метки" width="200">
          <template #default="{ row }">
            <el-input
              v-model="labelInputs[row.id]"
              placeholder="Введите метки через ;"
              :maxlength="50"
                             @blur="updateLabelsHandler(row.id, labelInputs[row.id])"
               @input="updateLabelsHandler(row.id, labelInputs[row.id])"
            />
          </template>
        </el-table-column>

        <el-table-column prop="type" label="Тип записи" width="150">
          <template #default="{ row }">
            <el-select
              v-model="row.type"
                             @change="updateTypeHandler(row.id, row.type)"
              style="width: 100%"
            >
              <el-option label="LDAP" value="LDAP" />
              <el-option label="Локальная" value="Локальная" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column prop="login" label="Логин" width="200">
          <template #default="{ row }">
            <el-input
              v-model="row.login"
              placeholder="Введите логин"
              :maxlength="100"
              :class="{ 'is-error': row.errors?.login }"
                             @blur="updateLoginHandler(row.id, row.login)"
            />
            <div v-if="row.errors?.login" class="error-message">
              {{ row.errors.login }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="password" label="Пароль" width="200">
          <template #default="{ row }">
            <el-input
              v-if="row.type === 'Локальная'"
              v-model="row.password"
              type="password"
              placeholder="Введите пароль"
              :maxlength="100"
              :class="{ 'is-error': row.errors?.password }"
                             @blur="updatePasswordHandler(row.id, row.password || '')"
            />
            <span v-else class="disabled-text">—</span>
            <div v-if="row.errors?.password" class="error-message">
              {{ row.errors.password }}
            </div>
          </template>
        </el-table-column>

        <!-- Кнопки действий -->
        <el-table-column label="Действия" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="danger"
              :icon="Delete"
              size="small"
                             @click="removeAccountHandler(row.id)"
              title="Удалить запись"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Сообщение если нет записей -->
    <div v-if="accounts.length === 0" class="empty-state">
      <el-empty description="Нет учетных записей. Нажмите кнопку 'Добавить' для создания новой записи." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useAccountsStore } from '@/stores/accounts'
import type { Account } from '@/types/account'

const accountsStore = useAccountsStore()
const { accounts } = storeToRefs(accountsStore)
const { addAccount, removeAccount, updateLabels, updateType, updateLogin, updatePassword, getLabelsString } = accountsStore

// Реактивные объекты для хранения значений полей меток
const labelInputs = ref<Record<string, string>>({})

// Инициализация полей меток при загрузке
onMounted(() => {
  if (accounts.value && Array.isArray(accounts.value)) {
    accounts.value.forEach(account => {
      if (account && account.id) {
        labelInputs.value[account.id] = getLabelsString(account)
      }
    })
  }
})

// Обработчики событий
const addAccountHandler = () => {
  console.log('Кнопка "Добавить" нажата')
  console.log('Количество записей до добавления:', accounts.value.length)
  addAccount()
  console.log('Количество записей после добавления:', accounts.value.length)
  // Инициализируем поле меток для новой записи
  const newAccount = accounts.value[accounts.value.length - 1]
  if (newAccount) {
    labelInputs.value[newAccount.id] = ''
    console.log('Новая запись добавлена с ID:', newAccount.id)
  }
}

const removeAccountHandler = (id: string) => {
  removeAccount(id)
  delete labelInputs.value[id]
}

const updateLabelsHandler = (id: string, labelsString: string) => {
  updateLabels(id, labelsString)
}

const updateTypeHandler = (id: string, type: Account['type']) => {
  updateType(id, type)
}

const updateLoginHandler = (id: string, login: string) => {
  updateLogin(id, login)
}

const updatePasswordHandler = (id: string, password: string) => {
  updatePassword(id, password)
}
</script>

<style scoped>
.account-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 35px 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  color: #303133;
}

.add-button {
  font-weight: 500;
}

.info-block {
  margin-bottom: 20px;
}

.accounts-table {
  margin-bottom: 20px;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
}

.disabled-text {
  color: #c0c4cc;
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

:deep(.el-input.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset;
}

:deep(.el-table .el-table__cell) {
  padding: 8px;
  vertical-align: baseline;
}

:deep(.el-table .el-input__wrapper) {
  box-shadow: none;
  border: 1px solid #dcdfe6;
}

:deep(.el-table .el-input__wrapper:hover) {
  border-color: #c0c4cc;
}

:deep(.el-table .el-input__wrapper.is-focus) {
  border-color: #409eff;
}
</style>
