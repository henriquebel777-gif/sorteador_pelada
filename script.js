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

let jogadores = JSON.parse(localStorage.getItem('pelada_jogadores')) || [];
let timesSorteados = [];
let ultimoEspera = [];
let indexEmEdicao = null; 

const CORES_TIMES = ['#4caf50', '#2196f3', '#9c27b0', '#ff9800', '#e91e63'];

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
        li.innerHTML = `
            <div class="jogador-item-esquerda">
                <input type="checkbox" ${jogador.presente ? 'checked' : ''} onchange="alternarPresenca(${index})">
                <span class="lista-nome ${jogador.presente ? '' : 'ausente'}" id="txt-jogador-${index}"></span>
            </div>
            <div style="display: flex; gap: 5px;">
                <button class="btn-editar" onclick="editarJogador(${index})">✏️</button>
                <button class="btn-deletar" onclick="removerJogador(${index})">X</button>
            </div>
        `;
        listaUl.appendChild(li);
        
        const sufixoGoleiro = jogador.posicao === 'goleiro' ? ' GK' : '';
        document.getElementById(`txt-jogador-${index}`).textContent = `${jogador.nome} (${'★'.repeat(jogador.nivel)})${sufixoGoleiro}`;
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
    const j = jogadores[index];
    inputNome.value = j.nome;
    document.querySelector(`input[name="posicao"][value="${j.posicao}"]`).checked = true;
    document.querySelector(`input[name="nivel"][value="${j.nivel}"]`).checked = true;
    
    indexEmEdicao = index;
    const btnSalvar = form.querySelector('.btn-primary');
    btnSalvar.textContent = " Atualizar Craque";
    btnSalvar.style.backgroundColor = "#0288d1";
    inputNome.focus();
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
            alert(" Um jogador com este nome já está cadastrado no elenco!");
            return;
        }

        if (indexEmEdicao !== null) {
            jogadores[indexEmEdicao] = { ...jogadores[indexEmEdicao], nome, posicao, nivel };
            indexEmEdicao = null;
            const btnSalvar = form.querySelector('.btn-primary');
            btnSalvar.textContent = "Salvar no Elenco";
            btnSalvar.style.backgroundColor = "#2e7d32";
        } else {
            jogadores.push({ nome, posicao, nivel, presente: true });
        }

        inputNome.value = ''; 
        renderizarJogadores();
        secaoResultado.classList.add('hidden');
    });
}


window.removerJogador = function(index) {
    if(confirm("Deseja realmente excluir este jogador?")) {
        indexEmEdicao = null; 
        const btnSalvar = form.querySelector('.btn-primary');
        btnSalvar.textContent = "Salvar no Elenco";
        btnSalvar.style.backgroundColor = "#2e7d32";
        form.reset(); 

        jogadores.splice(index, 1);
        renderizarJogadores();
        secaoResultado.classList.add('hidden');
    }
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
            alert(`Marque pelo menos ${qtdTimesAlvo} jogadores presentes para dividir em ${qtdTimesAlvo} times!`);
            return;
        }

        secaoResultado.classList.add('hidden');
        btnSortear.disabled = true;
        btnSortear.classList.add('carregando');
        btnSortear.innerText = " Estruturando torneio...";

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

            
            containerTimesDinamicos.innerHTML = '';
            timesSorteados.forEach((time, index) => {
                const corBorda = CORES_TIMES[index % CORES_TIMES.length];
                const blocoHtml = document.createElement('div');
                blocoHtml.className = 'time-bloco';
                blocoHtml.style.borderTopColor = corBorda;
                
                let titularesHtml = time.jogadores.map(j => `<li>${j.posicao === 'goleiro' ? '🧤 ' : '🏃‍♂️ '}${j.nome}</li>`).join('');
                
              
                let revezamentoHtml = '';
                if(time.revezamento.length > 0) {
                    revezamentoHtml = `<div style="margin-top:10px; padding-top:5px; border-top: 1px solid #ddd; font-size:0.9rem; color:#e65100;">
                        <strong> Revezamento:</strong>
                        <ul style="padding-left: 5px;">${time.revezamento.map(r => `<li>• ${r.nome}</li>`).join('')}</ul>
                    </div>`;
                }
                
                blocoHtml.innerHTML = `
                    <h3 style="color: ${corBorda};">${time.nome}</h3>
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
                        liEspera.textContent = `• ${j.nome} ${j.posicao === 'goleiro' ? ' (Goleiro Extra)' : ''}`;
                        listaEspera.appendChild(liEspera);
                    });
                } else {
                    blocoEspera.style.display = "none";
                }
            }

            btnSortear.disabled = false;
            btnSortear.classList.remove('carregando');
            btnSortear.innerText = " Sortear Presentes";

            secaoResultado.classList.remove('hidden');
            secaoResultado.scrollIntoView({ behavior: 'smooth' });

        }, 1500);
    });
}

if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', () => {
        if (timesSorteados.length === 0) return;

        let textoWhats = ` *TABELA DO TORNEIO* \n\n`;
        
        timesSorteados.forEach(time => {
            textoWhats += ` *${time.nome.toUpperCase()}*\n`;
            time.jogadores.forEach(j => {
                textoWhats += `• ${j.nome} ${j.posicao === 'goleiro' ? '(GK )' : ''}\n`;
            });
            
           
            if(time.revezamento.length > 0) {
                textoWhats += ` _Revezamento:_ ${time.revezamento.map(r => r.nome).join(', ')}\n`;
            }
            textoWhats += `\n`;
        });
        
        if (ultimoEspera.length > 0) {
            textoWhats += ` *GOLEIROS EXTRAS / ESPERA*\n`;
            ultimoEspera.forEach(j => textoWhats += `• ${j.nome} \n`);
            textoWhats += `\n`;
        }
        
        textoWhats += `_Gerado por Sorteador de Pelada Elite_`;

        navigator.clipboard.writeText(textoWhats).then(() => {
            alert(" Tabela do torneio copiada para a área de transferência!");
        }).catch(err => {
            alert("Erro ao copiar: ", err);
        });
    });
}

renderizarJogadores();