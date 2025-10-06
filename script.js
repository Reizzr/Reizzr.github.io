/*!
 * Mantis.js / jQuery / Zepto.js plugin for Constellation
 * @version 1.2.2
 * @author Acauã Montiel <contato@acauamontiel.com.br>
 * @license http://acaua.mit-license.org/
 */
(function ($, window) {
	var $window = $(window);
	/**
	 * Makes a nice constellation on canvas
	 * @constructor Constellation
	 */
	function Constellation (canvas, options) {
		var $canvas = $(canvas),
			context = canvas.getContext('2d'),
			defaults = {
				star: {
					color: 'rgba(255, 255, 255, .5)',
					width: 1,
					randomWidth: true
				},
				line: {
					color: 'rgba(255, 255, 255, .5)',
					width: 0.2
				},
				position: {
					x: 0,
					y: 0
				},
				width: window.innerWidth,
				height: window.innerHeight,
				velocity: 0.1,
				length: 100,
				distance: 120,
				radius: 150,
				stars: []
			},
			config = $.extend(true, {}, defaults, options);

		function Star () {
			this.x = Math.random() * canvas.width;
			this.y = Math.random() * canvas.height;

			this.vx = (config.velocity - (Math.random() * 0.5));
			this.vy = (config.velocity - (Math.random() * 0.5));

			this.radius = config.star.randomWidth ? (Math.random() * config.star.width) : config.star.width;
		}

		Star.prototype = {
			create: function(){
				context.beginPath();
				context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
				context.fill();
			},

			animate: function(){
				var i;
				for (i = 0; i < config.length; i++) {

					var star = config.stars[i];

					if (star.y < 0 || star.y > canvas.height) {
						star.vx = star.vx;
						star.vy = - star.vy;
					} else if (star.x < 0 || star.x > canvas.width) {
						star.vx = - star.vx;
						star.vy = star.vy;
					}

					star.x += star.vx;
					star.y += star.vy;
				}
			},

			line: function(){
				var length = config.length,
					iStar,
					jStar,
					i,
					j;

				for (i = 0; i < length; i++) {
					for (j = 0; j < length; j++) {
						iStar = config.stars[i];
						jStar = config.stars[j];

						if (
							(iStar.x - jStar.x) < config.distance &&
							(iStar.y - jStar.y) < config.distance &&
							(iStar.x - jStar.x) > - config.distance &&
							(iStar.y - jStar.y) > - config.distance
						) {
							if (
								(iStar.x - config.position.x) < config.radius &&
								(iStar.y - config.position.y) < config.radius &&
								(iStar.x - config.position.x) > - config.radius &&
								(iStar.y - config.position.y) > - config.radius
							) {
								context.beginPath();
								context.moveTo(iStar.x, iStar.y);
								context.lineTo(jStar.x, jStar.y);
								context.stroke();
								context.closePath();
							}
						}
					}
				}
			}
		};

		this.createStars = function () {
			var length = config.length,
				star,
				i;

			context.clearRect(0, 0, canvas.width, canvas.height);

			for (i = 0; i < length; i++) {
				config.stars.push(new Star());
				star = config.stars[i];

				star.create();
			}

			star.line();
			star.animate();
		};

		this.setCanvas = function () {
			canvas.width = config.width;
			canvas.height = config.height;
		};

		this.setContext = function () {
			context.fillStyle = config.star.color;
			context.strokeStyle = config.line.color;
			context.lineWidth = config.line.width;
		};

		this.setInitialPosition = function () {
			if (!options || !options.hasOwnProperty('position')) {
				config.position = {
					x: canvas.width * 0.5,
					y: canvas.height * 0.5
				};
			}
		};

		this.loop = function (callback) {
			callback();

			this.rAF = window.requestAnimationFrame(function () {
				this.loop(callback);
			}.bind(this));
		};

		this.handlers = {
			window: {
				mousemove: function(e){
					config.position.x = e.pageX - $canvas.offset().left;
					config.position.y = e.pageY - $canvas.offset().top;
				},
				resize: function () {
					window.cancelAnimationFrame(this.rAF);
					this.setCanvas();
					this.setContext();
					this.loop(this.createStars);
				}.bind(this)
			}
		};

		this.bind = function () {
			$window
				.on('mousemove', this.handlers.window.mousemove)
				.on('resize', this.handlers.window.resize);
		};

		this.unbind = function () {
			$window
				.off('mousemove', this.handlers.window.mousemove)
				.off('resize', this.handlers.window.resize);
		}

		this.init = function () {
			this.setCanvas();
			this.setContext();
			this.setInitialPosition();
			this.loop(this.createStars);
			this.bind();
		};
	}

	function instantiate(element, options) {
		var c = new Constellation(element, options);
		c.init();
	}

	$.fn.constellation = function (options) {
		return this.each(function () {
			instantiate(this, options);
		});
	};
})($, window);

// Инициализация Constellation
$(document).ready(function() {
	$('#constellation').constellation({
		star: {
			width: 3
		},
		line: {
			color: 'rgba(255, 255, 255, .5)'
		},
		length: (window.innerWidth / 6),
		radius: (window.innerWidth / 5)
	});
});

// Плавная прокрутка для якорей
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Анимация появления элементов при скролле
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Наблюдаем за всеми секциями
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Динамическое обновление года в футере
document.querySelector('.copyright').textContent = 
    document.querySelector('.copyright').textContent.replace('2024', new Date().getFullYear());







// Карусель проектов с правильным переключением
class ProjectsCarousel {
    constructor() {
        this.currentIndex = 0;
        this.projects = document.querySelectorAll('.project-card');
        this.indicators = document.querySelectorAll('.indicator');
        this.totalProjects = this.projects.length;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        // Обработчики для кнопок
        document.querySelector('.prev-btn').addEventListener('click', () => {
            this.prevProject();
        });
        
        document.querySelector('.next-btn').addEventListener('click', () => {
            this.nextProject();
        });
        
        // Обработчики для индикаторов
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                if (!this.isAnimating && index !== this.currentIndex) {
                    this.goToProject(index);
                }
            });
        });
        
        // Показываем первый слайд
        this.showProject(this.currentIndex);
        
        // Автопрокрутка
        this.startAutoPlay();
    }
    
    showProject(index) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        const currentProject = this.projects[this.currentIndex];
        const nextProject = this.projects[index];
        
        // Скрываем текущий слайд
        if (currentProject) {
            currentProject.classList.remove('active');
        }
        
        // Показываем следующий слайд
        nextProject.classList.add('active');
        
        // Обновляем индикаторы
        this.indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });
        this.indicators[index].classList.add('active');
        
        // Завершаем анимацию
        setTimeout(() => {
            this.currentIndex = index;
            this.isAnimating = false;
        }, 400);
    }
    
    nextProject() {
        let nextIndex = this.currentIndex + 1;
        if (nextIndex >= this.totalProjects) {
            nextIndex = 0;
        }
        this.showProject(nextIndex);
        this.resetAutoPlay();
    }
    
    prevProject() {
        let prevIndex = this.currentIndex - 1;
        if (prevIndex < 0) {
            prevIndex = this.totalProjects - 1;
        }
        this.showProject(prevIndex);
        this.resetAutoPlay();
    }
    
    goToProject(index) {
        this.showProject(index);
        this.resetAutoPlay();
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextProject();
        }, 10000);
    }
    
    resetAutoPlay() {
        clearInterval(this.autoPlayInterval);
        this.startAutoPlay();
    }
}

// Инициализация карусели
document.addEventListener('DOMContentLoaded', function() {
    new ProjectsCarousel();
});




// Динамический заголовок вкладки с циклической сменой сообщений
function setupTabTitle() {
    const originalTitle = document.title;
    let isHidden = false;
    let titleInterval;
    
    const awayMessages = [
        '😢 Эй, вернись!',
        '🚀 Тут классный код!',
        '💻 Смотри что я сделал!', 
        '⭐ Не уходи далеко!',
        '🎮 Продолжим просмотр!'
    ];
    
    let currentMessageIndex = 0;
    
    function cycleAwayMessages() {
        document.title = awayMessages[currentMessageIndex];
        currentMessageIndex = (currentMessageIndex + 1) % awayMessages.length;
    }
    
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Пользователь ушёл со вкладки
            isHidden = true;
            currentMessageIndex = 0;
            
            // Запускаем цикл смены сообщений каждые 2 секунды
            titleInterval = setInterval(cycleAwayMessages, 2000);
            cycleAwayMessages(); // Показываем первое сообщение сразу
            
        } else {
            // Пользователь вернулся на вкладку
            isHidden = false;
            document.title = originalTitle;
            
            // Останавливаем цикл
            if (titleInterval) {
                clearInterval(titleInterval);
            }
        }
    });
}

// Вызываем функцию
setupTabTitle();