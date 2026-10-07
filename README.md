# Release Notes Board

A small application to manage release notes: list entries, create new entries for an application and change an entry's status (`DRAFT` → `REVIEW` → `PUBLISHED`).

| Layer    | Technology                                                    |
|----------|---------------------------------------------------------------|
| Backend  | Java 21, Spring Boot 3.5, Spring Data JPA, Flyway, Maven      |
| Frontend | Angular 22 (standalone components, signals), Vitest, ESLint   |
| Database | PostgreSQL 16 (Docker Compose)                                |

## Prerequisites

- **Docker** with Docker Compose v2 (for PostgreSQL)
- **JDK 21** or newer (Maven is not required, the project ships the Maven Wrapper)
- **Node.js** `^22.22.3`, `^24.15.0` or `>=26` and **npm**

Ports used: `5432` (PostgreSQL), `8080` (backend), `4200` (frontend).

## Local startup

Run the three parts in this order, each in its own terminal, from the repository root.

### 1. Database

```bash
docker compose up -d
```

Starts PostgreSQL on `localhost:5432` with database, user and password `releasenotes`. Data is kept in the `postgres-data` volume. Check that it is ready with `docker compose ps` (status `healthy`).

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

On startup Flyway creates the schema and seeds three applications (there is no endpoint to create them). The API is available at `http://localhost:8080/api` and the health check at `http://localhost:8080/actuator/health`.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200`. The dev server proxies `/api` requests to the backend.

### Stopping

Stop the backend and frontend with `Ctrl+C`, then:

```bash
docker compose down        # add -v to also delete the database volume
```

## Configuration

All configuration is done through environment variables; every variable has a default that works for local development.

| Variable                     | Used by          | Default                                          |
|------------------------------|------------------|--------------------------------------------------|
| `DB_NAME`                    | Docker Compose   | `releasenotes`                                   |
| `DB_USER`                    | Docker Compose   | `releasenotes`                                   |
| `DB_PASSWORD`                | Docker Compose   | `releasenotes`                                   |
| `DB_PORT`                    | Docker Compose   | `5432`                                           |
| `SERVER_PORT`                | Backend          | `8080`                                           |
| `SPRING_DATASOURCE_URL`      | Backend          | `jdbc:postgresql://localhost:5432/releasenotes`  |
| `SPRING_DATASOURCE_USERNAME` | Backend          | `releasenotes`                                   |
| `SPRING_DATASOURCE_PASSWORD` | Backend          | `releasenotes`                                   |
| `APP_CORS_ALLOWED_ORIGINS`   | Backend          | `http://localhost:4200` (comma-separated list)   |
| `API_URL`                    | Frontend (dev)   | `http://localhost:8080` (proxy target for `/api`) |

Docker Compose reads a `.env` file in the repository root if present (git-ignored). Backend overrides can also go into `backend/src/main/resources/application-local.yml` (git-ignored).

## API

| Method  | Path                       | Description                          | Success |
|---------|----------------------------|--------------------------------------|---------|
| `GET`   | `/api/applications`        | List applications (sorted by name)   | `200`   |
| `GET`   | `/api/items`               | List entries (newest first)          | `200`   |
| `POST`  | `/api/items`               | Create an entry (status `DRAFT`)     | `201` + `Location` |
| `PATCH` | `/api/items/{id}/status`   | Change the status of an entry        | `200`   |

Examples:

```bash
curl -X POST http://localhost:8080/api/items \
  -H 'Content-Type: application/json' \
  -d '{"applicationId": 1, "title": "New login page", "version": "1.2.0", "description": "Redesigned sign-in flow"}'

curl -X PATCH http://localhost:8080/api/items/1/status \
  -H 'Content-Type: application/json' \
  -d '{"status": "REVIEW"}'
```

Errors are returned as [RFC 7807](https://www.rfc-editor.org/rfc/rfc7807) problem details: `400` for validation errors (with an `errors` field → message map) or a malformed body / unknown status, `404` for an unknown application or entry.

## Tests and quality checks

```bash
# Frontend
cd frontend
npm test -- --watch=false     # unit tests (Vitest)
npm run lint                  # ESLint: lint and formatting rules
npm run lint:fix              # auto-fix / format the code
npm run build                 # production build into dist/

# Backend
cd backend
./mvnw test                   # Windows: mvnw.cmd test
./mvnw package                # build the executable jar into target/
```

Frontend tests cover the API client, the error mapping, the form validation and the main page. The backend has no automated tests yet (see [Open points](#open-points)); it was verified manually against PostgreSQL with the requests above.

## Architecture decisions

**Repository layout.** A single repository with `backend/` and `frontend/` keeps the API contract and its only client in sync and makes the assignment easy to review.

**Backend layering** (`com.example.releasenotes`): `api` (controller, DTOs, error handling) → `service` (transactions, business logic) → `repository` → `domain` (JPA entities).

- Entities are never exposed. Requests and responses are Java records, validated with Bean Validation, so the API contract does not change by accident when the persistence model changes.
- The schema is owned by **Flyway** and Hibernate only validates it (`ddl-auto: validate`). This makes schema changes explicit, versioned and repeatable across environments. Database constraints (`NOT NULL`, lengths, the `status` `CHECK`) mirror the DTO validation as a second line of defence.
- `open-in-view` is disabled and DTOs are mapped inside the service transaction. The item list fetches the related application in the same query (`@EntityGraph`) to avoid N+1 selects.
- A global exception handler returns consistent RFC 7807 problem details, and the API locale is fixed to English so messages do not depend on the client's `Accept-Language`.
- CORS is restricted to `/api/**`, the methods actually used and a configurable list of origins.

**Frontend.**

- One container component (`App`) owns the state (Angular signals) and talks to the API. `ItemForm` and `ItemList` are presentational (inputs/outputs only) and use `OnPush` change detection, which keeps them simple to test and reuse.
- The API client uses relative `/api` URLs. In development the Angular dev server proxies them to the backend; in production the same build can be served behind a reverse proxy, with no environment-specific rebuild.
- The status selector keeps showing the persisted status until the server confirms the change, instead of updating optimistically, so the UI never shows a state that failed to save.
- **ESLint is also the formatter** (`@stylistic/eslint-plugin`, no Prettier), so there is a single tool and a single command for code style. Stricter rules are enabled: explicit return types, no `any`, `OnPush` required, built-in control flow and template accessibility checks.

**Status changes.** Any status can be set from any other, as the assignment asks for a simple status change. Workflow rules (e.g. `PUBLISHED` is final) would be added in `Item.changeStatus`.

## Optional part: what was implemented

- [x] Database schema via Flyway migration (including seed data)
- [x] Unit tests (frontend)
- [ ] Unit tests (backend)
- [ ] Dockerfiles for backend and frontend
- [~] Docker Compose: PostgreSQL only
- [~] Lint: ESLint configured with lint and formatting rules, but no CI pipeline runs it yet
- [ ] Basic Auth / JWT skeleton
- [ ] Environment separation (dev/prod): only the env-var-based configuration is in place

## Open points

Not implemented because of the timebox, in order of priority:

1. **Backend tests**: `@WebMvcTest` for the controller (validation, status codes, error format) and `@DataJpaTest` with Testcontainers for PostgreSQL to run the Flyway migrations against the real database. *High*: this is the main gap.
2. **CI pipeline** (e.g. GitHub Actions) running backend `mvnw verify` and frontend `lint`, `test` and `build` on every push. *High*: cheap and protects everything else.
3. **Dockerfiles and full Compose setup**: a multi-stage build for the backend, nginx serving the Angular build and proxying `/api`, all three services in Compose. *Medium*: makes the app runnable with one command.
4. **Authentication and authorization**: Spring Security with JWT or OIDC, e.g. only some roles may publish. *Medium*: required before any real deployment.
5. **Concurrency control**: optimistic locking (`@Version`) so two users changing the same entry do not overwrite each other silently. *Medium*.
6. **Status workflow rules and an audit trail** of who changed which status and when. *Medium*: depends on business requirements.
7. **Pagination and filtering** (by application and status) for `GET /api/items`. *Low* at the current data volume.
8. **Observability**: structured logs, request correlation IDs, metrics via Actuator/Micrometer. *Low* for the assignment, important for production.
9. **OpenAPI documentation** (springdoc) and a generated TypeScript client to keep frontend models in sync with the API. *Low*.
