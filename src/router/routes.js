const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        component: () => import('pages/dashboard/IndexPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'tasks',
        component: () => import('pages/tasks/TasksPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'profile',
        component: () => import('pages/profile/ProfilePage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'login',
        component: () => import('pages/auth/LoginPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'signup',
        component: () => import('pages/auth/SignupPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'forgot-password',
        component: () => import('pages/auth/ForgotPasswordPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: '/set-password/:token/:uidb64',
        component: () => import('pages/auth/SetPasswordPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'auth/callback',
        component: () => import('pages/auth/AuthCallback.vue'),
        meta: { requiresAuth: false },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
