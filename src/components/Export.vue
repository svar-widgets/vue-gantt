<script setup>
defineOptions({ name: "GanttExport" });

import Willow from "../themes/Willow.vue";
import WillowDark from "../themes/WillowDark.vue";
import Gantt from "./Gantt.vue";

const props = defineProps({
	skin: {},
	config: { default: () => ({}) },
});
</script>

<template>
	<WillowDark v-if="skin === 'willow-dark'">
		<Gantt v-bind="config" />
	</WillowDark>
	<Willow v-else>
		<Gantt v-bind="config" />
	</Willow>
</template>
