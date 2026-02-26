import ProjectPage from '@/views/ProjectDetailView.vue'
import ProjectsPage from '@/views/ProjectsView.vue'
import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/', name: 'projects', component: ProjectsPage },
		{
			path: '/project/:id',
			name: 'project',
			component: ProjectPage,
			props: true,
		},
	],
})
