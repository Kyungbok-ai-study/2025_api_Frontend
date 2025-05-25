<template>
  <div class="admin-dashboard">
    <v-app>
      <v-navigation-drawer v-model="drawer" app>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="text-h6">
                관리자 대시보드
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item
            v-for="item in menuItems"
            :key="item.title"
            @click="currentView = item.component"
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-app-bar app color="primary" dark>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>경복대학교 학습 지원 플랫폼 - 관리자</v-toolbar-title>
        <v-spacer></v-spacer>
        
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-badge
              :content="notifications.length.toString()"
              :value="notifications.length"
              color="error"
              overlap
            >
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon>mdi-bell</v-icon>
              </v-btn>
            </v-badge>
          </template>
          
          <v-list>
            <v-list-item
              v-for="(notification, index) in notifications"
              :key="index"
            >
              <v-list-item-title>{{ notification.message }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-btn icon @click="logout">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </v-app-bar>

      <v-main>
        <v-container fluid>
          <component :is="currentView"></component>
        </v-container>
      </v-main>
    </v-app>
  </div>
</template>

<script>
import axios from 'axios'
import SystemLogs from '../components/admin/SystemLogs.vue'
import ErrorLogs from '../components/admin/ErrorLogs.vue'
import UserManagement from '../components/admin/UserManagement.vue'
import LoginHistory from '../components/admin/LoginHistory.vue'
import ActiveUsers from '../components/admin/ActiveUsers.vue'
import DatabaseStatus from '../components/admin/DatabaseStatus.vue'

export default {
  name: 'AdminDashboard',
  components: {
    SystemLogs,
    ErrorLogs,
    UserManagement,
    LoginHistory,
    ActiveUsers,
    DatabaseStatus
  },
  data() {
    return {
      drawer: true,
      currentView: 'SystemLogs',
      notifications: [
        { message: '새로운 오류가 발생했습니다.' },
        { message: '새로운 사용자가 가입했습니다.' }
      ],
      menuItems: [
        { title: '시스템 로그', icon: 'mdi-text', component: 'SystemLogs' },
        { title: '오류 로그', icon: 'mdi-alert', component: 'ErrorLogs' },
        { title: '사용자 관리', icon: 'mdi-account-group', component: 'UserManagement' },
        { title: '로그인 기록', icon: 'mdi-history', component: 'LoginHistory' },
        { title: '활성 사용자', icon: 'mdi-account-check', component: 'ActiveUsers' },
        { title: 'DB 상태', icon: 'mdi-database', component: 'DatabaseStatus' }
      ]
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('admin_token')
      this.$router.push('/admin')
    }
  },
  async created() {
    // 알림 데이터를 서버에서 가져오는 로직
    try {
      const token = localStorage.getItem('admin_token')
      const response = await axios.get('http://localhost:8000/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      this.notifications = response.data
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  height: 100vh;
}
</style>
