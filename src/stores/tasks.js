import { defineStore, acceptHMRUpdate } from 'pinia'
import { Notify } from 'quasar'
import axios from 'config/axios'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    filter: 'all', // 'all', 'active', 'completed'
    loading: false,
  }),

  getters: {
    filteredTasks(state) {
      if (state.filter === 'active') {
        return state.tasks.filter((task) => !task.completed)
      }
      if (state.filter === 'completed') {
        return state.tasks.filter((task) => task.completed)
      }
      return state.tasks
    },
  },

  actions: {
    /**
     * Fetch all tasks
     */
    async fetchTasks() {
      this.loading = true
      try {
        const response = await axios.get('/task/')
        if (response.data?.success) {
          this.tasks = response.data.tasks || []
          return true
        } else {
          const errorMessage = response.data?.message || 'Failed to fetch tasks'
          Notify.create({
            message: errorMessage,
            color: 'negative',
            position: 'top',
            timeout: 3000,
          })
          return false
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to fetch tasks'
        Notify.create({
          message: errorMessage,
          color: 'negative',
          position: 'top',
          timeout: 3000,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * Add a new task
     */
    async addTask(payload) {
      try {
        const response = await axios.post('/task/', payload)
        if (response.data?.success) {
          Notify.create({
            message: response.data?.message || 'Task added successfully!',
            color: 'positive',
            position: 'top',
            timeout: 2000,
          })
          // Refetch tasks to ensure filter is applied
          await this.fetchTasks()
          return true
        } else {
          const errorMessage = response.data?.message || 'Failed to add task'
          Notify.create({
            message: errorMessage,
            color: 'negative',
            position: 'top',
            timeout: 3000,
          })
          return false
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to add task'
        Notify.create({
          message: errorMessage,
          color: 'negative',
          position: 'top',
          timeout: 3000,
        })
        return false
      }
    },

    /**
     * Update a task
     */
    async updateTask(taskId, payload) {
      if (taskId === null || taskId === undefined || taskId === '') {
        Notify.create({
          message: 'Task ID is missing',
          color: 'negative',
          position: 'top',
          timeout: 3000,
        })
        return false
      }

      try {
        const response = await axios.put(`/task/${taskId}`, payload)
        if (response.data?.success) {
          const taskIndex = this.tasks.findIndex((t) => t.entity_id === taskId)
          if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...payload }
          }
          Notify.create({
            message: response.data?.message || 'Task updated successfully!',
            color: 'positive',
            position: 'top',
            timeout: 2000,
          })
          return true
        } else {
          const errorMessage = response.data?.message || 'Failed to update task'
          Notify.create({
            message: errorMessage,
            color: 'negative',
            position: 'top',
            timeout: 3000,
          })
          return false
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to update task'
        Notify.create({
          message: errorMessage,
          color: 'negative',
          position: 'top',
          timeout: 3000,
        })
        return false
      }
    },

    /**
     * Mark task as complete/incomplete
     */
    async toggleTaskComplete(taskId) {
      const task = this.tasks.find((t) => t.entity_id === taskId)
      if (!task) return false

      return await this.updateTask(taskId, {
        completed: !task.completed,
      })
    },

    /**
     * Delete a task
     */
    async deleteTask(taskId) {
      if (!taskId) {
        Notify.create({
          message: 'Task ID is missing',
          color: 'negative',
          position: 'top',
          timeout: 3000,
        })
        return false
      }

      try {
        const response = await axios.delete(`/task/${taskId}`)
        if (response.data?.success) {
          const taskIndex = this.tasks.findIndex((t) => t.entity_id === taskId)
          if (taskIndex !== -1) {
            this.tasks.splice(taskIndex, 1)
          }
          Notify.create({
            message: response.data?.message || 'Task deleted successfully!',
            color: 'positive',
            position: 'top',
            timeout: 2000,
          })
          return true
        } else {
          const errorMessage = response.data?.message || 'Failed to delete task'
          Notify.create({
            message: errorMessage,
            color: 'negative',
            position: 'top',
            timeout: 3000,
          })
          return false
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to delete task'
        Notify.create({
          message: errorMessage,
          color: 'negative',
          position: 'top',
          timeout: 3000,
        })
        return false
      }
    },

    /**
     * Set filter (client-side filtering)
     */
    setFilter(filter) {
      this.filter = filter
    },

    /**
     * Toggle all tasks completion status
     */
    async toggleAllTasks(completed) {
      const tasksToUpdate = this.tasks.filter((task) => task.completed !== completed)

      if (tasksToUpdate.length === 0) return true

      try {
        tasksToUpdate.forEach((task) => {
          const taskIndex = this.tasks.findIndex((t) => t.entity_id === task.entity_id)
          if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], completed }
          }
        })

        const updatePromises = tasksToUpdate.map((task) => {
          return axios.put(`/task/${task.entity_id}`, { completed })
        })

        await Promise.all(updatePromises)
        await this.fetchTasks()
        return true
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to toggle all tasks'
        Notify.create({
          message: errorMessage,
          color: 'negative',
          position: 'top',
          timeout: 3000,
        })
        return false
      }
    },

    /**
     * Clear all completed tasks
     */
    async clearCompleted() {
      const completedTasks = this.tasks.filter((task) => task.completed)

      if (completedTasks.length === 0) return true

      try {
        const deletePromises = completedTasks.map((task) => {
          return axios.delete(`/task/${task.entity_id}`)
        })

        await Promise.all(deletePromises)
        await this.fetchTasks()
        return true
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to clear completed tasks'
        Notify.create({
          message: errorMessage,
          color: 'negative',
          position: 'top',
          timeout: 3000,
        })
        return false
      }
    },
  },
})

// Hot Module Replacement support
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTasksStore, import.meta.hot))
}
