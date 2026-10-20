// Ano atual no rodapé
const ano = document.getElementById('ano');
if (ano) ano.textContent = new Date().getFullYear();

// Marca no menu a seção visível (aria-current)
const links = document.querySelectorAll('nav a');
const secoes = [...links].map(a => document.querySelector(a.getAttribute('href')));
const observador = new IntersectionObserver(entradas => {
  entradas.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.removeAttribute('aria-current'));
    document.querySelector(`nav a[href="#${e.target.id}"]`)?.setAttribute('aria-current', 'true');
  });
}, { rootMargin: '-40% 0px -55% 0px' });
secoes.forEach(s => s && observador.observe(s));

// Barra de contato do celular: aparece depois que os botões do topo saem da tela
// e some quando o contato final já está visível.
const botoesTopo = document.querySelector('.hero .acoes');
const contatoFinal = document.querySelector('.cta-final');
const estado = { topoVisivel: true, finalVisivel: false };
const atualizarBarra = () => {
  const mostrar = !estado.topoVisivel && !estado.finalVisivel;
  if (mostrar) document.body.dataset.barra = ''; else delete document.body.dataset.barra;
};
if (botoesTopo) new IntersectionObserver(([e]) => { estado.topoVisivel = e.isIntersecting; atualizarBarra(); }).observe(botoesTopo);
if (contatoFinal) new IntersectionObserver(([e]) => { estado.finalVisivel = e.isIntersecting; atualizarBarra(); }).observe(contatoFinal);
