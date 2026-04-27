<script setup>
defineOptions({ name: "DemoIndex" });
import { ref, computed, provide, onMounted, watch } from "vue";

import Router from "./Router.vue";
import Link from "./Link.vue";
import { getLinks } from "./helpers";
import { GitHubLogoIcon, LogoIcon } from "../assets/icons/index";

const { skins, Button, Segmented, Globals, Locale } = defineProps({
	publicName: String,
	skins: Array,
	productLink: String,
	productTag: String,
	// eslint-disable-next-line vue/prop-name-casing
	Button: Object,
	// eslint-disable-next-line vue/prop-name-casing
	Segmented: Object,
	// eslint-disable-next-line vue/prop-name-casing
	Globals: Object,
	// eslint-disable-next-line vue/prop-name-casing
	Locale: Object,
});

const skin = ref(skins[0].id);
const title = ref("");
const link = ref("");
const show = ref(true);

const windowWidth = ref(window.innerWidth);
window.addEventListener('resize', () => {
	windowWidth.value = window.innerWidth;
});

const MOBILE_BREAKPOINT = 767;
const isMobileView = computed(() => windowWidth.value <= MOBILE_BREAKPOINT);

const links = getLinks();

provide("wx-theme", "");

function toggleSidebar() {
	show.value = !show.value;
}

function updateInfo(ev) {
	skin.value = ev.skin || skin.value;
	title.value = ev.title;
	link.value = ev.link;
	if (isMobileView.value && ev.title) show.value = false;
}

watch([isMobileView, title], ([mobile, t]) => {
	if (mobile && t) show.value = false;
});

onMounted(() => {
	document.body.className = `wx-willow-theme`;
});
</script>

<template>
    <component v-for="(obj, index) in skins" :key="index" :is="obj.component" />

	<div class="layout" :class="{ active: show, narrow: isMobileView }">
		<div class="sidebar" :class="{ active: show }" role="tabpanel">
			<div class="sidebar-content">
				<div class="sidebar-header">
					<div class="box-title">
						<a
							href="https://svar.dev/vue/"
							target="_blank"
							rel="noopener noreferrer"
						>
							<img
								:src="LogoIcon"
								alt="Logo icon"
								class="box-title-img"
							/>
						</a>
						<div class="separator"></div>
						<a
							:href="`https://svar.dev/vue/${productLink||productTag}/`"
							target="_blank"
							rel="noopener noreferrer"
						>
							<h1 class="title">Vue {{ publicName }}</h1>
						</a>
					</div>
					<div class="btn-box">
						<Button
							type="secondary"
							icon="wxi-angle-left"
							css="toggle-btn"
							:onclick="toggleSidebar"
						/>
					</div>
				</div>
				<div class="box-links">
					<Link
						v-for="data in links"
						:key="data[0]"
						:data="data"
						:skin="skin"
						@click="() => { if (isMobileView) show = false; }"
					/>
				</div>
			</div>
		</div>
		<div class="page-content">
			<div class="page-header">
				<div v-if="isMobileView" class="header-back-btn">
					<div class="btn-box">
						<Button
							icon="wxi-angle-left"
							css="toggle-btn"
							:onclick="toggleSidebar"
							type="secondary"
						>
							Back to list
						</Button>
					</div>
				</div>
				<div class="page-content-header">
					<div class="header-title-box">
						<div v-if="!show && !isMobileView" class="btn-box">
							<Button
								type="secondary"
								icon="wxi-angle-right"
								css="toggle-btn"
								:onclick="toggleSidebar"
							/>
						</div>
						<div v-if="!isMobileView" class="hint">{{ title }}</div>
					</div>
					<div class="header-actions-container">
						<div class="segmented-box">
							<Segmented
								v-model:value="skin"
								:options="skins"
								css="segmented-themes"
							>
								<template #default="{ option }">
									<svg
									    v-if="option.id === 'willow-dark'"
										viewBox="0 0 16 16"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										aria-hidden="true"
									>
										<path
											d="M11.8329 2.72663L10.1462 4.01996L10.7529 6.05996L8.99956 4.85329L7.24622 6.05996L7.85289 4.01996L6.16622 2.72663L8.29289 2.66663L8.99956 0.666626L9.70622 2.66663L11.8329 2.72663ZM14.1662 7.33329L13.0729 8.16663L13.4662 9.48663L12.3329 8.70663L11.1996 9.48663L11.5929 8.16663L10.4996 7.33329L11.8729 7.29996L12.3329 5.99996L12.7929 7.29996L14.1662 7.33329ZM12.6462 10.6333C13.1996 10.58 13.7929 11.3666 13.4396 11.8666C13.2262 12.1666 12.9996 12.4466 12.7196 12.7133C10.1129 15.3333 5.89289 15.3333 3.29289 12.7133C0.686224 10.1133 0.686224 5.88663 3.29289 3.28663C3.55956 3.01996 3.83956 2.77996 4.13956 2.56663C4.63956 2.21329 5.42622 2.80663 5.37289 3.35996C5.19289 5.26663 5.83289 7.24663 7.29956 8.70663C8.75956 10.1733 10.7329 10.8133 12.6462 10.6333ZM11.5529 11.98C9.66622 11.8733 7.79956 11.0933 6.35289 9.66663C4.90622 8.20663 4.13289 6.33329 4.02622 4.45329C2.15289 6.54663 2.22622 9.75996 4.23289 11.7733C6.24622 13.78 9.45956 13.8533 11.5529 11.98Z"
											fill="currentColor"
										/>
									</svg>
									<svg
									    v-if="option.id === 'willow'"
										viewBox="0 0 16 16"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										aria-hidden="true"
									>
										<path
											d="M7.9999 4.66671C8.88395 4.66671 9.7318 5.0179 10.3569 5.64302C10.982 6.26814 11.3332 7.11599 11.3332 8.00004C11.3332 8.8841 10.982 9.73194 10.3569 10.3571C9.7318 10.9822 8.88395 11.3334 7.9999 11.3334C7.11584 11.3334 6.26799 10.9822 5.64287 10.3571C5.01775 9.73194 4.66656 8.8841 4.66656 8.00004C4.66656 7.11599 5.01775 6.26814 5.64287 5.64302C6.26799 5.0179 7.11584 4.66671 7.9999 4.66671ZM7.9999 6.00004C7.46946 6.00004 6.96075 6.21075 6.58568 6.58583C6.21061 6.9609 5.9999 7.46961 5.9999 8.00004C5.9999 8.53047 6.21061 9.03918 6.58568 9.41425C6.96075 9.78933 7.46946 10 7.9999 10C8.53033 10 9.03904 9.78933 9.41411 9.41425C9.78918 9.03918 9.9999 8.53047 9.9999 8.00004C9.9999 7.46961 9.78918 6.9609 9.41411 6.58583C9.03904 6.21075 8.53033 6.00004 7.9999 6.00004ZM7.9999 1.33337L9.59323 3.61337C9.0999 3.43337 8.5599 3.33337 7.9999 3.33337C7.4399 3.33337 6.8999 3.43337 6.40656 3.61337L7.9999 1.33337ZM2.22656 4.66671L4.9999 4.43337C4.5999 4.77337 4.2399 5.18671 3.9599 5.66671C3.66656 6.16004 3.4999 6.66671 3.40656 7.19337L2.22656 4.66671ZM2.2399 11.3334L3.41323 8.82004C3.50656 9.33337 3.68656 9.85337 3.96656 10.3334C4.24656 10.8267 4.60656 11.24 4.9999 11.58L2.2399 11.3334ZM13.7666 4.66671L12.5866 7.19337C12.4932 6.66671 12.3132 6.15337 12.0332 5.66671C11.7532 5.18671 11.3999 4.76671 10.9999 4.42671L13.7666 4.66671ZM13.7599 11.3334L10.9999 11.5734C11.3932 11.2334 11.7466 10.8134 12.0266 10.3334C12.3066 9.84671 12.4866 9.33337 12.5799 8.80671L13.7599 11.3334ZM7.9999 14.6667L6.39323 12.3734C6.88656 12.5534 7.42656 12.6667 7.9999 12.6667C8.54656 12.6667 9.08656 12.5534 9.5799 12.3734L7.9999 14.6667Z"
											fill="currentColor"
										/>
									</svg>


									<span v-if="!isMobileView" style="margin-left: 4px">
									{{ option.label }}
									</span>
								</template>
							</Segmented>
						</div>

						<div class="btn-box">
							<a :href="link" target="_blank" rel="noopener noreferrer">
								<Button type="secondary" css="toggle-btn link-btn">
									<div>
									    <img :src="GitHubLogoIcon" alt="GitHub icon" />
									</div>
									<span v-if="!isMobileView">See code on GitHub</span>
								</Button>
							</a>
						</div>
					</div>
				</div>
			</div>
			<div class="wrapper-content" @click="show = false">
				<div data-wx-portal-root="true" class="content" :class="`wx-${skin}-theme`">
					<Globals>
					    <Locale>
						    <Router :product-tag="productTag" :skin="skin" @onnewpage="updateInfo" />
					    </Locale>
					</Globals>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
* {
	-webkit-tap-highlight-color: transparent;
}

.page-header :deep(*),
.sidebar :deep(*) {
	font-family: Roboto, Arial, Helvetica, sans-serif;
}

.page-header {
	--wx-border: 1px solid #ebebeb;
}

.layout {
	--demo-framework-color: #079C69;
	box-sizing: border-box;
	display: flex;
	height: 100%;
	width: 100%;
	position: relative;
}

.page-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: auto;
	min-width: 0;
}

.header-back-btn {
	height: 48px;
	width: 100%;
	padding: 8px 16px;
	border-bottom: var(--wx-border);
}

.header-back-btn .btn-box :deep(button.toggle-btn) {
	border: 1px solid transparent;
	padding: 5px;
	gap: 0;
	font-size: 16px;
	font-weight: 400;
	color: var(--demo-framework-color);
}
.header-back-btn .btn-box :deep(button.toggle-btn:hover),
.header-back-btn .btn-box :deep(button.toggle-btn:focus),
.header-back-btn .btn-box :deep(button.toggle-btn:active) {
	border: 1px solid transparent;
	background: transparent;
}
.header-back-btn .btn-box :deep(i) {
	color: var(--demo-framework-color);
}

.page-content-header {
	height: 60px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 40px;
	padding: 12px;
	border-bottom: var(--wx-border);
}

.narrow .page-content-header {
	height: 68px;
	padding: 12px 16px 12px 28px;
}

.header-title-box {
	display: flex;
	align-items: center;
	gap: 16px;
	flex-grow: 1;
	min-width: 0;
}

.header-actions-container {
	display: flex;
	align-items: center;
	gap: 16px;
}

.narrow .header-actions-container {
	gap: 12px;
}

.layout.active {
	flex-direction: row;
}

.sidebar {
	width: 0;
	height: 100%;
	overflow: hidden;
	transition: width 0.3s;
}

.narrow .sidebar {
	position: absolute;
	top: 0;
	left: 0;
	z-index: 10;
	transition: none;
}

.sidebar-header {
	height: 60px;
	display: flex;
	justify-content: space-between;
	position: sticky;
	top: 0px;
	padding: 14px 16px 14px 18px;
	background-color: #fbfbfb;
}

.box-title {
	display: flex;
	align-items: center;
	gap: 12px;
}

.box-title-img {
	&:hover,
	&:focus {
		opacity: 0.6;
	}

	&:active {
		opacity: 0.8;
	}
}

.separator {
	width: 1px;
	height: 20px;
	background: #ebebeb;
}

.sidebar.active,
.sidebar-content {
	width: 300px;
}

.narrow .sidebar.active,
.narrow .sidebar-content {
	width: 100%;
}

.sidebar-content {
	display: flex;
	flex-direction: column;
	gap: 16px;
	height: 100%;
	border-right: var(--wx-border);
	overflow-y: auto;
	font-size: 16px;
	line-height: 20px;
	background-color: #fbfbfb;
	border-bottom: var(--wx-border);
}

.btn-box :deep(button.toggle-btn) {
    display: flex;
	align-items: center;
	gap: 8px;
	border: var(--wx-border);
	color: #2c2f3c;
	font-weight: 500;
	line-height: 18px;
}
.btn-box :deep(button.toggle-btn:hover),
.btn-box :deep(button.toggle-btn:focus) {
    border: var(--wx-border);
	background: #f7f7f7;
}
.btn-box :deep(button.toggle-btn:active) {
	background: #f1f1f1;
}
.btn-box :deep(i) {
    opacity: 1;
    color: #42454d;
}

.btn-box :deep(button.toggle-btn.link-btn) {
	padding: 7px 19px;
	border-radius: 4px;
	align-items: center;
}
.narrow .btn-box :deep(button.toggle-btn.link-btn) {
	padding: 11px;
}

.btn-box :deep(button.toggle-btn.link-btn div) {
	width: 16px;
	height: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.narrow .btn-box :deep(button.toggle-btn.link-btn div) {
	width: 20px;
	height: 20px;
}

.btn-box :deep(button.toggle-btn.link-btn img) {
	height: 100%;
	width: 100%;
	object-fit: cover;
}

a {
	display: flex;
	text-decoration: none;
}

.wrapper-content {
	flex: 1;
	height: calc(100% - 60px);
}

.narrow .wrapper-content {
	height: calc(100% - 116px);
}

.content {
	position: relative;
	width: 100%;
	height: 100%;
	transition:
		transform 0.3s,
		width 0.3s;
	overflow-y: auto;
}
.content :deep(h4) {
	font-size: 16px;
	font-weight: 300;
	margin-bottom: 12px;
	border-bottom: var(--wx-border);
}

.content :deep(h3) {
	font-size: 18px;
	margin: 12px 0;
	font-weight: normal;
}
.content :deep(.demo-box) {
	margin: 20px;
}
.content :deep(.demo-box + .demo-box) {
	margin-top: 40px;
}
.content :deep(.demo-code) {
	font-family: monospace;
	line-height: 30px;
}

.content :deep(.demo-status) {
	height: 30px;
	line-height: 30px;
	background: rgba(0, 0, 0, 0.15);
	padding-left: 10px;
}

.content :deep(.demo-toolbar) {
	border: 2px solid var(--wx-background-alt);
	max-width: 600px;
}

.box-links {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.hint {
	font-size: 16px;
	font-weight: 500;
	line-height: 24px;
	color: #42454d;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.title {
	margin: 0;
	font-size: 18px;
	font-weight: 500;
	line-height: 24px;
	color: #42454d;
	white-space: nowrap;
}

.segmented-box :deep(div.segmented-themes) {
    height: 36px;
	padding: 2px;
	border-radius: 4px;
}

.segmented-box :deep(div.segmented-themes button) {
    font-size: 14px;
	font-weight: 400;
	line-height: 18px;
	color: var(--wx-color-font-alt);
	background-color: transparent;
	padding: 7px 12px;
	border: none;
}

.segmented-box :deep(div.segmented-themes button.wx-selected) {
    border-radius: 2px;
	font-weight: 500;
	color: var(--wx-color-font);
	background: #fff;
	box-shadow: 0px 0px 7px 0px rgba(66, 69, 76, 0.07);
}

.layout :deep(div.segmented-themes svg) {
	height: 16px;
	width: 16px;
}

.narrow .segmented-box :deep(div.segmented-themes) {
	height: 44px;
}
.narrow .segmented-box :deep(div.segmented-themes button) {
	padding: 7px 10px;
}
.narrow .segmented-box :deep(div.segmented-themes button svg) {
	height: 24px;
	width: 24px;
}
</style>
