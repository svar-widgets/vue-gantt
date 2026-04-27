<script setup>
defineOptions({ name: "GanttEditorLinks" });

import { ref, watchEffect, inject, provide } from "vue";
import { Field, Combo, Text } from "@svar-ui/vue-core";
import { subscribe } from "@svar-ui/lib-vue";

const _ = inject("wx-i18n").getGroup("gantt");
const props = defineProps({
	api: {},
	autoSave: {},
	onlinkschange: { type: Function },
	onchange: { type: Function },
	comp: { type: String },
	label: { type: String },
	isHidden: { type: Function },
	setter: { type: Function },
	getter: { type: Function },
	hidden: { type: Boolean },
	error: { type: String },
	value: { type: String },
});

provide("wx-input-id", null);

const {
	activeTask,
	_activeTask,
	_links: links,
	schedule,
	unscheduledTasks,
} = props.api.getReactiveState();

const $activeTask = subscribe(activeTask);
const $_activeTask = subscribe(_activeTask);
const $links = subscribe(links);
const $schedule = subscribe(schedule);
const $unscheduledTasks = subscribe(unscheduledTasks);

const linksData = ref();

watchEffect(() => {
	linksData.value = getLinksData();
});

function getLinksData() {
	if ($activeTask.value) {
		const inLinks = $links.value
			.filter(a => a.target === $activeTask.value)
			.map(link => ({ link, task: props.api.getTask(link.source) }));

		const outLinks = $links.value
			.filter(a => a.source === $activeTask.value)
			.map(link => ({ link, task: props.api.getTask(link.target) }));

		return [
			{ title: _("Predecessors"), data: inLinks },
			{ title: _("Successors"), data: outLinks },
		];
	}
}

const list = [
	{ id: "e2s", label: _("End-to-start") },
	{ id: "s2s", label: _("Start-to-start") },
	{ id: "e2e", label: _("End-to-end") },
	{ id: "s2e", label: _("Start-to-end") },
];

function deleteLink(id) {
	if (props.autoSave) {
		props.api.exec("delete-link", { id });
	} else {
		linksData.value = linksData.value.map(group => ({
			...group,
			data: group.data.filter(item => item.link.id !== id),
		}));
		props.onlinkschange?.({
			id,
			action: "delete-link",
			data: { id },
		});
	}
}

function handleChange(id, update) {
	if (props.autoSave) {
		props.api.exec("update-link", {
			id,
			link: update,
		});
	} else {
		linksData.value = linksData.value.map(group => ({
			...group,
			data: group.data.map(item =>
				item.link.id === id
					? { ...item, link: { ...item.link, ...update } }
					: item
			),
		}));
		props.onlinkschange?.({
			id,
			action: "update-link",
			data: {
				id,
				link: update,
			},
		});
	}
}
</script>

<template>
	<template v-for="linkGroup in linksData" :key="linkGroup.title">
		<div v-if="linkGroup.data.length" class="wx-links">
			<Field :label="linkGroup.title" position="top">
				<table>
					<tbody>
						<tr v-for="obj in linkGroup.data" :key="obj.link.id">
							<td class="wx-cell">
								<div class="wx-task-name">
									{{ obj.task.text || "" }}
								</div>
							</td>
							<td
								v-if="$schedule?.auto && obj.link.type === 'e2s'"
								class="wx-cell wx-link-lag"
							>
								<Text
									type="number"
									:placeholder="_('Lag')"
									:value="obj.link.lag"
									:disabled="$unscheduledTasks &&
										$_activeTask.unscheduled"
									:onchange="ev => {
										if (!ev.input)
											handleChange(obj.link.id, {
												lag: ev.value,
											});
									}"
								/>
							</td>
							<td class="wx-cell">
								<div class="wx-wrapper">
									<Combo
										:value="obj.link.type"
										:placeholder="_('Select link type')"
										:options="list"
										:onchange="ev =>
											handleChange(obj.link.id, {
												type: ev.value,
											})"
									>
										<template #default="{ option }">
											{{ option.label }}
										</template>
									</Combo>
								</div>
							</td>

							<td class="wx-cell">
								<i
									class="wxi-delete wx-delete-icon"
									:onclick="() => deleteLink(obj.link.id)"
									role="button"
								></i>
							</td>
						</tr>
					</tbody>
				</table>
			</Field>
		</div>
	</template>
</template>

<style scoped>
.wx-links {
	margin-bottom: 10px;
}

.wx-cell {
	text-align: center;
}

.wx-task-name {
	font-family: var(--wx-input-font-family);
	font-size: var(--wx-input-font-size);
	font-weight: var(--wx-input-font-weigth);
	color: var(--wx-input-font-color);
	width: 170px;
	text-align: left;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.wx-link-lag {
	width: 60px;
}

.wx-wrapper {
	position: relative;
	display: flex;
}

.wx-delete-icon {
	margin-left: 12px;
	position: relative;
	top: 2px;

	font-size: var(--wx-icon-size);
	cursor: pointer;
	color: var(--wx-gantt-icon-color);
}

.wx-delete-icon:hover {
	color: var(--wx-color-primary);
}
</style>
