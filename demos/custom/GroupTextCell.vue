<script setup>
import { inject, computed } from "vue";
import { subscribe } from "@svar-ui/lib-vue";

const _ = inject("wx-i18n").getGroup("gantt");
const api = inject("gantt-store");
const { groupBy } = api.getReactiveState();
const $groupBy = subscribe(groupBy);

const props = defineProps({
	row: {},
});

const isGroup = computed(() => $groupBy.value?.field && props.row.$group);

const groupValue = computed(() => {
	const priorityMap = { 1: "low", 2: "medium", 3: "high" };
	let value = props.row.$groupValue;
	if (value && $groupBy.value.field === "priority") {
		value = priorityMap[value];
	}
	return value;
});
</script>

<template>
	<template v-if="isGroup">
		<template v-if="row.$groupValue === '$ungrouped'">
			{{ _("Ungrouped") }}
		</template>
		<div v-else class="group">
			{{ $groupBy.field }}: {{ groupValue }}
		</div>
	</template>
	<template v-else>
		{{ row.text }}
	</template>
</template>

<style scoped>
.group {
	text-transform: capitalize;
}
</style>
