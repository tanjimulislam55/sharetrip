import { Request, Response, NextFunction } from 'express'
import { RowDataPacket } from 'mysql2'
import jwt from 'jsonwebtoken'
require('dotenv').config()

import conn from '../config/db'

export interface RequestWithUserId extends Request {
    userId: number | null
}

export const getAuthenticatedUser = async (req: Request, res: Response, next: NextFunction) => {
    const requestWithUserId = req as RequestWithUserId
    const token = requestWithUserId.headers['authorization']?.split('Bearer ')[1]?.trim()
    if (!token) {
        // allows public users
        requestWithUserId.userId = null
        next()
    } else {
        try {
            const tokenData = jwt.verify(token, process.env.SECRET_KEY!)
            if (typeof tokenData === 'string') {
            } else {
                const { email } = tokenData
                const [rows] = await (await conn).execute<RowDataPacket[]>('SELECT email, id FROM users WHERE email = ?', [email])
                const user = rows[0] as RowDataPacket | undefined
                if (!user) {
                    return res.status(404).json({
                        message: 'User not found',
                    })
                } else {
                    requestWithUserId.userId = user.id
                    next()
                }
            }
        } catch (error) {
            return res.status(403).json({
                message: 'Could not validate credentials',
            })
        }
    }
}
