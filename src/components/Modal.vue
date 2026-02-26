<template>
	<div v-if="show" class="modal">
		<div class="modal-content">
			<button class="btn btn-outline modal-close" @click="onClose()">
				<img src="../assets/close.svg" alt="close" />
			</button>

			<h3>{{ projectId ? 'Нове завдання' : 'Новий проєкт' }}</h3>

			<template v-if="!projectId">
				<input
					v-model="name"
					placeholder="Назва (обов'язково)"
					:class="{ error: errors.name }"
				/>
				<textarea
					v-model="description"
					placeholder="Опис"
					:class="{ error: errors.description }"
				></textarea>
			</template>

			<template v-else>
				<label>
					<span>Назва:</span>
					<input
						v-model="title"
						placeholder="Назва"
						:class="{ error: errors.title }"
					/>
					<small v-if="errors.title" class="err">{{ errors.title }}</small>
				</label>

				<label>
					<span>Виконавець:</span>
					<select v-model="assignee" :class="{ error: errors.assignee }">
						<option value="">Оберіть</option>
						<option v-for="a in assignees" :key="a" :value="a">{{ a }}</option>
					</select>
					<small v-if="errors.assignee" class="err">{{
						errors.assignee
					}}</small>
				</label>

				<label>
					<span>Статус:</span>
					<select v-model="status" :class="{ error: errors.status }">
						<option value="To Do">To Do</option>
						<option value="In Progress">In Progress</option>
						<option value="Done">Done</option>
					</select>
				</label>

				<label>
					<span>Термін:</span>
					<input
						type="date"
						v-model="dueDate"
						:min="today"
						:class="{ error: errors.dueDate }"
					/>
					<small v-if="errors.dueDate" class="err">{{ errors.dueDate }}</small>
				</label>
			</template>

			<button class="btn btn-primary" @click="submit">Зберегти</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useProjectsStore } from '@/store/projects'
import { useTasksStore } from '@/store/tasks'
import { computed, ref } from 'vue'

const props = defineProps<{
	show: boolean
	onClose: () => void
	projectId?: number
	assignees?: string[]
}>()

const projects = useProjectsStore()
const tasks = useTasksStore()

const name = ref('')
const description = ref('')

const title = ref('')
const assignee = ref(props.assignees?.[0] ?? '')
const status = ref<'To Do' | 'In Progress' | 'Done'>('To Do')
const dueDate = ref('')
const errors = ref<Record<string, string>>({})

const today = computed(() => new Date().toISOString().split('T')[0])

function validate() {
	errors.value = {}

	if (props.projectId) {
		if (!title.value.trim()) errors.value.title = 'Назва обов’язкова'
		if (!assignee.value.trim()) errors.value.assignee = 'Оберіть виконавця'
		if (!dueDate.value.trim()) errors.value.dueDate = 'Вкажіть термін'
	} else {
		if (!name.value.trim()) errors.value.name = 'Назва обов’язкова'
	}

	return Object.keys(errors.value).length === 0
}

async function submit() {
	if (!validate()) return

	if (props.projectId) {
		await tasks.add({
			projectId: props.projectId,
			title: title.value.trim(),
			assignee: assignee.value.trim(),
			status: status.value,
			dueDate: dueDate.value,
		})
		title.value = ''
		assignee.value = props.assignees?.[0] ?? ''
		status.value = 'To Do'
		dueDate.value = ''
	} else {
		projects.add({
			name: name.value.trim(),
			description: description.value.trim(),
			status: 'active',
		})
		name.value = ''
		description.value = ''
	}

	props.onClose()
}
</script>
