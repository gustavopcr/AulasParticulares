$(document).ready()
{
    
    document.getElementById ('btn_salvar').addEventListener ('click', salvarUsuario());     
    document.getElementById ('btn_entrar').addEventListener ('click', processaFormLogin());        
    //document.getElementById ('login-form').addEventListener ('submit', processaFormLogin);

    var db_usuarios = {};
    var usuarioCorrente = {};


    // função para gerar códigos randômicos a serem utilizados como código de usuário
    // Fonte: https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
    function generateUUID() { // Public Domain/MIT
        var d = new Date().getTime();//Timestamp
        var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if(d > 0){//Use timestamp until depleted
                r = (d + r)%16 | 0;
                d = Math.floor(d/16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r)%16 | 0;
                d2 = Math.floor(d2/16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    const dadosIniciais = {
        usuarios: [
            { "id": generateUUID (), "login": "admin", "senha": "123", "nome": "Administrador do Sistema", "email": "admin@abc.com", "tipo": "true"},
            { "id": generateUUID (), "login": "user", "senha": "123", "nome": "Usuario Comum", "email": "user@abc.com", "tipo": "false"},
        ]
    };
    
    const materiasIniciais = {
        materias: [// id, discplina, professor, valor
            { "id": "1", "disciplina": "matematica", "professor": "joao", "valor": "100"},
            { "id": "2", "disciplina": "quimica", "professor": "raquel", "valor": "120"},
        ]
    };

    
    // Inicializa o usuarioCorrente e banco de dados de usuários da aplicação de Login
    function initLoginApp () {
        // PARTE 1 - INICIALIZA USUARIOCORRENTE A PARTIR DE DADOS NO LOCAL STORAGE, CASO EXISTA
        usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
        if (usuarioCorrenteJSON) {
            usuarioCorrente = JSON.parse (usuarioCorrenteJSON);
        }
        
        // PARTE 2 - INICIALIZA BANCO DE DADOS DE USUÁRIOS
        // Obtem a string JSON com os dados de usuários a partir do localStorage
        var usuariosJSON = localStorage.getItem('db_usuarios');
    
        // Verifica se existem dados já armazenados no localStorage
        if (!usuariosJSON) {  // Se NÃO há dados no localStorage
            
            // Informa sobre localStorage vazio e e que serão carregados os dados iniciais
            alert('Dados de usuários não encontrados no localStorage. \n -----> Fazendo carga inicial.');
    
            // Copia os dados iniciais para o banco de dados 
            db_usuarios = dadosIniciais;
    
            // Salva os dados iniciais no local Storage convertendo-os para string antes
            localStorage.setItem('db_usuarios', JSON.stringify (dadosIniciais));
        }
        else  {  // Se há dados no localStorage
            
            // Converte a string JSON em objeto colocando no banco de dados baseado em JSON
            db_usuarios = JSON.parse(usuariosJSON);    
        }
    };

    function salvarUsuario (event) {
        // Cancela a submissão do formulário para tratar sem fazer refresh da tela
        event.preventDefault ();

        // Obtem os dados do formulário
        let login  = document.getElementById('txt_login').value;
        let nome   = document.getElementById('txt_nome').value;
        let email  = document.getElementById('txt_email').value;
        let senha  = document.getElementById('txt_senha').value;
        let senha2 = document.getElementById('txt_senha2').value;
        let tipo = document.getElementById('radio_prof').checked; //true é professor
        let materias = [
            { "id": "1", "disciplina": "matematica", "professor": "joao", "valor": "100"},
            { "id": "2", "disciplina": "quimica", "professor": "raquel", "valor": "120"},
        ];

        if (senha != senha2) {
            alert ('As senhas informadas não conferem.');
            return
        }

        // Adiciona o usuário no banco de dados
        addUser (nome, login, senha, email, tipo, materias);
        alert ('Usuário salvo com sucesso. Proceda com o login para ');

        // Oculta a div modal do login
        //document.getElementById ('loginModal').style.display = 'none';
        $('#loginModal').modal('hide');
    }

    function addUser (nome, login, senha, email, tipo, materias) {
    
        // Cria um objeto de usuario para o novo usuario 
        let newId = generateUUID ();
        //console.log("teste");
        let usuario = { "id": newId, "login": login, "senha": senha, "nome": nome, "email": email, "tipo": tipo, "materias": materias};
        
        // Inclui o novo usuario no banco de dados baseado em JSON
        db_usuarios.usuarios.push (usuario);
    
        // Salva o novo banco de dados com o novo usuário no localStorage
        localStorage.setItem('db_usuarios', JSON.stringify (db_usuarios));
    }


    function processaFormLogin (event) {                
        // Cancela a submissão do formulário para tratar sem fazer refresh da tela
        event.preventDefault ();
        
        // Obtem os dados de login e senha a partir do formulário de login
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        var tipo     = document.querySelector('select').selectedIndex;
        if(tipo == 0)
        {
            tipo=false;
        }
        else{
            tipo=true;
        }
        // Valida login e se estiver ok, redireciona para tela inicial da aplicação
        resultadoLogin = loginUser (username, password, tipo);
        if (resultadoLogin) {
            window.location.href = 'home.html';
        }
        else { // Se login falhou, avisa ao usuário
            alert ('Usuário ou senha incorretos');
        }
}

    // Verifica se o login do usuário está ok e, se positivo, direciona para a página inicial
    function loginUser (login, senha, tipo) {
        
        // Verifica todos os itens do banco de dados de usuarios 
        // para localizar o usuário informado no formulario de login
        for (var i = 0; i < db_usuarios.usuarios.length; i++) {
            var usuario = db_usuarios.usuarios[i];
            
            // Se encontrou login, carrega usuário corrente e salva no Session Storage
            if (login == usuario.login && senha == usuario.senha && tipo == usuario.tipo) {
                usuarioCorrente.id = usuario.id;
                usuarioCorrente.login = usuario.login;
                usuarioCorrente.email = usuario.email;
                usuarioCorrente.nome = usuario.nome;
                usuarioCorrente.tipo = usuario.tipo;
                usuarioCorrente.materias = usuario.materias;

                
                // Salva os dados do usuário corrente no Session Storage, mas antes converte para string
                sessionStorage.setItem ('usuarioCorrente', JSON.stringify (usuarioCorrente));

                // Retorna true para usuário encontrado
                return true;
            }
        }

        // Se chegou até aqui é por que não encontrou o usuário e retorna falso
        return false;
    }

    // Apaga os dados do usuário corrente no sessionStorage
    function logoutUser () {
        usuarioCorrente = {};
        sessionStorage.setItem ('usuarioCorrente', JSON.stringify (usuarioCorrente));
        window.location = LOGIN_URL;
    }
    initLoginApp();
}