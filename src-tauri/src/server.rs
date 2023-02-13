use anyhow::Result;
use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    http::Method,
    routing::get,
    Router,
};
use tauri::{
    plugin::{Builder, TauriPlugin},
    AppHandle, Manager, Runtime, WindowBuilder, WindowUrl,
};
use tower_http::cors::{Any, CorsLayer};

fn open_search<R: Runtime>(app: &AppHandle<R>) -> Result<()> {
    if let Some(window) = app.get_window("search") {
        window.close()?;
    }

    WindowBuilder::new(app, "search", WindowUrl::App("search.html".parse()?))
        .always_on_top(true)
        .decorations(false)
        .center()
        .focus()
        .title("Search")
        .build()?;

    Ok(())
}

pub fn plugin<R: Runtime>() -> TauriPlugin<R> {
    async fn handle_socket<R: Runtime>(mut socket: WebSocket, app: AppHandle<R>) {
        while let Some(msg) = socket.recv().await {
            match msg {
                Ok(Message::Text(text)) => match text.as_str() {
                    "choose_quote" => {
                        if let Err(err) = open_search(&app) {
                            eprintln!("Error opening search: {err}");
                        }
                    }
                    _ => {}
                },
                Err(_) => {
                    // client disconnected
                    return;
                }
                _ => {}
            }
        }
    }

    Builder::new("server")
        .setup(|app| {
            let app = app.app_handle();

            tauri::async_runtime::spawn(async {
                let router = Router::new()
                    .route(
                        "/",
                        get(move |ws: WebSocketUpgrade| {
                            let app = app.app_handle();
                            async {
                                ws.on_upgrade(move |socket| {
                                    handle_socket(socket, app.app_handle())
                                })
                            }
                        }),
                    )
                    .layer(
                        CorsLayer::new()
                            .allow_methods([Method::GET])
                            .allow_origin(Any),
                    );

                // run it with hyper on localhost:3000
                axum::Server::bind(&"127.0.0.1:3000".parse().unwrap())
                    .serve(router.into_make_service())
                    .await
                    .unwrap();
            });
            Ok(())
        })
        .build()
}
