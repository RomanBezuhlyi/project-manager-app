<template>
	<div class="container">
		<div class="filters">
			<label>
				<span class="filter-label">Виконавець:</span>
				<select v-model="filterAssignee">
					<option value="">Всі</option>
					<option v-for="a in assignees" :key="a" :value="a">{{ a }}</option>
				</select>
			</label>

			<label>
				<span class="filter-label">Статус:</span>
				<select v-model="filterStatus">
					<option value="">Всі</option>
					<option value="To Do">To Do</option>
					<option value="In Progress">In Progress</option>
					<option value="Done">Done</option>
				</select>
			</label>
		</div>

		<div class="board">
			<div
				v-for="status in ['To Do', 'In Progress', 'Done']"
				:key="status"
				class="lane"
			>
				<h3>{{ status }}</h3>

				<draggable
					v-model="lanes[status as TaskStatus]"
					item-key="id"
					group="tasks"
					ghost-class="drag-ghost"
					chosen-class="drag-chosen"
					@change="onChange($event, status as TaskStatus)"
				>
					<template #item="{ element }">
						<div class="card">
							<strong>{{ element.title }}</strong>
							<div class="meta">
								{{ element.assignee }} · {{ formatDate(element.dueDate) }}
							</div>
						</div>
					</template>
				</draggable>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useTasksStore } from '@/store/tasks'
import { useUsersStore } from '@/store/users'
import type { TaskStatus } from '@/types/task'
import { formatDate } from '@/utils/date'
import { computed, ref, watch } from 'vue'
import draggable from 'vuedraggable'

interface DragChangeEvent<T = any> {
	added?: { element: T; newIndex: number }
	removed?: { element: T; oldIndex: number }
	moved?: { element: T; oldIndex: number; newIndex: number }
}

const props = defineProps<{ projectId: number }>()
const tasks = useTasksStore()
const users = useUsersStore()

const assignees = computed(() => users.assignees ?? [])
const filterAssignee = ref('')
const filterStatus = ref('')

const lanes = ref<Record<TaskStatus, any[]>>({
	'To Do': [],
	'In Progress': [],
	Done: [],
})

watch(
	[() => tasks.items, filterAssignee, filterStatus],
	() => {
		const list = tasks.items.filter(t => t.projectId === props.projectId)

		const filtered = list.filter(
			t =>
				(!filterAssignee.value ||
					t.assignee
						.toLowerCase()
						.includes(filterAssignee.value.toLowerCase())) &&
				(!filterStatus.value || t.status === filterStatus.value)
		)

		lanes.value['To Do'] = filtered
			.filter(t => t.status === 'To Do')
			.sort((a, b) => a.order - b.order)
		lanes.value['In Progress'] = filtered
			.filter(t => t.status === 'In Progress')
			.sort((a, b) => a.order - b.order)
		lanes.value['Done'] = filtered
			.filter(t => t.status === 'Done')
			.sort((a, b) => a.order - b.order)
	},
	{ immediate: true, deep: true }
)

async function onChange(evt: DragChangeEvent, status: TaskStatus) {
	const added = evt.added?.element
	if (added) {
		await tasks.patch(added.id, { status })
		await tasks.moveToStatus(added.id, status, 0)
	}
}
</script>
