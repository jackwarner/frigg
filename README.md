# Frigg is currently a work in progress

# Frigg
Frigg, or Frija, is a Norse goddess who lives in the Fensalir wetlands and is known for her foreknowledge and wisdom.

# What it does
This serverless application receives GitHub organization events and manages CodePipeline resources for the organization's repositories and branches. It will dynamically create new pipelines as repositories and branches are created, and automatically remove those pipelines after repositories and/or branches are removed.

# Quickstart
1. Assumes you have an AWS account, AWS CLI, and ~/.aws/credentials files with the proper permissions already set up.

1. Assumes you've done this:

    ``` 
    src/frigg $ aws ssm put-parameter --name "/GITHUB_TOKEN/frigg-access" --value XXXXXXXXXXXXX --type String
    ```
    
    Where XXXXXXXXXXXXX is your Github token created at https://github.com/settings/tokens. 

1. Deploy [odin](https://github.com/manwaring/odin) (otherwise you'll see an error about odin-[stage] not existing!)

    ```
    src/odin $ sls deploy --stage local
    ```

1. Specify the github organization where the webhook will be added in the `serverless.yml` file:

    ``` 
    GITHUB_ORGANIZATION: my_github_org_name 
    ```
    
1. Deploy frigg:

    ```
    src/frigg $ sls deploy --stage local
    ```
    
    Where the stage matches the stage of the odin deploy stage, above.  
    
1. If everything worked, a new CloudFormation stack will exist with name frigg-[stage] (where stage is the value of the 'stage' parameter above). Check the status in the AWS console or with this command:

    ``` 
    aws cloudformation describe-stacks --stack-name frigg-local --output text --query 'Stacks[0].StackStatus'
    ```
    
    If you see anything other than `UPDATE_COMPLETE`, something went wrong.
    
1. At this point, frigg will respond to GitHub webhook events inside the organization you specified above (`my_github_org_name`) and create pipelines to deploy projects. Your project must deploy as a [Serverless Framework](https://serverless.com/) application and include a CodeBuild [buildspec.yml](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html). See https://github.com/pariveda-serverless/sls-jack for a working example.

# How to use it
Frigg is built with the [Serverless Framework](https://serverless.com/) - see their documentation for more about the tool and how to use it.

Command line arguments:
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

# Pending core functionality
1. [Create a standard serverless pipeline template](https://github.com/manwaring/frigg/issues/21) to use when deploying applications.

# Architecture overview
![frigg - architecture overview](https://cloud.githubusercontent.com/assets/2955468/25515592/43a3249e-2bab-11e7-8314-46ca919ca36a.png)

