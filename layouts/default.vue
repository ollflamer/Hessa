<template>
	<header
		class="flex justify-between items-center px-6 md:px-10 py-6 max-w-[1440px] mx-auto"
	>
		<!-- Логотип -->
		<NuxtLink
			to="/"
			class="text-2xl font-semibold tracking-wide text-[#60D8D8]"
		>
			Hessa
		</NuxtLink>

		<!-- Навигация (десктоп) -->
		<nav class="hidden md:flex gap-10 text-[16px] font-medium">
			<NuxtLink to="/catalog" class="hover:text-[#60D8D8] transition">
				Каталог
			</NuxtLink>
			<NuxtLink to="/companies" class="hover:text-[#60D8D8] transition">
				Для компаний
			</NuxtLink>
			<NuxtLink to="/contact" class="hover:text-[#60D8D8] transition">
				Контакты
			</NuxtLink>
		</nav>

		<!-- Кнопка и бургер -->
		<div class="flex items-center gap-4">
			<button
				class="bg-[#60D8D8] hover:bg-gray-300 transition text-white font-semibold px-5 py-3 rounded-xl text-sm"
			>
				Войти
			</button>

			<!-- Бургер (мобильный) -->
			<button
				@click="toggleMenu"
				class="md:hidden focus:outline-none"
				aria-label="Открыть меню"
			>
				<svg
					class="w-6 h-6 text-[#60D8D8]"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					viewBox="0 0 24 24"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M4 6h16M4 12h16M4 18h16"></path>
				</svg>
			</button>
		</div>
	</header>

	<!-- Mobile menu -->
	<div
		class="fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden"
		:class="isOpen ? 'translate-x-0' : 'translate-x-full'"
	>
		<div class="p-6 flex flex-col gap-6">
			<button @click="closeMenu" class="self-end" aria-label="Закрыть меню">
				<svg
					class="w-6 h-6 text-gray-600"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					viewBox="0 0 24 24"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>

			<NuxtLink
				to="/catalog"
				class="text-gray-800 text-lg font-medium hover:text-[#60D8D8]"
				@click="closeMenu"
			>
				Каталог
			</NuxtLink>
			<NuxtLink
				to="/companies"
				class="text-gray-800 text-lg font-medium hover:text-[#60D8D8]"
				@click="closeMenu"
			>
				Для компаний
			</NuxtLink>
			<NuxtLink
				to="/contact"
				class="text-gray-800 text-lg font-medium hover:text-[#60D8D8]"
				@click="closeMenu"
			>
				Контакты
			</NuxtLink>
		</div>
	</div>
	<main>
		<slot />
	</main>
	<footer class="bg-[#EEEEEE] py-10 w-full">
		<div
			class="max-w-[1440px] flex mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-700"
		>
			<!-- Левая часть -->
			<div>
				<h2 class="text-2xl font-semibold text-[#60D8D8] mb-2">Hessa</h2>
				<p class="mb-4 max-w-xs">
					Витамины, которые знают, чего ты хочешь от жизни
				</p>
				<div class="flex space-x-4">
					<!-- Иконки можно заменить на SVG для лучшего качества -->
					<a href="#"
						><img
							src="https://img.icons8.com/ios-glyphs/24/000000/telegram-app.png"
							alt="Telegram"
					/></a>
					<a href="#"
						><img
							src="https://img.icons8.com/ios-glyphs/24/000000/vk-com.png"
							alt="VK"
					/></a>
					<a href="#"
						><img
							src="https://img.icons8.com/ios-glyphs/24/000000/youtube-play.png"
							alt="YouTube"
					/></a>
					<a href="#"
						><img
							src="https://img.icons8.com/ios-glyphs/24/000000/instagram-new.png"
							alt="Instagram"
					/></a>
					<a href="#"
						><img
							src="https://img.icons8.com/ios-glyphs/24/000000/cancel.png"
							alt="X"
					/></a>
				</div>
			</div>

			<!-- Центр -->
			<div>
				<h3 class="font-semibold mb-2">Контакты</h3>
				<p class="flex items-center mb-1">
					<svg
						class="w-4 h-4 mr-2 text-gray-600"
						fill="currentColor"
						viewBox="0 0 24 24"
					>
						<path d="M4 4h16v2H4V4zm0 6h16v2H4v-2zm0 6h10v2H4v-2z" />
					</svg>
					hessa@hessa.uz
				</p>
				<p class="flex items-center">
					<svg
						class="w-4 h-4 mr-2 text-gray-600"
						fill="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M6.62 10.79a15.093 15.093 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.11-.21 11.05 11.05 0 003.89.74c.55 0 1 .45 1 1v3.75a1 1 0 01-1 1C8.36 22.66 1.34 15.64 1.34 7a1 1 0 011-1h3.75a1 1 0 011 1c0 1.34.25 2.63.74 3.89a1.003 1.003 0 01-.21 1.11l-2.2 2.2z"
						/>
					</svg>
					+998 90 123 4567
				</p>
			</div>

			<!-- Правая часть -->
			<div>
				<h3 class="font-semibold mb-2">Документы</h3>
				<ul class="space-y-1">
					<li><a href="#" class="hover:underline">Сертификаты</a></li>
					<li><a href="#" class="hover:underline">Договор оферты</a></li>
					<li>
						<a href="#" class="hover:underline">Пользовательское соглашение</a>
					</li>
					<li>
						<a href="#" class="hover:underline">Политика конфиденциальности</a>
					</li>
					<li>
						<a href="#" class="hover:underline">Отказ от ответственности</a>
					</li>
					<li><a href="#" class="hover:underline">Правила акций</a></li>
				</ul>
			</div>
		</div>
	</footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// состояние меню
const isOpen = ref(false)

// функции открытия/закрытия
const toggleMenu = () => {
	isOpen.value = !isOpen.value
}
const closeMenu = () => {
	isOpen.value = false
}
</script>
