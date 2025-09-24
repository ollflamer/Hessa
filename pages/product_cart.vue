<template>
	<section
		class="max-w-[1200px] mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-10"
	>
		<!-- Левая часть - изображения -->
		<div>
			<img
				src="/product-big.png"
				alt="Товар"
				class="w-full rounded-2xl shadow-md"
			/>
			<!-- Миниатюры -->
			<div class="flex gap-3 mt-4">
				<img
					src="/product-big.png"
					alt="Превью"
					class="w-20 h-20 rounded-xl border cursor-pointer hover:border-teal-500"
				/>
				<img
					src="/product-big.png"
					alt="Превью"
					class="w-20 h-20 rounded-xl border cursor-pointer hover:border-teal-500"
				/>
				<img
					src="/product-big.png"
					alt="Превью"
					class="w-20 h-20 rounded-xl border cursor-pointer hover:border-teal-500"
				/>
			</div>
		</div>

		<!-- Правая часть - описание -->
		<div class="flex flex-col justify-between">
			<!-- Название -->
			<h1 class="text-2xl font-semibold mb-2">
				Solgar, цинк, 50 мг, 100 таблеток
			</h1>
			<!-- Цена -->
			<p class="text-2xl font-bold text-gray-900 mb-3">2 000 000 сум</p>
			<!-- Описание -->
			<p class="text-gray-600 mb-4">
				Цинк — ключевой элемент для иммунитета, заживления кожи и
				антиоксидантной защиты.
			</p>

			<!-- Размеры -->
			<div class="mb-5">
				<p class="font-medium mb-2">Размер / Объем:</p>
				<div class="flex gap-2">
					<button class="px-4 py-2 border rounded-lg hover:bg-teal-50">
						30 мл
					</button>
					<button class="px-4 py-2 border rounded-lg bg-teal-500 text-white">
						60 мл
					</button>
					<button class="px-4 py-2 border rounded-lg hover:bg-teal-50">
						90 мл
					</button>
					<button class="px-4 py-2 border rounded-lg hover:bg-teal-50">
						100 мл
					</button>
				</div>
			</div>

			<!-- Количество -->
			<div class="flex items-center gap-3 mb-5">
				<button
					class="w-8 h-8 flex items-center justify-center border rounded-lg"
				>
					-
				</button>
				<span class="px-3">1</span>
				<button
					class="w-8 h-8 flex items-center justify-center border rounded-lg"
				>
					+
				</button>
			</div>

			<!-- Иконки -->
			<div class="flex gap-6 mb-6">
				<div class="flex flex-col items-center text-sm text-gray-600">
					<img src="/icon1.png" alt="Иконка 1" class="w-8 h-8 mb-1" />
					<span>Без лактозы</span>
				</div>
				<div class="flex flex-col items-center text-sm text-gray-600">
					<img src="/icon2.png" alt="Иконка 2" class="w-8 h-8 mb-1" />
					<span>Веган</span>
				</div>
				<div class="flex flex-col items-center text-sm text-gray-600">
					<img src="/icon3.png" alt="Иконка 3" class="w-8 h-8 mb-1" />
					<span>GMO Free</span>
				</div>
			</div>

			<!-- Кнопки -->
			<div class="flex gap-4">
				<button class="px-6 py-3 border rounded-xl hover:bg-gray-100">
					Добавить в корзину
				</button>
				<button
					class="px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600"
				>
					Купить сейчас
				</button>
			</div>

			<!-- Доп. текст -->
			<p class="text-sm text-gray-500 mt-4">
				Наша продукция сертифицирована в РБ, а производство соответствует
				стандарту ISO
			</p>
		</div>
	</section>
</template>
