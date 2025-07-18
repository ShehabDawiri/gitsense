#!/usr/bin/env node
"use strict";
/**
 * This script retrieves the last 100 Git commits from the current repository
 * and summarizes them using Google GenAI.
 *
 * It requires the GEMINI_API_KEY to be set in the environment variables.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const simple_git_1 = __importDefault(require("simple-git"));
const genai_1 = require("@google/genai");
// Load environment variables from .env file
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// Initialize GoogleGenAI with the API key from environment variables
if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in the environment variables.");
    process.exit(1);
}
const ai = new genai_1.GoogleGenAI({});
function getAllCommits() {
    return __awaiter(this, arguments, void 0, function* (repoPath = ".") {
        const git = (0, simple_git_1.default)(repoPath);
        try {
            const log = yield git.log({
                maxCount: 100,
                format: {
                    hash: "%H",
                    author_name: "%an",
                    author_email: "%ae",
                    date: "%ad",
                    message: "%s",
                },
            });
            if (!log || !log.all) {
                console.error("No commits found or log is undefined");
                return;
            }
            const commits = log.all;
            return commits.map((commit) => {
                return {
                    hash: commit.hash,
                    author_name: commit.author_name,
                    author_email: commit.author_email,
                    date: commit.date,
                    message: commit.message,
                };
            });
        }
        catch (err) {
            console.error("Failed to get commits:", err);
        }
    });
}
function summarizeCommits(commits) {
    return __awaiter(this, void 0, void 0, function* () {
        const commitMessages = commits.map((c) => `- ${c.message}`).join("\n");
        console.log("Commit messages to summarize:\n", commitMessages);
        const prompt = `
You are a code assistant. Please analyze the following Git commits inorder every commit and and summarize the changes made in a concise manner on its own without any additional information and retrun each commity summary as json itself:
1. A high-level summary of the changes.
2. The main features or fixes added.
3. Any refactorings or improvements.

Commits:
${commitMessages}
  `;
        const response = yield ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        if (!response || !response.text) {
            console.error("Failed to get response from AI model");
            return;
        }
        if (response.text.length === 0) {
            console.error("AI response is empty");
            return;
        }
        const result = response.text;
        return result;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const commits = yield getAllCommits();
        if (commits) {
            const commitsJson = yield summarizeCommits(commits);
            console.log(commitsJson);
        }
    });
}
main();
