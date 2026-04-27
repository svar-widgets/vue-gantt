<script setup>
import { ref, computed } from "vue";
import { getData } from "../data";
import { Gantt, registerScaleUnit } from "../../src/";
import { Select } from "@svar-ui/vue-core";

import {
	startOfMonth,
	endOfMonth,
	isSameMonth,
	addMonths,
	addDays,
	differenceInDays,
	format,
} from "date-fns";

const props = defineProps({
	skinSettings: {},
});

const data = getData();
const options = [
	{ id: 1, label: "sprint" },
	{ id: 2, label: "month, sprint" },
	{ id: 3, label: "month, sprint, week" },
	{ id: 4, label: "month, sprint, week, day" },
];

const getMidDate = d => {
	const m = d.getMonth();
	return m === 1 ? 15 : 16;
};

const sprintStart = d => {
	const monthStart = startOfMonth(d);
	const midDate = getMidDate(d);
	if (d.getDate() >= midDate) monthStart.setDate(midDate);
	return monthStart;
};

const sprintEnd = d => {
	const monthEnd = endOfMonth(d);
	const midDate = getMidDate(d);
	if (d.getDate() < midDate) monthEnd.setDate(midDate - 1);
	return monthEnd;
};

const sprintFormat = d => {
	const monthStr = format(d, "MMMM");
	const start = d.getDate();
	const end = sprintEnd(d).getDate();
	return `${monthStr} ${start} - ${end}`;
};

const allScales = [
	{ unit: "month", step: 1, format: "%F %Y" },
	{ unit: "sprint", step: 1, format: sprintFormat },
	{ unit: "week", step: 1, format: "%w" },
	{ unit: "day", step: 1, format: "%j" },
];

const scaleOption = ref(2);

const scales = computed(() => {
	if (scaleOption.value === 1) return [allScales[1]];
	if (scaleOption.value === 2) return allScales.slice(0, 2);
	if (scaleOption.value === 3) return allScales.slice(0, 3);
	return allScales;
});

registerScaleUnit("sprint", {
	start: sprintStart,
	end: sprintEnd,
	isSame: (a, b) => {
		if (!a || !b) return true;
		const sameMonth = isSameMonth(a, b);
		if (!sameMonth) return false;
		const midDate = getMidDate(a);
		return a.getDate() < midDate == b.getDate() < midDate;
	},
	add: (d, amount) => {
		const date = d.getDate();
		const start = sprintStart(d);
		const diff = date - start.getDate();
		let newDate = addMonths(start, Math.floor(amount / 2));
		const midDate = getMidDate(newDate);
		if (amount % 2) {
			newDate = addDays(newDate, midDate);
			newDate = sprintStart(newDate);
		}
		return addDays(newDate, diff);
	},
	diff: (endDate, startDate) => {
		return Math.floor(differenceInDays(endDate, startDate) / 15);
	},
	smallerCount: {
		day: d => {
			if (!d) return 15;
			const start = sprintStart(d).getDate();
			const end = sprintEnd(d).getDate();
			return end - start + 1;
		},
	},
	biggerCount: {
		year: 24,
		quarter: 6,
		month: 2,
	},
});
</script>

<template>
	<div class="demo">
		<div class="bar">
			<Select v-model:value="scaleOption" :options="options" />
		</div>
		<div class="gantt">
			<Gantt
				v-bind="skinSettings"
				:tasks="data.tasks"
				:links="data.links"
				:scales="scales"
				:zoom="true"
				:start="new Date(2026, 3, 1)"
				:end="new Date(2026, 5, 1)"
				:cellWidth="60"
			/>
		</div>
	</div>
</template>

<style scoped>
.demo {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.bar {
	padding: 20px;
	background-color: var(--wx-background);
	border: var(--wx-border);

	--wx-input-width: 180px;
}

.gantt {
	position: relative;
	height: calc(100% - 74px);
}
</style>
