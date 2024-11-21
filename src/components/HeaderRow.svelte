<script>
    export let rowNumber;
</script>

<div class="row-header">
    {rowNumber}
</div>

<style>
    .row-header {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 32px;
        background-color: #f0f0f0;
        border-right: 1px solid #ccc;
        border-bottom: 1px solid #ccc;
        font-weight: bold;
    }
</style>
