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
          const numCapitulo = i + 1; // Números dos capítulos começam em 1
          biblia[nomeLivro][numCapitulo] = {};
          for (let j = 0; j < capitulo.length; j++) {
            const versiculo = capitulo[j];
            const numVersiculo = j + 1; // Números dos versículos começam em 1
            biblia[nomeLivro][numCapitulo][numVersiculo] = versiculo;
          }
        }
      }

      // Inicializa a interface do usuário
      inicializarInterface();
    })
    .catch(error => {
      console.error('Erro ao carregar o arquivo JSON:', error);
      // Lidar com o erro de carregamento (exibir mensagem para o usuário, etc.)
    });
}

// Função para inicializar a interface do usuário
function inicializarInterface() {
  // Popula os selects de livros, capítulos e versículos
  popularLivros();
  popularCapitulos();
  popularVersiculos();

  // Inicializa as variáveis de controle de navegação
  livroAtual = document.getElementById('livros').value;
  capituloAtual = document.getElementById('capitulos').value;
  versiculoAtual = document.getElementById('versiculos').value;

  // Desabilita o botão "Capítulo Anterior" inicialmente
  document.getElementById('btnAnterior').disabled = true;
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
  livrosSelect.addEventListener('change', popularCapitulos);
}

// Função para popular o select de capítulos
function popularCapitulos() {
  const livro = document.getElementById('livros').value;
  const capitulosSelect = document.getElementById('capitulos');
  capitulosSelect.innerHTML = ''; // Limpa as opções existentes

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
  versiculosSelect.innerHTML = ''; // Limpa as opções existentes

  if (biblia[livro] && biblia[livro][capitulo]) {
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
  const btnAnterior = document.getElementById('btnAnterior');
  const btnProximo = document.getElementById('btnProximo');

  if (biblia[livro] && biblia[livro][capitulo]) {
    // Atualiza as variáveis de controle de navegação
    livroAtual = livro;
    capituloAtual = parseInt(capitulo, 10); // Converte para número
    versiculoAtual = versiculo;

    // Exibe o capítulo completo
    let textoCapitulo = '';
    for (const v in biblia[livro][capitulo]) {
      const versiculoTexto = biblia[livro][capitulo][v];
      const classeDestaque = (v === versiculo) ? 'destaque' : '';
      textoCapitulo += `<span class="versiculo ${classeDestaque}" data-versiculo="${v}">${versiculoTexto}</span>`;
    }
    textoDiv.innerHTML = textoCapitulo;

    // Habilita os botões de navegação
    btnAnterior.disabled = false;
    btnProximo.disabled = false;

    // Atualiza o texto dos botões de navegação
    atualizarBotoesNavegacao();
  } else {
    textoDiv.textContent = 'Texto não encontrado.';
  }
}

// Função para navegar até o capítulo anterior
function capituloAnterior() {
  const livrosSelect = document.getElementById('livros');
  const capitulosSelect = document.getElementById('capitulos');

  let capituloAnterior = capituloAtual - 1;
  if (capituloAnterior > 0) {
    // Ainda há capítulos anteriores no livro atual
    capitulosSelect.selectedIndex = capituloAnterior - 1; // Índice começa em 0
    capituloAtual = capituloAnterior;
    exibirTexto();
  } else {
    // Navega para o último capítulo do livro anterior
    let livroAnteriorIndex = livrosSelect.selectedIndex - 1;
    if (livroAnteriorIndex >= 0) {
      livrosSelect.selectedIndex = livroAnteriorIndex;
      capitulosSelect.selectedIndex = capitulosSelect.options.length - 1; // Último capítulo
      capituloAtual = parseInt(capitulosSelect.value, 10); // Converte para número
      exibirTexto();
    } else {
      // Já está no primeiro capítulo do primeiro livro
      alert('Você já está no início da Bíblia.');
    }
  }

  atualizarBotoesNavegacao();
}

// Função para navegar até o próximo capítulo
function proximoCapitulo() {
  const livrosSelect = document.getElementById('livros');
  const capitulosSelect = document.getElementById('capitulos');

  let proximoCapitulo = capituloAtual + 1;
  let numCapitulos = Object.keys(biblia[livroAtual]).length;

  if (proximoCapitulo <= numCapitulos) {
    // Ainda há próximos capítulos no livro atual
    capitulosSelect.selectedIndex = proximoCapitulo - 1; // Índice começa em 0
    capituloAtual = proximoCapitulo;
    exibirTexto();
  } else {
    // Navega para o primeiro capítulo do próximo livro
    let proximoLivroIndex = livrosSelect.selectedIndex + 1;
    if (proximoLivroIndex < livrosSelect.options.length) {
      livrosSelect.selectedIndex = proximoLivroIndex;
      capitulosSelect.selectedIndex = 0; // Primeiro capítulo
      capituloAtual = parseInt(capitulosSelect.value, 10); // Converte para número
      exibirTexto();
    } else {
      // Já está no último capítulo do último livro
      alert('Você já está no fim da Bíblia.');
    }
  }

  atualizarBotoesNavegacao();
}

// Função para atualizar o texto dos botões de navegação
function atualizarBotoesNavegacao() {
  const livrosSelect = document.getElementById('livros');
  const capitulosSelect = document.getElementById('capitulos');
  const btnAnterior = document.getElementById('btnAnterior');
  const btnProximo = document.getElementById('btnProximo');

  let proximoCapitulo = capituloAtual + 1;
  let numCapitulos = Object.keys(biblia[livroAtual]).length;

  if (proximoCapitulo <= numCapitulos) {
    // Ainda há próximos capítulos no livro atual
    btnProximo.textContent = 'Próximo Capítulo';
  } else {
    // Próximo capítulo está em outro livro
    let proximoLivroIndex = livrosSelect.selectedIndex + 1;
    let proximoLivro = livrosSelect.options[proximoLivroIndex].value;
    btnProximo.textContent = `Ler ${proximoLivro}`;
  }

  let capituloAnterior = capituloAtual - 1;
  if (capituloAnterior > 0) {
    // Ainda há capítulos anteriores no livro atual
    btnAnterior.textContent = 'Capítulo Anterior';
  } else {
    // Capítulo anterior está em outro livro
    let livroAnteriorIndex = livrosSelect.selectedIndex - 1;
    if (livroAnteriorIndex >= 0) {
      let livroAnterior = livrosSelect.options[livroAnteriorIndex].value;
      btnAnterior.textContent = `Ler ${livroAnterior}`;
    }
  }
}

// Carrega a Bíblia ao iniciar a página
carregarBiblia('KJF.json');