<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, ContextMenu, Toolbar, Editor } from "../../src/";
import { Segmented, Locale } from "@svar-ui/vue-core";
import { cn } from "@svar-ui/gantt-locales";
import { cn as cnCore } from "@svar-ui/core-locales";

const props = defineProps(["skinSettings"]);

const api = ref(null);

const data = getData();

const langs = [
	{ id: "en", label: "EN" },
	{ id: "cn", label: "CN" },
];
const lang = ref("en");

const settings = {
	...props.skinSettings,
	tasks: data.tasks,
	links: data.links,
	scales: data.scales,
	zoom: true,
};
</script>

<template>
	<div class="rows">
		<div class="bar">
			<Segmented :options="langs" v-model:value="lang" />
		</div>
		<template v-if="lang === 'en'">
			<Toolbar :api="api" />
			<div class="gtcell">
				<ContextMenu :api="api">
					<Gantt v-bind="settings" ref="api" />
				</ContextMenu>
				<Editor :api="api" />
			</div>
		</template>

		<template v-if="lang === 'cn'">
			<Locale :words="{ ...cn, ...cnCore }">
				<Toolbar :api="api" />
				<div class="gtcell">
					<ContextMenu :api="api">
						<Gantt v-bind="settings" ref="api" />
					</ContextMenu>
					<Editor :api="api" />
				</div>
			</Locale>
		</template>
	</div>
</template>

<style scoped>
.rows {
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.bar {
	padding: 12px;
	border-bottom: var(--wx-gantt-border);
}
.gtcell {
	position: relative;
	height: calc(100% - 106px);
	border-top: var(--wx-gantt-border);
}
</style>
