pipeline {
    agent any

    environment {     
        // GITHUB_TOKEN is a secret text credential
        // To create a secret text credential, go to Jenkins > Credentials > System > Global credentials (unrestricted) > Add Credentials
        // Select Kind as Secret text and add the token value
        // To get the token, go to GitHub > Settings > Developer settings > Personal access tokens > Generate new token
        // Give a name and select the required scopes
        // Copy the generated token and add it as a secret text credential
        // Use the token in the pipeline as follows

        GITHUB_TOKEN=credentials('GITHUB_TOKEN')
        REPO_OWNER="KnowledgeWorksUS"
        REPO_NAME="com.cassiacm.rda.fe"
        BASE_API_URL="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}"
        WORKFLOW_NAME="Make a release"
        WORKFLOW_ID=""
        WF_RUN_ID=""
        WF_STATUS=""
        WF_CONCLUSION=""
        BACKEND_BUILD_JOB_NAME='cassiacm-rda'
    }
    stages {
        stage('Trigger UI Build Workflow') {
            steps {         
                 dir("${WORKSPACE}") {
                    script {
                        def scriptOutput = sh(script: './scripts/github-build/workflow-trigger.sh', returnStdout: true).trim()
                        def lastLine = scriptOutput.trim().tokenize('\n').last()
												echo lastLine;
												if (lastLine != 'success') {
													 error 'Stopping build process due to unsuccessful ui build'
												}
												else{
														 echo 'UI Build Successful'                      
												}
                     //   env.WF_CONCLUSION = lastLine
                    }
                }
            }
        }
        // stage('Check UI Build Status') {
        //     steps {
        //         script {
								// 	  echo env.WF_CONCLUSION
								// 	  echo "Conclusion"
        //             if (env.WF_CONCLUSION != 'success') {
								// 			   error 'Stopping build process due to unsuccessful ui build'
        //             }
        //             else{
        //                  echo 'UI Build Successful'                      
        //             }
        //         }
        //     }
        // }
        stage('Build Backend') {
            steps {
                script {           
                    echo 'Triggering backend build'   
                    build job: env.BACKEND_BUILD_JOB_NAME
                }
            }
        }
    }
}
