<template>
	<!-- Hero-секция -->
	<section
		class="bg-[url('BG/survey.png')] rounded-3xl p-8 mx-4 my-8 md:mx-auto max-w-[1440px] min-h-[400px] flex flex-col md:flex-row items-stretch justify-between gap-6"
	>
		<!-- Текст -->
		<div class="text-white max-w-xl flex flex-col justify-center">
			<h1 class="text-3xl md:text-4xl font-semibold mb-4">
				Hessa — это ваши<br />
				витамины на каждый день
			</h1>
			<p class="mb-4">
				Узнаете правду о витаминах и научитесь <br />
				обогащать свой рацион
			</p>
			<div class="flex items-center gap-6">
				<a
					href="#"
					class="border border-white text-white px-5 py-2 rounded-lg hover:bg-white hover:text-cyan-500 transition"
				>
					Пройти опросник
				</a>
				<p class="text-sm">
					&gt; 10 тыс. <br /><span class="opacity-80"
						>Реальных покупателей</span
					>
				</p>
			</div>
		</div>

		<!-- Картинка — прилипает к низу секции -->
		<div class="w-full max-w-md flex items-end">
			<img src="/Bottles.png" alt="Bottles" class="w-full h-auto" />
		</div>
	</section>

	<!-- Статистика -->
	<section
		class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-[1440px] mx-4 md:mx-auto mb-10"
	>
		<!-- Карточка 1 -->
		<div class="bg-gray-100 p-6 rounded-2xl text-center">
			<div class="text-2xl font-bold mb-2">1</div>
			<p>Больше 3 лет работает своё производство в Москве</p>
		</div>
		<!-- Карточка 2 -->
		<div class="bg-gray-100 p-6 rounded-2xl text-center">
			<div class="text-2xl font-bold mb-2">2</div>
			<p>Больше 1 миллиона клиентов доверяют Halsa</p>
		</div>
		<!-- Карточка 3 -->
		<div class="bg-gray-100 p-6 rounded-2xl text-center">
			<div class="text-2xl font-bold mb-2">3</div>
			<p>Проверенное сертифицированное сырьё</p>
		</div>
		<!-- Карточка 4 -->
		<div class="bg-cyan-400 text-white p-6 rounded-2xl text-center">
			<div class="text-2xl font-bold mb-2">4</div>
			<p>Больше 60 витаминных комплексов в продуктовой линейке</p>
		</div>
	</section>

	<!-- Можно и без ClientOnly, но так надёжнее для SSR -->
	<section
		class="w-full bg-[#ECECEC] h-[90px] overflow-hidden flex items-center"
	>
		<div
			ref="marquee"
			class="flex whitespace-nowrap will-change-transform"
		></div>
	</section>

	<section class="max-w-[1440px] mx-auto px-4 py-12">
		<!-- Заголовок и кнопки -->
		<div class="flex justify-between items-center mb-6">
			<h2 class="text-2xl md:text-3xl font-semibold">
				Почувствуйте разницу<br />
				через 30 дней
			</h2>

			<!-- Кнопки -->
			<div class="flex gap-4">
				<button
					class="swiper-button-prev-custom w-10 h-10 rounded-full bg-cyan-200 flex items-center justify-center hover:bg-cyan-300 transition"
				>
					←
				</button>
				<button
					class="swiper-button-next-custom w-10 h-10 rounded-full bg-cyan-200 flex items-center justify-center hover:bg-cyan-300 transition"
				>
					→
				</button>
			</div>
		</div>

		<!-- Слайдер -->
		<Swiper
			:modules="[Navigation]"
			:space-between="20"
			:slides-per-view="1"
			:breakpoints="{
				640: { slidesPerView: 1 },
				768: { slidesPerView: 2 },
				1024: { slidesPerView: 3 },
			}"
			:navigation="{
				nextEl: '.swiper-button-next-custom',
				prevEl: '.swiper-button-prev-custom',
			}"
			class="mySwiper"
		>
			<!-- Слайд -->
			<SwiperSlide>
				<div class="relative bg-white rounded-2xl overflow-hidden shadow-md">
					<img
						src="/Girl_ticket.png"
						alt="product"
						class="w-full h-[400px] object-cover"
					/>
					<div
						class="absolute bottom-0 w-full p-4 text-white bg-gradient-to-t from-black/70 via-black/30 to-transparent"
					>
						<h3 class="font-semibold text-lg">Сияющая, гладкая кожа</h3>
						<p class="text-sm opacity-80">
							Комплекс с витаминами и уходовой косметикой
						</p>
						<button
							class="mt-3 border border-white rounded-xl px-4 py-1 text-sm hover:bg-white hover:text-black transition"
						>
							Начать
						</button>
					</div>
				</div>
			</SwiperSlide>

			<!-- Ещё слайды -->
			<SwiperSlide>
				<div class="relative bg-white rounded-2xl overflow-hidden shadow-md">
					<img
						src="/Girl_ticket.png"
						alt="product"
						class="w-full h-[400px] object-cover"
					/>
					<div
						class="absolute bottom-0 w-full p-4 text-white bg-gradient-to-t from-black/70 via-black/30 to-transparent"
					>
						<h3 class="font-semibold text-lg">Сияющая, гладкая кожа</h3>
						<p class="text-sm opacity-80">
							Комплекс с витаминами и уходовой косметикой
						</p>
						<button
							class="mt-3 border border-white rounded-xl px-4 py-1 text-sm hover:bg-white hover:text-black transition"
						>
							Начать
						</button>
					</div>
				</div>
			</SwiperSlide>

			<SwiperSlide>
				<div class="relative bg-white rounded-2xl overflow-hidden shadow-md">
					<img
						src="/Girl_ticket.png"
						alt="product"
						class="w-full h-[400px] object-cover"
					/>
					<div
						class="absolute bottom-0 w-full p-4 text-white bg-gradient-to-t from-black/70 via-black/30 to-transparent"
					>
						<h3 class="font-semibold text-lg">Сияющая, гладкая кожа</h3>
						<p class="text-sm opacity-80">
							Комплекс с витаминами и уходовой косметикой
						</p>
						<button
							class="mt-3 border border-white rounded-xl px-4 py-1 text-sm hover:bg-white hover:text-black transition"
						>
							Начать
						</button>
					</div>
				</div>
			</SwiperSlide>
		</Swiper>
	</section>

	<!-- Секция: 3 Этапа контроля для
безупречного качества -->
	<section
		class="w-full bg-[url('BG/3-steps.png')] bg-no-repeat bg-cover bg-center p-8 my-12 flex flex-col-reverse md:flex-row items-center text-white px-4"
	>
		<!-- Левая часть (картинка) уйдёт вниз на мобилке -->
		<div class="w-full md:w-1/2 flex justify-center">
			<img
				src="/girl_with_ticket.png"
				alt="Девушка с продуктом"
				class="max-h-[420px] object-contain"
			/>
		</div>

		<!-- Правая часть: текст + карточки -->
		<div class="w-full md:w-1/2 flex flex-col gap-6">
			<div>
				<p class="text-sm opacity-80 mb-1">Качество под контролем</p>
				<h2 class="text-2xl md:text-3xl font-semibold leading-snug">
					3 Этапа контроля для <br />
					безупречного качества
				</h2>
			</div>

			<!-- Карточки -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-black">
				<!-- Карточка 1 -->
				<div class="bg-white rounded-2xl p-4 shadow">
					<div class="flex items-center gap-2 mb-2">
						<img
							src="https://i.imgur.com/ahVOUvQ.png"
							alt="experts"
							class="w-6 h-6 rounded-full ring-2 ring-white"
						/>
						<img
							src="https://i.imgur.com/MoeFxZk.png"
							alt="experts"
							class="w-6 h-6 rounded-full ring-2 ring-white -ml-2"
						/>
					</div>
					<h3 class="font-semibold">Разрабатываем формулы с врачами</h3>
					<p class="text-sm text-gray-600 mt-1">
						Команда экспертов со стажем от 20 лет
					</p>
				</div>

				<!-- Карточка 2 -->
				<div class="bg-white rounded-2xl p-4 shadow">
					<div class="flex items-center gap-2 mb-2">
						<span
							class="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded"
							>ISO</span
						>
						<span
							class="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded"
							>ISO</span
						>
					</div>
					<h3 class="font-semibold">Производим по международным стандартам</h3>
					<p class="text-sm text-gray-600 mt-1">
						Автоматическое оборудование и стерильное производство
					</p>
				</div>

				<!-- Карточка 3 -->
				<div class="bg-white rounded-2xl p-4 shadow sm:col-span-2">
					<div class="flex items-center gap-2 mb-2">
						<img
							src="https://www.svgrepo.com/show/355037/cruelty-free.svg"
							class="w-6 h-6"
							alt="cruelty free"
						/>
						<img
							src="https://www.svgrepo.com/show/355037/cruelty-free.svg"
							class="w-6 h-6"
							alt="cruelty free"
						/>
					</div>
					<h3 class="font-semibold">Тестируем в независимых лабораториях</h3>
					<p class="text-sm text-gray-600 mt-1">
						Все продукты сертифицированы в УЗБ
					</p>
				</div>
			</div>
		</div>
	</section>

	<section class="py-16 bg-[#fffff]">
		<div class="max-w-6xl mx-auto px-4 text-center">
			<h3 class="text-gray-600 text-sm uppercase">Отзывы</h3>
			<h2 class="text-2xl md:text-3xl font-bold mb-10">
				Преобразующий опыт наших клиентов
			</h2>

			<!-- Слайдер -->
			<div
				class="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide space-x-6"
			>
				<!-- Карточка -->
				<div
					class="snap-center min-w-[300px] md:min-w-[350px] bg-gray-100 rounded-xl p-6 text-left shadow"
				>
					<p class="italic text-lg">
						“Впечатлен профессионализмом и вниманием к деталям”
					</p>
					<div class="flex items-center mt-4">
						<img
							src="/Ellipse.png"
							class="w-10 h-10 rounded-full"
							alt="avatar"
						/>
						<div class="ml-3">
							<h4 class="font-semibold">Инга Леска</h4>
							<span class="text-gray-500 text-sm">Клиент</span>
						</div>
					</div>
				</div>
				<!-- Повторить карточки -->
				<div
					class="snap-center min-w-[300px] md:min-w-[350px] bg-gray-100 rounded-xl p-6 text-left shadow"
				>
					<p class="italic text-lg">
						“Впечатлен профессионализмом и вниманием к деталям”
					</p>
					<div class="flex items-center mt-4">
						<img
							src="/Ellipse.png"
							class="w-10 h-10 rounded-full"
							alt="avatar"
						/>
						<div class="ml-3">
							<h4 class="font-semibold">Инга Леска</h4>
							<span class="text-gray-500 text-sm">Клиент</span>
						</div>
					</div>
				</div>
				<div
					class="snap-center min-w-[300px] md:min-w-[350px] bg-gray-100 rounded-xl p-6 text-left shadow"
				>
					<p class="italic text-lg">
						“Впечатлен профессионализмом и вниманием к деталям”
					</p>
					<div class="flex items-center mt-4">
						<img
							src="/Ellipse.png"
							class="w-10 h-10 rounded-full"
							alt="avatar"
						/>
						<div class="ml-3">
							<h4 class="font-semibold">Инга Леска</h4>
							<span class="text-gray-500 text-sm">Клиент</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Часто задаваемые вопросы -->
	<section class="max-w-[800px] mx-auto px-4 py-16 text-center">
		<h2 class="text-2xl font-semibold mb-1">Часто задаваемые вопросы</h2>
		<p class="text-gray-500 mb-8">Доверяют более 100+ клиентов</p>

		<!-- Вопросы -->
		<div class="space-y-4 text-left">
			<!-- Элемент FAQ -->
			<div class="bg-gray-100 rounded-xl overflow-hidden">
				<button
					class="faq-toggle w-full px-6 py-4 flex items-center justify-between"
				>
					<span class="font-medium">Вопрос №1</span>
					<div
						class="w-7 h-7 bg-[#60D8D8] text-white flex items-center justify-center rounded-full text-xl leading-none transition-transform transform duration-300"
					>
						+
					</div>
				</button>
				<div class="faq-answer px-6 pb-4 text-gray-600 hidden">
					Ответ на первый вопрос. Здесь можно написать подробное пояснение или
					инструкцию.
				</div>
			</div>

			<!-- Копируй и дублируй по образцу ниже -->
			<div class="bg-gray-100 rounded-xl overflow-hidden">
				<button
					class="faq-toggle w-full px-6 py-4 flex items-center justify-between"
				>
					<span class="font-medium">Вопрос №2</span>
					<div
						class="w-7 h-7 bg-[#60D8D8] text-white flex items-center justify-center rounded-full text-xl leading-none transition-transform transform duration-300"
					>
						+
					</div>
				</button>
				<div class="faq-answer px-6 pb-4 text-gray-600 hidden">
					Ответ на второй вопрос. Текст по желанию.
				</div>
			</div>

			<!-- Добавь ещё столько, сколько нужно -->
			<div class="bg-gray-100 rounded-xl overflow-hidden">
				<button
					class="faq-toggle w-full px-6 py-4 flex items-center justify-between"
				>
					<span class="font-medium">Вопрос №2</span>
					<div
						class="w-7 h-7 bg-[#60D8D8] text-white flex items-center justify-center rounded-full text-xl leading-none transition-transform transform duration-300"
					>
						+
					</div>
				</button>
				<div class="faq-answer px-6 pb-4 text-gray-600 hidden">
					Ответ на второй вопрос. Текст по желанию.
				</div>
			</div>
			<div class="bg-gray-100 rounded-xl overflow-hidden">
				<button
					class="faq-toggle w-full px-6 py-4 flex items-center justify-between"
				>
					<span class="font-medium">Вопрос №2</span>
					<div
						class="w-7 h-7 bg-[#60D8D8] text-white flex items-center justify-center rounded-full text-xl leading-none transition-transform transform duration-300"
					>
						+
					</div>
				</button>
				<div class="faq-answer px-6 pb-4 text-gray-600 hidden">
					Ответ на второй вопрос. Текст по желанию.
				</div>
			</div>
			<div class="bg-gray-100 rounded-xl overflow-hidden">
				<button
					class="faq-toggle w-full px-6 py-4 flex items-center justify-between"
				>
					<span class="font-medium">Вопрос №2</span>
					<div
						class="w-7 h-7 bg-[#60D8D8] text-white flex items-center justify-center rounded-full text-xl leading-none transition-transform transform duration-300"
					>
						+
					</div>
				</button>
				<div class="faq-answer px-6 pb-4 text-gray-600 hidden">
					Ответ на второй вопрос. Текст по желанию.
				</div>
			</div>
		</div>
	</section>

	<!-- Секция подписки -->
	<section
		class="relative bg-[url('BG/subscription-bg.png')] bg-cover bg-center rounded-3xl mx-4 my-12 md:mx-auto max-w-[1440px] min-h-[400px] flex items-center justify-center"
	>
		<!-- Затемняющий слой -->
		<div class="absolute inset-0 bg-black/10 rounded-3xl"></div>

		<!-- Контент -->
		<div
			class="relative z-10 p-8 flex flex-col md:flex-row items-center justify-center text-center gap-8"
		>
			<!-- Левая часть (только иконка) -->
			<div class="flex justify-center flex-shrink-0">
				<img
					src="/mail_icon.png"
					alt="Иконка почты"
					class="w-20 h-20 md:w-24 md:h-24"
				/>
			</div>

			<!-- Правая часть (тексты + форма) -->
			<div class="flex-1 text-white max-w-2xl">
				<h2 class="text-xl md:text-2xl font-bold">
					Эксклюзивная скидка 15% для новых подписчиков рассылки
				</h2>
				<p class="mt-2 text-sm md:text-base">
					Только проверенная информация о витаминах, здоровье и красоте — плюс
					первыми узнавайте о скидках и спецпредложениях!
				</p>

				<form
					class="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full"
				>
					<input
						type="email"
						placeholder="Укажите свой email"
						class="flex-1 w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
						required
					/>
					<button
						type="submit"
						class="px-6 py-3 rounded-lg bg-white text-gray-800 border border-gray-200 hover:bg-gray-100 transition"
					>
						Подписаться
					</button>
				</form>

				<p class="text-xs text-white/80 mt-3">
					Заполняя эту форму, вы соглашаетесь с нашей
					<a href="#" class="underline">политикой конфиденциальности</a>.
				</p>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'

// Стили swiper
import 'swiper/css'
import 'swiper/css/navigation'

// --- Marquee logic ---
const marquee = ref<HTMLElement | null>(null)

const blockHTML = `
  <div class="flex items-center gap-16 px-8">
    <span class="flex items-center gap-2">
      <img src="/percent.png" class="w-6 h-6" />
      Скидка 23% на первый заказ
    </span>
    <span class="flex items-center gap-2">
      <img src="/delivery.png" class="w-6 h-6" />
      Бесплатная доставка по Узбекистану
    </span>
    <span class="flex items-center gap-2">
      <img src="/credit.png" class="w-6 h-6" />
      Оплата долями
    </span>
  </div>
`

function fillMarquee() {
	const containerWidth = window.innerWidth
	let content = ''

	const testDiv = document.createElement('div')
	testDiv.style.position = 'absolute'
	testDiv.style.visibility = 'hidden'
	testDiv.innerHTML = blockHTML
	document.body.appendChild(testDiv)

	const blockWidth = testDiv.offsetWidth
	document.body.removeChild(testDiv)

	const repeatCount = Math.ceil((containerWidth * 2) / blockWidth)

	for (let i = 0; i < repeatCount; i++) {
		content += blockHTML
	}

	if (marquee.value) {
		marquee.value.innerHTML = content + content
		marquee.value.classList.add('marquee-animate')
	}
}

onMounted(() => {
	fillMarquee()
	window.addEventListener('resize', () => {
		if (marquee.value) {
			marquee.value.classList.remove('marquee-animate')
		}
		fillMarquee()
	})
})
</script>

<style scoped>
@keyframes marquee {
	0% {
		transform: translateX(0);
	}
	100% {
		transform: translateX(-50%);
	}
}

.marquee-animate {
	animation: marquee 60s linear infinite; /* скорость регулируется здесь */
}
</style>
