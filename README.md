# 🚖 Shopper Driver - Api

**Shopper Driver** é uma aplicação que conecta motoristas a clientes que necessitam de transporte para suas compras ou entregas. A API REST desenvolvida com Node.js e TypeScript permite que os usuários solicitem viagens, calculem rotas, escolham motoristas disponíveis, confirmem viagens e acesso o histórico de viagens de forma eficiente.

---

## 📝 Descrição do Projeto
Esta aplicação backend permite que os clientes:

Solicitem uma estimativa de valor de viagem.
Confirmem uma viagem com um motorista escolhido.
Consultem o histórico de viagens realizadas.
A API se comunica com o Google Maps para calcular rotas e fornecer estimativas de tempo e distância.

---

## 🛠️ Tecnologias Utilizadas
* **Node.js**: Ambiente de execução do JavaScript no backend.
* **TypeScript**: Superset do JavaScript para tipagem estática e mais segurança.
* **Express**: Framework minimalista para a construção de APIs REST.
* **Axios**: Cliente HTTP para fazer chamadas à API do Google Maps.
* **Docker**: Containerização da aplicação para facilitar a execução em qualquer ambiente.
* **Docker Compose**: Ferramenta para definir e gerenciar multi-contêineres Docker.

---

## 🚩 Pré-requisitos
Antes de rodar o projeto, certifique-se de ter o seguinte instalado na sua máquina:

**Node.js** (v20.11.0 ou superior)
**Docker** e **Docker Compose**
**Git** (para versionamento)

---

## 📦  Dependências

Este projeto usa as seguintes dependências:

### Dependências de produção:
- **axios**: Cliente HTTP para fazer requisições a APIs externas.
- **body-parser**: Middleware para analisar corpos de requisições.
- **cors**: Middleware para habilitar o CORS (Cross-Origin Resource Sharing).
- **dotenv**: Carregar variáveis de ambiente a partir de um arquivo `.env`.
- **express**: Framework web para construir a API.
- **sqlite**: Biblioteca SQLite para interação com o banco de dados.
- **sqlite3**: Driver para SQLite3.

### Dependências de desenvolvimento:
- **@types/cors**: Tipos TypeScript para a biblioteca CORS.
- **@types/express**: Tipos TypeScript para o Express.
- **@types/jest**: Tipos TypeScript para Jest (testes).
- **@types/node**: Tipos TypeScript para Node.js.
- **@types/sqlite3**: Tipos TypeScript para SQLite3.
- **@types/supertest**: Tipos TypeScript para Supertest (testes HTTP).
- **jest**: Framework de testes.
- **nodemon**: Ferramenta para reiniciar automaticamente o servidor durante o desenvolvimento.
- **supertest**: Biblioteca para testar APIs HTTP.
- **ts-jest**: Integração do Jest com TypeScript.
- **ts-node**: Executar TypeScript diretamente.
- **typescript**: Compilador TypeScript.

---

## 💻 Como Rodar o Projeto

1. Instale as Dependências
Clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-usuario/shopper-driver-backend.git
cd shopper-driver-backend

```
2. Instale as Dependências

```bash
npm install

```

3. Configuração do Ambiente
- Registre-se na Google Cloud Platform.
- Crie um novo projeto e habilite a API do Google Maps.
- Gere uma chave de API e configure-a no backend da aplicação.
- Crie um arquivo `.env` na raiz do projeto e adicione a chave da API do Google Maps

```bash
GOOGLE_API_KEY = Sua chave de API do Google Maps.
```
4. Docker
Para rodar a aplicação com Docker, execute:

```bash
docker-compose up
```

Isso irá subir a aplicação e os serviços necessários, expondo o backend na porta 8080.

5. Rodando o Servidor Localmente
Se preferir rodar localmente, use:

```bash
npm run dev
```

O servidor estará disponível em http://localhost:8080.

---

## 🚀 Funcionalidades
1. Estimativa de Viagem
##### **API Endpoint:** `POST /ride/estimate`
Este endpoint permite que o cliente calcule a distância e o tempo estimado entre o ponto de origem e o destino, além de calcular as opções de motoristas disponíveis com base na quilometragem mínima e no valor da viagem.

**Exemplo de requisição:**
* **Corpo da Requisição**:
  - `customer_id`: ID do cliente.
  - `origin`: Endereço de origem.
  - `destination`: Endereço de destino.

```json
{
  "customer_id": "12345",
  "origin": "Rua A, 123",
  "destination": "Rua B, 456"
}
```
**Exemplo de resposta:**

```json
{
  "latitude_origin": -23.55052,
  "longitude_origin": -46.633308,
  "latitude_destination": -23.561662,
  "longitude_destination": -46.625288,
  "distance": "5 km",
  "duration": "15 min",
  "drivers_available": [
    {
      "id": 1,
      "name": "João Silva",
      "description": "Motorista experiente",
      "vehicle": "Carro Compacto",
      "rating": "4.8",
      "value": 35.00
    },
    {
      "id": 2,
      "name": "Maria Oliveira",
      "description": "Motorista com SUV",
      "vehicle": "SUV",
      "rating": "4.9",
      "value": 40.00
    }
  ],
  "route_response": { "google_maps_data": "response" }
}
```
2. Confirmação de Viagem
##### **API Endpoint:** `PATCH /ride/confirm`
Após a estimativa, o cliente pode confirmar a viagem escolhendo um motorista disponível e fornecendo as informações necessárias, como distância, duração e valor.

**Exemplo de requisição**:
* **Corpo da Requisição**:
  - `customer_id`: ID do cliente.
  - `origin`: Endereço de origem.
  - `destination`: Endereço de destino.
  - `driver`: Objeto contendo informações do motorista (ID, nome).
  - `distance`: Distância estimada.
  - `duration`: Duração estimada.
  - `value`: Valor calculado da viagem.

```json
{
  "customer_id": "12345",
  "origin": "Rua A, 123",
  "destination": "Rua B, 456",
  "driver": {
    "id": 1,
    "name": "João"
  },
  "distance": 10.5,
  "duration": "15 mins",
  "value": 35.00
}
```
**Exemplo de resposta**:

```json
{
  "status": "OK"
}
```
3. Histórico de Viagens
#####  **API Endpoint:** `GET /ride/{customer_id}?driver_id={id}`

Este endpoint permite listar as viagens realizadas por um determinado cliente, podendo filtrar por motorista.

**Exemplo de requisição:**
 * **Parâmetros de URL**:
  - `customer_id`: ID do cliente.

```json
{
  "customer_id": "12345",
  "driver_id": "1"
}
```
**Exemplo de resposta:**

```json

[
  {
    "id": 1,
    "customer_id": "12345",
    "driver_id": "1",
    "origin": "Rua A, 123",
    "destination": "Rua B, 456",
    "distance": "5 km",
    "duration": "15 min",
    "value": 35.00,
    "date": "2024-11-25T10:00:00Z"
  }
]
```

## 🗂️ Estrutura do Projeto
```bash
src/
├── controllers/        # Controladores que gerenciam a lógica de cada endpoint
├── services/           # Serviços para integração com APIs externas (como o Google Maps)
├── models/             # Modelos de dados e entidades (Ex: Viagem, Motorista)
├── utils/              # Funções auxiliares
├── routes/             # Arquivos que definem as rotas da API
├── config/             # Arquivos de configuração (como variáveis de ambiente)
├── app.ts              # Arquivo principal de inicialização da aplicação
└── server.ts           # Configuração do servidor HTTP
```

---

## 🧪 Como Rodar os Testes

Testes unitários são fundamentais para garantir a qualidade do código. Para rodar os testes, execute:

```bash
npm run test
```
