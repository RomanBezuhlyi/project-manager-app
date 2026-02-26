export type TaskStatus = 'To Do' | 'In Progress' | 'Done'

export interface Task {
	id: number
	projectId: number
	title: string
	assignee: string
	status: TaskStatus
	dueDate: string
	order: number
}
