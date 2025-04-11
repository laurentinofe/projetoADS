document.addEventListener("DOMContentLoaded", () => {
    const formCadastro = document.getElementById("formCadastro");
    const formLogin = document.getElementById("formLogin");
  
    // Cadastro de usuário
    if (formCadastro) {
      formCadastro.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = document.getElementById("nome").value;
        const matricula = document.getElementById("matricula").value;
        const senha = document.getElementById("senha").value;
  
        const usuario = { nome, matricula, senha };
        localStorage.setItem(matricula, JSON.stringify(usuario));
        alert("Cadastro realizado com sucesso!");
        window.location.href = "login.html";
      });
    }
  
    // Login de usuário
    if (formLogin) {
      formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const matricula = document.getElementById("matriculaLogin").value;
        const senha = document.getElementById("senhaLogin").value;
  
        const user = JSON.parse(localStorage.getItem(matricula));
        if (user && user.senha === senha) {
          alert("Login bem-sucedido!");
          sessionStorage.setItem("usuarioLogado", JSON.stringify(user));
          window.location.href = "ponto.html";
        } else {
          alert("Matrícula ou senha incorretos!");
        }
      });
    }
  
    // Login do gestor
    const formLoginGestor = document.getElementById("formLoginGestor");
  
    if (formLoginGestor) {
      formLoginGestor.addEventListener("submit", (e) => {
        e.preventDefault();
        const usuario = document.getElementById("usuarioGestor").value;
        const senha = document.getElementById("senhaGestor").value;
  
        if (usuario === "admin" && senha === "1234") {
          sessionStorage.setItem("gestorLogado", "true");
          window.location.href = "gestor.html";
        } else {
          alert("Usuário ou senha inválidos para gestor.");
        }
      });
    }
  
    // Página de ponto
    const btnRegistrar = document.getElementById("btnRegistrar");
  
    if (btnRegistrar) {
      const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));
  
      if (!usuario) {
        alert("Você precisa estar logado.");
        window.location.href = "login.html";
      }
  
      document.getElementById("boasVindas").textContent = `Olá, ${usuario.nome}`;
  
      btnRegistrar.addEventListener("click", async () => {
        const hoje = new Date().toLocaleDateString();
        const registros = JSON.parse(localStorage.getItem("registros") || "[]");
  
        // Filtra os registros de hoje do usuário
        const registrosHoje = registros.filter(
          (r) => r.matricula === usuario.matricula && r.data === hoje
        );
  
        if (registrosHoje.length >= 4) {
          document.getElementById("resultado").textContent =
            "Limite de 4 registros atingido para hoje.";
          return;
        }
  
        const hora = new Date().toLocaleTimeString();
  
        // Coletar IP público via API gratuita
        let ip = "Desconhecido";
        try {
          const response = await fetch("https://api.ipify.org?format=json");
          const data = await response.json();
          ip = data.ip;
        } catch (e) {
          console.warn("Falha ao buscar IP", e);
        }
  
        const novoRegistro = {
          nome: usuario.nome,
          matricula: usuario.matricula,
          data: hoje,
          hora: hora,
          ip: ip,
        };
  
        registros.push(novoRegistro);
        localStorage.setItem("registros", JSON.stringify(registros));
        document.getElementById("resultado").textContent =
          "Ponto registrado com sucesso!";
      });
    }
  
    // Página do gestor
    const tabela = document.getElementById("tabelaRegistros");
    const btnFiltrar = document.getElementById("btnFiltrar");
    const btnLimpar = document.getElementById("btnLimpar");
  
    if (tabela) {
      // Protege a página do gestor
      if (!sessionStorage.getItem("gestorLogado")) {
        alert("Acesso negado. Faça login como gestor.");
        window.location.href = "loginGestor.html";
        return;
      }
  
      const registros = JSON.parse(localStorage.getItem("registros") || "[]");
  
      function renderizarTabela(lista) {
        const corpo = tabela.querySelector("tbody");
        corpo.innerHTML = "";
  
        if (lista.length === 0) {
          const linha = corpo.insertRow();
          const celula = linha.insertCell();
          celula.colSpan = 5;
          celula.textContent = "Nenhum registro encontrado.";
          return;
        }
  
        lista.forEach((r) => {
          const linha = corpo.insertRow();
          linha.insertCell().textContent = r.nome;
          linha.insertCell().textContent = r.matricula;
          linha.insertCell().textContent = r.data;
          linha.insertCell().textContent = r.hora;
          linha.insertCell().textContent = r.ip;
        });
      }
  
      renderizarTabela(registros);
  
      btnFiltrar.addEventListener("click", () => {
        const matricula = document.getElementById("filtroMatricula").value.trim();
        const filtrados = registros.filter((r) => r.matricula === matricula);
        renderizarTabela(filtrados);
      });
  
      btnLimpar.addEventListener("click", () => {
        document.getElementById("filtroMatricula").value = "";
        renderizarTabela(registros);
      });
    }
  });
  