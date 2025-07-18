import { simpleGit, SimpleGit, SimpleGitOptions } from "simple-git"

const git: SimpleGit = simpleGit("./")

console.log(git.log())
