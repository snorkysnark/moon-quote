use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    http::Method,
    routing::get,
    Router,
};
use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};
use tower_http::cors::{Any, CorsLayer};

pub fn plugin<R: Runtime>() -> TauriPlugin<R> {
    async fn handle_socket(mut socket: WebSocket) {
        while let Some(msg) = socket.recv().await {
            match msg {
                Ok(Message::Text(text)) => {
                    if &text == "choose_quote" {
                        println!("Opening quote dialog");
                    }
                }
                Err(_) => {
                    // client disconnected
                    return;
                }
                _ => {}
            }
        }
    }

    Builder::new("server")
        .setup(|_| {
            tauri::async_runtime::spawn(async {
                // build our application with a single route
                let app = Router::new()
                    .route(
                        "/",
                        get(|ws: WebSocketUpgrade| async { ws.on_upgrade(handle_socket) }),
                    )
                    .layer(
                        CorsLayer::new()
                            .allow_methods([Method::GET])
                            .allow_origin(Any),
                    );

                // run it with hyper on localhost:3000
                axum::Server::bind(&"127.0.0.1:3000".parse().unwrap())
                    .serve(app.into_make_service())
                    .await
                    .unwrap();
            });
            Ok(())
        })
        .build()
}
