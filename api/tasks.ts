import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'fs'
import path from 'path'

const FILE = path.join(process.cwd(), 'db.json')

export default function handler(req: VercelRequest, res: VercelResponse) {
	const db = JSON.parse(fs.readFileSync(FILE, 'utf-8'))

	switch (req.method) {
		case 'GET':
			res.status(200).json(db.tasks)
			break
		case 'POST':
			const newTask = req.body
			db.tasks.push(newTask)
			fs.writeFileSync(FILE, JSON.stringify(db, null, 2))
			res.status(201).json(newTask)
			break
		case 'PATCH':
			const id = Number(req.url?.split('/')[2]) // /tasks/:id
			const index = db.tasks.findIndex((t: any) => t.id === id)
			if (index === -1) return res.status(404).json({ message: 'Not found' })
			Object.assign(db.tasks[index], req.body)
			fs.writeFileSync(FILE, JSON.stringify(db, null, 2))
			res.status(200).json(db.tasks[index])
			break
		default:
			res.status(405).json({ message: 'Method not allowed' })
	}
}
