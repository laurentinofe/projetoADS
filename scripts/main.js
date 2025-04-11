document.addEventListener("DOMContentLoaded", () => {
  // Inicialização garantida
  if (!localStorage.getItem('registros')) localStorage.setItem('registros', '[]');
  if (!localStorage.getItem('users')) localStorage.setItem('users', '{}');

  // API Simulada Melhorada
  const api = {
    async registrarPonto(registro) {
      const registros = JSON.parse(localStorage.getItem('registros'));
      registros.push(registro);
      localStorage.setItem('registros', JSON.stringify(registros));
      return true;
    },

    async getRegistros() {
      return JSON.parse(localStorage.getItem('registros'));
    },

    async getUser(matricula) {
      const users = JSON.parse(localStorage.getItem('users'));
      return users[matricula] || null;
    }
  };

  // Login Gestor Garantido
  const formLoginGestor = document.getElementById('formLoginGestor');
  if (formLoginGestor) {
    formLoginGestor.addEventListener('submit', (e) => {
      e.preventDefault();
      const usuario = document.getElementById('usuarioGestor').value.trim();
      const senha = document.getElementById('senhaGestor').value.trim();

      if (usuario === 'admin' && senha === '1234') {
        sessionStorage.setItem('gestorLogado', 'true');
        window.location.href = 'gestor.html';
      } else {
        alert('Credenciais inválidas! Use admin/1234');
      }
    });
  }

  // Sistema de Ponto Definitivo
  const btnRegistrar = document.getElementById('btnRegistrar');
  if (btnRegistrar) {
    const user = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    if (!user) window.location.href = 'login.html';

    document.getElementById('boasVindas').textContent = `Olá, ${user.nome}`;

    btnRegistrar.addEventListener('click', async () => {
      try {
        btnRegistrar.disabled = true;
        const agora = new Date();
        const hoje = agora.toLocaleDateString('pt-BR');
        const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        // Verificação robusta de registros recentes
        const registros = await api.getRegistros();
        const registroRecente = registros.find(r => {
          if (r.matricula === user.matricula && r.data === hoje) {
            const [h, m] = r.hora.split(':');
            const regDate = new Date();
            regDate.setHours(h);
            regDate.setMinutes(m);
            return (agora - regDate) < 300000;
          }
          return false;
        });

        if (registroRecente) {
          document.getElementById('resultado').textContent = 
            `Aguarde 5 minutos (Último: ${registroRecente.hora})`;
          document.getElementById('resultado').className = 'error';
          return;
        }

        // Registro com IP
        let ip = 'Desconhecido';
        try {
          const res = await fetch('https://api.ipify.org?format=json');
          ip = (await res.json()).ip || ip;
        } catch (e) {
          console.log('IP não capturado');
        }

        await api.registrarPonto({
          nome: user.nome,
          matricula: user.matricula,
          data: hoje,
          hora: hora,
          ip: ip
        });

        document.getElementById('resultado').textContent = 'Ponto registrado!';
        document.getElementById('resultado').className = 'success';

      } catch (error) {
        document.getElementById('resultado').textContent = 'Erro ao registrar!';
        document.getElementById('resultado').className = 'error';
      } finally {
        btnRegistrar.disabled = false;
      }
    });
  }
});