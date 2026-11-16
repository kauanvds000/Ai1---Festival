/* =========================================================
   ROCK IN VISEU — JavaScript principal
   Relógio · Menu · Slider · Contagem · Cartaz · Newsletter
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. Data e hora atual (em todas as páginas) ---------- */
  const relogio = document.getElementById('relogio');

  function atualizarRelogio() {
    const agora = new Date();
    const data = agora.toLocaleDateString('pt-PT', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
    const hora = agora.toLocaleTimeString('pt-PT');
    relogio.textContent = data + ' · ' + hora;
  }
  if (relogio) {
    atualizarRelogio();
    setInterval(atualizarRelogio, 1000);
  }

  /* ---------- 2. Menu de navegação (mobile + submenus) ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      const aberto = nav.classList.toggle('aberto');
      menuToggle.classList.toggle('aberto');
      menuToggle.setAttribute('aria-expanded', aberto);
    });
  }

  // Em ecrãs pequenos, o submenu abre ao clicar no item pai
  document.querySelectorAll('.tem-sub > .nav__link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (window.innerWidth <= 896) {
        e.preventDefault();
        link.parentElement.classList.toggle('aberto');
      }
    });
  });

  // Fecha o menu mobile ao escolher um submenu ou link simples
  document.querySelectorAll('.submenu a, .nav__item:not(.tem-sub) > .nav__link').forEach(function (a) {
    a.addEventListener('click', function () {
      if (nav) nav.classList.remove('aberto');
      if (menuToggle) menuToggle.classList.remove('aberto');
    });
  });

  /* ---------- 3. Slider de imagens com intervalo de tempo ---------- */
  const slides = document.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('dots');
  const INTERVALO = 5000; // 5 segundos
  let atual = 0;
  let temporizador;

  if (slides.length > 0) {
    // Cria um "dot" por cada slide
    slides.forEach(function (_, i) {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' ativo' : '');
      dot.setAttribute('aria-label', 'Ir para a imagem ' + (i + 1));
      dot.addEventListener('click', function () { mostrarSlide(i); reiniciar(); });
      dotsContainer.appendChild(dot);
    });
    const dots = dotsContainer.querySelectorAll('.dot');

    function mostrarSlide(n) {
      slides[atual].classList.remove('ativo');
      dots[atual].classList.remove('ativo');
      atual = (n + slides.length) % slides.length; // volta ao início no fim
      slides[atual].classList.add('ativo');
      dots[atual].classList.add('ativo');
    }

    function seguinte() { mostrarSlide(atual + 1); }
    function reiniciar() {
      clearInterval(temporizador);
      temporizador = setInterval(seguinte, INTERVALO);
    }

    document.getElementById('next').addEventListener('click', function () { seguinte(); reiniciar(); });
    document.getElementById('prev').addEventListener('click', function () { mostrarSlide(atual - 1); reiniciar(); });

    // Pausa quando o rato está por cima do slider
    const slider = document.querySelector('.slider');
    slider.addEventListener('mouseenter', function () { clearInterval(temporizador); });
    slider.addEventListener('mouseleave', reiniciar);

    reiniciar();
  }

  /* ---------- 4. Contagem decrescente para o festival ---------- */
  const DATA_FESTIVAL = new Date('2027-09-03T18:00:00');
  const cdDias = document.getElementById('cdDias');

  function atualizarContagem() {
    let diff = Math.max(0, DATA_FESTIVAL - new Date());
    const dias = Math.floor(diff / 86400000);
    const horas = Math.floor((diff % 86400000) / 3600000);
    const min = Math.floor((diff % 3600000) / 60000);
    const seg = Math.floor((diff % 60000) / 1000);
    cdDias.textContent = dias;
    document.getElementById('cdHoras').textContent = String(horas).padStart(2, '0');
    document.getElementById('cdMin').textContent = String(min).padStart(2, '0');
    document.getElementById('cdSeg').textContent = String(seg).padStart(2, '0');
  }
  if (cdDias) {
    atualizarContagem();
    setInterval(atualizarContagem, 1000);
  }

  /* ---------- 5. Separadores do cartaz (por dia) ---------- */
  const tabs = document.querySelectorAll('.tab');
  const dias = document.querySelectorAll('.cartaz__dia');

  function mostrarDia(dia) {
    tabs.forEach(function (t) { t.classList.toggle('ativo', t.dataset.dia === dia); });
    dias.forEach(function (d) { d.classList.toggle('ativo', d.dataset.dia === dia); });
  }
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { mostrarDia(tab.dataset.dia); });
  });
  // Os submenus "Dia 1/2/3" abrem diretamente o separador certo
  document.querySelectorAll('.submenu a[data-dia]').forEach(function (a) {
    a.addEventListener('click', function () { mostrarDia(a.dataset.dia); });
  });

  /* ---------- 6. Newsletter (validação simples) ---------- */
  const newsForm = document.getElementById('newsletterForm');
  if (newsForm) {
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('newsEmail').value.trim();
      const msg = document.getElementById('newsMsg');
      const valido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      if (!valido) {
        msg.textContent = 'Introduz um email válido.';
        return;
      }
      const lista = JSON.parse(localStorage.getItem('newsletter') || '[]');
      if (!lista.includes(email)) lista.push(email);
      localStorage.setItem('newsletter', JSON.stringify(lista));
      msg.textContent = 'Subscrição feita! Bem-vindo ao Rock in Viseu 🤘';
      newsForm.reset();
    });
  }
});
