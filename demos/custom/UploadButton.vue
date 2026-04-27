<script setup>
import { ref } from "vue";

const props = defineProps({
	text: {},
	onchange: { type: Function },
	value: {},
	id: {},
	comp: {},
	onclick: { type: Function },
	menu: {},
});

const fileInput = ref(null);

function handleClick() {
	fileInput.value.click();
}

function handleChange() {
	if (props.onchange) {
		props.onchange();
	}
}
</script>

<template>
	<button class="button" @click="handleClick">
		{{ text }}
	</button>
	<input
		ref="fileInput"
		id="import-file"
		type="file"
		accept=".xml"
		@change="handleChange"
		style="display: none;"
	/>
</template>

<style scoped>
.button {
	font-size: 14px;
	line-height: 20px;
	font-weight: 600;
	padding: 5px 16px;
	border: 1px solid transparent;
	border-radius: 3px;
	background-color: #f2f2f7;
	color: #2c2f3c;
}
:global(.wx-willow-dark-theme .button) {
	background-color: #384047;
	color: rgba(255, 255, 255, 0.9);
}
</style>
