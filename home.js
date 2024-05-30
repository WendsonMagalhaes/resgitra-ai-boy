// routes.js
const express = require('express');
const { getAuthSheets } = require('./auth'); // Importe a função getAuthSheets do seu arquivo de autenticação

const router = express.Router();

router.get('/metadata', async (req, res) => {
  try {
    const { googleSheets, auth, spreadsheetId } = await getAuthSheets('1xjlkqRENrP1Hphs3W9Gb8Pi6kHriaSX05V6LbdLlxmM');

    const metadata = await googleSheets.spreadsheets.get({
      auth,
      spreadsheetId,
    });

    console.log('Metadata:', metadata.data);

    res.send(metadata.data);
  } catch (error) {
    console.error('Erro ao obter metadata:', error.message);
    res.status(500).send('Erro interno do servidor');
  }
});

router.get('/getRows', async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets('1xjlkqRENrP1Hphs3W9Gb8Pi6kHriaSX05V6LbdLlxmM');

  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: 'Página1',
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  });

  console.log('Metadata:', getRows.data);

  res.send(getRows.data);
});


router.post("/addRow", async (req, res) => {
  try {
    const { googleSheets, auth, spreadsheetId } = await getAuthSheets('1xjlkqRENrP1Hphs3W9Gb8Pi6kHriaSX05V6LbdLlxmM');
    const { values } = req.body;

    if (!values) {
      res.status(400).send('Valores ausentes no corpo da solicitação');
      return;
    }

    const row = await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "Página1",
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
router.post("/addRowBoasVindas", async (req, res) => {
  try {
    const { googleSheets, auth, spreadsheetId } = await getAuthSheets('1osm3T9FFHEQ99cXukShAfITcTX7kntUcrsXf3Zu5xjw');
    const { values } = req.body;

    if (!values) {
      res.status(400).send('Valores ausentes no corpo da solicitação');
      return;
    }

    const row = await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "Página1",
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

router.post("/addRowRecibosPP", async (req, res) => {
  try {
    const { googleSheets, auth, spreadsheetId } = await getAuthSheets('1PMFvaWKZLqu8e_OJfb3lon93wilTXfIKtey1P9M6fNk');
    const { values } = req.body;

    if (!values) {
      res.status(400).send('Valores ausentes no corpo da solicitação');
      return;
    }

    const row = await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "Página1",
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

router.post('/updateValue', async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets('1xjlkqRENrP1Hphs3W9Gb8Pi6kHriaSX05V6LbdLlxmM');

  const { values } = req.body;

  const updateValue = await googleSheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Página1!A2:C2',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values,
    },
  });

  res.send(updateValue.data);
});


module.exports = router;
