[![Build Status][travis-badge]][travis-badge-url]

# Frigg is a work in progress!

# Frigg
Frigg, or Frija, is a Norse goddess who lives in the Fensalir wetlands and is known for her foreknowledge and wisdom.

# What it does
This serverless application receives GitHub organization events and manages CodePipeline resources for the organization's repositories and branches.

# How to use it
Frigg is built with the [Serverless Framework](https://serverless.com/) - see their documentation for more about the tool and how to use it.

Currently a GitHub token needs to be supplied as a command line argument when deploying the application - in the future this will be managed with [AWS Parameter Store](https://github.com/manwaring/frigg/issues/9).

After deploying Frigg you will need to take the endpoint and secret token and use it to register a webhook in your GitHub organization.

# Architecture overview
![frigg - architecture overview](https://cloud.githubusercontent.com/assets/2955468/25515592/43a3249e-2bab-11e7-8314-46ca919ca36a.png)

[travis-badge]: https://travis-ci.org/manwaring/frigg.svg?branch=master		
[travis-badge-url]: https://travis-ci.org/manwaring/frigg
