<script setup>
import { format } from "date-fns";

const props = defineProps({
	api: {},
	data: {},
});

const mask = "yyyy.MM.dd";
</script>

<template>
	<template v-if="data?.task">
		<div class="data">
			<div class="text">
				<span class="caption">{{ data.task.type }}:</span>
				{{ data.task.text }}
			</div>
			<div class="text">
				<span class="caption">start:</span>
				{{ format(data.task.start, mask) }}
			</div>
			<div v-if="data.task.end" class="text">
				<span class="caption">end:</span>
				{{ format(data.task.end, mask) }}
			</div>
		</div>
	</template>
	<template v-else-if="data?.link">
		<div class="data">
			<div class="text">
				<span class="caption">predecessor:</span>
				{{ api.getTask(data.link.source).text }}
			</div>
			<div class="text">
				<span class="caption">successor:</span>
				{{ api.getTask(data.link.target).text }}
			</div>
		</div>
	</template>
	<template v-else-if="data?.resource">
		<div class="data">
			<div class="text">
				<span class="caption">Name:</span>
				{{ data.resource.name }}
			</div>
			<div class="text">
				<span class="caption">Total:</span>
				{{ data.resource.$total }}h
			</div>
			<div class="text">
				<span class="caption">Overloaded:</span>
				{{ data.resource.$overloaded }}
			</div>
		</div>
	</template>
</template>

<style scoped>
.data {
	white-space: nowrap;
	background-color: var(--wx-tooltip-background);
	padding: 3px 8px;
}

.text {
	font-family: var(--wx-font-family);
	color: var(--wx-color-primary-font);
	font-size: 13px;
	text-transform: capitalize;
	margin-bottom: 5px;
}

.text:last-child {
	margin-bottom: 0;
}

.caption {
	font-weight: 700;
}
</style>
