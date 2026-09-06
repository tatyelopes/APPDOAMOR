/* Demonstração local: não é autenticação, API ou armazenamento do produto. */
(() => {
  const examples = {
    Filhos: ['Que lembrança da sua infância você gostaria de compartilhar com uma criança?', 'Conte uma brincadeira de infância e ensine como brincar.'],
    Religioso: ['O que dá sentido à sua vida, com ou sem religião?', 'Compartilhe uma coisa pela qual sente gratidão hoje.'],
    Apimentado: ['Como você prefere comunicar seus desejos e limites?', 'Faça um elogio sobre algo que acha atraente na outra pessoa.'],
    Descontraído: ['Qual seria o título de uma comédia sobre nós?', 'Imite um personagem para a outra pessoa adivinhar.'],
    'Papo sério': ['Que necessidade sua eu poderia compreender melhor?', 'Escute por um minuto e resuma o que entendeu.'],
    Memórias: ['Qual lembrança nossa sempre consegue fazer você sorrir?', 'Escolham uma foto e contem o que sentiram naquele dia.'],
    Curiosidades: ['O que você gostaria que eu descobrisse sobre você?', 'Ensine à outra pessoa algo curioso que sabe.'],
    Carinho: ['Qual pequeno gesto meu faz você se sentir cuidado(a)?', 'Diga duas qualidades que admira na outra pessoa.'],
    Futuro: ['Que sonho você gostaria que construíssemos juntos?', 'Escolham um pequeno sonho e o primeiro passo para realizá-lo.'],
    Valores: ['Que valor você gostaria de ver mais presente na nossa relação?', 'Conte uma atitude da outra pessoa que demonstra um valor que admira.'],
    Parceria: ['Em qual situação você mais sente que formamos um time?', 'Escolham uma pequena tarefa e combinem como dividi-la.'],
  };
  const choices = ['Uma lembrança', 'Um desejo', 'Uma dúvida', 'Um pequeno gesto'];
  const names = ['Ana', 'Alex'];
  const clone = value => JSON.parse(JSON.stringify(value));
  function create() {
    let config = { theme: 'Descontraído', mode: 'questions', kind: 'open_text', context: 'remote' };
    let rounds = [], index = 0, viewer = 0, page = 'setup', condition = 'online', opened = false, editing = false, notice = '';
    const active = () => rounds[index];
    const allowed = () => ['online', 'fail'].includes(condition);
    const pending = () => page === 'activity' && active()?.status === 'pending';
    function configure(values) {
      if (page !== 'setup') return false;
      const next = { ...config, ...values };
      if (!examples[next.theme] || !['questions', 'challenges', 'mixed'].includes(next.mode) || !['open_text', 'multiple_choice'].includes(next.kind) || !['local', 'remote'].includes(next.context)) return false;
      config = next; return true;
    }
    function start() {
      if (page !== 'setup' || !allowed()) return false;
      const kinds = config.mode === 'mixed' ? [config.kind, 'challenge'] : [config.mode === 'challenges' ? 'challenge' : config.kind];
      rounds = kinds.map(kind => ({ kind, status: 'pending', responses: [null, null], drafts: ['', ''] }));
      index = 0; page = 'activity'; opened = false; editing = false; notice = ''; return true;
    }
    function setViewer(value) {
      if (![0, 1].includes(value)) return false;
      viewer = value; opened = false; editing = false; notice = ''; return true;
    }
    function setCondition(value) {
      if (!['online', 'fail', 'offline', 'expired', 'unlinked'].includes(value)) return false;
      if (condition === 'unlinked') return false;
      condition = value; notice = '';
      if (value === 'unlinked') { rounds = []; page = 'setup'; opened = false; }
      return true;
    }
    function draft(value) {
      if (!pending() || ['expired', 'unlinked'].includes(condition) || (active().responses[viewer] !== null && !editing)) return false;
      active().drafts[viewer] = String(value).slice(0, 500); return true;
    }
    function edit() {
      if (!pending() || !allowed() || active().responses[viewer] === null || active().kind === 'challenge') return false;
      active().drafts[viewer] = active().responses[viewer]; editing = true; return true;
    }
    function submit() {
      if (!pending() || !allowed()) return false;
      const round = active();
      if (round.responses[viewer] !== null && !editing) return false;
      const value = round.kind === 'challenge' ? 'Cumpri minha parte.' : round.drafts[viewer].trim();
      if (!value || (round.kind === 'multiple_choice' && !choices.includes(value))) return false;
      if (condition === 'fail') { condition = 'online'; notice = 'Não conseguimos guardar sua participação. Seu rascunho continua aqui; tente novamente.'; return false; }
      round.responses[viewer] = value; round.drafts[viewer] = ''; editing = false; notice = '';
      if (round.responses.every(item => item !== null)) round.status = 'resolved';
      return true;
    }
    function skip() {
      if (!pending() || !allowed()) return false;
      active().status = 'skipped'; active().responses = [null, null]; active().drafts = ['', '']; opened = false; editing = false; notice = ''; return true;
    }
    function reveal() {
      if (page !== 'activity' || active()?.status !== 'resolved' || !allowed()) return false;
      opened = true; return true;
    }
    function advance() {
      if (page !== 'activity' || !allowed() || !['resolved', 'skipped'].includes(active()?.status)) return false;
      if (index + 1 < rounds.length) index++; else page = 'summary';
      opened = false; editing = false; notice = ''; return true;
    }
    function pause() { if (page !== 'activity') return false; page = 'paused'; opened = false; return true; }
    function resume() { if (page !== 'paused' || ['expired', 'unlinked'].includes(condition)) return false; page = 'activity'; return true; }
    function view() {
      const base = { condition, viewer, name: names[viewer], otherName: names[1 - viewer] };
      if (['expired', 'unlinked'].includes(condition)) return { ...base, page: 'locked' };
      const result = { ...base, page, config: clone(config), notice, writable: allowed(), completed: rounds.filter(r => r.status === 'resolved').length, skipped: rounds.filter(r => r.status === 'skipped').length, total: rounds.length, index };
      if (page !== 'activity') return result;
      const round = active();
      result.round = {
        kind: round.kind, status: round.status,
        prompt: round.kind === 'challenge' ? examples[config.theme][1] : round.kind === 'multiple_choice' ? `Ao conversar sobre ${config.theme.toLowerCase()}, qual jeito de começar você prefere?` : examples[config.theme][0],
        options: round.kind === 'multiple_choice' ? [...choices] : [],
        mine: round.responses[viewer], draft: round.drafts[viewer], otherSubmitted: round.responses[1 - viewer] !== null,
        editing, opened, answers: round.status === 'resolved' && opened && allowed() ? round.responses.map((text, person) => ({ name: names[person], text })) : [],
      };
      return result;
    }
    return { configure, start, setViewer, setCondition, draft, edit, submit, skip, reveal, advance, pause, resume, view };
  }
  globalThis.RevelationPrototype = { create, themes: Object.keys(examples) };
  if (typeof document === 'undefined') return;

  let model = create(), confirmation = '', busy = false;
  const main = document.querySelector('#main');
  const personSelect = document.querySelector('#viewer');
  const connectionSelect = document.querySelector('#connection');
  const restart = document.querySelector('#restart');
  const esc = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const button = (action, text, secondary = false, disabled = false) => `<button type="button" data-action="${action}" class="${secondary ? 'secondary' : ''}"${disabled ? ' disabled' : ''}>${text}</button>`;
  function render() {
    const view = model.view(), round = view.round;
    personSelect.value = String(view.viewer); connectionSelect.value = view.condition;
    personSelect.disabled = connectionSelect.disabled = restart.disabled = busy;
    let html = '';
    if (confirmation) {
      const skip = confirmation === 'skip';
      html = `<h1>${skip ? 'Pular esta atividade?' : 'Recomeçar a demonstração?'}</h1><p>${skip ? 'Esta atividade será encerrada para os dois, sem revelar respostas e sem contar como participação mútua.' : 'As participações e os rascunhos desta demonstração serão apagados.'}</p><div class="actions">${button('cancel', 'Continuar de onde parei', true)}${button(skip ? 'confirm-skip' : 'confirm-restart', skip ? 'Pular para os dois' : 'Recomeçar')}</div>`;
    } else if (view.page === 'locked') {
      html = `<h1>${view.condition === 'unlinked' ? 'Este vínculo foi encerrado.' : 'Seu acesso expirou.'}</h1><p>${view.condition === 'unlinked' ? 'O conteúdo desta partida não está mais disponível. No aplicativo, o próximo passo será criar ou entrar em outro espaço.' : 'Confirme seu acesso para retomar. Nenhuma pergunta ou resposta é exibida nesta tela.'}</p>${view.condition === 'expired' ? button('reconnect', 'Simular acesso revalidado') : button('reset', 'Nova demonstração', true)}`;
    } else if (view.page === 'setup') {
      html = `<div class="eyebrow">Antes de começar</div><h1>Como vocês querem participar?</h1><p>Escolham um tema e um jeito de viver este momento.</p><label class="field">Tema<select id="theme">${Object.keys(examples).map(theme => `<option${view.config.theme === theme ? ' selected' : ''}>${esc(theme)}</option>`).join('')}</select></label><label class="field">Formato<select id="mode">${[['questions', 'Perguntas'], ['challenges', 'Desafios'], ['mixed', 'Perguntas e desafios']].map(([value, text]) => `<option value="${value}"${value === view.config.mode ? ' selected' : ''}>${text}</option>`).join('')}</select></label>${view.config.mode !== 'challenges' ? `<label class="field">Resposta das perguntas<select id="kind"><option value="open_text"${view.config.kind === 'open_text' ? ' selected' : ''}>Discursiva</option><option value="multiple_choice"${view.config.kind === 'multiple_choice' ? ' selected' : ''}>Múltipla escolha</option></select></label>` : ''}<label class="field">Onde vão jogar?<select id="context"><option value="remote"${view.config.context === 'remote' ? ' selected' : ''}>Cada um na própria conta</option><option value="local"${view.config.context === 'local' ? ' selected' : ''}>Juntos neste dispositivo</option></select></label><p class="status">${view.config.mode === 'mixed' ? '2 atividades · cerca de 5–10 minutos' : '1 atividade · cerca de 3–5 minutos'}<br>Intensidade: exemplo para revisão, sem classificação editorial aprovada.</p><p class="fine notice">Conteúdo ilustrativo. A publicação dos temas depende da revisão editorial. Vocês podem pular.</p>${button('start', 'Começar momento →', false, !view.writable)}`;
    } else if (view.page === 'paused') {
      html = `<h1>Seu momento pode continuar depois.</h1><p>Ao retomar nesta demonstração, você volta à mesma atividade. Fechar ou recarregar esta página apaga os dados, inclusive rascunhos.</p>${button('resume', 'Retomar momento')}`;
    } else if (view.page === 'summary') {
      html = `<div class="mark" aria-hidden="true">♡</div><h1>${view.completed ? 'Mais um momento vivido a dois.' : 'Momento encerrado.'}</h1><p>${view.completed} de ${view.total} atividades com participação dos dois.<br>${view.skipped} ${view.skipped === 1 ? 'atividade pulada' : 'atividades puladas'}.</p><p>Fiquem com o que fez sentido. Não é preciso começar outra atividade agora.</p><div class="actions"><a href="prototipo-home-rotina.html">Voltar ao protótipo da home</a>${button('reset', 'Escolher outro momento', true)}</div>`;
    } else {
      const challenge = round.kind === 'challenge';
      const metadata = `<div class="eyebrow">${esc(view.config.theme)} · ${challenge ? 'Desafio' : round.kind === 'multiple_choice' ? 'Múltipla escolha' : 'Discursiva'} · ${view.index + 1} de ${view.total}</div>`;
      html = metadata;
      if (round.status === 'skipped') {
        html += `<h1>Atividade pulada.</h1><p>Nenhuma resposta desta atividade será revelada. Vocês podem seguir no próprio ritmo.</p>${button('advance', view.index + 1 < view.total ? 'Continuar →' : 'Ver resumo', false, !view.writable)}`;
      } else if (round.status === 'resolved' && round.opened && view.writable) {
        html += `<h1>${challenge ? 'Vocês cumpriram suas partes.' : 'Agora vocês podem se escutar.'}</h1>${round.answers.map(answer => `<article class="answer"><strong>${esc(answer.name)}</strong><p>${esc(answer.text)}</p></article>`).join('')}<p>${challenge ? 'Como foi viver esse momento?' : 'Leiam com calma. Depois contem o que mais chamou atenção.'}</p>${button('advance', view.index + 1 < view.total ? 'Próxima atividade →' : 'Concluir momento')}`;
      } else if (round.status === 'resolved') {
        html += `<h1>As duas participações estão prontas.</h1><p>Encontrem um momento para descobrir o que cada pessoa trouxe.</p>${button('reveal', challenge ? 'Ver confirmações' : 'Revelar respostas', false, !view.writable)}`;
      } else if (round.mine !== null && !round.editing) {
        html += `<h1>Sua parte está guardada.</h1><p>${esc(view.otherName)} participa quando puder. O conteúdo da outra pessoa continua privado.</p><article class="answer"><strong>Sua participação · ${esc(view.name)}</strong><p>${esc(round.mine)}</p></article><div class="actions">${challenge ? '' : button('edit', 'Corrigir minha resposta', true, !view.writable)}${view.config.context === 'local' ? button('handoff', `Passar para ${esc(view.otherName)}`) : ''}</div><p class="fine">${view.config.context === 'remote' ? 'Para revisar a outra perspectiva, altere a pessoa na barra de simulação.' : 'Passe o dispositivo antes de a outra pessoa começar.'}</p>`;
      } else {
        html += `<h1>${esc(round.prompt)}</h1><p><strong>Vez de ${esc(view.name)}.</strong> ${challenge ? 'Combinem o que é confortável para os dois. Confirme apenas sua própria parte.' : 'A outra pessoa não verá sua resposta antes de participar.'}</p>${round.editing ? '<p class="status">Você está corrigindo sua participação antes da revelação.</p>' : ''}`;
        if (challenge) html += button('submit', busy ? 'Guardando…' : 'Cumpri minha parte', false, busy || !view.writable);
        else html += `<form id="participation">${round.kind === 'open_text' ? `<label class="field" for="draft">Sua resposta<textarea id="draft" maxlength="500" required${busy ? ' disabled' : ''}>${esc(round.draft)}</textarea></label><p id="counter" class="count">${round.draft.length}/500 caracteres</p>` : `<fieldset><legend>Sua escolha</legend>${round.options.map((option, i) => `<label class="option"><input type="radio" name="answer" value="${esc(option)}"${round.draft === option ? ' checked' : ''}${busy ? ' disabled' : ''}><span>${String.fromCharCode(65 + i)} · ${esc(option)}</span></label>`).join('')}</fieldset>`}<button id="save" type="submit"${!round.draft.trim() || !view.writable || busy ? ' disabled' : ''}>${busy ? 'Guardando…' : round.kind === 'open_text' ? 'Guardar minha resposta' : 'Guardar minha escolha'}</button></form>`;
      }
      html += `<div class="actions">${round.status === 'pending' ? button('ask-skip', 'Pular atividade', true, busy || !view.writable) : ''}${button('pause', 'Sair por agora', true, busy)}</div><p class="fine">Rascunhos não enviados ficam apenas nesta página aberta.</p>`;
    }
    if (view.condition === 'offline' && view.page !== 'locked' && !confirmation) html = `<p class="error" role="status">Sem conexão. Você pode preparar seu rascunho, mas mudanças compartilhadas estão indisponíveis.</p>${button('reconnect', 'Simular reconexão', true)}${html}`;
    if (view.notice) html = `<p class="error" role="alert">${esc(view.notice)}</p>${html}`;
    main.innerHTML = `<section class="panel" aria-busy="${busy}">${html}</section>`;
    const title = main.querySelector('h1'); if (title) { title.tabIndex = -1; title.focus(); }
  }
  function send() {
    if (busy) return;
    busy = true; render();
    setTimeout(() => { model.submit(); busy = false; render(); document.querySelector('#announcement').textContent = model.view().notice || 'Estado de participação atualizado nesta demonstração.'; }, 250);
  }
  personSelect.addEventListener('change', () => { model.setViewer(Number(personSelect.value)); confirmation = ''; render(); });
  connectionSelect.addEventListener('change', () => { model.setCondition(connectionSelect.value); confirmation = ''; render(); });
  restart.addEventListener('click', () => { confirmation = 'restart'; render(); });
  main.addEventListener('change', event => {
    if (['theme', 'mode', 'kind', 'context'].includes(event.target.id)) { model.configure({ [event.target.id]: event.target.value }); render(); }
    else if (event.target.name === 'answer') { model.draft(event.target.value); const save = main.querySelector('#save'); if (save) save.disabled = !model.view().writable; }
  });
  main.addEventListener('input', event => {
    if (event.target.id !== 'draft') return;
    model.draft(event.target.value);
    main.querySelector('#counter').textContent = `${event.target.value.length}/500 caracteres`;
    main.querySelector('#save').disabled = !event.target.value.trim() || !model.view().writable;
  });
  main.addEventListener('submit', event => { if (event.target.id === 'participation') { event.preventDefault(); send(); } });
  main.addEventListener('click', event => {
    const action = event.target.closest('button')?.dataset.action;
    if (!action || busy) return;
    if (action === 'submit') return send();
    const actions = {
      start: () => model.start(), edit: () => model.edit(), reveal: () => model.reveal(), advance: () => model.advance(),
      pause: () => model.pause(), resume: () => model.resume(), handoff: () => model.setViewer(1 - model.view().viewer),
      reconnect: () => model.setCondition('online'), 'ask-skip': () => { confirmation = 'skip'; }, cancel: () => { confirmation = ''; },
      'confirm-skip': () => { model.skip(); confirmation = ''; }, reset: () => { model = create(); },
      'confirm-restart': () => { model = create(); confirmation = ''; },
    };
    actions[action]?.(); render();
  });
  render();
})();
