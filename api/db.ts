import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'fs'
import path from 'path'

export default function handler(req: VercelRequest, res: VercelResponse) {
	const filePath = path.join(process.cwd(), 'db.json')
	const db = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

	switch (req.method) {
		case 'GET':
			res.status(200).json(db)
			break
		case 'POST':
			const newData = req.body
			db.push(newData)
			fs.writeFileSync(filePath, JSON.stringify(db, null, 2))
			res.status(201).json(newData)
			break
		default:
			res.status(405).json({ message: 'Method not allowed' })
	}
}
