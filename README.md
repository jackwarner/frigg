# Frigg is currently a work in progress

# Frigg
Frigg, or Frija, is a Norse goddess who lives in the Fensalir wetlands and is known for her foreknowledge and wisdom.

# What it does
This serverless application receives GitHub organization events and manages CodePipeline resources for the organization's repositories and branches. It will dynamically create new pipelines as repositories and branches are created, and automatically remove those pipelines after repositories and/or branches are removed.

# How to use it
Frigg is built with the [Serverless Framework](https://serverless.com/) - see their documentation for more about the tool and how to use it.

Command line arguments:
1. `githubToken`. An organizational GitHub token for accessing private repositories. In the future I would like to manage this varialbe with the [AWS Parameter Store](https://github.com/manwaring/frigg/issues/9).
1. `stage` (or defaults to local). An arbitrary tag to delineate the stage of this deployment.

Prerequisites:
1. Frigg's a lover, not a fighter.  If you want pipelines removed after a branch (or even an entire repository) are deleted you will need to have [Odin](https://github.com/manwaring/odin) installed in the same organization and with the same stage name.

Application configuration:
1. For an application to integrate with Frigg it needs a [frigg.yml](https://github.com/manwaring/frigg/blob/master/examples/frigg.yml) definition file in it's root directory.  Currently the only configuration contained in this file is the pipeline name and version number - in the future this will contain additional configuration details around how to manage the pipeline.  Currently the corresponding frigg template files are managed in the [/pipelines/templates](https://github.com/manwaring/frigg/tree/master/pipelines/templates) directory.

```
  pipeline:
    name: standard
    version: 1
```

# Registering Frigg as a GitHub webhook

After deploying Frigg you will need to take the endpoint and secret token and use it to register a webhook in your GitHub organization.  I would like to add functionality to Frigg so that it [autoregisters with the GitHub organization](https://github.com/manwaring/frigg/issues/5) after installation.

1. The webhook must be registered with a secret for signed validation - currently Frigg expects the secret in the format `<stage>-<AWS account ID>`.  This can be changed by modifying the GITHUB_WEBHOOK_SECRET property of the GitHubEventHandler function in [serverless.yml](https://github.com/manwaring/frigg/blob/master/serverless.yml).
1. The webhook should communicate the following events: `create`, `delete`, `push`, and `repository`.

# Pending core functionality
1. [Create a standard serverless pipeline template](https://github.com/manwaring/frigg/issues/21) to use when deploying applications.

# Architecture overview
![frigg - architecture overview](https://cloud.githubusercontent.com/assets/2955468/25515592/43a3249e-2bab-11e7-8314-46ca919ca36a.png)
