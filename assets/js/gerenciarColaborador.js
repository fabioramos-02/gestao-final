document.addEventListener('DOMContentLoaded', function () {
    const btnSair = document.getElementById('btnSair');
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close-btn');
    const userForm = document.getElementById('userForm');
    const submitBtn = document.getElementById('submitBtn');
    const collaboratorList = document.getElementById('collaboratorList');
    const btnAdicionarUsuario = document.getElementById('btnAdicionarUsuario');
    let currentCollaboratorId = null;

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser) {
        alert("Você não está logado.");
        window.location.href = "login.html";
        return;
    }

    if (btnSair) {
        btnSair.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        });
    }

    function showModal(title, actionText) {
        document.getElementById('modalTitle').textContent = title;
        submitBtn.textContent = actionText;
        modal.style.display = 'block';
    }

    function resetModal() {
        currentCollaboratorId = null;
        userForm.reset();
    }

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        resetModal();
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            resetModal();
        }
    });

    btnAdicionarUsuario.addEventListener('click', () => {
        resetModal();
        showModal('Cadastrar Novo Colaborador', 'Cadastrar');
    });

    userForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const contact = document.getElementById('contact').value.trim();
        const email = document.getElementById('email').value.trim();
        const role = document.getElementById('role').value.trim();

        // Validações
        if (username.length < 3 || !/^[A-Za-zÀ-ÿ\s]+$/.test(username)) {
            alert('Nome deve ter pelo menos 3 letras e conter apenas letras e espaços.');
            return;
        }

        if (!/^(\(\d{2}\)\s?)?\d{4,5}-\d{4}$/.test(contact)) {
            alert('Contato deve ser um telefone válido. Ex: (99) 99999-9999 ou 99999-9999');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Informe um e-mail válido.');
            return;
        }

        if (role.length < 2) {
            alert('Cargo deve ter pelo menos 2 caracteres.');
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
                alert(`Colaborador ${username} ${currentCollaboratorId ? 'atualizado' : 'cadastrado'} com sucesso!`);
                listarColaboradores();
                modal.style.display = 'none';
                resetModal();
            })
            .catch(() => alert(`Erro ao ${currentCollaboratorId ? 'atualizar' : 'cadastrar'} o colaborador.`));
    });

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
            .catch(() => alert('Erro ao carregar colaboradores.'));
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
            .catch(() => alert('Erro ao carregar colaborador.'));
    };

    window.excluirColaborador = function (id) {
        if (confirm('Tem certeza que deseja excluir este colaborador?')) {
            fetch(`http://localhost:3003/colaboradores/${id}`, {
                method: 'DELETE'
            })
                .then(res => {
                    if (!res.ok) throw new Error('Erro ao excluir');
                    alert('Colaborador excluído com sucesso!');
                    listarColaboradores();
                })
                .catch(() => alert('Erro ao excluir colaborador.'));
        }
    };

    listarColaboradores(); // Inicia listagem
});
