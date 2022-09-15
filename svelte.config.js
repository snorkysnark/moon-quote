import sveltePreprocess from "svelte-preprocess";

/* Allows reusable code blocks like:
 *
 * <!--reusable SidePanelContent-->
 * <SidePanel .../>
 * <!--end-->
 *
 * <!--repeat SidePanelContent-->
 *
 * Original block is NOT deleted
 */
function reusableBlocks() {
    return {
        markup: (input) => {
            const blocks = {};
            const code = input.content
                .replace(
                    /<!--reusable\s+(.+?)\s*-->([^]+?)<!--end-->/g,
                    (_, name, block) => ((blocks[name] = block), block)
                )
                .replace(
                    /<!--repeat\s+(.+?)\s*?-->/g,
                    (_, name) => blocks[name]
                );
            return { code };
        },
    };
}

export default {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: [reusableBlocks(), sveltePreprocess()],
};
