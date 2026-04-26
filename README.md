# 🛡️ API Gateway Rate Limiter

Este projeto é um **API Gateway** robusto com um sistema de **Rate Limiting** de alta performance, projetado para proteger serviços downstream contra abusos e sobrecarga.

## 📝 Descrição

O sistema atua como um intermediário que valida cada requisição recebida com base no endereço IP do cliente ou em uma Chave de API (API Key). Ele utiliza uma combinação de cache em memória e persistência em banco de dados para garantir que os limites de taxa sejam aplicados de forma justa, rápida e precisa.

## ⚙️ Método de Funcionamento

O limitador utiliza o algoritmo de **Janela Fixa (Fixed Window)** com as seguintes camadas de otimização:

1.  **🔍 Identificação**: Extrai o identificador do cliente via header `Authorization` (API Key) ou endereço IP.
2.  **⚡ Cache de Resposta Rápida**: Consulta o `node-cache` (em memória) para verificar se o cliente já excedeu o limite. Se sim, bloqueia instantaneamente sem acessar o banco de dados.
3.  **⚛️ Operação Atômica (UPSERT)**: Caso não esteja no cache ou o limite não tenha sido atingido, executa uma operação SQL única (`INSERT ... ON CONFLICT`) que incrementa o contador de forma atômica no SQLite, evitando condições de corrida.
4.  **💾 Persistência Segura**: O estado é mantido no SQLite, permitindo que os limites persistam mesmo após reinicializações do servidor.
5.  **🧹 Worker de Limpeza**: Um serviço em segundo plano roda a cada 60 minutos para remover registros de janelas de tempo expiradas, mantendo o banco de dados leve.

## 🚀 Tecnologias Empregadas

-   **Node.js & TypeScript**: Core do sistema com tipagem forte e alta performance.
-   **Express**: Framework web para gerenciamento de rotas e middlewares.
-   **SQLite3**: Banco de dados leve e relacional para persistência dos contadores.
-   **node-cache**: Camada de cache em memória para acesso de baixa latência.
-   **k6**: Utilizado para testes de carga e validação de concorrência.

## 🛠️ Instruções para Rodar o Projeto

Como trata-se de uma API Gateway, construida de modo a proteger uma outra API, para testar a aplicação de localmente de forma que ela repasse requisições para outra aplicação, é necessário ter duas APIs rodando, uma sendo a API Gateway e a outra sendo a API protegida. Você pode ter outra APi rodando na porta 3001 por exemplo, e adicionar a rota desta API no arquivo server.ts, para que esta API consiga reconhecer a sua API local.

1.  **Instalação de dependências**:
    ```bash
    npm install
    ```

2.  **Execução em modo de desenvolvimento**:
    ```bash
    npm run dev
    ```

3.  **Execução do teste de carga (Opcional - Requer k6)**:
    ```bash
    k6 run tests/load-test.js
    ```

4.  **Execução do teste de cache/funcional**:
    ```bash
    node tests/test-cache.js
    ```

O servidor estará disponível em `http://localhost:3000`.

## 💡 Sugestão de Melhorias

-   **🌐 Cache Distribuído**: Migrar o `node-cache` para **Redis** para suportar múltiplos nós do Gateway.
-   **📈 Algoritmos Avançados**: Implementar *Token Bucket* ou *Leaky Bucket* para um controle de tráfego mais suave.
-   **🔐 Autenticação Integrada**: Validar as API Keys contra uma tabela de usuários/clientes reais.
-   **📊 Dashboard de Métricas**: Interface visual para monitorar requisições bloqueadas e uso em tempo real.
-   **🐳 Dockerização**: Criar um `Dockerfile` e `docker-compose.yml` para facilitar o deploy em ambientes de produção.
