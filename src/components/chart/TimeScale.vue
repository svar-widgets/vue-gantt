<script setup>
import { inject } from 'vue';
import { subscribe } from '@svar-ui/lib-vue';

const props = defineProps({
	highlightTime: { type: Function },
});

const api = inject('gantt-store');
const { _scales } = api.getReactiveState();
const scales = subscribe(_scales);
</script>

<template>
	<div class="wx-scale" :style="{ width: scales.width + 'px' }">
		<div
			v-for="(row, ri) in scales.rows"
			:key="ri"
			class="wx-row"
			:style="{ height: row.height + 'px' }"
		>
			<div
				v-for="(cell, ci) in row.cells"
				:key="ci"
				:class="[
					'wx-cell',
					cell.css,
					props.highlightTime
						? props.highlightTime(cell.date, cell.unit)
						: '',
				]"
				:style="{ width: cell.width + 'px' }"
			>
				{{ cell.value }}
			</div>
		</div>
	</div>
</template>

<style scoped>
.wx-scale {
	position: sticky;
	top: 0;
	background-color: var(--wx-background);
	box-shadow: var(--wx-timescale-shadow);
	z-index: 5;
	border-bottom: var(--wx-gantt-border);
}

.wx-row,
.wx-cell {
	display: flex;
	box-sizing: border-box;
}

.wx-row:not(:last-child) {
	border-bottom: var(--wx-gantt-border);
}

.wx-cell {
	justify-content: center;
	align-items: center;
	border-right: var(--wx-timescale-border);
	font: var(--wx-timescale-font);
	color: var(--wx-timescale-font-color);
}

.wx-cell.wx-weekend {
	background: var(--wx-gantt-holiday-background);
	color: var(--wx-gantt-holiday-color);
}
</style>
