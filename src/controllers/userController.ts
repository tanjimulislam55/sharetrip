import { Request, Response } from 'express'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

import { comparePassword, createToken, encryptPassword } from '../utils/auth'
import conn from '../config/db'

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            res.status(403).json('Fields required for email and password')
            return
        }
        const [rows] = await (await conn).execute<RowDataPacket[]>('SELECT email FROM users WHERE email = ?', [email])
        const existingUser = rows[0] as RowDataPacket | undefined
        if (existingUser) res.status(403).json('Email already in use')
        else {
            const hashedPassword = await encryptPassword(password)
            const [result] = await (await conn).execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword])
            const userId = (result as ResultSetHeader).insertId
            res.status(201).json(`User has been created with id ${userId}`)
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server Error' })
    }
}

export const signin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            res.status(403).json('Fields required for email and password')
            return
        }
        const [rows] = await (await conn).execute<RowDataPacket[]>('SELECT email, password FROM users WHERE email = ?', [email])
        const user = rows[0] as RowDataPacket | undefined

        if (!user) {
            res.status(404).json({ message: 'User not found' })
            return
        }

        const isVerified = await comparePassword(user.password, password)

        if (!isVerified) {
            res.status(403).json({ message: 'Incorrect password' })
            return
        } else {
            const jwt = createToken(user.email, 'ACCESS_TOKEN')
            res.status(200)
                .cookie('token', jwt, {
                    httpOnly: true,
                    sameSite: 'strict',
                    secure: true,
                })
                .json({
                    id: user.id,
                    email: user.email,
                })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server Error' })
    }
}
