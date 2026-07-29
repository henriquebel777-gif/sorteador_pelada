const form = document.getElementById('form-jogador');
const inputNome = document.getElementById('nome');
const listaUl = document.getElementById('lista-jogadores');
const contadorSpan = document.getElementById('contador');
const btnSortear = document.getElementById('btn-sortear');
const secaoResultado = document.getElementById('resultado');
const containerTimesDinamicos = document.getElementById('times-dinamicos-container');
const selectQtdTimes = document.getElementById('qtd-times');
const inputLimitePorTime = document.getElementById('limite-por-time');
const btnWhatsapp = document.getElementById('btn-whatsapp');
const listaEspera = document.getElementById('lista-espera-lista');
const blocoEspera = document.getElementById('bloco-espera');
const blocoProximoJogo = document.getElementById('bloco-proximo-jogo');
const botoesTimesDerrota = document.getElementById('botoes-times-derrota');

let jogadores = JSON.parse(localStorage.getItem('pelada_jogadores')) || [];
let timesSorteados = [];
let ultimoEspera = [];
let indexEmEdicao = null; 
let indexParaExcluir = null;

const CORES_TIMES = ['#4caf50', '#2196f3', '#9c27b0', '#ff9800', '#e91e63'];

// --- SISTEMA DE ALERTA PERSONALIZADO ---
window.mostrarAlerta = function(mensagem, titulo = "💡 Aviso", icone = "fa-solid fa-circle-info") {
    const modal = document.getElementById('modal-alerta');
    const elTitulo = document.getElementById('modal-alerta-titulo');
    const elMensagem = document.getElementById('modal-alerta-mensagem');

    if (modal && elTitulo && elMensagem) {
        elTitulo.innerHTML = `<i class="${icone}"></i> ${titulo}`;
        elMensagem.textContent = mensagem;
        modal.classList.remove('hidden');
    }
};

window.fecharAlerta = function() {
    const modal = document.getElementById('modal-alerta');
    if (modal) modal.classList.add('hidden');
};

// --- CONTROLE DAS ABAS ---
window.alternarAba = function(aba) {
    const btnMassa = document.getElementById('tab-btn-massa');
    const btnUnico = document.getElementById('tab-btn-unico');
    const abaMassa = document.getElementById('aba-massa');
    const abaUnico = document.getElementById('aba-unico');

    if (aba === 'massa') {
        btnMassa.classList.add('active');
        btnUnico.classList.remove('active');
        abaMassa.classList.remove('hidden');
        abaUnico.classList.add('hidden');
    } else {
        btnUnico.classList.add('active');
        btnMassa.classList.remove('active');
        abaUnico.classList.remove('hidden');
        abaMassa.classList.add('hidden');
    }
};

// --- IMPORTAÇÃO EM MASSA DO WHATSAPP ---
window.processarListaMassa = function() {
    const textarea = document.getElementById('texto-massa');
    if (!textarea) return;
    
    const texto = textarea.value.trim();
    if (!texto) {
        mostrarAlerta("Por favor, cole uma lista de nomes no campo para importar!", "Campo Vazio", "fa-solid fa-clipboard-question");
        return;
    }

    const linhas = texto.split('\n');
    let adicionados = 0;

    linhas.forEach(linha => {
        let nomeLimpo = linha.trim();
        if (!nomeLimpo) return;

        nomeLimpo = nomeLimpo.replace(/^[\d\.\-\)\•\*\s]+/, '').trim();
        if (!nomeLimpo) return;

        let posicao = 'linha';
        if (/\b(gk|goleiro|gol)\b/i.test(nomeLimpo)) {
            posicao = 'goleiro';
        }

        nomeLimpo = nomeLimpo.replace(/\s*[\(\[\{]?(gk|goleiro|gol)[\)\]\}]?\s*/gi, '').trim();

        const jaExiste = jogadores.some(j => j.nome.toLowerCase() === nomeLimpo.toLowerCase());
        if (!jaExiste && nomeLimpo.length > 0) {
            jogadores.push({
                nome: nomeLimpo,
                posicao: posicao,
                nivel: 2,
                presente: true
            });
            adicionados++;
        }
    });

    textarea.value = '';
    renderizarJogadores();
    if (secaoResultado) secaoResultado.classList.add('hidden');
    mostrarAlerta(`${adicionados} jogador(es) importados com sucesso!`, "Sucesso", "fa-solid fa-circle-check");
};

// --- CONTROLE DE ZERAR ELENCO COMPLETO ---
window.abrirModalZerarElenco = function() {
    if (jogadores.length === 0) {
        mostrarAlerta("O elenco já está totalmente vazio!", "Lista Vazia", "fa-solid fa-triangle-exclamation");
        return;
    }
    const modal = document.getElementById('modal-zerar');
    if (modal) modal.classList.remove('hidden');
};

window.fecharModalZerar = function() {
    const modal = document.getElementById('modal-zerar');
    if (modal) modal.classList.add('hidden');
};

window.confirmarZerarElenco = function() {
    jogadores = [];
    renderizarJogadores();
    if (secaoResultado) secaoResultado.classList.add('hidden');
    fecharModalZerar();
};

function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function renderizarJogadores() {
    if (!listaUl || !contadorSpan) return;
    listaUl.innerHTML = '';
    
    jogadores.forEach((jogador, index) => {
        if (jogador.presente === undefined) jogador.presente = true;
        if (jogador.posicao === undefined) jogador.posicao = 'linha';

        const li = document.createElement('li');
        
        let estrelasHtml = '';
        for(let s = 0; s < jogador.nivel; s++) {
            estrelasHtml += `<i class="fa-solid fa-star star-icon"></i>`;
        }
        
        const iconePos = jogador.posicao === 'goleiro' ? 
            `<i class="fa-solid fa-mitten pos-icon" title="Goleiro"></i>` : '';

        li.innerHTML = `
            <div class="jogador-item-esquerda">
                <input type="checkbox" ${jogador.presente ? 'checked' : ''} onchange="alternarPresenca(${index})">
                <span class="lista-nome ${jogador.presente ? '' : 'ausente'}">
                    ${jogador.nome} (${estrelasHtml})${iconePos}
                </span>
            </div>
            <div style="display: flex; gap: 5px;">
                <button class="btn-editar" onclick="editarJogador(${index})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-deletar" onclick="removerJogador(${index})"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;
        listaUl.appendChild(li);
    });
    
    contadorSpan.innerText = jogadores.length;
    localStorage.setItem('pelada_jogadores', JSON.stringify(jogadores));
}

window.alternarPresenca = function(index) {
    jogadores[index].presente = !jogadores[index].presente;
    renderizarJogadores();
};

window.marcarTodos = function(status) {
    jogadores.forEach(j => j.presente = status);
    renderizarJogadores();
};

window.editarJogador = function(index) {
    alternarAba('unico');
    const j = jogadores[index];
    if(inputNome) inputNome.value = j.nome;
    
    const radioPos = document.querySelector(`input[name="posicao"][value="${j.posicao}"]`);
    if(radioPos) radioPos.checked = true;
    
    const radioNivel = document.querySelector(`input[name="nivel"][value="${j.nivel}"]`);
    if(radioNivel) radioNivel.checked = true;
    
    indexEmEdicao = index;
    if (form) {
        const btnSalvar = form.querySelector('.btn-primary');
        if (btnSalvar) {
            btnSalvar.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Atualizar Craque`;
            btnSalvar.style.backgroundColor = "#0288d1";
        }
    }
    if(inputNome) inputNome.focus();
};

// --- EXCLUSÃO ÚNICA ---
window.removerJogador = function(index) {
    indexParaExcluir = index;
    const modal = document.getElementById('modal-confirm');
    if (modal) modal.classList.remove('hidden');
};

window.fecharModalExclusao = function() {
    indexParaExcluir = null;
    const modal = document.getElementById('modal-confirm');
    if (modal) modal.classList.add('hidden');
};

window.confirmarExclusao = function() {
    if (indexParaExcluir !== null && indexParaExcluir !== undefined) {
        indexEmEdicao = null; 
        if (form) {
            const btnSalvar = form.querySelector('.btn-primary');
            if (btnSalvar) {
                btnSalvar.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Salvar no Elenco`;
                btnSalvar.style.backgroundColor = "#2e7d32";
            }
            form.reset(); 
        }

        jogadores.splice(indexParaExcluir, 1);
        renderizarJogadores();
        if (secaoResultado) secaoResultado.classList.add('hidden');
        
        window.fecharModalExclusao();
    }
};

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = inputNome.value.trim();
        const posicao = document.querySelector('input[name="posicao"]:checked').value;
        const nivel = parseInt(document.querySelector('input[name="nivel"]:checked').value);

        if (!nome) return;

        const jaExiste = jogadores.some((j, idx) => j.nome.toLowerCase() === nome.toLowerCase() && idx !== indexEmEdicao);
        if (jaExiste) {
            mostrarAlerta("Um jogador com este nome já está cadastrado no elenco!", "Nome Duplicado", "fa-solid fa-user-gear");
            return;
        }

        if (indexEmEdicao !== null) {
            jogadores[indexEmEdicao] = { ...jogadores[indexEmEdicao], nome, posicao, nivel };
            indexEmEdicao = null;
            const btnSalvar = form.querySelector('.btn-primary');
            btnSalvar.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Salvar no Elenco`;
            btnSalvar.style.backgroundColor = "#2e7d32";
        } else {
            jogadores.push({ nome, posicao, nivel, presente: true });
        }

        inputNome.value = ''; 
        renderizarJogadores();
        secaoResultado.classList.add('hidden');
    });
}

// --- RENDERIZAÇÃO DOS TIMES FORMADOS E CONTROLES EM TEMPO REAL ---
function atualizarInterfaceTimes() {
    containerTimesDinamicos.innerHTML = '';
    
    timesSorteados.forEach((time, timeIdx) => {
        const corBorda = CORES_TIMES[timeIdx % CORES_TIMES.length];
        const blocoHtml = document.createElement('div');
        blocoHtml.className = 'time-bloco';
        blocoHtml.style.borderTopColor = corBorda;
        
        let titularesHtml = time.jogadores.map((j, jogIdx) => {
            const iconePos = j.posicao === 'goleiro' ? 'fa-solid fa-mitten' : 'fa-solid fa-person-running';
            const btnTroca = (time.revezamento.length > 0 && j.posicao === 'linha') ? 
                `<button class="btn-substituir" onclick="substituirJogador(${timeIdx}, ${jogIdx})" title="Enviar para revezamento e puxar o próximo"><i class="fa-solid fa-right-left"></i> Trocar</button>` : '';
            
            return `<li>
                <span><i class="${iconePos}"></i>${j.nome}</span>
                ${btnTroca}
            </li>`;
        }).join('');
        
        let revezamentoHtml = '';
        if(time.revezamento.length > 0) {
            revezamentoHtml = `<div style="margin-top:10px; padding-top:5px; border-top: 1px solid #ddd; font-size:0.9rem; color:#e65100;">
                <strong><i class="fa-solid fa-rotate"></i> Revezamento do Time:</strong>
                <ul style="padding-left: 5px;">${time.revezamento.map(r => `<li>• ${r.nome}</li>`).join('')}</ul>
            </div>`;
        }
        
        blocoHtml.innerHTML = `
            <h3 style="color: ${corBorda};"><i class="fa-solid fa-shield-halved"></i> ${time.nome}</h3>
            <ul>${titularesHtml}</ul>
            ${revezamentoHtml}
        `;
        containerTimesDinamicos.appendChild(blocoHtml);
    });

    if (blocoEspera && listaEspera) {
        if (ultimoEspera.length > 0) {
            blocoEspera.style.display = "block";
            listaEspera.innerHTML = '';
            ultimoEspera.forEach(j => {
                const liEspera = document.createElement('li');
                liEspera.innerHTML = `• ${j.nome} ${j.posicao === 'goleiro' ? '<i class="fa-solid fa-mitten"></i>' : ''}`;
                listaEspera.appendChild(liEspera);
            });
        } else {
            blocoEspera.style.display = "none";
        }
    }

    if (blocoProximoJogo && botoesTimesDerrota) {
        if (timesSorteados.length > 2) {
            blocoProximoJogo.classList.remove('hidden');
            botoesTimesDerrota.innerHTML = '';
            timesSorteados.forEach((t, idx) => {
                const btn = document.createElement('button');
                btn.className = 'btn-derrota';
                btn.innerHTML = `<i class="fa-solid fa-arrow-down-long"></i> ${t.nome} Perdeu`;
                btn.onclick = () => rotacionarTimePerdedor(idx);
                botoesTimesDerrota.appendChild(btn);
            });
        } else {
            blocoProximoJogo.classList.add('hidden');
        }
    }
}

// FUNCIONALIDADE A: SUBSTITUIÇÃO INDIVIDUAL DENTRO DO TIME
window.substituirJogador = function(timeIndex, jogadorIndex) {
    let time = timesSorteados[timeIndex];
    if (!time || time.revezamento.length === 0) return;

    let saindo = time.jogadores.splice(jogadorIndex, 1)[0];
    time.revezamento.push(saindo);

    let entrando = time.revezamento.shift();
    time.jogadores.push(entrando);

    atualizarInterfaceTimes();
    mostrarAlerta(`${saindo.nome} foi para o banco. ${entrando.nome} entrou em campo!`, "Substituição Realizada", "fa-solid fa-right-left");
};

// FUNCIONALIDADE B: ROTACIONAR TIME PERDEDOR (QUEM GANHA FICA)
window.rotacionarTimePerdedor = function(perdedorIdx) {
    if (timesSorteados.length <= 2) return;

    let timePerdedor = timesSorteados.splice(perdedorIdx, 1)[0];
    timesSorteados.push(timePerdedor);

    atualizarInterfaceTimes();
    mostrarAlerta(`${timePerdedor.nome} foi para o fim da fila de jogos. Próximo time pronto!`, "Próxima Partida", "fa-solid fa-arrows-spin");
};

if (btnSortear) {
    btnSortear.addEventListener('click', () => {
        let presentes = jogadores.filter(j => j.presente);
        let qtdTimesAlvo = parseInt(selectQtdTimes.value);
        let limitePorTime = parseInt(inputLimitePorTime.value);
        
        if (isNaN(limitePorTime) || limitePorTime <= 0) {
            limitePorTime = 5;
            inputLimitePorTime.value = 5;
        }

        if (presentes.length < qtdTimesAlvo) {
            mostrarAlerta(`Marque pelo menos ${qtdTimesAlvo} jogadores presentes para dividir em ${qtdTimesAlvo} times!`, "Jogadores Insuficientes", "fa-solid fa-users-slash");
            return;
        }

        secaoResultado.classList.add('hidden');
        btnSortear.disabled = true;
        btnSortear.classList.add('carregando');
        btnSortear.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Estruturando torneio...`;

        setTimeout(() => {
            timesSorteados = [];
            for (let i = 0; i < qtdTimesAlvo; i++) {
                timesSorteados.push({
                    id: i + 1,
                    nome: `Time ${String.fromCharCode(65 + i)}`,
                    jogadores: [],
                    revezamento: [], 
                    somaTecnica: 0
                });
            }
            ultimoEspera = [];

            let goleiros = presentes.filter(j => j.posicao === 'goleiro');
            goleiros = embaralhar(goleiros).sort((a,b) => b.nivel - a.nivel);

            goleiros.forEach(gol => {
                let timeSemGol = timesSorteados.find(t => t.jogadores.filter(j => j.posicao === 'goleiro').length === 0);
                if (timeSemGol) {
                    timeSemGol.jogadores.push(gol);
                    timeSemGol.somaTecnica += gol.nivel;
                } else {
                    ultimoEspera.push(gol);
                }
            });

            let jogadoresLinha = presentes.filter(j => j.posicao === 'linha');
            jogadoresLinha = embaralhar(jogadoresLinha).sort((a, b) => b.nivel - a.nivel);

            jogadoresLinha.forEach(jog => {
                let timesTitularesDisponiveis = timesSorteados.filter(t => t.jogadores.filter(j => j.posicao === 'linha').length < limitePorTime);
                
                if (timesTitularesDisponiveis.length > 0) {
                    timesTitularesDisponiveis.sort((a, b) => a.somaTecnica - b.somaTecnica);
                    timesTitularesDisponiveis[0].jogadores.push(jog);
                    timesTitularesDisponiveis[0].somaTecnica += jog.nivel;
                } else {
                    timesSorteados.sort((a, b) => a.revezamento.length - b.revezamento.length);
                    timesSorteados[0].revezamento.push(jog);
                    timesSorteados[0].somaTecnica += (jog.nivel * 0.5); 
                }
            });

            timesSorteados.sort((a, b) => a.id - b.id);

            atualizarInterfaceTimes();

            btnSortear.disabled = false;
            btnSortear.classList.remove('carregando');
            btnSortear.innerHTML = `<i class="fa-solid fa-dice"></i> Sortear Presentes`;

            secaoResultado.classList.remove('hidden');
            secaoResultado.scrollIntoView({ behavior: 'smooth' });

        }, 1500);
    });
}

if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', () => {
        if (timesSorteados.length === 0) return;

        let textoWhats = ` ⚽ *TABELA DO TORNEIO* \n\n`;
        
        timesSorteados.forEach(time => {
            textoWhats += ` 🛡️ *${time.nome.toUpperCase()}*\n`;
            time.jogadores.forEach(j => {
                textoWhats += `• ${j.nome} ${j.posicao === 'goleiro' ? '(GK 🧤)' : ''}\n`;
            });
            
            if(time.revezamento.length > 0) {
                textoWhats += ` _Revezamento:_ ${time.revezamento.map(r => r.nome).join(', ')}\n`;
            }
            textoWhats += `\n`;
        });
        
        if (ultimoEspera.length > 0) {
            textoWhats += ` ⏳ *GOLEIROS EXTRAS / ESPERA*\n`;
            ultimoEspera.forEach(j => textoWhats += `• ${j.nome} \n`);
            textoWhats += `\n`;
        }
        
        textoWhats += `_Gerado por Sorteador de Pelada Elite_`;

        navigator.clipboard.writeText(textoWhats).then(() => {
            mostrarAlerta("Tabela do torneio copiada para a área de transferência!", "Copiado com Sucesso", "fa-solid fa-paste");
        }).catch(err => {
            mostrarAlerta("Erro ao copiar para a área de transferência.", "Erro ao Copiar", "fa-solid fa-xmark");
        });
    });
}

renderizarJogadores();

// ==========================================
// --- MÓDULO DE ARTILHARIA (RANKING) ---
// ==========================================
let artilheiros = JSON.parse(localStorage.getItem('pelada_artilheiros')) || [];

// Preenche o Select com os Jogadores Cadastrados
function carregarSelectArtilheiros() {
    const select = document.getElementById('selectArtilheiro');
    if (!select) return;

    select.innerHTML = '<option value="">Selecione o Craque...</option>';
    
    // Pega os jogadores da lista principal
    jogadores.forEach(j => {
        const option = document.createElement('option');
        option.value = j.nome;
        option.textContent = j.nome;
        select.appendChild(option);
    });
}

// Chame essa função dentro da sua renderizarJogadores() para manter atualizado sempre que adicionar/remover jogador
const renderOriginal = renderizarJogadores;
renderizarJogadores = function() {
    renderOriginal();
    carregarSelectArtilheiros();
};

const btnSalvarArtilheiro = document.getElementById('btnSalvarArtilheiro');
if (btnSalvarArtilheiro) {
    btnSalvarArtilheiro.addEventListener('click', function () {
        const selectArt = document.getElementById('selectArtilheiro');
        const inputGolsArt = document.getElementById('golsArtilheiro');

        const nome = selectArt ? selectArt.value : '';
        const gols = inputGolsArt ? parseInt(inputGolsArt.value) : 0;

        // VALIDA SE SELECIONOU UM JOGADOR E SE OS GOLS SÃO VÁLIDOS
        if (!nome) {
            alert("Por favor, selecione um jogador da lista!");
            return;
        }

        if (isNaN(gols) || gols <= 0) {
            alert("Informe pelo menos 1 gol válido!");
            return;
        }

        const jogadorExistente = artilheiros.find(a => a.nome.toLowerCase() === nome.toLowerCase());
        if (jogadorExistente) {
            jogadorExistente.gols += gols;
        } else {
            artilheiros.push({ nome, gols });
        }

        artilheiros.sort((a, b) => b.gols - a.gols);
        localStorage.setItem('pelada_artilheiros', JSON.stringify(artilheiros));

        atualizarListaArtilheiros();

        if (selectArt) selectArt.value = '';
        if (inputGolsArt) inputGolsArt.value = '1';
    });
}

window.removerArtilheiro = function(index) {
    artilheiros.splice(index, 1);
    localStorage.setItem('pelada_artilheiros', JSON.stringify(artilheiros));
    atualizarListaArtilheiros();
};

function atualizarListaArtilheiros() {
    const container = document.getElementById('listaArtilheiros');
    if (!container) return;

    container.innerHTML = '';

    if (artilheiros.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#777; padding:15px;">Nenhum gol registrado ainda!</p>';
        return;
    }

    artilheiros.forEach((jogador, index) => {
        const card = document.createElement('div');
        card.className = 'ranking-card';

        let classePosicao = 'ranking-posicao';
        if (index === 0) classePosicao += ' pos-1';
        else if (index === 1) classePosicao += ' pos-2';
        else if (index === 2) classePosicao += ' pos-3';

        card.innerHTML = `
            <div class="${classePosicao}">${index + 1}</div>
            
            <div class="ranking-badge-craque">
                <i class="fa-solid fa-shirt"></i>
                <span>${jogador.nome}</span>
            </div>

            <div class="ranking-info-gols">
                <span class="gols-num">⚽ ${jogador.gols}</span>
                <button class="btn-deletar-artilheiro" onclick="removerArtilheiro(${index})" title="Excluir do Ranking">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

// Inicializa o select e a lista ao carregar a página
carregarSelectArtilheiros();
atualizarListaArtilheiros();/ /   t e s t e   g i t  
 