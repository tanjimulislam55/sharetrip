export interface SearchAction {
    ipAddr: string
    keyword: string
    timestamp: Date
}

export interface MatchRecord {
    postId: number
    userId: number
    title: string
    body: string
}

export interface Post {
    id: number
    userId: number
    title: string
    body: string
}

export interface User {
    email: string
    password: string
}
