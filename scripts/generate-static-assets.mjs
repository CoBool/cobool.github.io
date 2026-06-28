import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { readPostsFromDirectory } from "../src/lib/posts.ts"
import { buildRssFeed } from "../src/lib/rss.ts"

const postsDirectory = join(process.cwd(), "content", "posts")
const publicDirectory = join(process.cwd(), "public")

const posts = readPostsFromDirectory(postsDirectory)

mkdirSync(publicDirectory, { recursive: true })
writeFileSync(join(publicDirectory, "rss.xml"), buildRssFeed(posts), "utf8")
