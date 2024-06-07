const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { getAuthSheets } = require('./auth'); // Importe a função getAuthSheets do seu arquivo de autenticação
const router = express.Router();
const registradosRouter = require('./www/js/registros');


const port = 3030;
var path = require('path');
const app = express();

var loginAdriano = "adriano";
var passwordAdriano = "1111";
var loginDurval = "durval";
var passwordDurval = "2222";
var loginOscar = "oscar";
var passwordOscar = "3333";
var loginWendson = "wendson";
var passwordWendson = "4444";
var usuario;

app.use(session({ secret: '09r78cn82b3r89x1@38xy4184' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/views'));
app.use('/', router); // Use o roteador express
app.use('/registrados', registradosRouter);



app.listen(process.env.PORT || port, () => {
    console.log('SERVIDOR RODANDO')
});
app.use(express.static(path.join(__dirname, 'www')));
app.use('/lib', express.static(path.join(__dirname, 'lib')));
app.use('/css', express.static(path.join(__dirname, 'css')));



app.post('/', (req, res) => {
    let errorMessage = ""; // Inicializa a mensagem de erro como uma string vazia

    if (req.body.password == passwordAdriano && req.body.login.toLowerCase() == loginAdriano) {
        req.session.login = loginAdriano;
        usuario = loginAdriano.charAt(0).toUpperCase() + loginAdriano.slice(1).toLowerCase(); 
        res.render('home', { login: usuario });

    } else if (req.body.password == passwordDurval && req.body.login.toLowerCase() == loginDurval) {
        req.session.login = loginDurval;
        usuario = loginDurval.charAt(0).toUpperCase() + loginDurval.slice(1).toLowerCase(); 
        res.render('home', { login: usuario });
    }
    else if (req.body.password == passwordOscar && req.body.login.toLowerCase() == loginOscar) {
        req.session.login = loginOscar;
        usuario = loginOscar.charAt(0).toUpperCase() + loginOscar.slice(1).toLowerCase(); 
        res.render('home', { login: usuario });
    } else if (req.body.password == passwordWendson && req.body.login.toLowerCase() == loginWendson) {
        req.session.login = loginWendson;
        usuario = loginWendson.charAt(0).toUpperCase() + loginWendson.slice(1).toLowerCase(); 
        res.render('controle-registros', { login: usuario });
    }
     else {
        errorMessage = "Login ou senha incorretos. Por favor, tente novamente."; // Define a mensagem de erro
        res.render('index', { errorMessage: errorMessage }); // Passa a mensagem de erro para o modelo
    }

});
app.get('/', (req, res) => {
    const errorMessage = req.query.error || ""; // Obtém a mensagem de erro da query string ou define como uma string vazia se não houver erro
    res.render('index', { errorMessage: errorMessage });
});

app.get('/', (req, res) => {
    res.render('index', { errorMessage: "" }); // Passa uma mensagem de erro vazia para o modelo
});
app.get('/', (req, res) => {
    if (req.session.login) {
        res.render('home', { login: usuario });

    } else {
        res.render('index');
    }

});

app.get('/registrados', (req, res) => {
    if (req.session.login) {
        res.render('registrados', { login: usuario });
    } else {
        res.render('index');
    }

});
app.get('/home', (req, res) => {
    res.render('home', { login: usuario });
});




app.post("/addRow", async (req, res) => {
    try {
        const { googleSheets, auth, spreadsheetId } = await getAuthSheets('1qANHDNI6jSHg5JX1hWzLKqW5I2Hohe792ZNOjhcDOQM');

        const values = req.body; // Receba os valores diretamente do corpo da solicitação

        if (!values) {
            res.status(400).send('Valores ausentes no corpo da solicitação');
            return;
        }
        console.log('Recebendo valores:', values);

        const row = await googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: "Consolidado",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [values], // Certifique-se de que os dados estão no formato esperado
            },
        });

        console.log('Nova linha adicionada:', row.data);

        res.send(row.data);
    } catch (error) {
        console.error('Erro ao adicionar nova linha:', error.message);
        res.status(500).send('Erro interno do servidor');
    }
});
app.use(express.static('css', {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
        }
    }
}));
// Serve arquivos estáticos do diretório 'js'
app.use(express.static(path.join(__dirname, 'js'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.set('Content-Type', 'text/javascript');
        }
    }
}));
