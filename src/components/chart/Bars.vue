<script setup>
defineOptions({ name: "GanttChartBars" });

import { ref, computed, inject, watch, onMounted, onUnmounted } from "vue";

import { locate, locateID, getID, setID } from "@svar-ui/lib-dom";
import { subscribe } from "@svar-ui/lib-vue";
import Links from "./Links.vue";
import Rollups from "./Rollups.vue";
import { Button } from "@svar-ui/vue-core";
import { isSegmentMoveAllowed, extendDragOptions } from "@svar-ui/gantt-store";
import BarSegments from "./BarSegments.vue";

const props = defineProps({
	readonly: {},
	taskTemplate: {},
});

const api = inject("gantt-store");

const {
	_tasks: rTasks,
	_links: rLinks,
	area,
	_scales: scales,
	taskTypes,
	baselines,
	_selected: selected,
	rollups,
	_rollups: rRollups,
	focusTask,
	criticalPath,
	tasks: tree,
	schedule,
	splitTasks,
	summary,
	slack,
} = api.getReactiveState();

const _rTasks = subscribe(rTasks, true);
const _rLinks = subscribe(rLinks);
const _area = subscribe(area);
const _scales = subscribe(scales);
const _taskTypes = subscribe(taskTypes);
const _baselines = subscribe(baselines);
const _selected = subscribe(selected);
const _rollups = subscribe(rollups);
const _rRollups = subscribe(rRollups);
const _criticalPath = subscribe(criticalPath);
const _tree = subscribe(tree);
const _schedule = subscribe(schedule);
const _splitTasks = subscribe(splitTasks);
const _summary = subscribe(summary);
const _slack = subscribe(slack);

const tasks = computed(() =>
	_rTasks.value
		.slice(_area.value.start, _area.value.end)
		.map(a => ({ ...a }))
);

const lengthUnitWidth = computed(() => _scales.value.lengthUnitWidth);
let ignoreNextClick = false;

// link creation
const linkFrom = ref(undefined);
// task moving
const taskMove = ref(null);
let progressFrom = null;

const selectedLinkId = ref(null);
const selectedLink = computed(
	() =>
		selectedLinkId.value && {
			..._rLinks.value.find(link => link.id === selectedLinkId.value),
		}
);

const touched = ref(undefined);
let touchTimer;

function mousedown(e) {
	if (e.button !== 0) return;

	const node = locate(e);
	if (!node) return;

	down(node, e);
}

function touchstart(e) {
	const node = locate(e);
	if (node) {
		touchTimer = setTimeout(() => {
			touched.value = true;
			down(node, e.touches[0]);
		}, 300);
	}
}

function down(node, point) {
	const { clientX } = point;
	const id = getID(node);
	const task = api.getTask(id);
	const css = point.target.classList;
	if (point.target.closest(".wx-delete-button")) return;
	if (!props.readonly) {
		if (css.contains("wx-progress-marker")) {
			const { progress } = api.getTask(id);
			progressFrom = {
				id,
				x: clientX,
				progress,
				dx: 0,
				node,
				marker: point.target,
			};
			point.target.classList.add("wx-progress-in-drag");
		} else {
			const mode = getMoveMode(node, point, task) || "move";

			taskMove.value = {
				id,
				mode,
				x: clientX,
				dx: 0,
				l: task.$x,
				w: task.$w,
			};

			if (_splitTasks.value && task.segments?.length) {
				const segNode = locate(point, "data-segment");
				if (segNode) {
					taskMove.value.segmentIndex =
						segNode.dataset["segment"] * 1;
					extendDragOptions(task, taskMove.value);
				}
			}
		}
		startDrag();
	}
}

function getMoveMode(node, e, task) {
	if (e.target.classList.contains("wx-line")) return "";
	if (!task) task = api.getTask(getID(node));
	if (task.type === "milestone" || task.type === "summary") return "";

	const segmentNode = locate(e, "data-segment");
	if (segmentNode) node = segmentNode;

	const { left, width } = node.getBoundingClientRect();
	const p = (e.clientX - left) / width;
	let delta = 0.2 / (width > 200 ? width / 200 : 1);
	if (p < delta) return "start";
	if (p > 1 - delta) return "end";
	return "";
}

function touchmove(e) {
	if (touched.value) {
		e.preventDefault();
		move(e, e.touches[0]);
	} else if (touchTimer) {
		clearTimeout(touchTimer);
		touchTimer = null;
	}
}

function mousemove(e) {
	move(e, e);
}

function move(e, point) {
	const { clientX } = point;

	if (!props.readonly) {
		if (progressFrom) {
			const { node, x, id } = progressFrom;
			const dx = (progressFrom.dx = clientX - x);

			const diff = Math.round((dx / node.offsetWidth) * 100);
			let progress = progressFrom.progress + diff;
			progressFrom.value = progress = Math.min(
				Math.max(0, progress),
				100
			);

			api.exec("update-task", {
				id,
				task: { progress },
				inProgress: true,
			});
		} else if (taskMove.value) {
			onSelectLink(null);
			const { mode, l, w, x, id, start, segment, index } =
				taskMove.value;
			const task = api.getTask(id);
			const dx = clientX - x;
			const minWidth = Math.round(lengthUnitWidth.value) || 1;
			if (
				(!start && Math.abs(dx) < 20) ||
				(mode === "start" && w - dx < minWidth) ||
				(mode === "end" && w + dx < minWidth) ||
				(mode === "move" &&
					((dx < 0 && l + dx < 0) ||
						(dx > 0 &&
							l + w + dx > totalWidth.value))) ||
				(taskMove.value.segment &&
					!isSegmentMoveAllowed(task, taskMove.value))
			)
				return;

			taskMove.value.dx = dx;

			let left, width;
			if (mode === "start") {
				left = l + dx;
				width = w - dx;
			} else if (mode === "end") {
				left = l;
				width = w + dx;
			} else if (mode === "move") {
				left = l + dx;
				width = w;
			}

			api.exec("drag-task", {
				id,
				width: width,
				left: left,
				inProgress: true,
				...(segment && { segmentIndex: index }),
			});

			//dnd may be blocked, check positions
			if (
				!taskMove.value.start &&
				((mode === "move" && task.$x === l) ||
					(mode !== "move" && task.$w === w))
			) {
				ignoreNextClick = true;
				return up();
			}
			taskMove.value.start = true;
		} else {
			const taskNode = locate(e);
			if (taskNode) {
				const task = api.getTask(getID(taskNode));
				const segNode = locate(e, "data-segment");
				const barNode = segNode || taskNode;
				const mode = getMoveMode(barNode, point, task);
				barNode.style.cursor =
					mode && !props.readonly ? "col-resize" : "pointer";
			}
		}
	}
}

function mouseup() {
	up();
}

function touchend() {
	touched.value = null;
	if (touchTimer) {
		clearTimeout(touchTimer);
		touchTimer = null;
	}

	up();
}

function up() {
	if (progressFrom) {
		const { dx, id, marker, value } = progressFrom;
		progressFrom = null;
		if (typeof value !== "undefined" && dx)
			api.exec("update-task", {
				id,
				task: { progress: value },
				inProgress: false,
			});
		marker.classList.remove("wx-progress-in-drag");

		ignoreNextClick = true;
		endDrag();
	} else if (taskMove.value) {
		const { id, mode, dx, l, w, start, segment, index } =
			taskMove.value;
		taskMove.value = null;
		if (start) {
			const diff = Math.round(dx / lengthUnitWidth.value);

			if (!diff) {
				// restore node and link position
				api.exec("drag-task", {
					id,
					width: w,
					left: l,
					inProgress: false,
					...(segment && { segmentIndex: index }),
				});
			} else {
				let update = {};
				let task = api.getTask(id);
				if (segment) task = task.segments[index];

				if (mode === "move") {
					update.start = task.start;
					update.end = task.end;
				} else update[mode] = task[mode];

				api.exec("update-task", {
					id,
					diff,
					task: update,
					...(segment && { segmentIndex: index }),
				});
			}
			ignoreNextClick = true;
		}

		endDrag();
	}
}

function startDrag() {
	document.body.style.userSelect = "none";
}
function endDrag() {
	document.body.style.userSelect = "";
}

function onDblClick(e) {
	if (!props.readonly) {
		const id = locateID(e.target);
		if (id && !e.target.classList.contains("wx-link")) {
			const segmentIndex = locateID(e.target, "data-segment");
			api.exec("show-editor", {
				id,
				...(segmentIndex !== null && { segmentIndex }),
			});
		}
	}
}
function onClick(e) {
	if (ignoreNextClick) {
		ignoreNextClick = false;
		return;
	}

	const id = locateID(e.target);
	if (id) {
		const css = e.target.classList;
		if (css.contains("wx-link")) {
			const toStart = css.contains("wx-left");
			if (!linkFrom.value) {
				linkFrom.value = { id, start: toStart };
				return;
			}

			if (
				linkFrom.value.id !== id &&
				!alreadyLinked(id, toStart)
			) {
				api.exec("add-link", {
					link: {
						source: linkFrom.value.id,
						target: id,
						type: getLinkType(linkFrom.value.start, toStart),
					},
				});
			}
		} else if (css.contains("wx-delete-button-icon")) {
			api.exec("delete-link", { id: selectedLinkId.value });
			selectedLinkId.value = null;
		} else {
			const segmentIndex = locateID(e.target, "data-segment");
			api.exec("select-task", {
				id,
				toggle: e.ctrlKey || e.metaKey,
				range: e.shiftKey,
				...(segmentIndex !== null && { segmentIndex }),
			});
		}
	}
	removeLinkMarker();
}

function taskStyle(task) {
	return `left:${task.$x}px;top:${task.$y}px;width:${task.$w}px;height:${task.$h}px;line-height:${task.$h}px;`;
}

function baselineStyle(task) {
	return `left:${task.$x_base}px;top:${task.$y_base}px;width:${task.$w_base}px;height:${task.$h_base}px;`;
}

function slackStyle(task) {
	return `left:${task.$x_slack}px;top:${task.$y}px;width:${task.$w_slack}px;height:${task.$h}px;`;
}

function contextmenu(ev) {
	if (touched.value || touchTimer) {
		ev.preventDefault();
		return false;
	}
}

const types = ["e2s", "s2s", "e2e", "s2e"];
function getLinkType(fromStart, toStart) {
	return types[(fromStart ? 1 : 0) + (toStart ? 0 : 2)];
}

function alreadyLinked(target, toStart) {
	const source = linkFrom.value.id;
	const fromStart = linkFrom.value.start;

	if (target === source) return true;

	return _rLinks.value.find(l => {
		return (
			l.target === target &&
			l.source === source &&
			l.type === getLinkType(fromStart, toStart)
		);
	});
}

function removeLinkMarker() {
	if (linkFrom.value) {
		linkFrom.value = null;
	}
}

function onSelectLink(id) {
	selectedLinkId.value = id;
}

const taskTypeIds = computed(() => _taskTypes.value.map(t => t.id));
function taskTypeCss(type) {
	let css = taskTypeIds.value.includes(type) ? type : "task";
	if (!["task", "milestone", "summary"].includes(type)) {
		css = `task ${css}`;
	}
	return css;
}

function forward(ev) {
	api.exec(ev.action, ev.data);
}

const totalWidth = ref(0);

// focus selected
const container = ref(null);
const hasFocus = computed(
	() =>
		_selected.value.length &&
		container.value &&
		container.value.contains(document.activeElement)
);
const focused = computed(
	() => hasFocus.value && _selected.value[_selected.value.length - 1].id
);

const _focusTask = subscribe(focusTask);
watch(_focusTask, value => {
	if (value && value.column === false) {
		const { id } = value;
		const node = container.value?.querySelector(
			`.wx-bar[data-id='${setID(id)}']`
		);
		if (node) node.focus();
	}
});

const isTaskCritical = task => {
	return _criticalPath.value && task.critical;
};
function isLinkMarkerVisible(id) {
	if (_schedule.value.auto) {
		const summaryIds = _tree.value.getSummaryId(id, true);
		const linkFromSummaryIds = _tree.value.getSummaryId(
			linkFrom.value.id,
			true
		);
		return (
			linkFrom.value?.id &&
			!(
				Array.isArray(summaryIds) ? summaryIds : [summaryIds]
			).includes(linkFrom.value.id) &&
			!(
				Array.isArray(linkFromSummaryIds)
					? linkFromSummaryIds
					: [linkFromSummaryIds]
			).includes(id)
		);
	}
	return linkFrom.value;
}

// Track offsetWidth via ResizeObserver
let resizeObserver;
onMounted(() => {
	window.addEventListener("mouseup", mouseup);

	if (container.value) {
		totalWidth.value = container.value.offsetWidth;
		resizeObserver = new ResizeObserver(entries => {
			for (const entry of entries) {
				totalWidth.value = entry.target.offsetWidth;
			}
		});
		resizeObserver.observe(container.value);
	}
});

onUnmounted(() => {
	window.removeEventListener("mouseup", mouseup);
	resizeObserver?.disconnect();
});
</script>

<template>
	<div
		ref="container"
		class="wx-bars"
		:style="`line-height: ${tasks.length ? tasks[0].$h : 0}px`"
		@contextmenu="contextmenu"
		@mousedown="mousedown"
		@mousemove="mousemove"
		@touchstart="touchstart"
		@touchmove="touchmove"
		@touchend="touchend"
		@click="onClick"
		@dblclick="onDblClick"
		@dragstart.prevent
	>
		<template v-if="_slack">
			<template v-for="task in tasks" :key="task.id">
				<div
					v-if="task.$visibleSlack"
					:class="'wx-slack wx-slack-' + task.type"
					:style="slackStyle(task)"
				></div>
			</template>
		</template>
		<Links
			:onSelectLink="onSelectLink"
			:selectedLink="selectedLink"
			:readonly="props.readonly"
		/>
		<template v-for="task in tasks" :key="task.id">
			<div
				v-if="!task.$skip"
				:class="[
					'wx-bar',
					'wx-' + taskTypeCss(task.type),
					{
						'wx-touch':
							touched && taskMove && task.id === taskMove.id,
						'wx-selected':
							linkFrom && linkFrom.id === task.id,
						'wx-critical': isTaskCritical(task),
						'wx-reorder-task': task.$reorder,
						'wx-split': _splitTasks && task.segments,
					},
				]"
				:style="taskStyle(task)"
				:data-id="setID(task.id)"
				:data-tooltip-id="setID(task.id)"
				:tabindex="focused === task.id ? '0' : '-1'"
			>
				<template v-if="!props.readonly">
					<template
						v-if="
							task.id === selectedLink?.target &&
							selectedLink?.type[2] === 's'
						"
					>
						<Button
							type="danger"
							css="wx-left wx-delete-button wx-delete-link"
						>
							<i
								class="wxi-close wx-delete-button-icon"
							></i>
						</Button>
					</template>
					<template v-else>
						<div
							:class="[
								'wx-link',
								'wx-left',
								{
									'wx-visible': linkFrom,
									'wx-target':
										!linkFrom ||
										(!alreadyLinked(task.id, true) &&
											isLinkMarkerVisible(task.id)),
									'wx-selected':
										linkFrom &&
										linkFrom.id === task.id &&
										linkFrom.start,
									'wx-critical': isTaskCritical(task),
								},
							]"
						>
							<div class="wx-inner"></div>
						</div>
					</template>
				</template>

				<template v-if="task.type !== 'milestone'">
					<div
						v-if="
							task.progress &&
							!(_splitTasks && task.segments)
						"
						class="wx-progress-wrapper"
					>
						<div
							class="wx-progress-percent"
							:style="'width:' + task.progress + '%'"
						></div>
					</div>
					<div
						v-if="
							!props.readonly &&
							!(_splitTasks && task.segments) &&
							!(
								task.type === 'summary' &&
								_summary?.autoProgress
							)
						"
						class="wx-progress-marker"
						:style="
							'left:calc(' +
							task.progress +
							'% - 10px);'
						"
					>
						{{ task.progress }}
					</div>
					<template v-if="props.taskTemplate">
						<component
							:is="props.taskTemplate"
							:data="task"
							:api="api"
							:onaction="forward"
						/>
					</template>
					<template
						v-else-if="_splitTasks && task.segments"
					>
						<BarSegments
							:task="task"
							:type="taskTypeCss(task.type)"
						/>
					</template>
					<template v-else>
						<div class="wx-content">
							{{ task.text || "" }}
						</div>
					</template>
				</template>
				<template v-else>
					<div class="wx-content"></div>
					<template v-if="props.taskTemplate">
						<component
							:is="props.taskTemplate"
							:data="task"
							:api="api"
							:onaction="forward"
						/>
					</template>
					<template v-else>
						<div class="wx-text-out">
							{{ task.text }}
						</div>
					</template>
				</template>

				<template v-if="!props.readonly">
					<template
						v-if="
							task.id === selectedLink?.target &&
							selectedLink?.type[2] === 'e'
						"
					>
						<Button
							type="danger"
							css="wx-right wx-delete-button wx-delete-link"
						>
							<i
								class="wxi-close wx-delete-button-icon"
							></i>
						</Button>
					</template>
					<template v-else>
						<div
							:class="[
								'wx-link',
								'wx-right',
								{
									'wx-visible': linkFrom,
									'wx-target':
										!linkFrom ||
										(!alreadyLinked(
											task.id,
											false
										) &&
											isLinkMarkerVisible(
												task.id
											)),
									'wx-selected':
										linkFrom &&
										linkFrom.id === task.id &&
										!linkFrom.start,
									'wx-critical': isTaskCritical(task),
								},
							]"
						>
							<div class="wx-inner"></div>
						</div>
					</template>
				</template>
			</div>
			<template v-if="_rollups && _rRollups?.[task.id]">
				<Rollups
					v-for="rollup in _rRollups[task.id]"
					:key="rollup.id"
					:rollup="rollup"
					:parent="task"
				/>
			</template>
			<template v-if="_baselines && !task.$skip_baseline">
				<div
					:class="[
						'wx-baseline',
						{ 'wx-milestone': task.type === 'milestone' },
					]"
					:style="baselineStyle(task)"
				></div>
			</template>
		</template>
	</div>
</template>

<style scoped>
.wx-rollup {
	position: absolute;
	z-index: 1;
	background-color: var(--wx-gantt-task-color);
	border: 1px solid var(--wx-gantt-marker-color);
	border-color: var(--wx-gantt-marker-color);
}

.wx-baseline {
	position: absolute;
	background-color: #a883e4;
	border-radius: var(--wx-gantt-baseline-border-radius);
	z-index: 1;
}
.wx-baseline.wx-milestone {
	transform: rotate(45deg) scale(0.75);
	border-radius: var(--wx-gantt-milestone-border-radius);
}
.wx-bars {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.wx-bar,
.wx-bar :deep(.wx-segment) {
	pointer-events: all;
	box-sizing: border-box;
	position: absolute;
	border-radius: var(--wx-gantt-bar-border-radius);
	font: var(--wx-gantt-bar-font);
	white-space: nowrap;
	line-height: inherit;
	text-align: center;
	cursor: pointer;

	-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

.wx-bar.wx-touch {
	opacity: 0.5;
}

.wx-bar.wx-reorder-task {
	z-index: 3;
}
.wx-bar :deep(.wx-content) {
	overflow: hidden;
	text-overflow: ellipsis;
}
.wx-task:not(.wx-split),
.wx-task :deep(.wx-segment) {
	color: var(--wx-gantt-task-font-color);
	background-color: var(--wx-gantt-task-color);
	border: var(--wx-gantt-task-border);
}

.wx-task.wx-selected:not(.wx-split) {
	border: 1px solid var(--wx-gantt-task-border-color);
	box-shadow: var(--wx-gantt-bar-shadow);
}

.wx-task:not(.wx-split):hover,
.wx-task :deep(.wx-segment:hover) {
	box-shadow: var(--wx-gantt-bar-shadow);
}

.wx-summary {
	color: var(--wx-gantt-summary-font-color);
	background-color: var(--wx-gantt-summary-color);
	border: var(--wx-gantt-summary-border);
}

.wx-summary.wx-selected {
	border: 1px solid var(--wx-gantt-summary-border-color);
	box-shadow: var(--wx-gantt-bar-shadow);
}

.wx-summary:hover {
	box-shadow: var(--wx-gantt-bar-shadow);
}

.wx-milestone .wx-content {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 2;
}

.wx-bar:not(.wx-milestone) :deep(.wx-content) {
	position: relative;
	z-index: 2;
}

.wx-bars :deep(.wx-text-out) {
	position: absolute;
	line-height: normal;
	display: block;
	color: var(--wx-color-font);
	pointer-events: none;
}

.wx-milestone {
	border-color: var(--wx-gantt-milestone-color);
}

.wx-milestone .wx-text-out {
	padding: 0 2px;
	left: 100%;
}

.wx-milestone .wx-content {
	height: 100%;
	background-color: var(--wx-gantt-milestone-color);
	transform: rotate(45deg) scale(0.75);
	border-radius: var(--wx-gantt-milestone-border-radius);
}

.wx-bar :deep(.wx-progress-wrapper) {
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: transparent;
	border-radius: var(--wx-gantt-bar-border-radius);
	overflow: hidden;
}

.wx-bar :deep(.wx-progress-percent) {
	height: 100%;
}

.wx-progress-marker {
	opacity: 0;
	position: absolute;
	top: 80%;
	width: var(--wx-icon-size);
	height: var(--wx-gantt-progress-marker-height);
	background: var(--wx-gantt-progress-border-color);
	clip-path: polygon(50% 0, 100% 30%, 100% 100%, 0 100%, 0 30%);
	color: var(--wx-color-font);
	z-index: 3;
	font-size: calc(var(--wx-font-size-sm) - 2px);
	border-radius: 4px;
	cursor: ew-resize;
	text-align: center;
	line-height: 3;
}
.wx-progress-marker::before {
	content: "";
	display: block;
	position: absolute;
	width: calc(var(--wx-icon-size) - 2px);
	height: calc(var(--wx-gantt-progress-marker-height) - 2px);
	clip-path: polygon(50% 0, 100% 30%, 100% 100%, 0 100%, 0 30%);
	top: 1px;
	left: 1px;
	background: var(--wx-gantt-link-marker-background);
	z-index: -1;
	border-radius: 4px;
}
.wx-bar:hover .wx-progress-marker,
.wx-progress-marker.wx-progress-in-drag {
	opacity: 1;
}

.wx-task .wx-progress-percent {
	background-color: var(--wx-gantt-task-fill-color);
}

.wx-summary .wx-progress-percent {
	background-color: var(--wx-gantt-summary-fill-color);
}

.wx-link {
	position: absolute;
	z-index: 4;
	top: 50%;
	transform: translateY(-50%);
	width: 16px;
	height: 16px;
	border-radius: 50%;
	border: 1px solid var(--wx-gantt-link-marker-color);
	background-color: var(--wx-gantt-link-marker-background);
	opacity: 0;
	cursor: default;
}

.wx-link .wx-inner {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 8px;
	height: 8px;
	border-radius: 50%;
	border: 4px solid var(--wx-gantt-link-marker-color);
	pointer-events: none;
}

.wx-bar :deep(button.wx-button.wx-delete-button) {
	position: absolute;
	z-index: 4;
	top: 50%;
	transform: translateY(-50%);
	width: 16px;
	height: 16px;
	padding: 0;
}
.wx-delete-button-icon {
	display: block;
	line-height: 14px;
	font-size: 10px;
}
.wx-bar :deep(.wx-delete-button.wx-left),
.wx-link.wx-left {
	left: -16px;
}
.wx-bar :deep(.wx-delete-button.wx-right),
.wx-link.wx-right {
	right: -16px;
}
.wx-link.wx-target:hover,
.wx-link.wx-selected,
.wx-bar:hover .wx-link.wx-target,
.wx-link.wx-visible.wx-target {
	opacity: 1;
	cursor: pointer;
}

.wx-bar:not(.wx-split) .wx-link.wx-selected {
	border-color: inherit;
}
.wx-bar:not(.wx-split) .wx-link.wx-selected .wx-inner {
	border-color: inherit;
}

.wx-milestone .wx-link.wx-left {
	left: -16px;
}
.wx-milestone .wx-link.wx-right {
	right: -16px;
}

.wx-cut {
	opacity: 50%;
}
.wx-bar:not(.wx-milestone):focus {
	outline: 1px solid var(--wx-color-primary);
	outline-offset: 1px;
}
.wx-milestone:focus {
	outline: none;
}
.wx-milestone:focus .wx-content {
	outline: 1px solid var(--wx-color-primary);
	outline-offset: 1.6px;
}
/* critical path markers */
.wx-task.wx-critical {
	background-color: var(--wx-gantt-task-critical-color);
}
.wx-task.wx-critical.wx-selected {
	border: 1px solid var(--wx-gantt-task-critical-color);
}
.wx-task.wx-critical .wx-progress-percent {
	background-color: var(--wx-gantt-task-critical-fill-color);
}
.wx-milestone.wx-critical .wx-content {
	background-color: var(--wx-gantt-critical-color);
}
.wx-milestone.wx-critical {
	border-color: var(--wx-gantt-critical-color);
}
.wx-summary.wx-critical {
	background-color: var(--wx-gantt-summary-critical-color);
}
.wx-summary.wx-critical .wx-progress-percent {
	background-color: var(--wx-gantt-summary-critical-fill-color);
}
.wx-summary.wx-critical.wx-selected {
	border: 1px solid var(--wx-gantt-summary-critical-color);
}

/*split tasks*/
.wx-split.wx-selected {
	border-color: var(--wx-gantt-task-border-color);
}
.wx-bars .wx-split.wx-bar {
	background: transparent;
	border-color: transparent;
}
.wx-split .wx-link.wx-selected,
.wx-split .wx-link.wx-selected .wx-inner {
	border-color: var(--wx-gantt-task-border-color);
}

.wx-critical :deep(.wx-segment) {
	background-color: var(--wx-gantt-task-critical-color);
}
.wx-critical.wx-selected :deep(.wx-segment) {
	border: 1px solid var(--wx-gantt-task-critical-color);
}
.wx-critical :deep(.wx-segment .wx-progress-percent) {
	background-color: var(--wx-gantt-task-critical-fill-color);
}
.wx-critical.wx-split .wx-link.wx-selected,
.wx-critical.wx-split .wx-link.wx-selected .wx-inner {
	border-color: var(--wx-gantt-task-critical-color);
}

.wx-slack {
	box-sizing: border-box;
	position: absolute;
	border-radius: var(--wx-gantt-bar-border-radius);
	border-bottom-left-radius: 0;
	border-top-left-radius: 0;
}
.wx-slack-task {
	border: 1px solid var(--wx-gantt-task-slack-border-color);
	background: repeating-linear-gradient(
		-60deg,
		var(--wx-gantt-task-slack-border-color),
		var(--wx-gantt-task-slack-border-color) 1px,
		var(--wx-gantt-task-slack-color) 1px,
		var(--wx-gantt-task-slack-color) 8px
	);
}
</style>
