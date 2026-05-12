# Problem 5: ExpressJS CRUD Backend (TypeScript)

This service provides a simple CRUD API for a `resource` entity using:

- **ExpressJS** for HTTP APIs
- **TypeScript** for type-safe backend code
- **SQLite** for persistent local storage

---

## Features

1. Create a resource
2. List resources with basic filters
3. Get details of a resource
4. Update resource details
5. Delete a resource

---

## Project Structure

```text
problem5/
├── src/
│   ├── app.ts
│   ├── db.ts
│   ├── server.ts
│   ├── types.ts
│   └── routes/
│       └── resources.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Prerequisites

- Node.js 18+ (recommended)
- npm

---

## Setup

From repository root:

```bash
cd src/problem5
npm install
```

---

## Run Application

### Development mode

```bash
npm run dev
```

### Production mode

```bash
npm run build
npm start
```

By default, API runs on:

`http://localhost:3000`

You can override with environment variable:

```bash
PORT=4000 npm run dev
```

---

## Database

- SQLite database file is created automatically at:
  - `src/problem5/data/resources.db`
- Data is persisted between runs.

---

## API Endpoints

Base URL: `http://localhost:3000`

### Health check

- `GET /health`

Response:

```json
{ "status": "ok" }
```

### 1) Create resource

- `POST /resources`

Request body:

```json
{
  "name": "My first resource",
  "description": "Optional description",
  "category": "demo",
  "isActive": true
}
```

### 2) List resources (with filters)

- `GET /resources`

Supported query params:

- `search` (string): partial match on resource name
- `category` (string): exact match
- `isActive` (`true` or `false`)
- `limit` (integer, default `20`, max `100`)
- `offset` (integer, default `0`)

Example:

`GET /resources?search=demo&category=test&isActive=true&limit=10&offset=0`

### 3) Get resource details

- `GET /resources/:id`

Example:

`GET /resources/1`

### 4) Update resource

- `PUT /resources/:id`

Request body (all fields optional):

```json
{
  "name": "Updated resource name",
  "description": "Updated description",
  "category": "updated",
  "isActive": false
}
```

### 5) Delete resource

- `DELETE /resources/:id`

Returns `204 No Content` on success.

---

## Quick cURL Test

```bash
# Create
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"sample resource\",\"category\":\"demo\"}"

# List
curl http://localhost:3000/resources

# Detail
curl http://localhost:3000/resources/1

# Update
curl -X PUT http://localhost:3000/resources/1 \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"updated name\",\"isActive\":false}"

# Delete
curl -X DELETE http://localhost:3000/resources/1
```

---

## Postman Test Example

### 1) Create a Postman Environment

Create an environment with:

- `baseUrl` = `http://localhost:3000`
- `resourceId` = (leave empty, will be set from tests)

### 2) Create Request Collection

Add these requests in order:

1. `Create Resource`  
   - Method: `POST`  
   - URL: `{{baseUrl}}/resources`  
   - Body (raw JSON):
   ```json
   {
     "name": "Postman resource",
     "description": "created from Postman test",
     "category": "postman",
     "isActive": true
   }
   ```
   - Tests tab:
   ```javascript
   pm.test("Status is 201", function () {
     pm.response.to.have.status(201);
   });
   const json = pm.response.json();
   pm.test("Response has id", function () {
     pm.expect(json.id).to.be.a("number");
   });
   pm.environment.set("resourceId", json.id);
   ```

2. `List Resources`  
   - Method: `GET`  
   - URL: `{{baseUrl}}/resources?category=postman&limit=10&offset=0`  
   - Tests tab:
   ```javascript
   pm.test("Status is 200", function () {
     pm.response.to.have.status(200);
   });
   const json = pm.response.json();
   pm.test("Response is array", function () {
     pm.expect(Array.isArray(json)).to.eql(true);
   });
   ```

3. `Get Resource Detail`  
   - Method: `GET`  
   - URL: `{{baseUrl}}/resources/{{resourceId}}`  
   - Tests tab:
   ```javascript
   pm.test("Status is 200", function () {
     pm.response.to.have.status(200);
   });
   const json = pm.response.json();
   pm.test("Returns the expected resource", function () {
     pm.expect(json.id).to.eql(Number(pm.environment.get("resourceId")));
   });
   ```

4. `Update Resource`  
   - Method: `PUT`  
   - URL: `{{baseUrl}}/resources/{{resourceId}}`  
   - Body (raw JSON):
   ```json
   {
     "name": "Postman resource updated",
     "isActive": false
   }
   ```
   - Tests tab:
   ```javascript
   pm.test("Status is 200", function () {
     pm.response.to.have.status(200);
   });
   const json = pm.response.json();
   pm.test("Resource updated", function () {
     pm.expect(json.name).to.eql("Postman resource updated");
     pm.expect(json.isActive).to.eql(false);
   });
   ```

5. `Delete Resource`  
   - Method: `DELETE`  
   - URL: `{{baseUrl}}/resources/{{resourceId}}`  
   - Tests tab:
   ```javascript
   pm.test("Status is 204", function () {
     pm.response.to.have.status(204);
   });
   ```

6. `Verify Deleted`  
   - Method: `GET`  
   - URL: `{{baseUrl}}/resources/{{resourceId}}`  
   - Tests tab:
   ```javascript
   pm.test("Status is 404 after delete", function () {
     pm.response.to.have.status(404);
   });
   ```

### 3) Run with Collection Runner

Run the collection in sequence (`Create` -> `List` -> `Detail` -> `Update` -> `Delete` -> `Verify Deleted`) to validate the full CRUD flow.
