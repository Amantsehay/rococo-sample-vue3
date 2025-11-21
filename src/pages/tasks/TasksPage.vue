<template>
  <q-page class="bg-grey-1">
    <div class="todoapp-container">
      <h1 class="todo-title">todos</h1>

      <section class="todoapp-section">
        <!-- Header -->
        <header>
          <input
            v-model="newTaskTitle"
            type="text"
            placeholder="What needs to be done?"
            class="new-todo-input"
            @keyup.enter="onAddTask"
            autofocus
          />
        </header>

        <!-- Main Section -->
        <section v-if="tasksStore.tasks.length > 0" class="main-section">
          <!-- Toggle All -->
          <div class="toggle-all-wrapper">
            <input
              id="toggle-all"
              type="checkbox"
              class="toggle-all-input"
              :checked="allCompleted"
              @change="toggleAll"
            />
            <label for="toggle-all" class="toggle-all-label">Mark all as complete</label>
          </div>

          <!-- Todo List -->
          <ul class="todo-list">
            <li
              v-for="task in tasksStore.filteredTasks"
              :key="getTaskId(task)"
              :class="{
                completed: task.completed,
                editing: editingId === getTaskId(task),
              }"
              class="todo-item"
            >
              <!-- View Mode -->
              <div v-if="editingId !== getTaskId(task)" class="view">
                <input
                  type="checkbox"
                  class="todo-toggle"
                  :checked="task.completed"
                  @change="toggleTask(getTaskId(task))"
                />
                <label class="todo-label" @dblclick="startEdit(task)">
                  {{ task.title }}
                </label>
                <button class="destroy-btn" @click="deleteTask(getTaskId(task))">×</button>
              </div>

              <!-- Edit Mode -->
              <input
                v-else
                v-model="editingTitle"
                type="text"
                class="edit-input"
                @blur="finishEdit"
                @keyup.enter="finishEdit"
                @keyup.esc="cancelEdit"
              />
            </li>
          </ul>
        </section>

        <!-- Footer -->
        <footer v-if="tasksStore.tasks.length > 0" class="footer-wrapper">
          <span class="todo-count">
            <strong>{{ activeCount }}</strong>
            {{ activeCount === 1 ? 'item' : 'items' }} left
          </span>

          <ul class="filters-list">
            <li>
              <button
                type="button"
                :class="{ selected: tasksStore.filter === 'all' }"
                @click.stop="handleFilterChange('all')"
                class="filter-link"
              >
                All
              </button>
            </li>
            <li>
              <button
                type="button"
                :class="{ selected: tasksStore.filter === 'active' }"
                @click.stop="handleFilterChange('active')"
                class="filter-link"
              >
                Active
              </button>
            </li>
            <li>
              <button
                type="button"
                :class="{ selected: tasksStore.filter === 'completed' }"
                @click.stop="handleFilterChange('completed')"
                class="filter-link"
              >
                Completed
              </button>
            </li>
          </ul>

          <div class="clear-completed-wrapper">
            <button v-if="completedCount > 0" class="clear-completed-btn" @click="clearCompleted">
              Clear completed
            </button>
          </div>
        </footer>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useTasksStore } from 'stores/tasks'

const tasksStore = useTasksStore()

const newTaskTitle = ref('')
const editingId = ref(null)
const editingTitle = ref('')

onMounted(() => {
  tasksStore.fetchTasks()
})

// Focus edit input when editing starts
watch(editingId, async (newId) => {
  if (newId) {
    await nextTick()
    const editInput = document.querySelector('.edit-input')
    if (editInput) {
      editInput.focus()
      editInput.select()
    }
  }
})

const allCompleted = computed(() => {
  return tasksStore.tasks.length > 0 && tasksStore.tasks.every((task) => task.completed)
})

const activeCount = computed(() => {
  return tasksStore.tasks.filter((task) => !task.completed).length
})

const completedCount = computed(() => {
  return tasksStore.tasks.filter((task) => task.completed).length
})

function getTaskId(task) {
  return task?.entity_id || null
}

async function onAddTask() {
  if (!newTaskTitle.value.trim()) return

  const success = await tasksStore.addTask({
    title: newTaskTitle.value.trim(),
  })

  if (success) {
    newTaskTitle.value = ''
  }
}

async function toggleTask(taskId) {
  await tasksStore.toggleTaskComplete(taskId)
}

async function toggleAll(event) {
  const shouldComplete = event.target.checked
  await tasksStore.toggleAllTasks(shouldComplete)
}

function startEdit(task) {
  editingId.value = getTaskId(task)
  editingTitle.value = task.title
}

function cancelEdit() {
  editingId.value = null
  editingTitle.value = ''
}

async function finishEdit() {
  if (!editingId.value) {
    return
  }

  if (!editingTitle.value.trim()) {
    await deleteTask(editingId.value)
    return
  }

  const taskId = editingId.value
  const success = await tasksStore.updateTask(taskId, {
    title: editingTitle.value.trim(),
  })

  if (success) {
    editingId.value = null
    editingTitle.value = ''
  }
}

async function deleteTask(taskId) {
  await tasksStore.deleteTask(taskId)
}

function handleFilterChange(filter) {
  tasksStore.filter = filter
}

async function clearCompleted() {
  await tasksStore.clearCompleted()
}
</script>

<style scoped lang="scss">
@import '@/styles/pages/TasksPage';
</style>
