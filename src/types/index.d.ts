export interface Commit {
  hash: string
  author_name: string
  author_email: string
  date: string
  message: string
}

export interface Summary {
  summary: string
}

export type formatType = {
  name: string
  instructions: string
}
