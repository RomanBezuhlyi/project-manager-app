import { defineStore } from 'pinia'

export const useUsersStore = defineStore('users', {
	state: () => ({
		assignees: ['Всі', 'Іван', 'Марія', 'Олег', 'Світлана'] as string[],
	}),
})
