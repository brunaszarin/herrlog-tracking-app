# Herrlog Tracking App  

Aplicação fullstack desenvolvida para gerenciar veículos e exibir suas rotas a partir de dados de rastreamento.  

O sistema permite:  
- 🚗 Cadastro, edição e exclusão de veículos.  
- 📂 Upload de arquivos JSON com informações de localização.  
- 🗺️ Exibição das rotas dos veículos em um mapa interativo.  



## Requisitos do Projeto  
A aplicação foi construída seguindo as regras fornecidas no desafio:  
- **Backend**: Python (FastAPI, API RESTful).  
- **Frontend**: React.  
- **Banco de Dados**: SQL Server.  
- **Mapa**: integração com bibliotecas de mapas (Leaflet, Mapbox ou Google Maps).  



## Tecnologias Utilizadas  
- **React** para a interface web.  
- **FastAPI** para a API e lógica de negócio.  
- **SQLAlchemy + pyodbc** para integração com o SQL Server.  
- **Leaflet** para renderização de rotas em mapas.  



## Estrutura do Projeto  

```
herrlog-tracking-app/
│── backend/             # API em Python
│   ├── src/
│   │   ├── controllers/ # Regras de negócio (CRUD, upload JSON)
│   │   ├── models/      # Modelos do banco (Veículo, Localização)
│   │   ├── routes/      # Endpoints da API
│   │   ├── services/    # Processamento e utilitários
│   │   └── database/    # Conexão com SQL Server
│   ├── tests/           # Testes automatizados
│   ├── requirements.txt # Dependências Python
│   └── main.py          # Ponto de entrada da aplicação
│
│── frontend/            # Aplicação React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── services/    # Comunicação com a API
│   │   ├── hooks/       # Hooks customizados
│   │   └── styles/      # Estilos
│   ├── public/          # Arquivos estáticos
│   └── package.json
│
│── database/            # Scripts SQL
│   ├── schema.sql       # Estrutura das tabelas
│   ├── seed.sql         # Dados de exemplo
│
│── docs/                # Documentação adicional
│   └── requirements.md
```



## Como Rodar Localmente  

### Backend (FastAPI)  
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend (React)  
```bash
cd frontend
npm install
npm start
```

### Banco de Dados (SQL Server)  
- Execute o script `schema.sql` para criar as tabelas.  
- Opcionalmente, rode o `seed.sql` para inserir dados de teste.  



## Licença  
MIT License.  
