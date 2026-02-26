export type ProjectStatus = 'active' | 'archived'

export interface Project {
	id: number
	name: string
	description?: string
	taskCount: number
	status: ProjectStatus
	createdAt: string
}
