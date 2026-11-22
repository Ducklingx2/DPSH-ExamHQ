
use axum::{
    extract::{Extension, Path, Request, State},
    http::{header::AUTHORIZATION, StatusCode},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, patch, post},
    Json,
    Router,
};

use chrono::{DateTime, NaiveDate, Utc};

use serde::{Deserialize, Serialize};

use sqlx::{
    postgres::PgPoolOptions,
    FromRow,
    PgPool,
};

use std::{
    env,
    time::Duration,
};

use tower_http::services::ServeDir;

use uuid::Uuid;


// ============================================================
// STATE
// ============================================================

#[derive(Clone)]
struct AppState {
    db: PgPool,
    http: reqwest::Client,
    supabase_url: String,
    supabase_key: String,
}


// ============================================================
// ERRORS
// ============================================================

struct ApiError {
    status: StatusCode,
    message: String,
}

impl ApiError {
    fn new(
        status: StatusCode,
        message: impl Into<String>,
    ) -> Self {
        Self {
            status,
            message: message.into(),
        }
    }

    fn unauthorized() -> Self {
        Self::new(
            StatusCode::UNAUTHORIZED,
            "Authentication required.",
        )
    }

    fn forbidden() -> Self {
        Self::new(
            StatusCode::FORBIDDEN,
            "Insufficient permissions.",
        )
    }

    fn internal() -> Self {
        Self::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            "An internal server error occurred.",
        )
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (
            self.status,
            Json(serde_json::json!({
                "error": self.message
            })),
        )
            .into_response()
    }
}


// ============================================================
// MODELS
// ============================================================

#[derive(Clone, Debug, Serialize, FromRow)]
struct CurrentUser {
    id: Uuid,
    email: String,
    full_name: String,
    role: String,
}

#[derive(Deserialize)]
struct SupabaseUser {
    id: Uuid,
}

#[derive(Serialize, FromRow)]
struct Task {
    id: Uuid,
    title: String,
    description: Option<String>,
    deadline: NaiveDate,
    status: String,
    teacher_id: Uuid,
    teacher_name: String,
    created_at: DateTime<Utc>,
}

#[derive(Deserialize)]
struct CreateTaskInput {
    title: String,
    description: Option<String>,
    deadline: NaiveDate,
    teacher_id: Uuid,
}

#[derive(Serialize, FromRow)]
struct DashboardStats {
    total: i64,
    completed: i64,
    pending: i64,
    overdue: i64,
}

#[derive(Serialize, FromRow)]
struct TeacherReport {
    teacher_id: Uuid,
    teacher_name: String,
    total: i64,
    completed: i64,
    pending: i64,
    overdue: i64,
}


// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================

async fn auth_middleware(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, ApiError> {

    let path = request.uri().path();

    // Static frontend and health endpoint are public.
    if !path.starts_with("/api/") || path == "/api/health" {
        return Ok(next.run(request).await);
    }

    // Extract Supabase access token.
    let token = request
        .headers()
        .get(AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.strip_prefix("Bearer "))
        .filter(|value| !value.is_empty())
        .ok_or_else(ApiError::unauthorized)?;

    // Supabase Auth validates the token.
    let response = state
        .http
        .get(format!(
            "{}/auth/v1/user",
            state.supabase_url.trim_end_matches('/')
        ))
        .header("apikey", &state.supabase_key)
        .bearer_auth(token)
        .send()
        .await
        .map_err(|_| {
            ApiError::new(
                StatusCode::SERVICE_UNAVAILABLE,
                "Authentication service unavailable.",
            )
        })?;

    if !response.status().is_success() {
        return Err(ApiError::unauthorized());
    }

    let auth_user: SupabaseUser = response
        .json()
        .await
        .map_err(|_| ApiError::unauthorized())?;

    // Get the actual profile and role from PostgreSQL.
    let profile = sqlx::query_as::<_, CurrentUser>(
        "
        SELECT id, email, full_name, role
        FROM public.profiles
        WHERE id = $1
        ",
    )
    .bind(auth_user.id)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| ApiError::internal())?
    .ok_or_else(ApiError::forbidden)?;

    request.extensions_mut().insert(profile);

    Ok(next.run(request).await)
}


// ============================================================
// AUTHORIZATION
// ============================================================

fn require_admin(
    user: &CurrentUser,
) -> Result<(), ApiError> {

    if user.role != "admin" {
        return Err(ApiError::forbidden());
    }

    Ok(())
}


// ============================================================
// HEALTH
// ============================================================

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "service": "ExamHQ",
        "version": "0.1.0"
    }))
}


// ============================================================
// CURRENT USER
// ============================================================

async fn me(
    Extension(user): Extension<CurrentUser>,
) -> Json<CurrentUser> {
    Json(user)
}


// ============================================================
// TEACHERS
// ============================================================

async fn list_teachers(
    State(state): State<AppState>,
    Extension(user): Extension<CurrentUser>,
) -> Result<Json<Vec<CurrentUser>>, ApiError> {

    require_admin(&user)?;

    let teachers = sqlx::query_as::<_, CurrentUser>(
        "
        SELECT id, email, full_name, role
        FROM public.profiles
        WHERE role = 'teacher'
        ORDER BY full_name ASC
        ",
    )
    .fetch_all(&state.db)
    .await
    .map_err(|_| ApiError::internal())?;

    Ok(Json(teachers))
}


// ============================================================
// TASK QUERIES
// ============================================================

const TASK_SELECT: &str = "
    SELECT
        t.id,
        t.title,
        t.description,
        t.deadline,
        t.status,
        t.teacher_id,
        COALESCE(
            NULLIF(p.full_name, ''),
            p.email
        ) AS teacher_name,
        t.created_at
    FROM public.tasks t
    JOIN public.profiles p
        ON p.id = t.teacher_id
";

async fn load_task(
    db: &PgPool,
    id: Uuid,
) -> Result<Task, ApiError> {

    let query = format!(
        "{} WHERE t.id = $1",
        TASK_SELECT
    );

    sqlx::query_as::<_, Task>(&query)
        .bind(id)
        .fetch_one(db)
        .await
        .map_err(|_| ApiError::internal())
}


// ============================================================
// LIST TASKS
// ============================================================

async fn list_tasks(
    State(state): State<AppState>,
    Extension(user): Extension<CurrentUser>,
) -> Result<Json<Vec<Task>>, ApiError> {

    let tasks = if user.role == "admin" {

        let query = format!(
            "{} ORDER BY t.deadline ASC, t.created_at DESC",
            TASK_SELECT
        );

        sqlx::query_as::<_, Task>(&query)
            .fetch_all(&state.db)
            .await

    } else {

        let query = format!(
            "{} WHERE t.teacher_id = $1
              ORDER BY t.deadline ASC, t.created_at DESC",
            TASK_SELECT
        );

        sqlx::query_as::<_, Task>(&query)
            .bind(user.id)
            .fetch_all(&state.db)
            .await
    };

    Ok(Json(
        tasks.map_err(|_| ApiError::internal())?
    ))
}


// ============================================================
// CREATE TASK
// ============================================================

async fn create_task(
    State(state): State<AppState>,
    Extension(user): Extension<CurrentUser>,
    Json(input): Json<CreateTaskInput>,
) -> Result<(StatusCode, Json<Task>), ApiError> {

    require_admin(&user)?;

    let title = input.title.trim();

    if title.is_empty() || title.len() > 160 {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Title must contain between 1 and 160 characters.",
        ));
    }

    let description = input.description
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    // Verify that the assigned account is a teacher.
    let teacher_exists =
        sqlx::query_scalar::<_, Uuid>(
            "
            SELECT id
            FROM public.profiles
            WHERE id = $1 AND role = 'teacher'
            ",
        )
        .bind(input.teacher_id)
        .fetch_optional(&state.db)
        .await
        .map_err(|_| ApiError::internal())?;

    if teacher_exists.is_none() {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Selected teacher does not exist.",
        ));
    }

    let id = sqlx::query_scalar::<_, Uuid>(
        "
        INSERT INTO public.tasks (
            title,
            description,
            deadline,
            teacher_id,
            created_by
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        ",
    )
    .bind(title)
    .bind(description)
    .bind(input.deadline)
    .bind(input.teacher_id)
    .bind(user.id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| ApiError::internal())?;

    let task = load_task(&state.db, id).await?;

    Ok((StatusCode::CREATED, Json(task)))
}


// ============================================================
// COMPLETE TASK
// ============================================================

async fn complete_task(
    State(state): State<AppState>,
    Extension(user): Extension<CurrentUser>,
    Path(id): Path<Uuid>,
) -> Result<Json<Task>, ApiError> {

    let updated = sqlx::query_scalar::<_, Uuid>(
        "
        UPDATE public.tasks
        SET
            status = 'completed',
            completed_at = NOW()
        WHERE
            id = $1
            AND (
                $2 = 'admin'
                OR teacher_id = $3
            )
        RETURNING id
        ",
    )
    .bind(id)
    .bind(&user.role)
    .bind(user.id)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| ApiError::internal())?;

    if updated.is_none() {
        return Err(ApiError::new(
            StatusCode::NOT_FOUND,
            "Task not found or permission denied.",
        ));
    }

    Ok(Json(load_task(&state.db, id).await?))
}


// ============================================================
// DASHBOARD
// ============================================================

async fn dashboard(
    State(state): State<AppState>,
    Extension(user): Extension<CurrentUser>,
) -> Result<Json<DashboardStats>, ApiError> {

    let teacher_scope = if user.role == "admin" {
        None
    } else {
        Some(user.id)
    };

    let stats =
        sqlx::query_as::<_, DashboardStats>(
            "
            SELECT
                COUNT(*) AS total,

                COUNT(*) FILTER (
                    WHERE status = 'completed'
                ) AS completed,

                COUNT(*) FILTER (
                    WHERE status = 'pending'
                    AND deadline >= CURRENT_DATE
                ) AS pending,

                COUNT(*) FILTER (
                    WHERE status = 'pending'
                    AND deadline < CURRENT_DATE
                ) AS overdue

            FROM public.tasks

            WHERE (
                $1::uuid IS NULL
                OR teacher_id = $1
            )
            ",
        )
        .bind(teacher_scope)
        .fetch_one(&state.db)
        .await
        .map_err(|_| ApiError::internal())?;

    Ok(Json(stats))
}


// ============================================================
// REPORTS
// ============================================================

async fn reports(
    State(state): State<AppState>,
    Extension(user): Extension<CurrentUser>,
) -> Result<Json<Vec<TeacherReport>>, ApiError> {

    require_admin(&user)?;

    let reports =
        sqlx::query_as::<_, TeacherReport>(
            "
            SELECT
                p.id AS teacher_id,

                COALESCE(
                    NULLIF(p.full_name, ''),
                    p.email
                ) AS teacher_name,

                COUNT(t.id) AS total,

                COUNT(t.id) FILTER (
                    WHERE t.status = 'completed'
                ) AS completed,

                COUNT(t.id) FILTER (
                    WHERE t.status = 'pending'
                    AND t.deadline >= CURRENT_DATE
                ) AS pending,

                COUNT(t.id) FILTER (
                    WHERE t.status = 'pending'
                    AND t.deadline < CURRENT_DATE
                ) AS overdue

            FROM public.profiles p

            LEFT JOIN public.tasks t
                ON t.teacher_id = p.id

            WHERE p.role = 'teacher'

            GROUP BY p.id, p.full_name, p.email

            ORDER BY teacher_name ASC
            ",
        )
        .fetch_all(&state.db)
        .await
        .map_err(|_| ApiError::internal())?;

    Ok(Json(reports))
}


// ============================================================
// SERVER
// ============================================================

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {

    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| {
                    tracing_subscriber::EnvFilter::new("info")
                }),
        )
        .init();

    let database_url =
        env::var("DATABASE_URL")?;

    let supabase_url =
        env::var("SUPABASE_URL")?;

    let supabase_key =
        env::var("SUPABASE_PUBLISHABLE_KEY")?;

    let host = env::var("HOST")
        .unwrap_or_else(|_| "0.0.0.0".to_string());

    let port: u16 = env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()?;

    let frontend_dir = env::var("FRONTEND_DIR")
        .unwrap_or_else(|_| "Frontend".to_string());

    // Connect to Supabase PostgreSQL.
    tracing::info!("Connecting to Supabase PostgreSQL...");

let db = PgPoolOptions::new()
    .max_connections(5)
    .acquire_timeout(Duration::from_secs(15))
    .connect(&database_url)
    .await
    .map_err(|error| {
        tracing::error!("PostgreSQL connection failed: {error}");
        error
    })?;

tracing::info!("Connected to Supabase PostgreSQL.");

tracing::info!("Testing database query...");

sqlx::query("SELECT 1")
    .execute(&db)
    .await
    .map_err(|error| {
        tracing::error!("Database test query failed: {error}");
        error
    })?;

tracing::info!("Database test successful.");

    // Supabase Auth HTTP client.
    let http = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()?;

    let state = AppState {
        db,
        http,
        supabase_url,
        supabase_key,
    };

    let app = Router::new()

        .route("/api/health", get(health))

        .route("/api/me", get(me))

        .route("/api/teachers", get(list_teachers))

        .route(
            "/api/tasks",
            get(list_tasks).post(create_task),
        )

        .route(
            "/api/tasks/{id}/complete",
            patch(complete_task),
        )

        .route("/api/dashboard", get(dashboard))

        .route("/api/reports", get(reports))

        .fallback_service(
            ServeDir::new(frontend_dir)
                .append_index_html_on_directories(true),
        )

        .layer(
            middleware::from_fn_with_state(
                state.clone(),
                auth_middleware,
            ),
        )

        .with_state(state);

    let address = format!("{}:{}", host, port);

    let listener =
        tokio::net::TcpListener::bind(&address).await?;

    tracing::info!(
        "ExamHQ listening on {}",
        address
    );

    axum::serve(listener, app).await?;

    Ok(())
}

