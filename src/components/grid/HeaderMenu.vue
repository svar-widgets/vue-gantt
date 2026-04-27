<script setup>
import { computed } from 'vue';
import { HeaderMenu } from '@svar-ui/vue-grid';

const props = defineProps({
	columns: { default: null },
	api: {},
});

const tableAPI = computed(() => props.api?.getTable());
</script>

<template>
	<HeaderMenu :api="tableAPI" :columns="columns">
		<slot v-if="$slots.default" />
	</HeaderMenu>
</template>
