<script setup>
defineOptions({ name: "DemoCustomForm" });

import { ref, onMounted } from "vue";

import {
	Field,
	Text,
	TextArea,
	Select,
	Slider,
	DatePicker,
} from "@svar-ui/vue-core";

const props = defineProps({
	task: {},
	taskTypes: {},
	onaction: { type: Function },
});

const node = ref(null);
const left = ref(undefined);
const top = ref(undefined);

onMounted(() => {
	left.value = (window.innerWidth - node.value.offsetWidth) / 2;
	top.value = (window.innerHeight - node.value.offsetHeight) / 2;
});

function deleteTask() {
	props.onaction && props.onaction({ action: "delete-task", data: { id: props.task.id } });
	props.onaction && props.onaction({ action: "close-form" });
}

function onClose() {
	props.onaction && props.onaction({ action: "close-form" });
}

function handleChange({ value }, key) {
	let task = { ...props.task };
	if (key === "type" && value === "milestone") {
		delete task.end;
		task.duration = 0;
	} else if (task.start > task.end) {
		task.start = task.end;
		task.duration = 1;
		task.end = 0;
	}
	task = {
		...task,
		[key]: value,
	};
	props.onaction &&
		props.onaction({
			action: "update-task",
			data: { id: task.id, task },
		});
}
</script>

<template>
	<div class="backdrop">
		<div class="modal" :style="`left:${left}px;top:${top}px`" ref="node">
			<div class="header">
				<h3 class="title">Edit task</h3>
				<i class="close wxi-close" @click="onClose"></i>
			</div>
			<div class="body">
				<Field label="Name">
					<Text
						:focus="true"
						:value="task.text"
						:onchange="ev => handleChange(ev, 'text')"
					/>
				</Field>

				<Field label="Description">
					<TextArea
						:value="task.details"
						:onchange="ev => handleChange(ev, 'details')"
					/>
				</Field>

				<Field v-if="taskTypes.length > 1" label="Type">
					<Select
						:value="task.type"
						:options="taskTypes"
						:onchange="ev => handleChange(ev, 'type')"
					/>
				</Field>

				<Field label="Start date">
					<DatePicker
						:value="task.start"
						:onchange="ev => handleChange(ev, 'start')"
					/>
				</Field>

				<template v-if="task.type !== 'milestone'">
					<Field label="End date">
						<DatePicker
							:value="task.end"
							:onchange="ev => handleChange(ev, 'end')"
						/>
					</Field>
					<Field :label="`Progress: ${task.progress}%`">
						<Slider
							:value="task.progress"
							:onchange="ev => handleChange(ev, 'progress')"
						/>
					</Field>
				</template>

				<button class="button danger" @click="deleteTask">Delete</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.backdrop {
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	z-index: 5;
	background: var(--wx-modal-backdrop);
}

.modal {
	position: relative;
	width: 340px;
	padding: 20px;
	border-radius: 6px;
	box-shadow:
		0 4px 4px rgba(0, 0, 0, 0.12),
		0 0 10px rgba(0, 0, 0, 0.06);
	background-color: var(--wx-background);
	font-family: var(--wx-font-family);
	font-size: var(--wx-font-size);
	color: var(--wx-color-font);
}

.title {
	margin: 0;
}

.close {
	position: absolute;
	top: 20px;
	right: 20px;
	cursor: pointer;
	font-weight: 700;
	transition: color 0.15s ease-in;
}

.close:hover {
	color: rgb(255, 122, 122);
}

.body {
	margin: 20px 0 0 0;
}

.button {
	padding: 10px;
	margin: 1.5em 0 0 0;
	box-sizing: border-box;
	border: 1px solid #ccc;
	border-radius: 2px;
	font-family: var(--wx-font-family);
	font-size: var(--wx-font-size);
	border-radius: 3px;
	cursor: pointer;
}

.button:focus {
	outline: none;
	opacity: 0.7;
}

.danger {
	color: var(--wx-color-danger-font);
	background-color: var(--wx-color-danger);
}
</style>
