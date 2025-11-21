<template>
  <q-page class="flex row flex-center">
    <q-dialog v-model="successDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Password reset email sent</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          If an account exists with this email address, you will receive a password reset link
          shortly. Please check your email and follow the instructions.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Back to login" color="primary" @click="backToLogin" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-card class="col-11 col-sm-8 col-md-6 col-lg-4 col-xl-3 q-pa-xs q-pa-md-sm q-mb-xl">
      <q-card-section>
        <div class="text-h6 text-center">Reset your password</div>
        <div class="text-subtitle2 text-center">
          Enter the e-mail address used to register your account
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="full-width">
          <!-- Email -->
          <q-input v-model="email" type="email" label="Email" outlined class="q-mb-lg" />

          <!-- Reset password Button -->
          <q-btn
            label="Reset password"
            color="primary"
            type="submit"
            class="full-width"
            :loading="resetPasswordLoading"
          />

          <!-- Login Link -->
          <div class="text-center q-mt-md">
            <router-link to="/login">Back to login</router-link>
          </div>
          <!-- Signup Link -->
          <div class="text-center q-mt-md">
            <span>Don't have an account? </span>
            <router-link to="/signup">Sign up</router-link>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const email = ref('')

const successDialog = ref(false)
const resetPasswordLoading = ref(false)

const router = useRouter()
const authStore = useAuthStore()

async function onSubmit() {
  resetPasswordLoading.value = true

  let success = await authStore.requestPasswordReset(email.value)

  resetPasswordLoading.value = false

  if (success) {
    successDialog.value = true
  }
}

function backToLogin() {
  router.push('/login')
}
</script>
