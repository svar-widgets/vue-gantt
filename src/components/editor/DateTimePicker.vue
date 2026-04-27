<script setup>
import { computed } from "vue";
import { DatePicker, TimePicker } from "@svar-ui/vue-core";

const props = defineProps({
	value: {},
	time: {},
	format: {},
	onchange: { type: Function },
});

const restProps = computed(() => {
	const { value, time, format, onchange, ...rest } = props;
	return rest;
});

function handleDateChange(ev) {
	const current = new Date(ev.value);
	current.setHours(props.value.getHours());
	current.setMinutes(props.value.getMinutes());

	props.onchange?.({ value: current });
}
</script>

<template>
	<div class="date-time-controll">
		<DatePicker
			v-bind="restProps"
			:value="value"
			:onchange="handleDateChange"
			:format="format"
			:buttons="['today']"
			:clear="false"
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
