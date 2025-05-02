// Função para confirmar a idade
function confirmAge() {
  localStorage.setItem('ageConfirmed', 'true');
  document.getElementById('age-verification-modal').style.display = 'none';
}

// Função para sair do site
function exitSite() {
  window.location.href = 'https://www.makingoff.eu.org'; // Redireciona para um site seguro
}

// Exibe o modal de verificação de idade se necessário
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('ageConfirmed') !== 'true') {
    const modal = `
      <div id="age-verification-modal">
        <h1>Este é um site adulto</h1>
        <p>
          Este site contém material com restrições de idade, incluindo nudez e
          representações explícitas de atividade sexual. Ao continuar, você afirma
          que tem pelo menos 18 anos ou a maioridade na sua jurisdição e consente
          em visualizar conteúdo sexualmente explícito.
        </p>
        <div class="buttons">
          <button class="enter" onclick="confirmAge()">Tenho 18 anos ou mais - Entrar</button>
          <button class="exit" onclick="exitSite()">Tenho menos de 18 anos - Sair</button>
        </div>
        <div class="footer">
          Nossa <a href="#">página de controle parental</a> explica como bloquear facilmente o acesso a este site.
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
  }
});
