<script lang="ts">
    import Highight from "highlight.js";
    import "highlight.js/styles/default.css";

    export let content: string;
    export let language: string = null;

    let html: string;
    $: {
        try {
            html = language
                ? Highight.highlight(content, { language }).value
                : content;
        } catch {
            html = content;
        }
    }
</script>

<pre>{@html html}</pre>
