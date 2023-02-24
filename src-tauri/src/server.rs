use anyhow::Result;
use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    http::Method,
    routing::get,
    Router,
};
use futures::{prelude::*, stream::SplitStream};
use tauri::{
    async_runtime::{Mutex, Sender},
    plugin::{Builder, TauriPlugin},
    AppHandle, Manager, Runtime, State, WindowBuilder, WindowEvent, WindowUrl,
};
use tower_http::cors::{Any, CorsLayer};

use crate::{error::SerializableResult, library::AnnotationFull};

pub struct SearchState {
    sender: Mutex<Option<Sender<AnnotationFull>>>,
}

fn open_search<R: Runtime>(app: &AppHandle<R>) -> Result<()> {
    if let Some(window) = app.get_window("search") {
        window.close()?;
    }

    let window = WindowBuilder::new(app, "search", WindowUrl::App("search.html".parse()?))
        .always_on_top(true)
        .decorations(false)
        .center()
        .focus()
        .title("Search")
        .build()?;

    let app = app.app_handle();
    window.on_window_event(move |event| {
        if matches!(event, WindowEvent::Destroyed) {
            let search_state: State<'_, SearchState> = app.state();
            // Clear search_state when window has been closed
            futures::executor::block_on(async {
                search_state.sender.lock().await.take();
            });
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn finish_search(
    state: State<'_, SearchState>,
    value: Option<AnnotationFull>,
) -> SerializableResult<()> {
    let mut sender = state.sender.lock().await;
    if let Some(sender) = sender.take() {
        if let Some(value) = value {
            if let Err(err) = sender.send(value).await {
                eprintln!("{err}");
            }
        }
    }

    Ok(())
}

pub fn plugin<R: Runtime>() -> TauriPlugin<R> {
    async fn handle_socket<R: Runtime>(socket: WebSocket, app: AppHandle<R>) {
        let (mut ws_sender, ws_receiver) = socket.split();
        let (tx, mut rx) = tauri::async_runtime::channel::<AnnotationFull>(100);

        let read_task = async move { read_socket(ws_receiver, app, tx).await };
        let write_task = async move {
            while let Some(value) = rx.recv().await {
                match serde_json::to_string(&value) {
                    Ok(json) => {
                        if let Err(err) = ws_sender.send(Message::Text(json)).await {
                            eprintln!("{err}");
                        }
                    }
                    Err(err) => eprintln!("{err}"),
                }
            }
        };

        tokio::join!(read_task, write_task);
    }

    async fn read_socket<R: Runtime>(
        mut receiver: SplitStream<WebSocket>,
        app: AppHandle<R>,
        answer_sender: Sender<AnnotationFull>,
    ) {
        while let Some(msg) = receiver.next().await {
            match msg {
                Ok(Message::Text(text)) => match text.as_str() {
                    "choose_quote" => match open_search(&app) {
                        Ok(_) => {
                            let search_state: State<'_, SearchState> = app.state();
                            search_state
                                .sender
                                .lock()
                                .await
                                .replace(answer_sender.clone());
                        }
                        Err(err) => eprintln!("{err}"),
                    },
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
            app.manage(SearchState {
                sender: Mutex::new(None),
            });

            tauri::async_runtime::spawn(async {
                let router = Router::new()
                    .route(
                        "/",
                        get(move |ws: WebSocketUpgrade| {
                            let app = app.app_handle();
                            return async {
                                return ws.on_upgrade(move |socket| {
                                    handle_socket(socket, app.app_handle())
                                });
                            };
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
        .invoke_handler(tauri::generate_handler![finish_search])
        .build()
}
