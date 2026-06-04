<script setup>
import { computed, inject } from "vue";
import { subscribe } from "@svar-ui/lib-vue";
import { Avatar } from "@svar-ui/vue-core";

const props = defineProps({
	row: {},
});

const locale = inject("wx-i18n");
const _ = locale.getGroup("gantt");

const api = inject("gantt-store");
const { groupBy, resources } = api.getReactiveState();

const $groupBy = subscribe(groupBy);
const $resources = subscribe(resources);

const resourceData = computed(() => {
	if ($groupBy.value?.field === "resource") {
		let value = props.row.$groupValue;
		if (!Array.isArray(value)) value = [value];
		return value.map(id => $resources.value.byId(id)).filter(Boolean);
	}
	return null;
});

const ungroupLabel = computed(() =>
	$groupBy.value?.field == "resource" ? _("Unassigned") : _("Ungrouped")
);
</script>

<template>
	<div class="wx-group-text">
		<template v-if="row.$groupValue === '$ungrouped'">
			{{ ungroupLabel }}
		</template>
		<template v-else-if="resourceData?.length">
			<Avatar :value="resourceData" :size="28" />
			<span v-if="resourceData.length === 1" class="wx-name">
				{{ resourceData[0].name }}
			</span>
		</template>
		<template v-else>
			{{ row.text }}
		</template>
	</div>
</template>

<style scoped>
.wx-group-text {
	display: flex;
	align-items: center;
	gap: 8px;
	& :deep(.wx-avatar-root) {
		flex: 0 0 auto;
	}
}
.wx-group-text,
.wx-name {
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}
</style>
