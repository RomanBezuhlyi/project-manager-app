import { api } from '@/services/api'
import type { Project } from '@/types/project'
import { save } from '@/utils/persistence'
import { defineStore } from 'pinia'
import { useToast } from 'vue-toast-notification'

const toast = useToast()

type SortKey = 'id' | 'name' | 'taskCount' | 'status' | 'createdAt'

export const useProjectsStore = defineStore('projects', {
	state: () => ({
		items: [] as Project[],
		sort: { key: 'id', dir: 'asc' } as { key: SortKey; dir: 'asc' | 'desc' },
		filters: { name: '', status: null as string | null },
	}),
	actions: {
		async fetchAll() {
			const { data } = await api.get<Project[]>('/projects')
			this.items = data
			save('projects.items', this.items)
		},
		setSort(key: SortKey) {
			const dir =
				this.sort.key === key && this.sort.dir === 'asc' ? 'desc' : 'asc'
			this.sort = { key, dir }
			save('projects.sort', this.sort)
		},
		setFilters(partial: Partial<{ name: string; status: string | null }>) {
			this.filters = { ...this.filters, ...partial }
			save('projects.filters', this.filters)
		},
		async add(project: Omit<Project, 'id' | 'taskCount' | 'createdAt'>) {
			try {
				const payload = {
					taskCount: 0,
					createdAt: new Date().toISOString(),
					...project,
				}
				const { data } = await api.post<Project>('/projects', payload)
				this.items.push(data)
				save('projects.items', this.items)
				toast.success('Проєкт успішно додано!')
			} catch {
				toast.error('Не вдалося додати проєкт')
			}
		},
		async remove(projectId: number) {
			try {
				await api.delete(`/projects/${projectId}`)
				this.items = this.items.filter(p => p.id !== projectId)
				save('projects.items', this.items)
				toast.success('Проєкт успішно видалено!')
			} catch {
				toast.error('Не вдалося видалити проєкт')
			}
		},
	},
})
