<script lang="ts">
    import { onDestroy } from "svelte";
    import { spreadsheetStore } from "../stores/spreadSheet";
    import { indexToChar } from "../utils/indexToChar";

    export let row: number;
    export let col: number;

    let isEditing = false;
    let inputValue = "";
    let inputElement: HTMLInputElement;
    let displayValue: string;

    $: cellId = `${indexToChar(Number(col))}${Number(row) + 1}`;

    $: {
        $spreadsheetStore.version;
        displayValue = spreadsheetStore.getCellValue(cellId);
    }

    function startEdit() {
        inputValue = spreadsheetStore.getRawValue(cellId);
        isEditing = true;
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter") {
            finishEdit();
        } else if (event.key === "Escape") {
            isEditing = false;
        }
    }

    function finishEdit() {
        if (isEditing) {
            spreadsheetStore.updateCell(row, col, inputValue);
            isEditing = false;
        }
    }

    onDestroy(() => {
        if (isEditing) {
            finishEdit();
        }
    });
</script>

<div class="cell" on:dblclick={startEdit}>
    {#if isEditing}
        <input
            bind:this={inputElement}
            type="text"
            bind:value={inputValue}
            on:blur={finishEdit}
            on:keydown={handleKeyDown}
            autofocus
        />
    {:else}
        <p>{displayValue}</p>
    {/if}
</div>

<style>
    .cell {
        width: 100px;
        height: 32px;
        border: 1px solid #ccc;
        overflow: hidden;
        background-color: white;
    }

    input {
        width: 100%;
        height: 100%;
        border: none;
        padding: 0 4px;
        outline: 2px solid #1a73e8;
    }

    p {
        margin: 0;
        padding: 0 4px;
        line-height: 32px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        user-select: none;
    }

    .cell:hover {
        background-color: #f0f0f0;
    }
</style>
