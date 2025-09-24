<template>
	<section class="max-w-[1440px] mx-auto py-16">
		<div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
			<!-- Левая часть -->
			<div>
				<h3 class="text-sm text-gray-500 tracking-wide uppercase">
					МЫ ЗДЕСЬ, ЧТОБЫ ПОМОЧЬ ВАМ
				</h3>
				<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mt-3">
					Подберите <br />
					идеальные витамины <br />
					для своего здоровья
				</h2>
				<p class="text-gray-600 mt-4">
					Оставьте заявку — мы подскажем, что подойдет именно вам
				</p>

				<!-- Контакты -->
				<div class="mt-8 space-y-6">
					<!-- Адрес -->
					<div class="flex items-start space-x-4">
						<div
							class="w-12 h-12 flex items-center justify-center rounded-full``"
						>
							<img src="/Vector.png" alt="Адрес" class="w-6 h-6" />
						</div>
						<div>
							<h4 class="text-gray-900 font-medium">Наш адрес</h4>
							<p class="text-gray-700">г. Ташкент, ул. Примерная 123</p>
						</div>
					</div>

					<!-- Телефон -->
					<div class="flex items-start space-x-4">
						<div
							class="w-12 h-12 flex items-center justify-center rounded-full"
						>
							<img src="/telephone.png" alt="Телефон" class="w-6 h-6" />
						</div>
						<div>
							<h4 class="text-gray-900 font-medium">Телефон</h4>
							<p class="text-gray-700">+998 (90) 123-45-67</p>
						</div>
					</div>

					<!-- Email -->
					<div class="flex items-start space-x-4">
						<div
							class="w-12 h-12 flex items-center justify-center rounded-full"
						>
							<img src="/icon.png" alt="Email" class="w-6 h-6" />
						</div>
						<div>
							<h4 class="text-gray-900 font-medium">Электронная почта</h4>
							<p class="text-gray-700">info@company.com</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Правая часть (Форма) -->
			<div class="bg-[#F5F5F5] rounded-2xl p-8">
				<form class="space-y-5">
					<div>
						<label class="block text-sm font-medium text-gray-700">Имя</label>
						<input
							type="text"
							placeholder="Введите ваше имя"
							class="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-[#60D8D8] focus:outline-none"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700">Email</label>
						<input
							type="email"
							placeholder="Введите ваш email"
							class="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-[#60D8D8] focus:outline-none"
						/>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700"
							>Сообщение</label
						>
						<textarea
							rows="4"
							placeholder="Введите текст"
							class="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-[#60D8D8] focus:outline-none"
						></textarea>
					</div>

					<button
						type="submit"
						class="w-full bg-[#8280FF] hover:bg-[#60D8D8] text-white font-semibold py-3 rounded-xl transition"
					>
						Отправить заявку
					</button>
				</form>
			</div>
		</div>
	</section>
</template>
