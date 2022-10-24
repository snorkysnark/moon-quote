<script lang="ts">
    export let message: string;
</script>

<div class="w-full h-full p-4">
    <div
        class="w-full h-full border-dotted border-4 border-gray-500 flex items-center justify-center"
    >
        <pre><p class="text-center text-2xl">{message}</p></pre>
    </div>
</div>
