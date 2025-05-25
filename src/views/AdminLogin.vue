<template>
  <div class="admin-login">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark>
              <v-toolbar-title>관리자 로그인</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-form @submit.prevent="handleLogin">
                <v-text-field
                  v-model="student_id"
                  label="학번"
                  prepend-icon="mdi-account"
                  type="text"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="password"
                  label="비밀번호"
                  prepend-icon="mdi-lock"
                  type="password"
                  required
                ></v-text-field>
                <v-btn
                  type="submit"
                  color="primary"
                  block
                  class="mt-4"
                  :loading="loading"
                >
                  로그인
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'AdminLogin',
  data() {
    return {
      student_id: '',
      password: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      try {
        this.loading = true
        const response = await axios.post('http://localhost:8000/api/auth/login', {
          student_id: this.student_id,
          password: this.password
        })
        
        if (response.data.role === 'admin') {
          localStorage.setItem('admin_token', response.data.access_token)
          this.$router.push('/admin/dashboard')
        } else {
          alert('관리자 권한이 없습니다.')
        }
      } catch (error) {
        alert('로그인에 실패했습니다.')
        console.error('Login error:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.admin-login {
  height: 100vh;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
}
</style> 