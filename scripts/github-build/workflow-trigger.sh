#!/bin/bash
WORKFLOW_ID=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "${BASE_API_URL}/actions/workflows" | jq -r --arg name "$WORKFLOW_NAME" '.workflows[] | select(.name | test($name)) | .id')
curl -X POST -u $GITHUB_TOKEN: -H "Accept: application/vnd.github.v3+json" "${BASE_API_URL}/actions/workflows/$WORKFLOW_ID/dispatches" -d '{"ref":"main"}'
echo "Workflow triggered with workflow id: ${WORKFLOW_ID}. Waiting for workflow to complete..."
sleep 10
echo "Fetching workflow run status..."
result=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "${BASE_API_URL}/actions/workflows/$WORKFLOW_ID/runs" | jq -r '.workflow_runs[0]' | tr -d '\000-\011\013\014\016-\037')
WF_RUN_ID=$(echo "$result" | jq -r '.id')
WF_STATUS=$(echo "$result" | jq -r '.status')
WF_CONCLUSION=$(echo "$result" | jq -r '.conclusion')
echo "Workflow run id: $WF_RUN_ID - status: $WF_STATUS - conclusion: $WF_CONCLUSION"
maxAttempts=20
for attempt in $(seq 1 $maxAttempts); do
    echo "Attempt #$attempt - Fetching workflow run status..."
    wf_run_response=$(curl -L -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github.v3+json" "${BASE_API_URL}/actions/runs/$WF_RUN_ID")    
    WF_STATUS=$(echo "$wf_run_response" | jq -r '.status')
    WF_CONCLUSION=$(echo "$wf_run_response" | jq -r '.conclusion')    
    echo "Attempt #$attempt response# - status: $WF_STATUS - conclusion: $WF_CONCLUSION"
    if [ "$WF_STATUS" != "in_progress" ] && [ "$WF_STATUS" != "queued" ]; then
        break
    fi
    if [ $attempt -eq $maxAttempts ]; then
        echo "Maximum attempts reached. Exiting loop."
        break
    fi
    sleep 60
done
if [ "$WF_CONCLUSION" == "success" ]; then
    echo "Workflow run completed successfully"
else
    echo "Workflow run failed"
fi

echo $WF_CONCLUSION