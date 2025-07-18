#!/usr/bin/env node

/**
 * This script retrieves the last 100 Git commits from the current repository
 * and summarizes them using Google GenAI.
 *
 * It requires the GEMINI_API_KEY to be set in the environment variables.
 */

import simpleGit, { SimpleGit } from "simple-git"
import { Command } from "commander"
import { GoogleGenAI } from "@google/genai"
import fs from "fs"

// Load environment variables from .env file
import { config as loadEnv } from "dotenv"

// Define the types
import { Commit, Summary } from "./types"
loadEnv()

const program = new Command()

program
  .option("-k, --api-key <key>", "Google Gemini API key")
  .option(
    "-f, --format <type>",
    "Output format: general, release, standup, tweet",
    "general"
  )
  .parse(process.argv)

const options = program.opts()
const apiKey = options.apiKey || process.env.GEMINI_API_KEY

// Check if the API key is provided
if (!apiKey) {
  console.error(
    "API key is required. Please provide it using -k or set GEMINI_API_KEY in .env file."
  )
  process.exit(1)
}

if (!["general", "release", "standup", "tweet"].includes(options.format)) {
  console.error(
    `Invalid format "${options.format}". Valid formats are: general, release, standup, tweet.`
  )
  process.exit(1)
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
})

async function getAllCommits(
  repoPath: string = "."
): Promise<Commit[] | undefined> {
  const git: SimpleGit = simpleGit(repoPath)

  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 24h ago
    const until = new Date().toISOString() // now

    const log = await git.log({
      "--since": since,
      "--until": until,
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

async function summarizeCommits(
  commits: Commit[]
): Promise<string | undefined> {
  const commitMessages = commits.map((c) => `- ${c.message}`).join("\n")
  console.log("Commit messages to summarize:\n", commitMessages)
  if (commitMessages.length === 0) {
    console.error("No commit messages to summarize")
    return
  }
  const prompt = `You are an intelligent and helpful AI assistant specialized in analyzing Git commit messages.

Your job is to summarize the recent project activity based on a list of Git commits. Focus on generating clear, useful summaries that could be used in team updates, changelogs, or release notes.

🎯 Goals:
- Group related commits together (e.g., auth-related changes, UI tweaks)
- Highlight key progress, new features, bug fixes, or refactors
- Remove redundant or low-value commits (like "update README", "fix typo")
- Use natural, developer-friendly language

🎨 Output Styles (depending on format parameter):
- **general**: A high-level summary of what’s been done
- **release**: Changelog-style notes (organized by Features, Fixes, Improvements)
- **standup**: Daily update style (e.g., “Yesterday we..., Today we will...”)
- **tweet**: One-liner suitable for posting as a short update

📥 Input:
A list of recent Git commit messages

📤 Output:
A summarized version in the format requested

Do NOT repeat all commits one by one — your job is to **summarize intelligently**.
Use the format "${options.format}" for the summary.
Here are the recent commits:
${commitMessages}`

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
    const summary = await summarizeCommits(commits)
    if (!summary) {
      console.error("Failed to summarize commits")
      return
    }
    fs.writeFileSync("summary.md", summary, "utf-8")
  }
}

main()
