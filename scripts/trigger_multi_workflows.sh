#!/bin/bash

# Script to trigger GitHub Actions workflows for multiple accounts/repositories
# Config file should be in CSV format: owner,repo,workflow_file,token,branch,inputs

CONFIG_FILE="github_accounts.csv"
LOG_FILE="workflow_triggers.log"

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Config file '$CONFIG_FILE' not found."
    echo "Please create a CSV file with the following format:"
    echo "owner,repo,workflow_file,token,branch,inputs"
    echo "Example:"
    echo "myuser,my-repo,deploy.yml,ghp_token123,main,{\"env\":\"prod\"}"
    echo "org1,tool-repo,build.yml,ghp_token456,develop,"
    exit 1
fi

# Function to trigger a workflow
trigger_workflow() {
    local owner="$1"
    local repo="$2"
    local workflow_file="$3"
    local token="$4"
    local branch="${5:-main}"  # Default to 'main' if not provided
    local inputs="$6"
    
    # Construct the API URL
    local api_url="https://api.github.com/repos/$owner/$repo/actions/workflows/$workflow_file/dispatches"
    
    # Prepare the payload
    local payload
    if [ -z "$inputs" ] || [ "$inputs" = "null" ]; then
        # No inputs provided
        payload="{\"ref\":\"$branch\"}"
    else
        # Inputs provided
        payload="{\"ref\":\"$branch\",\"inputs\":$inputs}"
    fi
    
    # Make the API request
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Triggering workflow $workflow_file in $owner/$repo on branch $branch..." | tee -a "$LOG_FILE"
    
    local response
    response=$(curl -s -X POST "$api_url" \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Authorization: token $token" \
        -H "Content-Type: application/json" \
        -d "$payload" \
        -w "%{http_code}" \
        -o /dev/null)
    
    # Check the response
    if [ "$response" -eq 204 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Success! Workflow dispatch initiated for $owner/$repo." | tee -a "$LOG_FILE"
        return 0
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Error: Received HTTP status code $response for $owner/$repo" | tee -a "$LOG_FILE"
        return 1
    fi
}

# Initialize counters
total=0
success=0
failed=0

# Process each line in the config file
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting workflow trigger process..." | tee -a "$LOG_FILE"
echo "------------------------------------------------" | tee -a "$LOG_FILE"

# Skip header line if it exists
first_line=true

while IFS=, read -r owner repo workflow_file token branch inputs || [ -n "$owner" ]; do
    # Skip header line if present
    if $first_line && [[ "$owner" == "owner" || "$owner" == *"Owner"* ]]; then
        first_line=false
        continue
    fi
    first_line=false
    
    # Skip empty lines
    if [ -z "$owner" ] || [ -z "$repo" ] || [ -z "$workflow_file" ] || [ -z "$token" ]; then
        continue
    fi
    
    # Trim whitespace
    owner=$(echo "$owner" | xargs)
    repo=$(echo "$repo" | xargs)
    workflow_file=$(echo "$workflow_file" | xargs)
    token=$(echo "$token" | xargs)
    branch=$(echo "$branch" | xargs)
    inputs=$(echo "$inputs" | xargs)
    
    # Use default branch if not specified
    if [ -z "$branch" ]; then
        branch="main"
    fi
    
    # Increment total counter
    ((total++))
    
    # Trigger the workflow
    if trigger_workflow "$owner" "$repo" "$workflow_file" "$token" "$branch" "$inputs"; then
        ((success++))
    else
        ((failed++))
    fi
    
    echo "------------------------------------------------" | tee -a "$LOG_FILE"
    
    # Add a small delay to avoid rate limiting
    sleep 1
    
done < "$CONFIG_FILE"

# Print summary
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Summary:" | tee -a "$LOG_FILE"
echo "Total workflows: $total" | tee -a "$LOG_FILE"
echo "Successful: $success" | tee -a "$LOG_FILE"
echo "Failed: $failed" | tee -a "$LOG_FILE"
echo "See $LOG_FILE for detailed log." | tee -a "$LOG_FILE"