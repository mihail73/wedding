var submitted = false;

function showSuccessMessage() {
    if (submitted) {
        const form = document.querySelector('.wedding-form');
        const successMsg = document.getElementById('success-msg');

        // Скрываем форму
        form.style.display = 'none';
        
        // Настраиваем сообщение об успехе
        successMsg.style.display = 'block';
        successMsg.classList.remove('hidden');
        successMsg.classList.add('fade-in'); // Добавляем анимацию

        successMsg.innerHTML = `
            <div class="success-content">
                <h3 style="color: #d4a373;">Успешно отправлено!</h3>
                <p>Будем очень рады видеть вас на нашем празднике.</p>
                <button type="button" onclick="resetWeddingForm()" class="form-submit-btn" style="margin-top: 20px; cursor: pointer;">
                    ОТПРАВИТЬ ЕЩЕ ОДИН ОТВЕТ
                </button>
            </div>
        `;
        
        successMsg.scrollIntoView({ behavior: 'smooth' });
    }
}

function resetWeddingForm() {
    const form = document.querySelector('.wedding-form');
    const successMsg = document.getElementById('success-msg');

    form.reset(); // Очистка полей
    
    // Прячем сообщение
    successMsg.style.display = 'none';
    
    // Показываем форму с анимацией
    form.style.display = 'block';
    form.classList.add('fade-in');
    
    submitted = false; // Сброс флага для следующей отправки

    form.scrollIntoView({ behavior: 'smooth' });
}

const lenis = new Lenis({
  duration: 1.2,     // Длительность плавности (чем больше, тем медленнее остановка)
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Функция ускорения
  direction: 'vertical', 
  gestureDirection: 'vertical', 
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false, // На телефонах лучше оставить стандартный скролл для отзывчивости
  touchMultiplier: 2,
  infinite: false,
});

// Основной цикл анимации для Lenis
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
updateTimer();
document.addEventListener('DOMContentLoaded', function() {
    // --- 1. ПОИСК ЭЛЕМЕНТОВ ---
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainContent = document.getElementById('mainContent');
    const sliderHandle = document.getElementById('sliderHandle');
    const unlockArea = document.getElementById('unlockArea');
    const successIcon = document.getElementById('successIcon');
    const music = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const timelineSvg = document.getElementById('timelineSvg');

    let isDragging = false;
    let startX = 0;

    // --- 2. РАЗБЛОКИРОВКА ---
    function onUnlock() {
        isDragging = false;
        
        // Сначала показываем галочку без задержки и скрываем ползунок
        if (successIcon) successIcon.classList.add('success-active');
        if (sliderHandle) sliderHandle.classList.add('slider-hide');
        
        // Небольшая задержка перед остальной разблокировкой для плавности
        setTimeout(() => {
            // 1. Мгновенно обновляем таймер, чтобы там не было нулей
            updateTimer(); 

            // 3. ПОДГОТОВКА: Включаем контент, но он всё еще прозрачный (opacity: 0)
            mainContent.style.display = 'block'; 

            // Даем браузеру 50мс, чтобы "переварить" display: block
            setTimeout(function() {
                // 4. Начинаем плавную смену экранов
                welcomeScreen.style.opacity = '0'; // Исчезает заставка
                mainContent.style.opacity = '1';  // Появляется сайт
                
                // Если у вас есть класс .show-content, используем его
                mainContent.classList.add('show-content');

                setTimeout(function() {
                    welcomeScreen.style.display = 'none';
                    
                    // Запускаем музыку только когда всё проявилось
                    if (music) {
                        fadeInAudio(music);
                        playIcon.classList.add('hidden');
                        pauseIcon.classList.remove('hidden');
                    }
                }, 600); // Время затухания заставки
            }, 50); 
        }, 200); // Задержка 200ms перед остальной разблокировкой
    }

    // --- 3. СЛАЙДЕР (МЫШЬ И ТАЧ) ---
    function handleStart(event) {
        isDragging = true;
        startX = (event.pageX || event.touches[0].pageX) - sliderHandle.offsetLeft;
    }

    function handleMove(event) {
        if (!isDragging) return;
        const clientX = event.pageX || event.touches[0].pageX;
        let x = clientX - startX;
        const maxScroll = unlockArea.clientWidth - sliderHandle.clientWidth - 8;

        if (x < 4) x = 4;
        if (x > maxScroll) x = maxScroll;
        sliderHandle.style.left = x + 'px';
        if (x >= maxScroll) onUnlock();
    }

    function handleEnd() {
        if (isDragging) {
            isDragging = false;
            if (parseInt(sliderHandle.style.left) < 200) {
                sliderHandle.style.left = '4px';
            }
        }
    }

    if (sliderHandle) {
        sliderHandle.addEventListener('mousedown', handleStart);
        sliderHandle.addEventListener('touchstart', handleStart);
    }
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    // --- 4. МУЗЫКА ---
    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            if (music.paused) {
                music.play();
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
            } else {
                music.pause();
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
            }
        });
    }

    // --- 5. ТАЙМЛАЙН (СЕРДЦЕ) ---
    function updateTimeline() {
        if (!timelineSvg) return;
        const rect = timelineSvg.getBoundingClientRect();
        const startTrigger = window.innerHeight * 0.4; 
        let progress = (startTrigger - rect.top) / rect.height;
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;
        // Управление анимацией сердца через setCurrentTime (для SMIL SVG animations)
        if (timelineSvg.setCurrentTime) {
            timelineSvg.setCurrentTime(progress * 118);
        }
    }

    window.addEventListener('scroll', updateTimeline);
    window.addEventListener('resize', updateTimeline);
    updateTimeline();
    // --- АНИМАЦИЯ ПОЯВЛЕНИЯ ЧИСЕЛ КАЛЕНДАРЯ ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Добавляем класс active, когда элемент виден
                entry.target.classList.add('active');
                
                // Прекращаем слежку после появления (чтобы не моргало при скролле назад)
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // Появляется, когда видно хотя бы 10% блока
        rootMargin: '0px 0px -25px 0px' // Срабатывает чуть раньше, чем блок ударится о низ экрана
    });

    // Ищем все элементы с классом reveal и запускаем слежку
    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // Обработчик отправки формы
    const weddingForm = document.querySelector('.wedding-form');
    if (weddingForm) {
        weddingForm.addEventListener('submit', function(event) {
            // Предполагаем, что форма отправляется в Google Forms, но устанавливаем флаг
            submitted = true;
            // Не предотвращаем submit, чтобы форма ушла в Google
            // После отправки Google может перенаправить или показать сообщение, но мы можем вызвать showSuccessMessage через таймаут или iframe
            setTimeout(showSuccessMessage, 1000); // Задержка для имитации отправки
        });
    }

    setInterval(updateTimer, 1000);
});

function updateTimer() {
    const weddingDate = new Date("June 26, 2026 16:00:00").getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
        document.getElementById("countdown").innerHTML = "День настал!";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days;
    document.getElementById("hours").innerText = hours;
    document.getElementById("minutes").innerText = minutes;
    document.getElementById("seconds").innerText = seconds;
}
function fadeInAudio(audio) {
    if (!audio) return;
    audio.volume = 0;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            let volume = 0;
            const targetVolume = 0.5;
            const step = 0.02;
            
            function fade() {
                if (audio.paused) return; // Если пауза, останавливаем
                volume += step;
                if (volume >= targetVolume) {
                    audio.volume = targetVolume;
                } else {
                    audio.volume = volume;
                    requestAnimationFrame(fade);
                }
            }
            requestAnimationFrame(fade);
        }).catch(e => console.log("Автовоспроизведение заблокировано"));
    }
}