<template>
	<section class="max-w-[1440px] mx-auto px-4 py-10">
		<!-- Верхняя часть профиля -->
		<div class="flex items-center gap-6">
			<!-- Аватар -->
			<img
				src="/avatar.png"
				alt="User Avatar"
				class="w-24 h-24 rounded-full object-cover"
			/>
			<!-- Инфо -->
			<div>
				<h2 class="text-xl font-semibold">Li Qiang</h2>
				<p class="text-gray-600">23 года</p>
				<p class="text-gray-500 text-sm">Ташкент</p>
			</div>
			<!-- Кнопка изменить -->
			<button
				class="ml-auto text-gray-500 hover:text-gray-800 text-sm flex items-center gap-1"
			>
				✏️ Изменить
			</button>
		</div>

		<!-- Навигация вкладок -->
		<nav class="flex gap-6 mt-6 border-b border-gray-200">
			<a href="#" class="pb-2 border-b-2 border-black font-medium">Профиль</a>
			<a href="#" class="pb-2 text-gray-500 hover:text-black">Заказы</a>
			<a href="#" class="pb-2 text-gray-500 hover:text-black">Бонусы</a>
			<a href="#" class="pb-2 text-gray-500 hover:text-black">Адреса</a>
		</nav>

		<!-- Характеристики -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
			<div class="bg-gray-100 rounded-xl p-4 flex flex-col items-center">
				<span class="text-gray-500 text-2xl">ℹ️</span>
				<p class="mt-2 text-gray-600">Рост</p>
				<p class="font-semibold">123 см</p>
			</div>
			<div class="bg-gray-100 rounded-xl p-4 flex flex-col items-center">
				<span class="text-gray-500 text-2xl">ℹ️</span>
				<p class="mt-2 text-gray-600">Рост</p>
				<p class="font-semibold">123 см</p>
			</div>
			<div class="bg-gray-100 rounded-xl p-4 flex flex-col items-center">
				<span class="text-gray-500 text-2xl">ℹ️</span>
				<p class="mt-2 text-gray-600">Рост</p>
				<p class="font-semibold">123 см</p>
			</div>
			<div class="bg-gray-100 rounded-xl p-4 flex flex-col items-center">
				<span class="text-gray-500 text-2xl">ℹ️</span>
				<p class="mt-2 text-gray-600">Рост</p>
				<p class="font-semibold">123 см</p>
			</div>
		</div>

		<!-- Здоровье -->
		<h3 class="text-lg font-semibold mt-10 mb-4">Здоровье</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="bg-gray-100 rounded-xl p-4">
				<div class="flex items-center gap-2">
					<span class="text-red-500 text-2xl">❤️</span>
					<p class="font-medium">Физическая активность</p>
				</div>
				<p class="text-green-600 text-sm mt-1">Высокая</p>
				<div class="w-full h-1 bg-gray-300 rounded-full mt-2">
					<div class="w-3/4 h-full bg-green-500 rounded-full"></div>
				</div>
			</div>
			<div class="bg-gray-100 rounded-xl p-4">
				<div class="flex items-center gap-2">
					<span class="text-red-500 text-2xl">❤️</span>
					<p class="font-medium">Физическая активность</p>
				</div>
				<p class="text-green-600 text-sm mt-1">Высокая</p>
				<div class="w-full h-1 bg-gray-300 rounded-full mt-2">
					<div class="w-2/3 h-full bg-green-500 rounded-full"></div>
				</div>
			</div>
			<div class="bg-gray-100 rounded-xl p-4">
				<div class="flex items-center gap-2">
					<span class="text-red-500 text-2xl">❤️</span>
					<p class="font-medium">Физическая активность</p>
				</div>
				<p class="text-green-600 text-sm mt-1">Высокая</p>
				<div class="w-full h-1 bg-gray-300 rounded-full mt-2">
					<div class="w-4/5 h-full bg-green-500 rounded-full"></div>
				</div>
			</div>
			<div class="bg-gray-100 rounded-xl p-4">
				<div class="flex items-center gap-2">
					<span class="text-red-500 text-2xl">❤️</span>
					<p class="font-medium">Физическая активность</p>
				</div>
				<p class="text-green-600 text-sm mt-1">Высокая</p>
				<div class="w-full h-1 bg-gray-300 rounded-full mt-2">
					<div class="w-1/2 h-full bg-green-500 rounded-full"></div>
				</div>
			</div>
		</div>
	</section>
</template>
