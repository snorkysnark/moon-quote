import { invoke } from "@tauri-apps/api/tauri";

interface ProjectDirs {
    data_dir: string;
    config_dir: string;
}

function getProjectDirs(): Promise<ProjectDirs> {
    return invoke("get_project_dirs");
}

export { getProjectDirs };
