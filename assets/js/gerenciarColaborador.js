document.addEventListener('DOMContentLoaded', function () {
    const btnSair = document.getElementById('btnSair');
    const modal = document.getElementById('modal');  // Modal de cadastro
    const closeBtn = document.querySelector('.close-btn');  // Fechar o modal de cadastro
    const userForm = document.getElementById('userForm');
    const submitBtn = document.getElementById('submitBtn');
    const collaboratorList = document.getElementById('collaboratorList');
    const btnAdicionarUsuario = document.getElementById('btnAdicionarUsuario');

    const successModal = document.getElementById('successModal');
    const successCloseBtn = document.getElementById('successCloseBtn');
    const closeSuccessBtn = document.querySelector('.close-btn-success');

    // Função para exibir o modal de sucesso por 5 segundos (ou mais)
    function showSuccessModal(message) {
        document.getElementById('successMessage').textContent = message;
        setTimeout(() => {
            successModal.style.display = 'none';
        }, 5000);  // Altere para o tempo que achar adequado (em milissegundos)
        successModal.style.display = 'block';

    }

    // Fechar o modal de sucesso se o usuário clicar no botão de fechar (X)
    closeSuccessBtn.addEventListener('click', () => {
        successModal.style.display = 'none';
    });

    // Fechar o modal de sucesso quando o usuário clicar fora do modal
    window.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });

    // Modal de logout
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
    const closeLogoutBtn = document.querySelector('.close-btn-logout'); // Fechar o modal de logout



    let currentCollaboratorId = null;

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    const contactInput = document.getElementById('contact');

    // Função para adicionar a máscara ao número de telefone
    contactInput.addEventListener('input', function (e) {
        let phoneNumber = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número
        if (phoneNumber.length <= 2) {
            phoneNumber = `(${phoneNumber}`;
        } else if (phoneNumber.length <= 6) {
            phoneNumber = `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
        } else if (phoneNumber.length <= 10) {
            phoneNumber = `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 10)}`;
        } else {
            phoneNumber = `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
        }

        e.target.value = phoneNumber; // Atualiza o valor do campo
    });

    if (!loggedInUser) {
        showSuccessModal("Você não está logado.");
        window.location.href = "login.html";
        return;
    }

    // Exibir o modal de confirmação ao clicar em "Sair"
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            logoutModal.style.display = 'block';  // Mostrar o modal de logout
        });
    }

    // Fechar o modal de logout se o usuário clicar no botão de fechar (X)
    if (closeLogoutBtn) {
        closeLogoutBtn.addEventListener('click', () => {
            logoutModal.style.display = 'none';  // Fechar o modal de logout
        });
    }

    // Fechar o modal de logout se o usuário clicar fora do modal
    window.addEventListener('click', (e) => {
        if (e.target === logoutModal) {
            logoutModal.style.display = 'none';  // Fechar o modal de logout
        }
    });

    // Quando o usuário confirmar o logout
    confirmLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');  // Remover o usuário da sessão
        window.location.href = 'login.html';  // Redirecionar para a página de login
    });

    // Quando o usuário cancelar o logout
    cancelLogoutBtn.addEventListener('click', () => {
        logoutModal.style.display = 'none';  // Fechar o modal de logout e voltar para a página
    });

    // Exibir o modal de cadastro
    function showModal(title, actionText) {
        document.getElementById('modalTitle').textContent = title;
        submitBtn.textContent = actionText;
        modal.style.display = 'block';
    }

    // Resetar o modal de cadastro
    function resetModal() {
        currentCollaboratorId = null;
        userForm.reset();
    }

    // Fechar o modal de cadastro se o usuário clicar no botão de fechar (X)
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        resetModal();
    });

    // Fechar o modal de cadastro se o usuário clicar fora do modal
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            resetModal();
        }
    });

    // Abrir o modal de cadastro quando o botão for clicado
    btnAdicionarUsuario.addEventListener('click', () => {
        resetModal();
        showModal('Cadastrar Novo Colaborador', 'Cadastrar');
    });


    // Exibir o modal de sucesso após a inserção de um colaborador
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const contact = document.getElementById('contact').value.trim();
        const email = document.getElementById('email').value.trim();
        const role = document.getElementById('role').value.trim();

        // Validações
        if (username.length < 3 || !/^[A-Za-zÀ-ÿ\s]+$/.test(username)) {
            showModal('Nome deve ter pelo menos 3 letras e conter apenas letras e espaços.');
            return;
        }

        if (!/^(\(\d{2}\)\s?)?\d{4,5}-\d{4}$/.test(contact)) {
            showSuccessModal('Contato deve ser um telefone válido. Ex: (99) 99999-9999 ou 99999-9999');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showSuccessModal('Informe um e-mail válido.');
            return;
        }

        if (role.length < 2) {
            showSuccessModal('Cargo deve ter pelo menos 2 caracteres.');
            return;
        }

        const collaborator = {
            nome: username,
            contato: contact,
            email: email,
            cargo: role,
            userId: loggedInUser.id
        };

        const url = currentCollaboratorId
            ? `http://localhost:3003/colaboradores/${currentCollaboratorId}`
            : 'http://localhost:3003/colaboradores';

        const method = currentCollaboratorId ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(collaborator)
        })
            .then(res => {
                if (!res.ok) throw new Error(currentCollaboratorId ? 'Erro ao atualizar' : 'Erro ao cadastrar');
                return res.json();
            })
            .then(() => {
                showSuccessModal(`Colaborador ${username} ${currentCollaboratorId ? 'atualizado' : 'cadastrado'} com sucesso!`);
                listarColaboradores();
                modal.style.display = 'none';
                resetModal();
            })
            .catch(() => showSuccessModal(`Erro ao ${currentCollaboratorId ? 'atualizar' : 'cadastrar'} o colaborador.`));
    });

    // Exibir o modal de sucesso após a exclusão de um colaborador
    window.excluirColaborador = function (id) {
        // Exibir o modal de exclusão
        const deleteModal = document.getElementById('deleteModal');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const closeDeleteBtn = document.querySelector('.close-btn-delete');

        // Mostrar o modal
        deleteModal.style.display = 'block';

        // Quando o usuário clicar em OK para confirmar a exclusão
        confirmDeleteBtn.onclick = function () {
            fetch(`http://localhost:3003/colaboradores/${id}`, {
                method: 'DELETE'
            })
                .then(res => {
                    if (!res.ok) throw new Error('Erro ao excluir');
                    showSuccessModal('Colaborador excluído com sucesso!');
                    listarColaboradores();
                    deleteModal.style.display = 'none';  // Fechar o modal após excluir
                })
                .catch(() => showSuccessModal('Erro ao excluir colaborador.'));
        };

        // Quando o usuário clicar em Cancelar ou no X para fechar o modal
        cancelDeleteBtn.onclick = function () {
            deleteModal.style.display = 'none';  // Fechar o modal
        };
        closeDeleteBtn.onclick = function () {
            deleteModal.style.display = 'none';  // Fechar o modal
        };

        // Fechar o modal de exclusão se o usuário clicar fora dele
        window.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                deleteModal.style.display = 'none';  // Fechar o modal
            }
        });
    };


    function listarColaboradores() {
        fetch(`http://localhost:3003/colaboradores?userId=${loggedInUser.id}`)
            .then(res => res.json())
            .then(colaboradores => {
                collaboratorList.innerHTML = '';
                colaboradores.forEach(c => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${c.nome}</td>
                        <td>
                            Contato: ${c.contato}<br>
                            Email: ${c.email || '-'}<br>
                            Cargo: ${c.cargo || '-'}
                        </td>
                        <td>
                            <button onclick="editarColaborador('${c.id}')">Editar</button>
                            <button onclick="excluirColaborador('${c.id}')">Excluir</button>
                        </td>
                    `;
                    collaboratorList.appendChild(tr);
                });
            })
            .catch(() => showSuccessModal('Erro ao carregar colaboradores.'));
    }

    window.editarColaborador = function (id) {
        fetch(`http://localhost:3003/colaboradores/${id}`)
            .then(res => res.json())
            .then(c => {
                document.getElementById('username').value = c.nome;
                document.getElementById('contact').value = c.contato;
                document.getElementById('email').value = c.email || '';
                document.getElementById('role').value = c.cargo || '';
                currentCollaboratorId = c.id;
                showModal('Editar Colaborador', 'Salvar Edição');
            })
            .catch(() => showSuccessModal('Erro ao carregar colaborador.'));
    };

    window.excluirColaborador = function (id) {
        // Exibir o modal de exclusão
        const deleteModal = document.getElementById('deleteModal');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const closeDeleteBtn = document.querySelector('.close-btn-delete');

        // Mostrar o modal
        deleteModal.style.display = 'block';

        // Quando o usuário clicar em OK para confirmar a exclusão
        confirmDeleteBtn.onclick = function () {
            fetch(`http://localhost:3003/colaboradores/${id}`, {
                method: 'DELETE'
            })
                .then(res => {
                    if (!res.ok) throw new Error('Erro ao excluir');
                    showSuccessModal('Colaborador excluído com sucesso!');
                    listarColaboradores();
                    deleteModal.style.display = 'none';  // Fechar o modal após excluir
                })
                .catch(() => showSuccessModal('Erro ao excluir colaborador.'));
        };

        // Quando o usuário clicar em Cancelar ou no X para fechar o modal
        cancelDeleteBtn.onclick = function () {
            deleteModal.style.display = 'none';  // Fechar o modal
        };
        closeDeleteBtn.onclick = function () {
            deleteModal.style.display = 'none';  // Fechar o modal
        };

        // Fechar o modal se o usuário clicar fora dele
        window.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                deleteModal.style.display = 'none';  // Fechar o modal
            }
        });
    };

    listarColaboradores(); // Inicia listagem
});
