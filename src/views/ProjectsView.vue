<template>
	<DefaultLayout>
		<div class="container">
			<div class="page-header">
				<h2>Список проєктів</h2>
				<button class="btn-primary" @click="showModal = true">
					Додати проєкт
				</button>
			</div>

			<Table
				:columns="columns"
				:data="projectsWithStatus"
				:filters="tableFilters"
				@row-click="goToProject"
			/>

			<Modal type="project" :show="showModal" @close="showModal = false" />
		</div>
	</DefaultLayout>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal.vue'
import Table from '@/components/Table.vue'
import DefaultLayout from '@/layout/DefaultLayout.vue'
import { useProjectsStore } from '@/store/projects'
import { useTasksStore } from '@/store/tasks'
import type { Project } from '@/types/project'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const projects = useProjectsStore()
const tasks = useTasksStore()
const router = useRouter()
const showModal = ref(false)

const projectsWithStatus = computed(() =>
	projects.items.map(p => {
		const projectTasks = tasks.items.filter(t => t.projectId == p.id)
		const taskCount = projectTasks.length

		const status =
			projectTasks.length && projectTasks.every(t => t.status == 'Done')
				? 'Completed'
				: 'Active'
		return { ...p, taskCount, status }
	})
)

const columns = [
	{ key: 'id', label: 'ID', sortable: true },
	{ key: 'name', label: 'Назва', sortable: true },
	{ key: 'taskCount', label: 'Кількість завдань', sortable: true },
	{ key: 'status', label: 'Статус', sortable: true },
	{
		key: 'createdAt',
		label: 'Створено',
		sortable: true,
		render: (row: Project) => new Date(row.createdAt).toLocaleDateString(),
	},
]

const tableFilters = [
	{
		label: 'Пошук:',
		key: 'name',
		type: 'text',
		placeholder: 'Пошук за назвою',
	},
	{
		label: 'Статус:',
		key: 'status',
		type: 'select',
		options: [
			{ value: 'active', label: 'Active' },
			{ value: 'completed', label: 'Completed' },
		],
	},
]

function goToProject(row: any) {
	router.push(`/project/${row.id}`)
}

onMounted(async () => {
	await projects.fetchAll()
	await tasks.fetchAll()
})
</script>
