const biblia = {};
let livroAtual, capituloAtual, versiculoAtual;

// Função para carregar o arquivo JSON da Bíblia
function carregarBiblia(caminhoArquivo) {
  fetch(caminhoArquivo)
    .then(response => response.json())
    .then(data => {
      // Converter os dados para a estrutura correta
      for (const livro of data) {
        const nomeLivro = livro.name;
        biblia[nomeLivro] = {};
        for (let i = 0; i < livro.chapters.length; i++) {
          const capitulo = livro.chapters[i];
          const numCapitulo = i + 1;
          biblia[nomeLivro][numCapitulo] = {};
          for (let j = 0; j < capitulo.length; j++) {
            const versiculo = capitulo[j];
            const numVersiculo = j + 1;
            biblia[nomeLivro][numCapitulo][numVersiculo] = versiculo;
          }
        }
      }

      // Inicializa a interface do usuário
      inicializarInterface();
    })
    .catch(error => {
      console.error('Erro ao carregar o arquivo JSON:', error);
      alert('Erro ao carregar a Bíblia. Por favor, tente novamente mais tarde.');
    });
}

// Função para inicializar a interface do usuário
function inicializarInterface() {
  popularLivros();
  popularCapitulos();
  popularVersiculos();

  livroAtual = document.getElementById('livros').value;
  capituloAtual = 1;
  versiculoAtual = document.getElementById('versiculos').value;
}

// Função para popular o select de livros
function popularLivros() {
  const livrosSelect = document.getElementById('livros');
  for (const livro in biblia) {
    const option = document.createElement('option');
    option.value = livro;
    option.text = livro;
    livrosSelect.add(option);
  }
  livrosSelect.addEventListener('change', () => {
    popularCapitulos();
    document.getElementById('capitulos').selectedIndex = 0;
    document.getElementById('versiculos').selectedIndex = 0;
  });
}

// Função para popular o select de capítulos
function popularCapitulos() {
  const livro = document.getElementById('livros').value;
  const capitulosSelect = document.getElementById('capitulos');
  capitulosSelect.innerHTML = '<option value="">Todos</option>';

  if (biblia[livro]) {
    for (const capitulo in biblia[livro]) {
      const option = document.createElement('option');
      option.value = capitulo;
      option.text = capitulo;
      capitulosSelect.add(option);
    }
    capitulosSelect.addEventListener('change', popularVersiculos);
  }
}

// Função para popular o select de versículos
function popularVersiculos() {
  const livro = document.getElementById('livros').value;
  const capitulo = document.getElementById('capitulos').value;
  const versiculosSelect = document.getElementById('versiculos');
  versiculosSelect.innerHTML = '<option value="">-</option>';

  if (biblia[livro] && capitulo && biblia[livro][capitulo]) {
    const numVersiculos = Object.keys(biblia[livro][capitulo]).length;
    for (let i = 1; i <= numVersiculos; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.text = i;
      versiculosSelect.add(option);
    }
  }
}

// Função para exibir o texto bíblico
function exibirTexto() {
  const livro = document.getElementById('livros').value;
  const capitulo = document.getElementById('capitulos').value;
  const versiculo = document.getElementById('versiculos').value;
  const textoDiv = document.getElementById('texto');
  const navegacaoDiv = document.querySelector('.navegacao');
  const btnAnterior = document.getElementById('btnAnterior');
  const btnProximo = document.getElementById('btnProximo');

  if (biblia[livro]) {
    livroAtual = livro;
    capituloAtual = capitulo ? parseInt(capitulo, 10) : 1;
    versiculoAtual = versiculo;

    let textoLivro = '';
    if (capitulo) {
      for (const v in biblia[livro][capitulo]) {
        const versiculoTexto = biblia[livro][capitulo][v];
        const classeDestaque = (v === versiculo) ? 'destaque' : '';
        textoLivro += `<span class="versiculo ${classeDestaque}" data-versiculo="${v}"><span class="numero-versiculo">${v}: </span>${versiculoTexto}</span>`;
      }
    } else {
      // Exibe apenas o primeiro capítulo do livro
      const primeiroCapitulo = Object.keys(biblia[livro])[0];
      textoLivro = `<h2>Capítulo ${primeiroCapitulo}</h2>`;
      for (const v in biblia[livro][primeiroCapitulo]) {
        const versiculoTexto = biblia[livro][primeiroCapitulo][v];
        textoLivro += `<span class="versiculo" data-versiculo="${v}"><span class="numero-versiculo">${v}: </span>${versiculoTexto}</span>`;
      }
      capituloAtual = parseInt(primeiroCapitulo, 10);
    }

    textoDiv.innerHTML = textoLivro;
    navegacaoDiv.style.display = 'flex';
    btnAnterior.disabled = false;
    btnProximo.disabled = false;

    atualizarBotoesNavegacao();
  } else {
    textoDiv.textContent = 'Texto não encontrado.';
  }
}

// Função para navegar até o capítulo anterior
function capituloAnterior() {
  const livrosSelect = document.getElementById('livros');
  const capitulosSelect = document.getElementById('capitulos');

  if (capituloAtual > 1) {
    capituloAtual--;
    capitulosSelect.selectedIndex = capituloAtual;
    exibirTexto();
  } else {
    let livroAnteriorIndex = livrosSelect.selectedIndex - 1;
    if (livroAnteriorIndex >= 0) {
      livrosSelect.selectedIndex = livroAnteriorIndex;
      popularCapitulos();
      capituloAtual = Object.keys(biblia[livrosSelect.value]).length;
      capitulosSelect.selectedIndex = capituloAtual;
      exibirTexto();
    } else {
      alert('Você já está no início da Bíblia.');
    }
  }

  atualizarBotoesNavegacao();
}

// Função para navegar até o próximo capítulo
function proximoCapitulo() {
  const livrosSelect = document.getElementById('livros');
  const capitulosSelect = document.getElementById('capitulos');

  let numCapitulos = Object.keys(biblia[livroAtual]).length;
  if (capituloAtual < numCapitulos) {
    capituloAtual++;
    capitulosSelect.selectedIndex = capituloAtual;
    exibirTexto();
  } else {
    let proximoLivroIndex = livrosSelect.selectedIndex + 1;
    if (proximoLivroIndex < livrosSelect.options.length) {
      livrosSelect.selectedIndex = proximoLivroIndex;
      popularCapitulos();
      capituloAtual = 1; // Define como primeiro capítulo do próximo livro
      capitulosSelect.selectedIndex = 1; // índice 1 por causa da opção "Todos"
      exibirTexto();
    } else {
      alert('Você já está no fim da Bíblia.');
    }
  }

  atualizarBotoesNavegacao();
}

// Função para atualizar o texto dos botões de navegação
function atualizarBotoesNavegacao() {
  const livrosSelect = document.getElementById('livros');
  const btnAnterior = document.getElementById('btnAnterior');
  const btnProximo = document.getElementById('btnProximo');

  let numCapitulos = Object.keys(biblia[livroAtual]).length;

  if (capituloAtual < numCapitulos) {
    btnProximo.textContent = 'Próximo Capítulo';
  } else {
    let proximoLivroIndex = livrosSelect.selectedIndex + 1;
    let proximoLivro = livrosSelect.options[proximoLivroIndex] ? livrosSelect.options[proximoLivroIndex].value : null;
    btnProximo.textContent = proximoLivro ? `Ler ${proximoLivro}` : 'Fim da Bíblia';
  }

  if (capituloAtual > 1) {
    btnAnterior.textContent = 'Capítulo Anterior';
  } else {
    let livroAnteriorIndex = livrosSelect.selectedIndex - 1;
    let livroAnterior = livrosSelect.options[livroAnteriorIndex] ? livrosSelect.options[livroAnteriorIndex].value : null;
    btnAnterior.textContent = livroAnterior ? `Ler ${livroAnterior}` : 'Início da Bíblia';
  }
}

// Carrega a Bíblia ao iniciar a página
carregarBiblia('KJF.json'); // Substitua 'KJF.json' pelo nome do seu arquivo JSON
