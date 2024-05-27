const SPREADSHEET_ID = '1vn_5JYkVxWK6i3UnhuvVpg11Eb7sdbCVWRVW5ha-hCg';
const RANGE = 'Inadimplencia!A:M';
const API_KEY = 'AIzaSyB_rfYHUzFP0hF5dmQPUVxK88BoVF74HJo'; // Substitua 'YOUR_API_KEY' pela sua chave da API

document.getElementById('searchButton').addEventListener('click', () => {
  const contractNumber = document.getElementById('contractNumber').value;
  if (!contractNumber) {
    alert('Por favor, insira o número do contrato.');
    return;
  }

  searchValue(SPREADSHEET_ID, RANGE, contractNumber, displayResult);
});

function searchValue(spreadsheetId, range, targetValue, callback) {
    gapi.load('client', () => {
      gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
      }).then(() => {
        return gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: spreadsheetId,
          range: range,
        });
      }).then((response) => {
        const result = response.result;
        const values = result.values;
  
        if (values && values.length > 0) {
          // Implementação da busca binária
          let low = 0;
          let high = values.length - 1;
          let targetRowIndex = -1;
  
          while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            let row = values[mid][0]; // Assumindo que a primeira coluna contém os valores ordenados
  
            if (row === targetValue) {
              targetRowIndex = mid;
              break;
            } else if (row < targetValue) {
              low = mid + 1;
            } else {
              high = mid - 1;
            }
          }
  
          if (targetRowIndex !== -1) {
            // Valor encontrado, chama o callback com o valor
            const targetRow = values[targetRowIndex];
            if (callback) callback(targetRow);
          } else {
            // Valor não encontrado
            console.log(`Valor '${targetValue}' não encontrado.`);
            document.getElementById('result').innerText = `Valor '${targetValue}' não encontrado.`;
          }
        } else {
          // Nenhum valor na planilha
          console.log('Nenhum valor na planilha.');
          document.getElementById('result').innerText = 'Nenhum valor na planilha.';
        }
      }, (err) => {
        console.error('Error: ', err.result.error.message);
        document.getElementById('result').innerText = 'Erro ao buscar o contrato.';
      });
    });
  }
  
  function updateValues(spreadsheetId, range, valueInputOption, _values, callback) {
    let values = [
      [
        // Cell values ...
      ],
      // Additional rows ...
    ];
    values = _values;
    const body = {
      values: values,
    };

    
    try {
      gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: valueInputOption,
        resource: body,
      }).then((response) => {
        const result = response.result;
        console.log(`${result.updatedCells} cells updated.`);
        if (callback) callback(response);
      });
    } catch (err) {
      document.getElementById('content').innerText = err.message;
      return;
    }
  }
function displayResult(row) {
    document.getElementById('output-contrato').textContent = row[0];
    document.getElementById('output-nome').textContent = row[4];
    document.getElementById('output-endereco').textContent = row[7];
    document.getElementById('output-bairro').textContent = row[10];
    document.getElementById('output-forma-de-pagamento').textContent = row[1];
    document.getElementById('output-data-ativacao').textContent = row[11];
    document.getElementById('output-total-parcelas').textContent = row[2];
    document.getElementById('output-total-debito').textContent = row[6];



  document.getElementById('input-contrato').value = row[0];
  document.getElementById('input-nome').value = row[4];
  document.getElementById('input-data-ativacao').value = row[3];
  document.getElementById('input-forma-de-pagamento').value= row[1];
  document.getElementById('input-total-parcelas').value = row[2];
  document.getElementById('input-total-debito').value = row[6];


  
}



async function enviarDados() {
    var dados = {
        values:
            [
            document.getElementById('input-contrato').value,
            document.getElementById('input-nome').value,
            document.getElementById('input-data-ativacao').value,
            document.getElementById('input-forma-de-pagamento').value,
            document.getElementById('input-total-parcelas').value,
            document.getElementById('input-total-debito').value
            ]
    };
    try {
        console.log('Enviando solicitação para adicionar nova linha:', JSON.stringify(dados));

        const response = await fetch('/addRow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        if (!response.ok) {
            throw new Error('Erro ao adicionar nova linha: ' + response.statusText);
        }

        const data = await response.json();
        console.log('Nova linha adicionada:', data);
        return data;
    } catch (error) {
        console.error('Erro ao adicionar nova linha:', error.message);
        throw error;
    }
}
