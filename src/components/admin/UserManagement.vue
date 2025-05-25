<template>
  <div class="user-management">
    <v-card>
      <v-card-title>
        사용자 관리
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="검색"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="users"
        :search="search"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:item="{ item }">
          <tr>
            <td>{{ item.student_id }}</td>
            <td>{{ item.name }}</td>
            <td>
              <v-chip
                :color="getRoleColor(item.role)"
                dark
                small
              >
                {{ item.role }}
              </v-chip>
            </td>
            <td>
              <v-chip
                :color="getStatusColor(item.status)"
                dark
                small
              >
                {{ item.status }}
              </v-chip>
            </td>
            <td>{{ formatDate(item.created_at) }}</td>
            <td>
              <v-btn
                small
                color="primary"
                class="mr-2"
                @click="showUserDetails(item)"
              >
                상세정보
              </v-btn>
              <v-btn
                small
                :color="item.status === 'active' ? 'error' : 'success'"
                @click="toggleUserStatus(item)"
              >
                {{ item.status === 'active' ? '비활성화' : '활성화' }}
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <!-- 사용자 상세 정보 다이얼로그 -->
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          사용자 상세 정보
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <strong>학번:</strong> {{ selectedUser.student_id }}
            </v-col>
            <v-col cols="6">
              <strong>이름:</strong> {{ selectedUser.name }}
            </v-col>
            <v-col cols="6">
              <strong>역할:</strong>
              <v-chip
                :color="getRoleColor(selectedUser.role)"
                dark
                small
                class="ml-2"
              >
                {{ selectedUser.role }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <strong>상태:</strong>
              <v-chip
                :color="getStatusColor(selectedUser.status)"
                dark
                small
                class="ml-2"
              >
                {{ selectedUser.status }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <strong>가입일:</strong> {{ formatDate(selectedUser.created_at) }}
            </v-col>
            <v-col cols="6">
              <strong>마지막 로그인:</strong> {{ formatDate(selectedUser.last_login) }}
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <v-row>
            <v-col cols="12">
              <h3>활동 통계</h3>
              <v-simple-table>
                <template v-slot:default>
                  <tbody>
                    <tr>
                      <td>총 로그인 횟수</td>
                      <td>{{ selectedUser.stats?.total_logins || 0 }}</td>
                    </tr>
                    <tr>
                      <td>총 학습 시간</td>
                      <td>{{ formatDuration(selectedUser.stats?.total_study_time) }}</td>
                    </tr>
                    <tr>
                      <td>완료한 과제</td>
                      <td>{{ selectedUser.stats?.completed_assignments || 0 }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="editUser(selectedUser)"
          >
            수정
          </v-btn>
          <v-btn
            color="grey darken-1"
            text
            @click="dialog = false"
          >
            닫기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 사용자 수정 다이얼로그 -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>
          사용자 정보 수정
          <v-spacer></v-spacer>
          <v-btn icon @click="editDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="editedUser.name"
              label="이름"
              required
            ></v-text-field>
            <v-select
              v-model="editedUser.role"
              :items="roles"
              label="역할"
              required
            ></v-select>
            <v-select
              v-model="editedUser.status"
              :items="statuses"
              label="상태"
              required
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="saveUser"
          >
            저장
          </v-btn>
          <v-btn
            color="grey darken-1"
            text
            @click="editDialog = false"
          >
            취소
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'

export default {
  name: 'UserManagement',
  data() {
    return {
      search: '',
      loading: false,
      dialog: false,
      editDialog: false,
      valid: true,
      headers: [
        { text: '학번', value: 'student_id' },
        { text: '이름', value: 'name' },
        { text: '역할', value: 'role' },
        { text: '상태', value: 'status' },
        { text: '가입일', value: 'created_at' },
        { text: '작업', value: 'actions', sortable: false }
      ],
      users: [],
      selectedUser: {},
      editedUser: {},
      roles: ['student', 'admin'],
      statuses: ['active', 'inactive', 'suspended']
    }
  },
  methods: {
    formatDate(date) {
      return moment(date).format('YYYY-MM-DD HH:mm:ss')
    },
    formatDuration(minutes) {
      if (!minutes) return '0시간'
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}시간 ${remainingMinutes}분`
    },
    getRoleColor(role) {
      const colors = {
        admin: 'deep-purple',
        student: 'primary'
      }
      return colors[role] || 'grey'
    },
    getStatusColor(status) {
      const colors = {
        active: 'success',
        inactive: 'grey',
        suspended: 'error'
      }
      return colors[status] || 'grey'
    },
    async fetchUsers() {
      try {
        this.loading = true
        const token = localStorage.getItem('admin_token')
        const response = await axios.get('http://localhost:8000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.users = response.data
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        this.loading = false
      }
    },
    showUserDetails(user) {
      this.selectedUser = user
      this.dialog = true
    },
    editUser(user) {
      this.editedUser = { ...user }
      this.dialog = false
      this.editDialog = true
    },
    async saveUser() {
      if (this.$refs.form.validate()) {
        try {
          const token = localStorage.getItem('admin_token')
          await axios.put(`http://localhost:8000/api/admin/users/${this.editedUser.student_id}`, this.editedUser, {
            headers: { Authorization: `Bearer ${token}` }
          })
          this.editDialog = false
          this.fetchUsers()
        } catch (error) {
          console.error('Failed to update user:', error)
        }
      }
    },
    async toggleUserStatus(user) {
      try {
        const token = localStorage.getItem('admin_token')
        const newStatus = user.status === 'active' ? 'inactive' : 'active'
        await axios.put(`http://localhost:8000/api/admin/users/${user.student_id}/status`, {
          status: newStatus
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.fetchUsers()
      } catch (error) {
        console.error('Failed to toggle user status:', error)
      }
    }
  },
  created() {
    this.fetchUsers()
  }
}
</script>

<style scoped>
.user-management {
  padding: 20px;
}
</style>
