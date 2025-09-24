<template>
	<section class="w-full bg-white py-12">
		<div class="max-w-[1440px] mx-auto px-4 flex flex-col min-h-[600px]">
			<!-- Заголовок + поиск -->
			<div
				class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
			>
				<h2 class="text-2xl font-bold">Каталог витаминов</h2>
				<div class="relative w-full md:w-80">
					<input
						type="text"
						placeholder="Поиск"
						class="w-full rounded-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
					/>
					<svg
						class="w-5 h-5 absolute right-4 top-2.5 text-gray-400 pointer-events-none"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
				</div>
			</div>

			<!-- Фильтры -->
			<div class="flex flex-wrap gap-3 mb-8">
				<button class="px-4 py-1 rounded-full bg-teal-400 text-white text-sm">
					Популярные
				</button>
				<button
					class="px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-sm"
				>
					Новинки
				</button>
				<button
					class="px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-sm"
				>
					Для детей
				</button>
				<button
					class="px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-sm"
				>
					Для женщин
				</button>
				<button
					class="px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-sm"
				>
					Для мужчин
				</button>
			</div>

			<!-- Сетка товаров -->
			<div class="flex-1">
				<!-- пока пусто -->
				<!-- здесь будут товары -->
			</div>

			<!-- Пагинация -->
			<div class="flex justify-center mt-10 gap-2">
				<button
					class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
				>
					&lt;
				</button>
				<button
					class="w-9 h-9 flex items-center justify-center rounded-full bg-teal-400 text-white"
				>
					1
				</button>
				<button
					class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
				>
					2
				</button>
				<button
					class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
				>
					3
				</button>
				<button
					class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
				>
					...
				</button>
				<button
					class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
				>
					5
				</button>
				<button
					class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
				>
					&gt;
				</button>
			</div>
		</div>
	</section>
</template>
