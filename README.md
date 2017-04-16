[![Build Status][travis-badge]][travis-badge-url]
# Frigg
Frigg, or Frija, is a Norse goddess who lives in the Fensalir wetlands and is known for her foreknowledge and wisdom.

# What it does
This serverless application receives GitHub organization events and manages CodePipeline resources for the organization's repositories and branches.

# How to use it
Frigg is built with the [Serverless Framework](https://serverless.com/) - see their documentation for more about the tool and how to use it.

To deploy Frigg to your AWS environment simply use your favorite CI/CD tools (this project unironically uses [Travis-CI](https://travis-ci.org/manwaring/odin)) or even deploy manually from your desktop using the command `sls deploy`.

After deploying Frigg you will need to take the endpoint and secret token and use it to register a webhook in your GitHub organization.

# Architecture overview
![frigg - architecture overview](https://cloudcraft.co/view/b0b457b5-9a97-45e1-9773-bfff692be287?key=lZqsUA5p0RL10ghUZSNg3w)

[travis-badge]: https://travis-ci.org/manwaring/frigg.svg?branch=master		
[travis-badge-url]: https://travis-ci.org/manwaring/frigg
