import { defineStore } from 'pinia'

export const useUsersStore = defineStore('users', {
	state: () => ({
		assignees: ['Іван', 'Марія', 'Олег', 'Світлана'] as string[],
	}),
})
