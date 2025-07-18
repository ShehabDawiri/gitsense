import simpleGit, { SimpleGit, DefaultLogFields } from "simple-git"
import { GoogleGenAI } from "@google/genai"
import dotenv from "dotenv"

interface Commit {
  hash: string
  author_name: string
  author_email: string
  date: string
  message: string
}

dotenv.config()

const ai = new GoogleGenAI({})

async function getAllCommits(
  repoPath: string = "."
): Promise<Commit[] | undefined> {
  const git: SimpleGit = simpleGit(repoPath)

  try {
    const log = await git.log()
    const commits = log.all

    return commits.map((commit: DefaultLogFields) => {
      return {
        hash: commit.hash,
        author_name: commit.author_name,
        author_email: commit.author_email,
        date: commit.date,
        message: commit.message,
      } as Commit
    })
  } catch (err) {
    console.error("Failed to get commits:", err)
  }
}

async function summarizeCommits(commits: Commit[]) {
  const commitMessages = commits.map((c) => `- ${c.message}`).join("\n")

  const prompt = `
You are a code assistant. Please analyze the following Git commit messages and provide:
1. A high-level summary of the changes.
2. The main features or fixes added.
3. Any refactorings or improvements.
4. A changelog-style bullet list.
5. Anything unusual or potentially risky.

Commits:
${commitMessages}
  `

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  })

  // assuming response.text() returns the result content
  if (!response || !response.text) {
    console.error("Failed to get response from AI model")
    return
  }
  const result = response.text
  return result
}

async function main() {
  const commits = await getAllCommits()
  if (commits) {
    const summary = await summarizeCommits(commits)
    console.log("Summary of commits:\n", summary)
  }
}

main()
