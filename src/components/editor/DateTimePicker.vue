<script setup>
import { computed, inject } from "vue";
import { DatePicker, TimePicker } from "@svar-ui/vue-core";

defineOptions({ inheritAttrs: false });

const props = defineProps({
	value: {},
	time: {},
	format: {},
	onchange: { type: Function },
	buttons: { default: () => ["today"] },
	clear: { type: Boolean, default: undefined },
});

const _ = inject("wx-i18n").getGroup("gantt");

const localButtons = computed(() => props.buttons.map(b => _(b)));
const clearButton = computed(
	() => props.clear ?? props.buttons.includes("Unschedule")
);

function handleDateChange(ev) {
	let current = ev.value;
	if (current) {
		current = new Date(ev.value);
		if (props.value) {
			current.setHours(props.value.getHours());
			current.setMinutes(props.value.getMinutes());
		}
	}

	props.onchange?.({ value: current });
}
</script>

<template>
	<div class="date-time-controll">
		<DatePicker
			v-bind="$attrs"
			:value="value"
			:onchange="handleDateChange"
			:format="format"
			:buttons="localButtons"
			:clear="clearButton"
		/>
		<TimePicker v-if="time" :value="value" :onchange="onchange" :format="format" />
	</div>
</template>

<style scoped>
.date-time-controll {
	display: flex;
	gap: 12px;
}
</style>
