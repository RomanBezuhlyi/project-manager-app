import { api } from '@/services/api'
import type { Task, TaskStatus } from '@/types/task'
import { save } from '@/utils/persistence'
import { defineStore } from 'pinia'
import { useToast } from 'vue-toast-notification'

const toast = useToast()

type SortKey = 'dueDate' | 'status'

export const useTasksStore = defineStore('tasks', {
	state: () => ({
		items: [] as Task[],
		sort: { key: 'dueDate', dir: 'asc' } as {
			key: SortKey
			dir: 'asc' | 'desc'
		},
		filters: { assignee: '', status: null as TaskStatus | null },
	}),
	getters: {
		byProject: state => (projectId: number) =>
			state.items.filter(t => t.projectId === projectId),
		lanes: state => (projectId: number) => {
			const group: Record<TaskStatus, Task[]> = {
				'To Do': [],
				'In Progress': [],
				Done: [],
			}
			state.items
				.filter(t => t.projectId === projectId)
				.forEach(t => group[t.status].push(t))
			for (const k of Object.keys(group) as TaskStatus[]) {
				group[k].sort((a, b) => a.order - b.order)
			}
			return group
		},
	},
	actions: {
		async fetchAll() {
			const { data } = await api.get<Task[]>('/tasks')
			this.items = data
			save('tasks.items', this.items)
		},
		setSort(key: SortKey) {
			const dir =
				this.sort.key === key && this.sort.dir === 'asc' ? 'desc' : 'asc'
			this.sort = { key, dir }
			save('tasks.sort', this.sort)
		},
		setFilters(
			partial: Partial<{ assignee: string; status: TaskStatus | null }>
		) {
			this.filters = { ...this.filters, ...partial }
			save('tasks.filters', this.filters)
		},
		async add(task: Omit<Task, 'id' | 'order'>) {
			try {
				const siblingCount = this.items.filter(
					t => t.projectId === task.projectId && t.status === task.status
				).length
				const payload = { order: siblingCount, ...task }
				const { data } = await api.post<Task>('/tasks', payload)
				this.items.push(data)
				save('tasks.items', this.items)
				toast.success('Завдання успішно додано!')
			} catch {
				toast.error('Не вдалося додати завдання')
			}
		},
		async patch(id: number, partial: Partial<Task>) {
			const { data } = await api.patch<Task>(`/tasks/${id}`, partial)
			const i = this.items.findIndex(t => t.id === id)
			if (i !== -1 && this.items[i]) {
				Object.assign(this.items[i], data)
			}
			save('tasks.items', this.items)
		},
		reorder(projectId: number, taskIdsInOrder: number[]) {
			const mapIdx = new Map(taskIdsInOrder.map((id, idx) => [id, idx]))
			this.items
				.filter(t => t.projectId === projectId)
				.forEach(t => {
					t.order = mapIdx.get(t.id) ?? t.order
				})
			save('tasks.items', this.items)
		},
		async moveToStatus(taskId: number, status: TaskStatus, newIndex: number) {
			try {
				const t = this.items.find(x => x.id === taskId)
				if (!t) return
				t.status = status
				t.order = newIndex

				const lane = this.items
					.filter(x => x.projectId === t.projectId && x.status === status)
					.sort((a, b) => a.order - b.order)
					.map((x, i) => ({ ...x, order: i }))

				for (const x of lane) {
					const i = this.items.findIndex(y => y.id === x.id)
					if (i !== -1 && this.items[i]) {
						Object.assign(this.items[i], x)
						await this.patch(x.id, { status: x.status, order: x.order })
					}
				}

				save('tasks.items', this.items)
				toast.success('Завдання переміщено')
			} catch {
				toast.error('Не вдалося перемістити завдання')
			}
		},
		async remove(taskId: number) {
			try {
				await api.delete(`/tasks/${taskId}`)
				this.items = this.items.filter(t => t.id !== taskId)
				save('tasks.items', this.items)
				toast.success('Завдання успішно видалено!')
			} catch {
				toast.error('Не вдалося видалити завдання')
			}
		},
	},
})
