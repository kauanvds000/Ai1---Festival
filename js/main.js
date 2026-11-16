/* =========================================================
   ROCK IN VISEU — JavaScript principal
   Relógio · Menu · Slider · Agenda · Mapa interativo
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. Data e hora atual (presente em todas as páginas) ---------- */
  const relogio = document.getElementById('relogio');

  function atualizarRelogio() {
    const agora = new Date();
    const data = agora.toLocaleDateString('pt-PT', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
    });
    const hora = agora.toLocaleTimeString('pt-PT');
    relogio.textContent = data + ' · ' + hora;
  }
  if (relogio) {
    atualizarRelogio();
    setInterval(atualizarRelogio, 1000);
  }

  /* ---------- 1b. Contagem decrescente para o festival ---------- */
  const DATA_FESTIVAL = new Date('2027-09-03T18:00:00'); // abertura das portas
  const cdDias = document.getElementById('cdDias');

  function doisDigitos(n) { return String(n).padStart(2, '0'); }

  function atualizarContagem() {
    const diff = Math.max(0, DATA_FESTIVAL - new Date()); // em milissegundos
    const dias = Math.floor(diff / 86400000);
    const horas = Math.floor((diff % 86400000) / 3600000);
    const min = Math.floor((diff % 3600000) / 60000);
    const seg = Math.floor((diff % 60000) / 1000);

    cdDias.textContent = dias;
    document.getElementById('cdHoras').textContent = doisDigitos(horas);
    document.getElementById('cdMin').textContent = doisDigitos(min);
    document.getElementById('cdSeg').textContent = doisDigitos(seg);

    // quando chegar a hora, troca o texto
    if (diff === 0) {
      document.querySelector('.contagem__label').textContent = '🤘 É agora!';
    }
  }
  if (cdDias) {
    atualizarContagem();
    setInterval(atualizarContagem, 1000);
  }

  /* ---------- 2. Menu de navegação ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const navs = document.querySelectorAll('.nav');
  const MOBILE = 896; // corresponde a 56rem no CSS

  function fecharMenu() {
    navs.forEach(function (n) { n.classList.remove('aberto'); });
    if (menuToggle) {
      menuToggle.classList.remove('aberto');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  }

  // Botão hambúrguer: abre/fecha os dois menus (esquerdo e direito)
  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      const aberto = menuToggle.classList.toggle('aberto');
      navs.forEach(function (n) { n.classList.toggle('aberto', aberto); });
      menuToggle.setAttribute('aria-expanded', aberto);
    });
  }

  // No telemóvel, clicar num item com submenu abre o submenu em vez de navegar
  document.querySelectorAll('.tem-sub > .nav__link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (window.innerWidth <= MOBILE) {
        e.preventDefault();
        link.parentElement.classList.toggle('aberto');
      }
    });
  });

  document.querySelectorAll('.submenu a').forEach(function (a) {
    a.addEventListener('click', fecharMenu);
  });

  /* ---------- 3. Carrossel de fotos com intervalo de tempo ---------- */
  const slides = document.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('dots');
  const INTERVALO = 4000; // muda de imagem a cada 4 segundos
  let atual = 0;
  let temporizador;

  if (slides.length > 0) {
    // cria um indicador ("dot") por imagem
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
      atual = (n + slides.length) % slides.length; // volta ao início depois da última
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

    // pausa enquanto o rato está por cima
    const slider = document.querySelector('.slider');
    slider.addEventListener('mouseenter', function () { clearInterval(temporizador); });
    slider.addEventListener('mouseleave', reiniciar);

    reiniciar();
  }

  /* ---------- 4. Agenda: separadores por dia ---------- */
  const tabs = document.querySelectorAll('.tab');
  const dias = document.querySelectorAll('.cartaz__dia');

  function mostrarDia(dia) {
    tabs.forEach(function (t) { t.classList.toggle('ativo', t.dataset.dia === dia); });
    dias.forEach(function (d) { d.classList.toggle('ativo', d.dataset.dia === dia); });
  }
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { mostrarDia(tab.dataset.dia); });
  });
  // os itens do submenu "Agenda" abrem logo o dia certo
  document.querySelectorAll('.submenu a[data-dia]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (tabs.length) mostrarDia(a.dataset.dia);
    });
  });

  /* ---------- 5. Mapa interativo ---------- */
  const mapa = document.querySelector('.mapa__container');
  const tooltip = document.getElementById('mapaTooltip');

  if (mapa && tooltip) {
    const TEXTOS = {
      'Palco Viseu': 'Clica para comprar bilhete',
      'Palco Dão': 'Clica para comprar bilhete',
      'Restauração': 'Ementas disponíveis em breve',
      'Loja Oficial': 'Loja online disponível em breve'
    };

    document.querySelectorAll('.zona').forEach(function (zona) {
      const nome = zona.dataset.nome;

      // mostra o balão com o nome da zona
      zona.addEventListener('mouseenter', function () {
        tooltip.innerHTML = '<strong>' + nome + '</strong> · ' + TEXTOS[nome];
        tooltip.classList.add('visivel');
      });

      // o balão segue o rato
      zona.addEventListener('mousemove', function (e) {
        const caixa = mapa.getBoundingClientRect();
        tooltip.style.left = (e.clientX - caixa.left) + 'px';
        tooltip.style.top = (e.clientY - caixa.top) + 'px';
      });

      zona.addEventListener('mouseleave', function () {
        tooltip.classList.remove('visivel');
      });

      // Restauração e Loja: registam o clique mas ainda não fazem nada
      if (!zona.matches('a')) {
        zona.addEventListener('click', function () {
          console.log('Zona clicada: ' + nome + ' (funcionalidade em desenvolvimento)');
        });
      }
    });
  }
});
