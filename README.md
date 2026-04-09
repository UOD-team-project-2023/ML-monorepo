<p align="center">
  <img src="ML Wallpaper.png" alt="Monitor Lizard Wallpaper" />
</p>

# Introduction
Monitor Lizard is a server monitoring software that is comprised of three components: a Windows or Linux daemon running on the client, an API and database backend, and a web frontend to visualize the data. Monitor Lizard was created as part of a group project.

More information can be found in the `Docs` folder and demonstrations can be found in the `Videos` folder.

# Demo Videos

## Installing the API
[![API Install](Videos/API-thumb.png)](https://youtu.be/jmRkWYstaMw)

## Installing the Front End
[![Site Install](Videos/site-thumb.png)](https://youtu.be/0LRqS8raUQQ)

## Installing Client Daemons
[![Daemon Install](Videos/daemon-thumb.png)](https://youtu.be/KT2hTS7PDYY)

## Product Demo
[![Product Demo](Videos/demo-thumb.png)](https://youtu.be/3Hi6yvXyGRY)

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
