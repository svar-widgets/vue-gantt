<script setup>
import { Combo } from "@svar-ui/vue-core";
import UserStub from "./UserStub.vue";

const props = defineProps({
	value: {},
	options: {},
	onchange: { type: Function },
});
</script>

<template>
	<Combo :options="options" :value="value" :onchange="onchange" clear placeholder="Assign to the person">
		<template #default="{ option }">
			<UserStub :user="option" />
		</template>
	</Combo>
</template>
