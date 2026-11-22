
# ============================================================
# BUILD STAGE
# ============================================================

FROM rust:1.89-bookworm AS builder

WORKDIR /app

COPY . .

RUN cargo build \
    --release \
    --manifest-path backend/rust/Cargo.toml


# ============================================================
# RUNTIME STAGE
# ============================================================

FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder \
    /app/target/release/examhq \
    /usr/local/bin/examhq

COPY frontend /app/frontend

ENV HOST=0.0.0.0
ENV FRONTEND_DIR=/app/frontend
ENV RUST_LOG=info

EXPOSE 10000

CMD ["/usr/local/bin/examhq"]

