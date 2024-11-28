<script>
    import { indexToChar } from "../utils/indexToChar";
    import Cell from "./Cell.svelte";
    import HeaderCell from "./HeaderCell.svelte";
    import HeaderRow from "./HeaderRow.svelte";
    import { autoScroll } from "../utils/autoScroll";
    import { PerformanceMetrics } from "../utils/performanceMetrics";

    const TOTAL_ROWS = 16384;
    const TOTAL_COLS = 1048576;
    const VISIBLE_ROWS = 50;
    const VISIBLE_COLS = 26;
    const ROW_HEIGHT = 32;
    const COL_WIDTH = 100;
    const BUFFER_SIZE = 25;

    let startRow = 0;
    let startCol = 0;
    let scrollTimeout;
    let spreadsheetElement;
    let isScrolling = false;
    let isTracking = false;

    function startAutoScroll() {
        if (isScrolling) return;

        isScrolling = true;
        autoScroll(spreadsheetElement);
    }

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

    function startPerformanceTest() {
        if (isTracking) return;

        isTracking = true;
        isScrolling = true;

        // 성능 측정 시작
        PerformanceMetrics.startTracking();

        // 자동 스크롤 시작
        autoScroll(spreadsheetElement);

        // 60초 후 테스트 종료
        setTimeout(() => {
            isTracking = false;
            isScrolling = false;
            const report = PerformanceMetrics.generateReport();
            console.log("성능 테스트 완료:", report);
        }, 60000);
    }
</script>

<div
    class="spreadsheet"
    on:scroll={debouncedScroll}
    bind:this={spreadsheetElement}
>
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

<div class="controls">
    <button
        class="test-button"
        on:click={startPerformanceTest}
        disabled={isTracking}
    >
        {isTracking ? "성능 테스트 진행 중..." : "60초 성능 테스트 시작"}
    </button>
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

    .controls {
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        gap: 10px;
        z-index: 1000;
    }

    .test-button {
        padding: 12px 24px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        transition: background-color 0.3s;
    }

    .test-button:hover {
        background-color: #45a049;
    }

    .test-button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
</style>
