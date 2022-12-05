import { Show } from "solid-js";
import Spinner from "./Spinner";
import classes from "./Loading.module.css";

export default function Loading(props: { message?: string }) {
    return (
        <div class={classes.container}>
            <Spinner />
            <Show when={props.message}>
                <pre>
                    <p class={classes.message}>{props.message}</p>
                </pre>
            </Show>
        </div>
    );
}
