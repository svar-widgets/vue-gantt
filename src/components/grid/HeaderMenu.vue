<script setup>
import { ref, computed } from 'vue';
import { HeaderMenu } from '@svar-ui/vue-grid';

const props = defineProps({
	columns: { default: null },
	api: {},
});

const targetSection = ref('grid');

const tableAPI = computed(() =>
	props.api?.getTable(false, targetSection.value),
);

function detectSection(ev) {
	const host = ev.target?.closest?.('[data-gantt-section]');
	targetSection.value =
		host?.dataset.ganttSection === 'subGrid' ? 'subGrid' : 'grid';
}
</script>

<template>
	<HeaderMenu :api="tableAPI" :columns="columns">
		<div style="display: contents" @contextmenu="detectSection">
			<slot v-if="$slots.default" />
		</div>
	</HeaderMenu>
</template>
