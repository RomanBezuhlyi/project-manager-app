import axios from 'axios'

const API_BASE = import.meta.env.DEV
	? '/api'
	: 'https://json-server-prod.onrender.com'

export const api = axios.create({
	baseURL: API_BASE,
	headers: { 'Content-Type': 'application/json' },
})
