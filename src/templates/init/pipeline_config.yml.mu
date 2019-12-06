###
# This file configures the SAP Cloud SDK Continuous Delivery pipeline of your project.
# For a reference of the configuration concept and available options, please have a look into its documentation.
#
# The documentation for the most recent pipeline version can always be found at:
#    https://github.com/SAP/cloud-s4-sdk-pipeline/blob/master/configuration.md
# If you are using a fixed version of the pipeline, please make sure to view the corresponding version from the tag
# list of GitHub (e.g. "v15" when you configured pipelineVersion = "v15" in the Jenkinsfile).
#
# For general information on how to get started with Continuous Delivery, visit:
#    https://blogs.sap.com/2017/09/20/continuous-integration-and-delivery
#
# We aim to keep the pipeline configuration as stable as possible. However, major changes might also imply breaking
# changes in the configuration. Before doing an update, please check the the release notes of all intermediate releases
# and adapt this file if necessary.
#
# This is a YAML-file. YAML is a indentation-sensitive file format. Please make sure to properly indent changes to it.
###

### General project setup
general:
  productiveBranch: 'master'
  projectName: '{{ projectName }}'

### Step-specific configuration
steps:
#  cloudFoundryDeploy:
#    cloudFoundry:
#      org: 'myOrg'
#      appName: '{{ projectName }}'
#      manifest: 'manifest.yml'
#      credentialsId: 'myDeploymentCredentialsId'
#      apiEndpoint: 'https://api.cf.sap.hana.ondemand.com'

### Stage-specific configuration
stages:
#  productionDeployment:
#    cfTargets:
#      - space: 'myProductiveSpace'
