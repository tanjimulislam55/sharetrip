import axios from 'axios'
import { Post } from './types'

export async function fetchPosts(): Promise<Post[]> {
    try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts')
        return response.data
    } catch (error) {
        console.error('Error while fetching posts:', error)
        throw error
    }
}
