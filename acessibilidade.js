/* ==========================================================
   Recursos de acessibilidade: modo escuro, alto contraste e
   tamanho da fonte. Carregado no <head> (sem defer) para aplicar
   as preferências antes da primeira pintura e evitar "piscada".
   As preferências ficam só no localStorage do visitante.
   ========================================================== */
(() => {
  const CHAVE = 'luantech-acessibilidade';
  const raiz = document.documentElement;
  const sistema = {
    escuro: matchMedia('(prefers-color-scheme: dark)'),
    contraste: matchMedia('(prefers-contrast: more)'),
  };
  const TAMANHOS = ['100%', '112.5%', '125%', '150%'];

  const ler = () => {
    try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch { return {}; }
  };
  const salvar = () => {
    try { localStorage.setItem(CHAVE, JSON.stringify(escolhas)); } catch { /* ignorado */ }
  };

  // Só guarda o que o visitante escolheu; o resto segue o sistema.
  let escolhas = ler();

  const estado = () => ({
    escuro: escolhas.escuro ?? sistema.escuro.matches,
    contraste: escolhas.contraste ?? sistema.contraste.matches,
    fonte: Math.min(Math.max(escolhas.fonte ?? 0, 0), TAMANHOS.length - 1),
  });

  const aplicar = () => {
    const e = estado();
    raiz.dataset.tema = e.escuro ? 'escuro' : 'claro';
    raiz.dataset.contraste = e.contraste ? 'alto' : 'normal';
    raiz.style.fontSize = TAMANHOS[e.fonte];
    atualizarBotoes();
  };

  /* ---------- Painel ---------- */
  let botoes = {}, aviso;

  const atualizarBotoes = () => {
    if (!botoes.escuro) return;
    const e = estado();
    botoes.escuro.setAttribute('aria-pressed', e.escuro);
    botoes.contraste.setAttribute('aria-pressed', e.contraste);
    botoes.menos.disabled = e.fonte === 0;
    botoes.mais.disabled = e.fonte === TAMANHOS.length - 1;
  };

  const avisar = texto => { if (aviso) aviso.textContent = texto; };

  const acoes = {
    escuro() {
      escolhas.escuro = !estado().escuro;
      avisar(escolhas.escuro ? 'Modo escuro ativado' : 'Modo escuro desativado');
    },
    contraste() {
      escolhas.contraste = !estado().contraste;
      avisar(escolhas.contraste ? 'Alto contraste ativado' : 'Alto contraste desativado');
    },
    mais() {
      escolhas.fonte = estado().fonte + 1;
      avisar(`Tamanho do texto: ${TAMANHOS[estado().fonte]}`);
    },
    menos() {
      escolhas.fonte = estado().fonte - 1;
      avisar(`Tamanho do texto: ${TAMANHOS[estado().fonte]}`);
    },
    padrao() {
      escolhas = {};
      avisar('Preferências restauradas');
    },
  };

  const montarPainel = () => {
    const painel = document.createElement('details');
    painel.setAttribute('aria-label', 'Opções de acessibilidade');
    painel.innerHTML = `
      <summary>Acessibilidade</summary>
      <ul>
        <li><button type="button" data-acao="escuro" aria-pressed="false">Modo escuro</button></li>
        <li><button type="button" data-acao="contraste" aria-pressed="false">Alto contraste</button></li>
        <li>
          <button type="button" data-acao="menos" aria-label="Diminuir o tamanho do texto">A−</button>
          <button type="button" data-acao="mais" aria-label="Aumentar o tamanho do texto">A+</button>
        </li>
        <li><button type="button" data-acao="padrao">Restaurar padrão</button></li>
      </ul>
      <output></output>`;
    document.body.append(painel);

    aviso = painel.querySelector('output');
    painel.querySelectorAll('button').forEach(b => {
      botoes[b.dataset.acao] = b;
      b.addEventListener('click', () => {
        acoes[b.dataset.acao]();
        salvar();
        aplicar();
      });
    });

    // Esc fecha o painel e devolve o foco ao botão de abertura
    painel.addEventListener('keydown', ev => {
      if (ev.key === 'Escape' && painel.open) {
        painel.open = false;
        painel.querySelector('summary').focus();
      }
    });
    atualizarBotoes();
  };

  // Acompanha mudanças do sistema enquanto o visitante não escolheu nada
  Object.values(sistema).forEach(m => m.addEventListener('change', aplicar));

  aplicar();
  document.addEventListener('DOMContentLoaded', montarPainel);
})();
