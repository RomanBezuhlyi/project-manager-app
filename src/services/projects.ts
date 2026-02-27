import { api } from './api'

export const fetchProjects = async () => {
	const res = await api.get('/projects')
	return res.data
}

export const addProject = async (project: any) => {
	const res = await api.post('/projects', project)
	return res.data
}
