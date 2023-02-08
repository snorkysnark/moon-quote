use axum::{http::Method, routing::get, Router};
use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};
use tower_http::cors::{Any, CorsLayer};

pub fn plugin<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("server")
        .setup(|_| {
            tauri::async_runtime::spawn(async {
                // build our application with a single route
                let app = Router::new()
                    .route("/", get(|| async { "Hello, World!" }))
                    .layer(
                        CorsLayer::new()
                            .allow_methods([Method::GET])
                            .allow_origin(Any),
                    );

                // run it with hyper on localhost:3000
                axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
                    .serve(app.into_make_service())
                    .await
                    .unwrap();
            });
            Ok(())
        })
        .build()
}
