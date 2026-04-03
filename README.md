# Introduction
Monitor Lizard is a server monitoring software that is comprised of three components: a Windows or Linux daemon running on the client, an API and database backend, and a web frontend to visualize the data. Monitor Lizard was created as part of a group project.

More information can be found in the `Docs` folder and demonstrations can be found in the `Videos` folder.

# Demo Videos

[API Install](https://raw.githubusercontent.com/UOD-team-project-2023/ML-monorepo/refs/heads/main/Videos/1-API.MP4)

[Site Install](https://raw.githubusercontent.com/UOD-team-project-2023/ML-monorepo/refs/heads/main/Videos/2-SITE.MP4)

[Daemon Install](https://raw.githubusercontent.com/UOD-team-project-2023/ML-monorepo/refs/heads/main/Videos/3-DAEMON.MP4)

[Front End Demo](https://raw.githubusercontent.com/UOD-team-project-2023/ML-monorepo/refs/heads/main/Videos/DEMO.MP4)

# Documentation

- [Client Feature Overview](Docs/Client%20Feature%20Overview.pdf)
- [Coversheet](Docs/Coversheet.pdf)
- [Install Guide](Docs/Install%20Guide.pdf)
- [Testing Documentation](Docs/Testing%20Documentation.pdf)

# Installation Guide

1. `yarn global add turbo`
2. `turbo build` (if this command errors saying command turbo not found, restart PC)
3. Configure `.env` files in each of the directories in `apps` (see `.env-templates`)
4. `turbo dev`