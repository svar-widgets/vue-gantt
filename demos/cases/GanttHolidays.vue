<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt } from "../../src/";
import { getISOWeek, getQuarter, startOfWeek } from "date-fns";
import { Checkbox } from "@svar-ui/vue-core";

const props = defineProps(["skinSettings"]);

const data = getData();

const sabbaticalYear = ref(false);
const summerBreak = ref(false);

const everySecondWeekOff = ref(false);
const everySecondQuarterOff = ref(false);

const zoomLevel = {
	year: 0,
	quarter: 1,
	month: 2,
	week: 3,
	day: 4,
};

const activeZoomLevel = ref(zoomLevel.day);

function onHolidayToggle(level, ev) {
	if (ev.value) activeZoomLevel.value = level;
}

const scales = [
	{ unit: "year", step: 1, format: "%Y" },
	{ unit: "month", step: 2, format: "%F %Y" },
	{ unit: "week", step: 1, format: "Week %W" },
	{ unit: "day", step: 1, format: "%j, %l" },
];

function isDayOff(date) {
	const d = date.getDay();
	return d == 0 || d == 6;
}
function isHourOff(date) {
	const h = date.getHours();
	return h < 8 || h == 12 || h > 17;
}

function isYearOff(date) {
	return sabbaticalYear.value && date.getFullYear() === 2026;
}

function isQuarterOff(date) {
	if (summerBreak.value && [6, 7, 8].includes(date.getMonth())) return true;
	if (!everySecondQuarterOff.value) return false;
	return getQuarter(date) === 2;
}

function isMonthOff(date) {
	return summerBreak.value && [6, 7, 8].includes(date.getMonth());
}

function isWeekOff(date) {
	if (!everySecondWeekOff.value) return false;
	const week = startOfWeek(date, { weekStartsOn: 0 });
	return getISOWeek(week) % 2 === 0;
}

const off = {
	year: isYearOff,
	quarter: isQuarterOff,
	month: isMonthOff,
	week: isWeekOff,
	day: isDayOff,
	hour: isHourOff,
};
function highlightTime(d, u) {
	for (const unit in off) {
		if (off[unit](d)) return "wx-weekend";
		if (unit === u) break;
	}
	return "";
}
</script>

<template>
	<div class="demo">
		<div class="bar">
			<Checkbox
				v-model:value="sabbaticalYear"
				label="Sabbatical year 2026"
				:onchange="ev => onHolidayToggle(zoomLevel.year, ev)"
			/>
			<Checkbox
				v-model:value="everySecondQuarterOff"
				label="Q2 off"
				:onchange="ev => onHolidayToggle(zoomLevel.quarter, ev)"
			/>
			<Checkbox
				v-model:value="summerBreak"
				label="Summer break"
				:onchange="ev => onHolidayToggle(zoomLevel.month, ev)"
			/>
			<Checkbox
				v-model:value="everySecondWeekOff"
				label="Every second week off"
				:onchange="ev => onHolidayToggle(zoomLevel.week, ev)"
			/>
		</div>
		<div class="gantt">
			<Gantt
				v-bind="skinSettings"
				:tasks="data.tasks"
				:links="data.links"
				:scales="scales"
				:highlightTime="highlightTime"
				:zoom="{ level: activeZoomLevel }"
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
	display: flex;
	align-items: center;
	padding: 12px;
	gap: 20px;
	border-bottom: var(--wx-gantt-border);
}

.gantt {
	position: relative;
	height: 100%;
	overflow: hidden;
}
</style>
