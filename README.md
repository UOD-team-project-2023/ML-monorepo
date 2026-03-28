# Introduction
Monitor Lizard is a server monitoring software that is comprised of three components. A windows or linux daemon running on the client, an API and database backend, and a web front end to visualise the data. Monitor Lizard was created as part of a group project.

More information can be fouund in the Docs folder and demonstrations can be found in the videos folder.

# Installation guide

1. yarn global add turbo
2. turbo build (if this command errors saying command turbo not found, restart PC)
3. configure .envs in each of the directories in the `apps` directory (see .env-templates)
4. turbo dev