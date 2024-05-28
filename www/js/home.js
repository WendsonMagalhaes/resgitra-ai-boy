const SPREADSHEET_ID = '1vn_5JYkVxWK6i3UnhuvVpg11Eb7sdbCVWRVW5ha-hCg';
const RANGE = 'Inadimplencia!A:M';
const API_KEY = 'AIzaSyB_rfYHUzFP0hF5dmQPUVxK88BoVF74HJo'; // Substitua 'YOUR_API_KEY' pela sua chave da API

document.getElementById('searchButton').addEventListener('click', () => {
  const contractNumber = (document.getElementById('contractNumber').value).padStart(6, '0');
  console.log(contractNumber);

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
            console.log(`Contrato '${targetValue}' não encontrado.`);
            alert(`Contrato'${targetValue}' não encontrado.`);

          }
        } else {
          // Nenhum valor na planilha
          console.log('Nenhum valor na planilha.');
          alert('Nenhum valor na planilha.');

        }
      }, (err) => {
        console.error('Error: ', err.result.error.message);
        alert('Error: ', err.result.error.message);

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

    var anoContrato = parseInt(calcularAno(row[11]));
    if(anoContrato >= 4){
        anoContrato = 4;
    }
    var parcelas = parseInt(row[2]);
    if(parcelas >= 6){
        parcelas = 6;
    }
    const descontos = obterDescontos(parcelas,anoContrato);

    const cardsContainer = document.getElementById('cards-container');
    cardsContainer.innerHTML = '';  // Limpa os cartões anteriores

    descontos.forEach(({ desconto, descricao }) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.textContent = `${desconto}`;
        card.dataset.descricao = descricao; // Alteração aqui para armazenar a descrição no dataset
        card.addEventListener('click', () => {
            console.log(descricao); // Alteração aqui para imprimir a descrição ao clicar
            card.classList.toggle('selected');
        });
        cardsContainer.appendChild(card);
    });

 
}

function calcularAno(data_ativacao) {
    var partes = data_ativacao.split('/');
    var dia = parseInt(partes[0], 10);
    var mes = parseInt(partes[1], 10) - 1; // Mês é zero-based
    var ano = parseInt(partes[2], 10);
    var dataAtivacao = new Date(ano, mes, dia);

    var dataAtual = new Date();
    var ano_de_contrato = dataAtual.getFullYear() - dataAtivacao.getFullYear();
    var mesAtual = dataAtual.getMonth();
    var diaAtual = dataAtual.getDate();

    // Ajustar a idade se o aniversário ainda não aconteceu no ano atual
    if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
        ano_de_contrato--;
    }
    return ano_de_contrato;
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
function obterDescontos(parcelas, ano) {
    if (propostasDescontos[parcelas] && propostasDescontos[parcelas][ano]) {
        return propostasDescontos[parcelas][ano];
    }
    return [];
}
const propostasDescontos = {
    2: {
        1: [{ desconto: "Parcelamento em 2 Vezes", descricao: 'ofertado parcelamento em 2 vezes' },
        { desconto: "5% de Desconto", descricao: 'ofertado desconto de 5%' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
        ],
        2: [{ desconto: "Parcelamento em 2 Vezes", descricao: 'ofertado parcelamento em 2 vezes' },
        { desconto: "10% de Desconto", descricao: 'ofertado desconto de 10%' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
        ],
        3: [{ desconto: "Parcelamento em 4 Vezes", descricao: 'ofertado parcelamento em 4 vezes' },
        { desconto: "15% de Desconto", descricao: 'ofertado desconto de 15%' },
        { desconto: "5% de Desconto com Parcelamento em 2 Vezes", descricao: 'ofertado desconto de 5% mais parcelamento em 2 vezes' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
        ],
        4: [{ desconto: "Parcelamento em 4 Vezes", descricao: 'ofertado parcelamento em 4 vezes' },
        { desconto: "20% de Desconto", descricao: 'ofertado desconto de 20%' },
        { desconto: "5% de Desconto com Parcelamento em 2 Vezes", descricao: 'ofertado desconto de 5% mais parcelamento em 2 vezes' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
        ]
    },
    3: {
        1: [{ desconto: "Parcelamento em 3 Vezes", descricao: 'ofertado parcelamento em 3 vezes' },
        { desconto: "5% de Desconto", descricao: 'ofertado desconto de 5%' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
        ],
        2: [{ desconto: "Parcelamento em 3 Vezes", descricao: 'ofertado parcelamento em 3 vezes' },
        { desconto: "15% de Desconto", descricao: 'ofertado desconto de 15%' },
        { desconto: "5% de Desconto com Parcelamento em 2 Vezes", descricao: 'ofertado desconto de 5% mais parcelameno em 2 vezes' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
        ],
        3: [{ desconto: "Parcelamento em 6 Vezes", descricao: 'ofertado parcelamento em 6 vezes' },
        { desconto: "20% de Desconto", descricao: 'ofertado desconto de 20%' },
        { desconto: "5% de Desconto com Parcelamento em 3 Vezes", descricao: 'ofertado desconto de 5% mais parcelamento em 3 vezes' },
        { desconto: "Isenção de 1 parcela", descricao: 'ofertado isenção de 1 parcela' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
        ],
        4: [{ desconto: "Parcelamento em 6 Vezes", descricao: 'ofertado parcelamento em 6 vezes' },
        { desconto: "25% de Desconto", descricao: 'ofertado desconto de 25%' },
        { desconto: "5% de Desconto com Parcelamento em 3 Vezes", descricao: 'ofertado desconto de 5% mais parcelamento em 3 vezes' },
        { desconto: "Isenção de 1 parcela", descricao: 'ofertado isenção de 1 parcela' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
        ]
    },
    4: {
        1: [{ desconto: "Parcelamento em 4 Vezes", descricao: 'ofertado parcelamento em 4 vezes' },
        { desconto: "5% de Desconto", descricao: 'ofertado desconto de 5%' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
        ],
        2: [{ desconto: "Parcelamento em 4 Vezes", descricao: 'ofertado parcelamento em 4 vezes' },
        { desconto: "20% de Desconto", descricao: 'ofertado desconto de 20%' },
        { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'ofertado desconto de 5% mais parcelameno em 4 vezes' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
        ],
        3: [{ desconto: "Parcelamento em 8 Vezes", descricao: 'ofertado parcelamento em 8 vezes' },
        { desconto: "25% de Desconto", descricao: 'ofertado desconto de 25%' },
        { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'ofertado desconto de 5% mais parcelamento em 4 vezes' },
        { desconto: "Isenção de 2 parcelas", descricao: 'ofertado isenção de 2 parcelas' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
        ],
        4: [{ desconto: "Parcelamento em 8 Vezes", descricao: 'ofertado parcelamento em 8 vezes' },
        { desconto: "30% de Desconto", descricao: 'ofertado desconto de 30%' },
        { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'ofertado desconto de 5% mais parcelamento em 4 vezes' },
        { desconto: "Isenção de 3 parcelas", descricao: 'ofertado isenção de 3 parcelas' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
        ]
    },
    5: {
      1: [{ desconto: "Parcelamento em 5 Vezes", descricao: 'ofertado parcelamento em 5 vezes' },
        { desconto: "5% de Desconto", descricao: 'ofertado desconto de 5%' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
        ],
        2: [{ desconto: "Parcelamento em 5 Vezes", descricao: 'ofertado parcelamento em 4 vezes' },
        { desconto: "20% de Desconto", descricao: 'ofertado desconto de 20%' },
        { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'ofertado desconto de 5% mais parcelameno em 4 vezes' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
        ],
        3: [{ desconto: "Parcelamento em 8 Vezes", descricao: 'ofertado parcelamento em 8 vezes' },
        { desconto: "25% de Desconto", descricao: 'ofertado desconto de 25%' },
        { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'ofertado desconto de 5% mais parcelamento em 4 vezes' },
        { desconto: "Isenção de 2 parcelas", descricao: 'ofertado isenção de 2 parcelas' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
        ],
        4: [{ desconto: "Parcelamento em 8 Vezes", descricao: 'ofertado parcelamento em 8 vezes' },
        { desconto: "30% de Desconto", descricao: 'ofertado desconto de 30%' },
        { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'ofertado desconto de 5% mais parcelamento em 4 vezes' },
        { desconto: "Isenção de 3 parcelas", descricao: 'ofertado isenção de 3 parcelas' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
        ]
    },
    6: {
      1: [{ desconto: "Parcelamento na Nº de Parcelas em Aberto", descricao: 'ofertado parcelamento no número de parcelas em aberto' },
      { desconto: "5% de Desconto", descricao: 'ofertado desconto de 5%' },
      { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
      ],
      2: [{ desconto: "Parcelamento em 5 Vezes", descricao: 'ofertado parcelamento em 4 vezes' },
      { desconto: "20% de Desconto", descricao: 'ofertado desconto de 20%' },
      { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'ofertado desconto de 5% mais parcelameno em 4 vezes' },
      { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
      ],
      3: [{ desconto: "Parcelamento em 8 Vezes", descricao: 'ofertado parcelamento em 8 vezes' },
      { desconto: "25% de Desconto", descricao: 'ofertado desconto de 25%' },
      { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'ofertado desconto de 5% mais parcelamento em 4 vezes' },
      { desconto: "Isenção de 2 parcelas", descricao: 'ofertado isenção de 2 parcelas' },
      { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
      ],
      4: [{ desconto: "Parcelamento em 8 Vezes", descricao: 'ofertado parcelamento em 8 vezes' },
      { desconto: "30% de Desconto", descricao: 'ofertado desconto de 30%' },
      { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'ofertado desconto de 5% mais parcelamento em 4 vezes' },
      { desconto: "Isenção de 3 parcelas", descricao: 'ofertado isenção de 3 parcelas' },
      { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'não foi passado descontos para o cliente' },
      ]
    }
    // Adicione mais anos conforme necessário
};
