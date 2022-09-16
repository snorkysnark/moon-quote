<main>
    <div id="topPanel">
        <slot name="top" />
    </div>
    <div id="mainView">
        <slot name="main" />
    </div>
</main>

<style>
    main {
        display: flex;
        flex-flow: column;
        width: 100%;
        height: 100vh;

        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    #topPanel {
        max-height: 50px;
        background-color: orange;
        display: flex;
        gap: 10px;
        padding-left: 5px;
        padding-right: 5px;
    }

    #mainView {
        flex: 1 1 auto;
        min-height: 0;
    }
</style>
