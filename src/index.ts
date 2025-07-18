#!/usr/bin/env node
/**
 * This script retrieves the last 100 Git commits from the current repository
 * and summarizes them using Google GenAI.
 *
 * It requires the GEMINI_API_KEY to be set in the environment variables.
 */

import simpleGit, { SimpleGit, DefaultLogFields } from "simple-git"
import { GoogleGenAI } from "@google/genai"

// Load environment variables from .env file
import { config as loadEnv } from "dotenv"

// Define the types
import { Commit, Summary } from "./types"
loadEnv()

// Initialize GoogleGenAI with the API key from environment variables
if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in the environment variables.")
  process.exit(1)
}
const ai = new GoogleGenAI({})

async function getAllCommits(
  repoPath: string = "."
): Promise<Commit[] | undefined> {
  const git: SimpleGit = simpleGit(repoPath)

  try {
    const log = await git.log({
      maxCount: 100,
      format: {
        hash: "%H",
        author_name: "%an",
        author_email: "%ae",
        date: "%ad",
        message: "%s",
      },
    })
    if (!log || !log.all) {
      console.error("No commits found or log is undefined")
      return
    }
    const commits = log.all

    return commits.map((commit: Commit) => {
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
  console.log("Commit messages to summarize:\n", commitMessages)
  const prompt = `
You are a code assistant. Please analyze the following Git commits inorder every commit and and summarize the changes made in a concise manner on its own without any additional information and retrun each commity summary as json itself:
1. A high-level summary of the changes.
2. The main features or fixes added.
3. Any refactorings or improvements.

Commits:
${commitMessages}
  `

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  })

  if (!response || !response.text) {
    console.error("Failed to get response from AI model")
    return
  }

  if (response.text.length === 0) {
    console.error("AI response is empty")
    return
  }
  const result = response.text
  return result
}

async function main() {
  const commits = await getAllCommits()
  if (commits) {
    const commitsJson = await summarizeCommits(commits)
    console.log(commitsJson)
  }
}

main()
