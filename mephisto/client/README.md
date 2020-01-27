## API specifications

All of the endpoints below are **`GET`** unless specified otherwise.


#### WIP Endpoints / Backlog

- Endpoints for actions to modify the review state of a Unit
- Endpoint for getting the URL of a task and it's data to show
- Make error reponse codes more consistent across all types of errors.

---
## Requesters

#### `/requesters`
Sample response:
```
{
  "requesters": [
    {
      "provider_type": "mturk",
      "registered": false,
      "requester_id": "1",
      "requester_name": "Bob"
    },
    {
      "provider_type": "mturk",
      "registered": true,
      "requester_id": "2",
      "requester_name": "Noah1010"
    }
  ]
}
```

#### `/requester/<type>`

Sample response:
```
{
  "HELP_TEXT": "AWS are required to create a new Requester. Please create an IAM user with programmatic access and AdministratorAccess policy at https://console.aws.amazon.com/iam/ (On the \"Set permissions\" page, choose \"Attach existing policies directly\" and then select \"AdministratorAccess\" policy). After creating the IAM user, please enter the user's Access Key ID and Secret Access Key.",
  "access_key_id": "IAM Access Key ID: ",
  "secret_access_key": "IAM Secret Access Key: "
}
```

#### `/<requester_name>/get_balance` - TODO: Change to `/requester/balance/<requester_name>`

Sample response:
```
# Success:

{ "balance": 3000 }

# Error:

{ message: "Could not find the requester" } # [501]
```

#### **`POST`** `/requester/<type>/register`

Sample response:
```
# Success:

{
  "success": true
}

# Error:

{
  "msg": "No name was specified for the requester.",
  "success": false
}
```

---
## Launching

#### `/launch/options`

Sample response:
```
{
  "blueprints": [
    { "name": "Test Blueprint", "rank": 1 },
    { "name": "Simple Q+A", "rank": 2 }
  ],
  "architects": ["Local", "Heroku"]
}
```

#### `/blueprints/<blueprint_name>/arguments`

Sample response:
```
{ 
  "args": [
    {
      "name": "Task name",
      "defaultValue": "Default Task Name",
      "helpText": "This is what your task will be named."
    }
  ]
}
```


#### `/architects/<architect_name>/arguments`

Sample response:
```
{
  "args": [
    {
      "name": "Port number",
      "defaultValue": 8888,
      "helpText": "Your task will be run on this port."
    }
  ]
}
```

#### **`POST`** `/task_runs/launch`

Sample request:
```
{
  "blueprint_name": "Test Blueprint",
  "blueprint_args": [ { ... } ],
  "architect": "Test Architect",
  "architect_args": [ { ... } ],
  "requester": <requester_id>
}
```

Sample response:
```
{
  "success": true
}

{
  "success": false,
  # TODO: How should the server provide validation feedback?
}
```

---
## Review

#### `/task_runs/running`

Sample response:
```
{
  live_task_count: 1,
  task_count: 1,
  task_runs: TaskRun[]
}

# For full example payload, see `task_runs__running` in mephisto/webapp/src/mocks.ts
```

#### `/task_runs/reviewable`

#### `/task_runs/<task_id>/units`

Sample response:
```
{
  "id": <unit_id>,
  "view_path": "https://google.com",
  "data": {
    "name": "me"
  }
}
```

#### **`POST`** `/task_runs/<task_id>/units/<unit_id>/accept`

#### **`POST`** `/task_runs/<task_id>/units/<unit_id>/reject`