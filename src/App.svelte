<script lang="ts">
    import { invoke } from '@tauri-apps/api/tauri'

    const projectDirs = invoke('get_project_dirs');
    projectDirs.then((dirs) => console.log(dirs));
</script>

<main>
    {#await projectDirs then projectDirs}
        <p>Config: {projectDirs.config_dir}</p>
        <p>Data: {projectDirs.data_dir}</p>
    {/await}
</main>

<style>
</style>
