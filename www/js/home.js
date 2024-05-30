const SPREADSHEET_ID = '1vn_5JYkVxWK6i3UnhuvVpg11Eb7sdbCVWRVW5ha-hCg';
const RANGE = 'Inadimplencia!A:n';
const API_KEY = 'AIzaSyB_rfYHUzFP0hF5dmQPUVxK88BoVF74HJo'; // Substitua 'YOUR_API_KEY' pela sua chave da API

document.getElementById('searchButton').addEventListener('click', () => {
  const contractNumber = (document.getElementById('contractNumber').value).padStart(6, '0');
  console.log(contractNumber);

  if (!contractNumber) {
    alert('Por favor, insira o número do contrato.');
    return;
  }
  showLoadingSpinner();
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
            hideLoadingSpinner()
            showCustomMessage("custom-message-contrato-nao-localizado")
          // Aguarda 3 segundos antes de recarregar a página
          setTimeout(function() {
            hideCustomMessage("custom-message-contrato-nao-localizado")
          }, 1500); // 3000 milissegundos = 3 segundos

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
  function redirectToPages(namePage) {
    if(namePage == "home"){
      window.location.href = "home";

    }else{
      window.location.href = "registrados";

    }

}

function displayResult(row) {
    document.getElementById('output-contrato').textContent = row[0];
    document.getElementById('output-cliente').textContent = row[12];
    document.getElementById('output-nome').textContent = row[4];
    document.getElementById('output-endereco').textContent = row[7];
    document.getElementById('output-bairro').textContent = row[10];
    document.getElementById('output-telefone').textContent = row[13];
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
    hideLoadingSpinner();
 
}
function displayResultsMotoboy(container, data) {
  container.innerHTML = ''; // Clear previous results
  data.forEach(item => {
      const row = document.createElement('div');
      row.className = 'result-row';

      const contractDiv = document.createElement('div');
      contractDiv.className = 'result-item';
      contractDiv.innerHTML = `<span>Contrato:</span> ${item[0]}`;

      const nameDiv = document.createElement('div');
      nameDiv.className = 'result-item result-item-name';
      nameDiv.innerHTML = `<span>Nome:</span> ${item[2]}`;

      const dateDiv = document.createElement('div');
      dateDiv.className = 'result-item';
      dateDiv.innerHTML = `<span>Data de Ativação:</span> ${item[7]}`;

      row.appendChild(contractDiv);
      row.appendChild(nameDiv);
      row.appendChild(dateDiv);

      // Adicionar evento de clique a cada linha
      row.addEventListener('click', () => showPopup(item));

      container.appendChild(row);
  });
}
function showPopup(data) {
  const popup = document.getElementById('popup-dados-registro');
  const popupContent = document.getElementById('popup-content');

  popupContent.innerHTML = `
      <div><strong>Contrato:</strong> ${data[0]}</div>
      <div><strong>Nome:</strong> ${data[2]}</div>
      <div><strong>Endereço:</strong> ${data[3]}</div>
      <div><strong>Bairro:</strong> ${data[4]}</div>
      <div><strong>Telefone:</strong> ${data[5]}</div>
      <div><strong>Identificação:</strong> ${data[6]}</div>
      <div><strong>Data de Ativação:</strong> ${data[7]}</div>
      <div><strong>Parcelas em Atraso:</strong> ${data[8]}</div>
      <div><strong>Débito:</strong> ${data[9]}</div>
      <div><strong>Motoboy:</strong> ${data[10]}</div>
      <div><strong>Observações:</strong> ${data[11]}</div>
  `;

  popup.style.display = 'block';
  console.log(data);
}

function closePopup() {
  const popup = document.getElementById('popup-dados-registro');
  popup.style.display = 'none';
}
function getCurrentDate() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
  const yyyy = today.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
}
// Função para atualizar o input de data
function atualizarDataInput() {
  // Obter o elemento de input de data
  const dataInput = document.getElementById('dataInput');
  // Criar um objeto de data para a data atual
  const dataAtual = new Date();
  // Formatar a data atual no formato YYYY-MM-DD
  const ano = dataAtual.getFullYear();
  const mes = String(dataAtual.getMonth() + 1).padStart(2, '0'); // Adiciona um zero à esquerda se for necessário
  const dia = String(dataAtual.getDate()).padStart(2, '0'); // Adiciona um zero à esquerda se for necessário
  const dataFormatada = `${ano}-${mes}-${dia}`;

  // Definir o valor do input de data como a data formatada
  dataInput.value = dataFormatada;
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
  showLoadingSpinner();
  const selectedCards = document.querySelectorAll('.card.selected');
  let selectedDescriptions = '';
  let i = 1;
  selectedCards.forEach(card => {
      selectedDescriptions += `Proposta ${i}: `+ card.dataset.descricao + '\n';
      i++;
  });
  console.log(selectedDescriptions);

    var dados = {
        values:
            [
              getCurrentDate(),
              document.getElementById('output-contrato').textContent.trim(),
              document.getElementById('output-cliente').textContent.trim(),
              document.getElementById('output-nome').textContent.trim(),
              document.getElementById('output-endereco').textContent.trim(),
              document.getElementById('output-bairro').textContent.trim(),
              document.getElementById('output-telefone').textContent.trim(),
              document.getElementById('output-forma-de-pagamento').textContent.trim(),
              document.getElementById('output-data-ativacao').textContent.trim(),
              document.getElementById('output-total-parcelas').textContent.trim(),
              document.getElementById('output-total-debito').textContent.trim(),
              document.getElementById('output-username').textContent.trim(),
            "Cobrança feita pelo Motoboy " + document.getElementById('output-username').textContent.trim() +
             '\n' +  "Cliente ficou de ir em Loja ou retornar para a Central"+ '\n' +"Negociação feita:" + '\n' + selectedDescriptions
             + '\n' + '\n' + "OBS: Considerar apenas uma proposta de negociação"  + '\n' +  "Wendson"

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
        // Exibe a mensagem personalizada
        hideLoadingSpinner()
        showCustomMessage("custom-message");

        // Aguarda 3 segundos antes de recarregar a página
        setTimeout(function() {
            window.location.reload();
        }, 1500); // 3000 milissegundos = 3 segundos


        return data;

        
    } catch (error) {
        console.error('Erro ao adicionar nova linha:', error.message);
        throw error;
    }
    
}
// Função para mostrar o spinner de carregamento
function showLoadingSpinner() {
  document.getElementById('loading-spinner').style.display = 'block';
}

// Função para ocultar o spinner de carregamento
function hideLoadingSpinner() {
  document.getElementById('loading-spinner').style.display = 'none';
}
// Exibe a caixa de mensagem personalizada
function showCustomMessage(id) {
  document.getElementById(id).style.display = 'block';
}
function hideCustomMessage(id) {
  document.getElementById(id).style.display = 'none';
}


/** Fecha a caixa de mensagem personalizada
document.getElementById('close-button').addEventListener('click', function() {
  document.getElementById('custom-message').style.display = 'none';
});*/ 


function obterDescontos(parcelas, ano) {
    if (propostasDescontos[parcelas] && propostasDescontos[parcelas][ano]) {
        return propostasDescontos[parcelas][ano];
    }
    return [];
}
const propostasDescontos = {
    2: {
        1: [{ desconto: "Parcelamento em 2 Vezes", descricao: 'Ofertado parcelamento em 2 vezes' },
        { desconto: "5% de Desconto", descricao: 'Ofertado desconto de 5%' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
        ],
        2: [{ desconto: "Parcelamento em 2 Vezes", descricao: 'Ofertado parcelamento em 2 vezes' },
        { desconto: "10% de Desconto", descricao: 'Ofertado desconto de 10%' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
        ],
        3: [{ desconto: "Parcelamento em 4 Vezes", descricao: 'Ofertado parcelamento em 4 vezes' },
        { desconto: "15% de Desconto", descricao: 'Ofertado desconto de 15%' },
        { desconto: "5% de Desconto com Parcelamento em 2 Vezes", descricao: 'Ofertado desconto de 5% mais parcelamento em 2 vezes' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
        ],
        4: [{ desconto: "Parcelamento em 4 Vezes", descricao: 'Ofertado parcelamento em 4 vezes' },
        { desconto: "20% de Desconto", descricao: 'Ofertado desconto de 20%' },
        { desconto: "5% de Desconto com Parcelamento em 2 Vezes", descricao: 'Ofertado desconto de 5% mais parcelamento em 2 vezes' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
        ]
    },
    3: {
        1: [{ desconto: "Parcelamento em 3 Vezes", descricao: 'Ofertado parcelamento em 3 vezes' },
        { desconto: "5% de Desconto", descricao: 'Ofertado desconto de 5%' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
        ],
        2: [{ desconto: "Parcelamento em 3 Vezes", descricao: 'Ofertado parcelamento em 3 vezes' },
        { desconto: "15% de Desconto", descricao: 'Ofertado desconto de 15%' },
        { desconto: "5% de Desconto com Parcelamento em 2 Vezes", descricao: 'Ofertado desconto de 5% mais parcelameno em 2 vezes' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
        ],
        3: [{ desconto: "Parcelamento em 6 Vezes", descricao: 'Ofertado parcelamento em 6 vezes' },
        { desconto: "20% de Desconto", descricao: 'Ofertado desconto de 20%' },
        { desconto: "5% de Desconto com Parcelamento em 3 Vezes", descricao: 'Ofertado desconto de 5% mais parcelamento em 3 vezes' },
        { desconto: "Isenção de 1 parcela", descricao: 'Ofertado isenção de 1 parcela' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
        ],
        4: [{ desconto: "Parcelamento em 6 Vezes", descricao: 'Ofertado parcelamento em 6 vezes' },
        { desconto: "25% de Desconto", descricao: 'Ofertado desconto de 25%' },
        { desconto: "5% de Desconto com Parcelamento em 3 Vezes", descricao: 'Ofertado desconto de 5% mais parcelamento em 3 vezes' },
        { desconto: "Isenção de 1 parcela", descricao: 'Ofertado isenção de 1 parcela' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
        ]
    },
    4: {
        1: [{ desconto: "Parcelamento em 4 Vezes", descricao: 'Ofertado parcelamento em 4 vezes' },
        { desconto: "5% de Desconto", descricao: 'Ofertado desconto de 5%' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
        ],
        2: [{ desconto: "Parcelamento em 4 Vezes", descricao: 'Ofertado parcelamento em 4 vezes' },
        { desconto: "20% de Desconto", descricao: 'Ofertado desconto de 20%' },
        { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'Ofertado desconto de 5% mais parcelameno em 4 vezes' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
        ],
        3: [{ desconto: "Parcelamento em 8 Vezes", descricao: 'Ofertado parcelamento em 8 vezes' },
        { desconto: "25% de Desconto", descricao: 'Ofertado desconto de 25%' },
        { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'Ofertado desconto de 5% mais parcelamento em 4 vezes' },
        { desconto: "Isenção de 2 parcelas", descricao: 'Ofertado isenção de 2 parcelas' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
        ],
        4: [{ desconto: "Parcelamento em 8 Vezes", descricao: 'Ofertado parcelamento em 8 vezes' },
        { desconto: "30% de Desconto", descricao: 'Ofertado desconto de 30%' },
        { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'Ofertado desconto de 5% mais parcelamento em 4 vezes' },
        { desconto: "Isenção de 3 parcelas", descricao: 'Ofertado isenção de 3 parcelas' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
        ]
    },
    5: {
      1: [{ desconto: "Parcelamento em 5 Vezes", descricao: 'Ofertado parcelamento em 5 vezes' },
        { desconto: "5% de Desconto", descricao: 'Ofertado desconto de 5%' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
        ],
        2: [{ desconto: "Parcelamento em 5 Vezes", descricao: 'Ofertado parcelamento em 4 vezes' },
        { desconto: "20% de Desconto", descricao: 'Ofertado desconto de 20%' },
        { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'Ofertado desconto de 5% mais parcelameno em 4 vezes' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
        ],
        3: [{ desconto: "Parcelamento em 8 Vezes", descricao: 'Ofertado parcelamento em 8 vezes' },
        { desconto: "25% de Desconto", descricao: 'Ofertado desconto de 25%' },
        { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'Ofertado desconto de 5% mais parcelamento em 4 vezes' },
        { desconto: "Isenção de 2 parcelas", descricao: 'Ofertado isenção de 2 parcelas' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
        ],
        4: [{ desconto: "Parcelamento em 8 Vezes", descricao: 'Ofertado parcelamento em 8 vezes' },
        { desconto: "30% de Desconto", descricao: 'Ofertado desconto de 30%' },
        { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'Ofertado desconto de 5% mais parcelamento em 4 vezes' },
        { desconto: "Isenção de 3 parcelas", descricao: 'Ofertado isenção de 3 parcelas' },
        { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
        ]
    },
    6: {
      1: [{ desconto: "Parcelamento na Nº de Parcelas em Aberto", descricao: 'Ofertado parcelamento no número de parcelas em aberto' },
      { desconto: "5% de Desconto", descricao: 'Ofertado desconto de 5%' },
      { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
      ],
      2: [{ desconto: "Parcelamento em 5 Vezes", descricao: 'Ofertado parcelamento em 4 vezes' },
      { desconto: "20% de Desconto", descricao: 'Ofertado desconto de 20%' },
      { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'Ofertado desconto de 5% mais parcelameno em 4 vezes' },
      { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
      ],
      3: [{ desconto: "Parcelamento em 8 Vezes", descricao: 'Ofertado parcelamento em 8 vezes' },
      { desconto: "25% de Desconto", descricao: 'Ofertado desconto de 25%' },
      { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'Ofertado desconto de 5% mais parcelamento em 4 vezes' },
      { desconto: "Isenção de 2 parcelas", descricao: 'Ofertado isenção de 2 parcelas' },
      { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
      ],
      4: [{ desconto: "Parcelamento em 8 Vezes", descricao: 'Ofertado parcelamento em 8 vezes' },
      { desconto: "30% de Desconto", descricao: 'Ofertado desconto de 30%' },
      { desconto: "5% de Desconto com Parcelamento em 4 Vezes", descricao: 'Ofertado desconto de 5% mais parcelamento em 4 vezes' },
      { desconto: "Isenção de 3 parcelas", descricao: 'Ofertado isenção de 3 parcelas' },
      { desconto: "Sem Desconto", descricao: 'Sem desconto' },
        { desconto: "Desconto não Ofertado", descricao: 'Não foi passado descontos para o cliente' },
      ]
    }
    // Adicione mais anos conforme necessário
};

function searchValueMotoBoy(spreadsheetId, range, date, callback) {
  const login= document.getElementById('output-username').textContent.trim();
  const motoboy =   login.charAt(0).toUpperCase() + login.slice(1).toLowerCase(); 

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
        let targetRows = values.filter(row => row[10] === motoboy); // Filtra pelo motoboy

        if (date) {
          // Filtra pela data, se fornecida
          targetRows = targetRows.filter(row => row[7] === date);
        }

        if (targetRows.length > 0) {
          // Registros encontrados, chama o callback com os valores
          if (callback) callback(targetRows);
        } else {
          // Nenhum registro encontrado
          console.log(`Nenhum registro para o motoboy '${motoboy}' e data '${date}' foi encontrado.`);
          hideLoadingSpinner()
          showCustomMessage("custom-message-contrato-nao-localizado")
        // Aguarda 3 segundos antes de recarregar a página
        setTimeout(function() {
          hideCustomMessage("custom-message-contrato-nao-localizado")
        }, 1500); // 3000 milissegundos = 3 segundos

        }
      } else {
        // Nenhuma linha na planilha
        console.log('Nenhuma linha na planilha.');
        alert('Nenhuma linha na planilha.');
      }
    }).catch((err) => {
      console.error('Erro: ', err.result.error.message);
      alert('Erro: ', err.result.error.message);
    });
  });
}
document.getElementById('searchButton').addEventListener('click', () => {
  const spreadsheetId = '1qANHDNI6jSHg5JX1hWzLKqW5I2Hohe792ZNOjhcDOQM';
  const range = 'A1:N100'; // Substitua pelo intervalo de células onde deseja pesquisar
  const contractNumber = (document.getElementById('contractNumberRegistrados').value).padStart(6, '0');


  if (!contractNumber) {
    alert('Por favor, insira o número do contrato.');
    return;
  }
  showLoadingSpinner();
  searchValueMotoBoyContrato(spreadsheetId, range, contractNumber, (result) => {
    console.log('Registros encontrados:', result);
    const resultContainer = document.getElementById('result-registrados');
    displayResultsMotoboy(resultContainer, result);
    hideLoadingSpinner()

});


});
function searchValueMotoBoyContrato(spreadsheetId, range, contrato, callback) {
  const login= document.getElementById('output-username').textContent.trim();
  const motoboy =   login.charAt(0).toUpperCase() + login.slice(1).toLowerCase(); 

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
        let targetRows = values.filter(row => row[10] === motoboy); // Filtra pelo motoboy

        if (contrato) {
          // Filtra pela data, se fornecida
          targetRows = targetRows.filter(row => row[0] === contrato);
        }

        if (targetRows.length > 0) {
          // Registros encontrados, chama o callback com os valores
          if (callback) callback(targetRows);
        } else {
          // Nenhum registro encontrado
          console.log(`Nenhum registro para o motoboy '${motoboy}' e data '${contrato}' foi encontrado.`);
          hideLoadingSpinner()
          showCustomMessage("custom-message-contrato-nao-localizado")
        // Aguarda 3 segundos antes de recarregar a página
        setTimeout(function() {
          hideCustomMessage("custom-message-contrato-nao-localizado")
        }, 1500); // 3000 milissegundos = 3 segundos
        }
      } else {
        // Nenhuma linha na planilha
        console.log('Nenhuma linha na planilha.');
        alert('Nenhuma linha na planilha.');
      }
    }).catch((err) => {
      console.error('Erro: ', err.result.error.message);
      alert('Erro: ', err.result.error.message);
    });
  });
}


