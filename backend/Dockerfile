FROM messense/rust-musl-cross:armv7-musleabihf as builder
ENV SQLX_OFFLINE=true
WORKDIR /backend
# Copy the source code
COPY . .
# Build the source code
RUN cargo build --release --target=armv7-unknown-linux-musleabihf

# Create a new stage with a minimal image
FROM scratch
COPY --from=builder /backend/target/armv7-unknown-linux-musleabihf/release/backend /backend
ENTRYPOINT ["/backend"]
EXPOSE 8000
