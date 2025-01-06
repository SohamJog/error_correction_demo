use axum::{
    extract::Multipart,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use axum_server::Server;
use reed_solomon_rs::fec::fec::*;
use std::io::Cursor;
use std::net::SocketAddr;
use std::{
    fs::File,
    io::{Read, Write},
    path::Path,
    sync::Arc,
};
use tokio::sync::Mutex;
use tower::ServiceBuilder;
use tower_http::cors::{Any, CorsLayer};
use zip::write::SimpleFileOptions;

#[tokio::main]
async fn main() {
    // In your app setup:
    let cors = CorsLayer::new()
        .allow_methods(Any)
        .allow_headers(Any)
        .allow_origin(Any);
    let app = Router::new()
        .route("/", get(|| async { "Reed-Solomon Encoding Service" }))
        .route("/encode", post(encode_file))
        .route("/decode", post(decode_files));

    let addr = SocketAddr::from(([127, 0, 0, 1], 8000));
    println!("Server running on {}", addr);
    Server::bind(addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

// Handler for encoding files
async fn encode_file(mut multipart: Multipart) -> impl IntoResponse {
    let required = 4;
    let total = 8;
    let fec = FEC::new(required, total).unwrap();

    let mut file_data = vec![];

    // Read uploaded file from multipart
    while let Some(field) = multipart.next_field().await.unwrap() {
        file_data.extend_from_slice(&field.bytes().await.unwrap());
    }

    let mut shares: Vec<Share> = vec![
        Share {
            number: 0,
            data: vec![]
        };
        total
    ];
    let output = |s: Share| {
        shares[s.number] = s.clone();
    };

    fec.encode(&file_data, output).unwrap();

    // Create a ZIP archive in memory
    let mut buf = Cursor::new(Vec::new());
    {
        let mut zip = zip::write::ZipWriter::new(&mut buf);

        for (i, share) in shares.iter().enumerate() {
            let filename = format!("share_{}.bin", i);
            zip.start_file(filename, SimpleFileOptions::default())
                .unwrap();
            zip.write_all(&share.data).unwrap();
        }

        zip.finish().unwrap();
    }

    // Return the ZIP file
    (
        StatusCode::OK,
        [("Content-Type", "application/zip")],
        buf.into_inner(),
    )
}

// Handler for decoding files
async fn decode_files(mut multipart: Multipart) -> impl IntoResponse {
    let required = 4;
    let total = 8;
    let fec = FEC::new(required, total).unwrap();

    let mut shares = vec![];

    // Read uploaded share files from multipart
    while let Some(field) = multipart.next_field().await.unwrap() {
        let share_data = field.bytes().await.unwrap().to_vec();
        shares.push(Share {
            number: shares.len(),
            data: share_data,
        });
    }

    match fec.decode(vec![], shares) {
        Ok(result_data) => (
            StatusCode::OK,
            [("Content-Type", "application/octet-stream")],
            result_data,
        ),
        Err(_) => (
            StatusCode::BAD_REQUEST,
            [("Content-Type", "text/plain")],
            Vec::from("Failed to decode the shares"),
        ),
    }
}
