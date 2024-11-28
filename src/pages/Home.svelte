<script>
    import { onMount } from "svelte";
    import SpreadSheet from "../components/SpreadSheet.svelte";
    import { spreadsheetStore } from "../stores/spreadSheet";

    onMount(() => {
        spreadsheetStore.initializeDummyData();
    });
</script>

<main>
    <SpreadSheet />
</main>

<style>
    main {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
</style>
