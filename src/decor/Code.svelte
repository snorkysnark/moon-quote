<script lang="ts">
    import Highight from "highlight.js";
    import "highlight.js/styles/default.css";

    export let content: string;
    export let language: string = null;

    let html: string;
    $: html = language
        ? Highight.highlight(content, { language }).value
        : content;
</script>

<pre>{@html html}</pre>
