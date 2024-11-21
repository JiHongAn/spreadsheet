<script>
    import { indexToChar } from "../utils/indexToChar";
    import Cell from "./Cell.svelte";
    import HeaderCell from "./HeaderCell.svelte";
    import HeaderRow from "./HeaderRow.svelte";

    const TOTAL_ROWS = 1000000;
    const TOTAL_COLS = 1000000;
    const VISIBLE_ROWS = 50;
    const VISIBLE_COLS = 26;
    const ROW_HEIGHT = 32;
    const COL_WIDTH = 100;
    const BUFFER_SIZE = 5;

    let startRow = 0;
    let startCol = 0;
    let scrollTimeout;

    function debouncedScroll(event) {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => handleScroll(event), 16);
    }

    function handleScroll(event) {
        const { scrollTop, scrollLeft, scrollHeight, clientHeight } =
            event.target;

        if (scrollHeight - (scrollTop + clientHeight) < clientHeight) {
            const element = event.target;
            const currentHeight =
                parseInt(
                    getComputedStyle(element).getPropertyValue(
                        "--virtual-height",
                    ),
                ) || 1000000;
            element.style.setProperty(
                "--virtual-height",
                `${currentHeight + 1000000}`,
            );
        }

        const newStartRow = Math.max(
            0,
            Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_SIZE,
        );
        const newStartCol = Math.max(0, Math.floor(scrollLeft / COL_WIDTH));

        if (newStartRow !== startRow || newStartCol !== startCol) {
            startRow = newStartRow;
            startCol = newStartCol;
        }
    }

    $: visibleRowsCount = VISIBLE_ROWS + BUFFER_SIZE * 2;
    $: rows = Array.from(
        { length: Math.min(visibleRowsCount, TOTAL_ROWS - startRow) },
        (_, i) => startRow + i,
    );
    $: columns = Array.from(
        { length: Math.min(VISIBLE_COLS, TOTAL_COLS - startCol) },
        (_, i) => startCol + i,
    );
</script>

<div class="spreadsheet" on:scroll={debouncedScroll}>
    <div class="header-row">
        <div class="corner-cell"></div>
        <div
            class="header-cells"
            style="transform: translateX({startCol * COL_WIDTH}px);"
        >
            {#each columns as column}
                <HeaderCell label={indexToChar(column)} />
            {/each}
        </div>
    </div>

    <div class="virtual-content">
        {#each rows as row (row)}
            <div
                class="row"
                style="transform: translateY({row * ROW_HEIGHT}px);"
            >
                <HeaderRow rowNumber={row + 1} />
                <div
                    class="cells-container"
                    style="transform: translateX({startCol * COL_WIDTH}px);"
                >
                    {#each columns as col (col)}
                        <Cell {row} {col} />
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    :root {
        --virtual-height: 1000px;
    }

    .spreadsheet {
        width: 100%;
        height: 100vh;
        overflow: auto;
        position: relative;
    }

    .virtual-content {
        position: relative;
        min-height: var(--virtual-height);
        width: 1000px;
    }

    .header-row {
        display: flex;
        position: sticky;
        top: 0;
        background-color: #f0f0f0;
        z-index: 2;
        width: 1000px;
    }

    .header-cells {
        display: flex;
        position: absolute;
        left: 40px;
    }

    .row {
        display: flex;
        position: absolute;
        left: 0;
        right: 0;
        height: 32px;
    }

    .cells-container {
        display: flex;
        position: absolute;
        left: 40px;
    }

    .corner-cell {
        width: 40px;
        height: 32px;
        background-color: #f0f0f0;
        border-bottom: 1px solid #ccc;
        border-right: 1px solid #ccc;
        position: sticky;
        left: 0;
        z-index: 3;
    }
</style>
