/* Demonstração local: sem rede, armazenamento ou dados de contas reais. */
globalThis.TestsPrototype = (() => {
  const scale = ['Não me representa agora', 'Me representa pouco', 'Me representa em parte', 'Me representa bastante', 'Me representa muito'];
  const catalog = {
    affection: { name: 'Formas de afeto', icon: '♡', time: '2–3 min', intro: 'Quais pequenos gestos encontram você?', description: 'Observe como você gosta de receber carinho no cotidiano.', items: [
      ['Palavras', 'Ouvir um reconhecimento sincero faz diferença no meu dia.'],
      ['Tempo juntos', 'Ter um momento de atenção, sem outras distrações, me faz sentir perto.'],
      ['Gestos e lembranças', 'Uma lembrança simples, escolhida pensando em mim, tem significado.'],
      ['Ajuda no cotidiano', 'Receber ajuda em uma tarefa combinada é uma forma de carinho para mim.'],
      ['Contato físico', 'Quando eu quero e me sinto à vontade, um abraço é uma forma de carinho que aprecio.']
    ] },
    temperament: { name: 'Temperamentos', icon: '✦', time: '2 min', intro: 'Como você se percebe neste momento?', description: 'Uma reflexão sobre diferentes maneiras de estar nas situações.', items: [
      ['Iniciativa · colérico', 'Em uma decisão em conjunto, gosto de propor um primeiro caminho.'],
      ['Expressão · sanguíneo', 'Quando algo me anima, gosto de compartilhar meu entusiasmo.'],
      ['Tranquilidade · fleumático', 'Em uma conversa agitada, prefiro encontrar um ritmo mais tranquilo.'],
      ['Reflexão · melancólico', 'Antes de mudar um combinado, gosto de pensar nos detalhes.']
    ] }
  };
  function summarize(answers, items) {
    const count = answers.filter(Number.isInteger).length;
    if (!count) return null;
    const max = Math.max(...answers.filter(Number.isInteger));
    return { count, total: items.length, partial: count < items.length, highlights: max >= 4 ? items.filter((_, i) => answers[i] === max).map(item => item[0]) : [] };
  }
  function create() {
    const records = [{}, {}];
    let viewer = 0, kind = 'affection', page = 'catalog', condition = 'online', linked = true, editing = false;
    let message = '';
    const mine = () => records[viewer][kind];
    const fresh = () => ({ answers: Array(catalog[kind].items.length).fill(null), index: 0, result: null, shared: false });
    const writable = () => {
      if (condition === 'offline') { message = 'Sem conexão. Suas escolhas continuam nesta aba. Reconecte para confirmar esta ação.'; return false; }
      if (condition === 'fail') { condition = 'online'; message = 'Não conseguimos confirmar. Suas escolhas foram mantidas. Tente novamente.'; return false; }
      return condition !== 'expired';
    };
    function action(type, value) {
      message = '';
      if (condition === 'expired') return false;
      const record = mine();
      if (type === 'catalog') { page = 'catalog'; return true; }
      if (type === 'open' && catalog[value]) { kind = value; const r = mine(); page = r?.result ? 'result' : r ? 'paused' : 'intro'; return true; }
      if (type === 'start' && page === 'intro') { records[viewer][kind] = fresh(); page = 'question'; return true; }
      if (type === 'resume' && page === 'paused') { page = 'question'; return true; }
      if (type === 'select' && page === 'question' && Number.isInteger(value) && value >= 1 && value <= 5) { record.answers[record.index] = value; return true; }
      if (type === 'pause' && page === 'question') { page = 'paused'; return true; }
      if (type === 'back' && page === 'question' && record.index > 0) { record.index--; return true; }
      if ((type === 'next' || type === 'skip') && page === 'question') {
        if (type === 'skip') record.answers[record.index] = null;
        if (type === 'next' && record.answers[record.index] === null) return false;
        if (editing || record.index === record.answers.length - 1) { editing = false; page = 'review'; } else record.index++;
        return true;
      }
      if (type === 'edit' && page === 'review' && Number.isInteger(value) && value >= 0 && value < record.answers.length) { record.index = value; editing = true; page = 'question'; return true; }
      if (type === 'finish' && page === 'review') {
        const summary = summarize(record.answers, catalog[kind].items);
        if (!summary) { message = 'Responda pelo menos uma situação para ver seu resumo.'; return false; }
        if (!writable()) return false;
        record.result = { ...summary, date: new Date().toLocaleDateString('pt-BR'), version: 'demo 1.0' }; page = 'result'; return true;
      }
      if (type === 'preview' && page === 'result' && linked && !record.shared) { page = 'share'; return true; }
      if (type === 'cancel' && ['share', 'retake'].includes(page)) { page = 'result'; return true; }
      if (type === 'share' && page === 'share' && linked && writable()) { record.shared = true; page = 'result'; return true; }
      if (type === 'revoke' && page === 'result' && record.shared && writable()) { record.shared = false; message = 'Compartilhamento retirado. O resumo não aparece mais para a outra pessoa.'; return true; }
      if (type === 'retake' && page === 'result') { page = 'retake'; return true; }
      if (type === 'confirm-retake' && page === 'retake' && writable()) { records[viewer][kind] = fresh(); editing = false; page = 'question'; return true; }
      return false;
    }
    return {
      action,
      setViewer(value) { if (![0, 1].includes(value)) return; viewer = value; page = 'catalog'; editing = false; message = ''; },
      setCondition(value) {
        if (!['online', 'offline', 'fail', 'expired', 'unlinked'].includes(value)) return;
        condition = value; message = '';
        if (value === 'unlinked') { linked = false; for (const person of records) for (const r of Object.values(person)) r.shared = false; page = 'catalog'; }
      },
      view() {
        const base = { viewer, kind, page, condition, linked, message };
        if (condition === 'expired') return { ...base, page: 'expired' };
        const own = Object.fromEntries(Object.entries(records[viewer]).map(([key, r]) => [key, r.result ? 'Ver resultado' : 'Retomar']));
        const partner = linked ? Object.entries(records[1 - viewer]).filter(([, r]) => r.shared && r.result).map(([key, r]) => ({ kind: key, result: r.result })) : [];
        // Apenas o resumo consentido entra na visão do par. Nunca suas escolhas.
        return JSON.parse(JSON.stringify({ ...base, record: mine() || null, own, partner }));
      }
    };
  }
  return { create, catalog, scale, summarize };
})();

if (typeof document !== 'undefined') {
  const { create, catalog, scale } = TestsPrototype;
  let model = create();
  const main = document.getElementById('main');
  const names = ['Ana', 'Alex'];
  const btn = (action, text, secondary = false, extra = '') => `<button data-action="${action}" class="${secondary ? 'secondary' : 'primary'}" ${extra}>${text}</button>`;
  const resultText = r => r.highlights.length ? `Mais presentes nas suas escolhas: ${r.highlights.join(' e ')}.` : 'Suas escolhas não destacaram uma preferência forte agora.';
  const summaryCard = (r, name) => `<div class="summary-card"><span class="eyebrow">${name} · ${r.partial ? 'Resumo parcial' : 'Resumo completo'}</span><h3>${resultText(r)}</h3><p>${r.count} de ${r.total} situações respondidas · ${r.date} · ${r.version}</p><small>Conteúdo experimental. Um retrato das escolhas deste momento.</small></div>`;
  function render(focus = true) {
    const v = model.view(), test = catalog[v.kind], r = v.record, other = names[1 - v.viewer];
    document.getElementById('person').textContent = names[v.viewer];
    document.getElementById('condition').value = v.condition;
    let body = '';
    const back = `<button class="back" data-action="catalog">← Todos os testes</button>`;
    if (v.page === 'catalog') {
      body = `<div class="eyebrow">EXPLORAR / TESTES</div><h1>Um pouco mais<br>sobre <em>você.</em></h1><p class="lead">Pequenas reflexões para descobrir o que faz sentido hoje — e abrir espaço para uma boa conversa.</p><div class="catalog">${Object.entries(catalog).map(([key, t]) => `<article class="test-card ${key}"><div class="card-top"><span class="symbol">${t.icon}</span><span class="tag">Experimental</span></div><h2>${t.name}</h2><p>${t.description}</p><p class="metadata">${t.items.length} situações · ${t.time}</p>${btn('open', `${v.own[key] || 'Conhecer teste'} <span aria-hidden="true">↗</span>`, false, `data-value="${key}"`)}</article>`).join('')}</div><section class="partner"><div class="eyebrow">COMPARTILHADO COM VOCÊ</div><h2>Um convite para conversar</h2>${v.partner.length ? v.partner.map(p => summaryCard(p.result, `${other} · ${catalog[p.kind].name}`)).join('') : `<p>${v.linked ? 'Quando a outra pessoa compartilhar um resumo, ele aparece aqui. Cada um escolhe seu momento.' : 'O vínculo foi encerrado nesta simulação. Seus resultados individuais continuam disponíveis.'}</p>`}</section>`;
    } else if (v.page === 'expired') {
      body = '<div class="symbol">↗</div><h1>Entre novamente<br>para continuar.</h1><p>Seu acesso expirou. O conteúdo fica oculto até a sessão ser confirmada.</p><p class="note">Na barra de revisão, escolha “Conexão normal” para simular o retorno do acesso.</p>';
    } else if (v.page === 'intro') {
      body = `${back}<span class="tag">Experimental · ${test.time}</span><h1>${test.intro}</h1><p class="lead">${test.description}</p><div class="info-list"><p><b>01</b> ${test.items.length} situações. Pense no que combina com você hoje.</p><p><b>02</b> Você pode voltar, pular ou pausar quando quiser.</p><p><b>03</b> O resultado é seu. Compartilhar um resumo é uma escolha posterior.</p></div><p class="note">Perguntas ilustrativas para conhecer o fluxo. Não é uma avaliação psicológica nem uma medida de compatibilidade.</p>${btn('start', 'Começar reflexão →')}`;
    } else if (v.page === 'question') {
      const n = r.index;
      body = `<div class="question-top"><span class="eyebrow">${test.name}</span><button class="back" data-action="pause">Pausar</button></div><div class="progress-label"><span>Situação ${n + 1} de ${test.items.length}</span><span>${r.answers.filter(Number.isInteger).length} respondidas</span></div><progress max="${test.items.length}" value="${n + 1}" aria-label="Situação ${n + 1} de ${test.items.length}"></progress><h1>Quanto isso combina<br>com você <em>hoje?</em></h1><fieldset><legend>${test.items[n][1]}</legend><p id="scale-help">Escolha uma opção. Não existe resposta certa.</p><div class="options">${scale.map((s, i) => `<label class="option ${r.answers[n] === i + 1 ? 'selected' : ''}"><input type="radio" name="answer" value="${i + 1}" aria-describedby="scale-help" ${r.answers[n] === i + 1 ? 'checked' : ''}><span>${s}</span><span class="scale-number" aria-hidden="true">${i + 1}</span></label>`).join('')}</div></fieldset><div class="actions">${n > 0 ? btn('back', '← Voltar', true) : ''}${btn('next', 'Continuar →', false, r.answers[n] === null ? 'disabled' : '')}</div><button class="back skip" data-action="skip">Prefiro não responder</button>`;
    } else if (v.page === 'paused') {
      body = `${back}<div class="symbol">☾</div><h1>Podemos continuar<br><em>depois.</em></h1><p class="lead">${test.name} · ${r.answers.filter(Number.isInteger).length} de ${test.items.length} situações respondidas.</p><p class="note">Suas escolhas continuam nesta aba. Fechar ou recarregar esta demonstração apaga as respostas.</p>${btn('resume', 'Retomar reflexão →')}`;
    } else if (v.page === 'review') {
      body = `${back}<div class="eyebrow">${test.name} / REVISÃO</div><h1>Está com a<br><em>sua cara?</em></h1><p>Você pode mudar uma escolha antes de ver o resumo.</p><div class="review-list">${test.items.map((item, i) => `<article><div><h3>${item[1]}</h3><p>${r.answers[i] === null ? 'Não respondido' : scale[r.answers[i] - 1]}</p></div><button class="back" data-action="edit" data-value="${i}" aria-label="Editar situação ${i + 1}">Editar</button></article>`).join('')}</div>${btn('finish', 'Ver meu resultado →')}`;
    } else if (v.page === 'result') {
      body = `${back}<span class="tag">${r.shared ? `Resumo compartilhado com ${other}` : 'Só você pode ver'}</span><h1>Seu jeito de sentir.<br><em>Neste momento.</em></h1>${summaryCard(r.result, test.name)}<p>Estas barras mostram suas escolhas de 1 a 5. Não medem sua personalidade ou a relação.</p><div class="dimensions">${test.items.map((item, i) => `<div><div class="dimension-label"><b>${item[0]}</b><span>${r.answers[i] === null ? 'Não respondido' : `${r.answers[i]} de 5`}</span></div><div class="bar" aria-hidden="true"><i style="width:${(r.answers[i] || 0) * 20}%"></i></div><small>${r.answers[i] === null ? 'Você preferiu pular esta situação.' : scale[r.answers[i] - 1]}</small></div>`).join('')}</div><div class="conversation"><span class="eyebrow">SE QUISER LEVAR PARA UMA CONVERSA</span><h2>“O que destas escolhas faz sentido para você hoje?”</h2><p>Cada pessoa pode perceber o mesmo gesto de uma forma. Há espaço para ouvir, sem precisar concordar.</p></div><div class="actions">${v.linked ? (r.shared ? btn('revoke', 'Retirar compartilhamento', true) : btn('preview', 'Escolher compartilhar →')) : '<p>Compartilhamento indisponível sem vínculo ativo.</p>'}${btn('retake', 'Refazer reflexão', true)}</div>`;
    } else if (v.page === 'share') {
      body = `<div class="eyebrow">VOCÊ ESCOLHE O QUE DIVIDIR</div><h1>Um resumo para<br><em>${other}.</em></h1><p>A outra pessoa verá apenas o cartão abaixo. Suas escolhas individuais ficam privadas.</p>${summaryCard(r.result, test.name)}<p class="note">Você pode retirar o compartilhamento depois. Isso não apaga o que a outra pessoa já tiver visto.</p><div class="actions">${btn('share', `Compartilhar resumo com ${other}`)}${btn('cancel', 'Agora não', true)}</div>`;
    } else if (v.page === 'retake') {
      body = `<h1>Começar uma<br><em>nova reflexão?</em></h1><p>Nesta demonstração, a nova tentativa substitui o resultado anterior e retira qualquer resumo compartilhado. Não é possível recuperar a tentativa anterior.</p><div class="actions">${btn('confirm-retake', 'Sim, começar novamente')}${btn('cancel', 'Manter meu resultado', true)}</div>`;
    }
    const notice = v.condition === 'offline' ? '<p class="notice" role="status">Sem conexão · você pode revisar suas escolhas, mas as confirmações estão indisponíveis.</p>' : '';
    main.innerHTML = `${notice}${body}${v.message ? `<p class="notice" role="alert">${v.message}</p>` : ''}`;
    const heading = main.querySelector('h1');
    if (heading) { heading.tabIndex = -1; if (focus) heading.focus({ preventScroll: true }); }
  }
  main.addEventListener('change', event => {
    if (event.target.name !== 'answer') return;
    model.action('select', Number(event.target.value));
    main.querySelectorAll('.option').forEach(option => option.classList.toggle('selected', option.querySelector('input').checked));
    main.querySelector('[data-action="next"]').disabled = false;
  });
  let pending = false;
  main.addEventListener('click', async event => {
    const button = event.target.closest('[data-action]');
    if (!button || pending) return;
    const { action, value } = button.dataset;
    if (action === 'finish') {
      pending = true; button.disabled = true; button.textContent = 'Preparando seu resumo…'; main.setAttribute('aria-busy', 'true');
      await new Promise(resolve => setTimeout(resolve, 450));
      pending = false; main.removeAttribute('aria-busy');
    }
    model.action(action, action === 'edit' ? Number(value) : value); render();
  });
  document.getElementById('viewer').addEventListener('change', event => { if (pending) { event.target.value = model.view().viewer; return; } model.setViewer(Number(event.target.value)); render(); });
  document.getElementById('condition').addEventListener('change', event => { if (pending) { event.target.value = model.view().condition; return; } model.setCondition(event.target.value); render(); });
  document.getElementById('reset').addEventListener('click', () => { if (pending || !confirm('Apagar as respostas fictícias e recomeçar a demonstração?')) return; model = create(); document.getElementById('viewer').value = '0'; render(); });
  render(false);
}
