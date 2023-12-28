import IP from 'ip'
import { Request, Response } from 'express'
import { ResultSetHeader } from 'mysql2/promise'

import { fetchPosts } from '../utils/fetchPosts'
import { SearchAction, MatchRecord, Post } from '../utils/types'
import conn from '../config/db'

export interface RequestWithUserId extends Request {
    userId: number
}

export const search = async (req: Request, res: Response): Promise<void> => {
    const requestWithUserId = req as RequestWithUserId
    const keyword = requestWithUserId.query.keyword as string

    if (!keyword) {
        res.status(406).json('Mandatory query parameter - keyword is missing')
        return
    }

    // Fetch data from external API
    const posts = await fetchPosts()

    // Filter matching posts based on the keyword
    const matchingPosts: MatchRecord[] = posts
        .filter((post: Post) => post.title.includes(keyword.toLowerCase()) || post.body.includes(keyword.toLowerCase()))
        .map((post: Post) => ({
            postId: post.id,
            userId: post.userId,
            title: post.title,
            body: post.body,
        }))

    const userSearch: SearchAction = {
        ipAddr: IP.address(),
        keyword,
        timestamp: new Date(),
    }

    try {
        const [result] = await (
            await conn
        ).execute('INSERT INTO search_actions (ip_addr, keyword, timestamp, userId) VALUES (?, ?, ?, ?)', [
            userSearch.ipAddr,
            keyword,
            userSearch.timestamp,
            requestWithUserId.userId,
        ])
        const searchActionId = (result as ResultSetHeader).insertId

        for (const post of matchingPosts) {
            await (
                await conn
            ).execute('INSERT INTO match_records (search_action_id, post_id, user_id, title, body) VALUES (?, ?, ?, ?, ?)', [
                searchActionId,
                post.postId,
                post.userId,
                post.title,
                post.body,
            ])
        }

        await (await conn).commit()

        res.status(200).json(matchingPosts)
    } catch (error) {
        await (await conn).rollback()
        console.error('Error while processing search', error)
        res.status(500).json({ error: 'Failed to process search' })
    }
}
