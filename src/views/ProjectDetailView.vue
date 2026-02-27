<template>
	<DefaultLayout>
		<div class="container">
			<div class="page-header">
				<div class="page-header-description">
					<h2>Проєкт #{{ props.id }}</h2>
					<p class="project-description">{{ project?.description }}</p>
				</div>
				<button class="btn-primary" @click="openModal">Додати завдання</button>
			</div>

			<!-- Tabs -->
			<div class="tabs">
				<button
					:class="{ active: activeTab === 'table' }"
					@click="activeTab = 'table'"
				>
					Таблиця
				</button>
				<button
					:class="{ active: activeTab === 'board' }"
					@click="activeTab = 'board'"
				>
					Дошка
				</button>
			</div>

			<div v-if="activeTab === 'table'">
				<Table
					:columns="columns"
					:data="tasksForProject"
					:filters="tableFilters"
					:draggable="true"
					@reorder="onTasksReorder"
					@row-delete="onDeleteTask"
				/>
			</div>

			<div v-if="activeTab === 'board'">
				<Board
					:project-id="props.id"
					:filter-assignee="filterAssignee"
					:filter-status="filterStatus"
				/>
			</div>

			<Modal
				type="task"
				:project-id="props.id"
				:assignees="assignees"
				:show="showModal"
				@close="showModal = false"
			/>
		</div>
	</DefaultLayout>
</template>

<script setup lang="ts">
import Board from '@/components/Board.vue'
import Modal from '@/components/Modal.vue'
import Table from '@/components/Table.vue'
import DefaultLayout from '@/layout/DefaultLayout.vue'
import { useProjectsStore } from '@/store/projects'
import { useTasksStore } from '@/store/tasks'
import { useUsersStore } from '@/store/users'
import type { Task, TaskStatus } from '@/types/task'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps<{ id: number }>()
const tasks = useTasksStore()
const users = useUsersStore()
const projects = useProjectsStore()

const showModal = ref(false)
const activeTab = ref<'table' | 'board'>(
	(localStorage.getItem(`project-tab-${props.id}`) as 'table' | 'board') ||
		'table'
)
const filterAssignee = ref(tasks.filters.assignee ?? '')
const filterStatus = ref(tasks.filters.status ?? '')

watch(activeTab, newTab => {
	localStorage.setItem(`project-tab-${props.id}`, newTab)
})

watch([filterAssignee, filterStatus], () => {
	tasks.setFilters({
		assignee: filterAssignee.value || '',
		status: (filterStatus.value as TaskStatus) || null,
	})
})
const assignees = computed(() => users.assignees ?? [])

const tasksForProject = computed(() => {
	const projectTasks = tasks.byProject(props.id) ?? []
	return projectTasks
		.filter(
			t =>
				(!filterAssignee.value || t.assignee === filterAssignee.value) &&
				(!filterStatus.value || t.status === filterStatus.value)
		)
		.map((t, index) => ({ ...t, order: index }))
})

const columns = [
	{ key: 'id', label: 'ID', sortable: true },
	{ key: 'title', label: 'Назва', sortable: true },
	{ key: 'assignee', label: 'Виконавець', sortable: true },
	{ key: 'status', label: 'Статус', sortable: true },
	{
		key: 'dueDate',
		label: 'Термін',
		sortable: true,
		render: (row: Task) => new Date(row.dueDate).toLocaleDateString(),
	},
]

const assigneeFilterOptions = computed(() =>
	assignees.value.map(a => ({ value: a, label: a }))
)

const tableFilters = computed(() => [
	{
		label: 'Виконавець:',
		key: 'assignee',
		type: 'select',
		options: assigneeFilterOptions.value,
	},
	{
		label: 'Статус:',
		key: 'status',
		type: 'select',
		options: [
			{ value: 'To Do', label: 'To Do' },
			{ value: 'In Progress', label: 'In Progress' },
			{ value: 'Done', label: 'Done' },
		],
	},
])

onMounted(async () => {
	await projects.fetchAll()
	await tasks.fetchAll()
	console.log(projects)
})

const project = computed(() =>
	projects.items.find(p => p.id === Number(props.id))
)

function openModal() {
	showModal.value = true
}

function onTasksReorder(orderedIds: string[]) {
	tasks.reorder(
		props.id,
		orderedIds.map(id => Number(id))
	)
}

function onDeleteTask(row: Task) {
	tasks.remove(row.id)
}
</script>
