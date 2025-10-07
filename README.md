# Herrlog Tracking App 🚛   
Aplicação de rastreamento e visualização de rotas em tempo real

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
│── backend/                       # API em Python (FastAPI)
│   ├── src/
│   │   ├── controllers/           # Regras de negócio (CRUD, upload JSON)
│   │   ├── models/                # Modelos do banco (Veículo, Localização)
│   │   ├── routes/                # Endpoints da API
│   │   ├── services/              # Processamento e utilitários
│   │   └── database/              # Conexão com SQL Server
│   ├── requirements.txt
│   └── main.py
│
│── frontend/                      # Aplicação React unificada
│   ├── src/
│   │   ├── app/                   # Rotas e layout principal
│   │   ├── components/            # Componentes do tracking + interface
│   │   ├── hooks/                 # Hooks customizados
│   │   ├── lib/                   # Funções auxiliares (utils, context)
│   │   ├── pages/                 # Páginas herdadas do tracking app
│   │   ├── services/              # Comunicação com API FastAPI
│   │   ├── styles/                # Estilos globais e importados da Interface
│   │   └── assets/                # Imagens, ícones e fontes
│   ├── public/
│   │   ├── images/
│   │   ├── icons/
│   │   └── assets/
│   ├── package.json
│   ├── vite.config.ts.from_interface
│   └── README.md.from_interface
│
│── database/
│   ├── schema.sql
│   ├── seed.sql
│
│── external/
│   └── herrlog_app_interface_full/ 
│
│── README.txt                




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

## ⚠️ Nota pessoal:
Este projeto foi desenvolvido dentro de um prazo bastante limitado, com foco em garantir o funcionamento completo das principais funcionalidades e a entrega de uma base sólida. Embora ainda existam oportunidades de aprimoramento e refatoração, o resultado representa o melhor possível dentro das condições e do tempo disponíveis, priorizando qualidade, clareza e usabilidade.

## 📄 Licença
MIT License © Herrlog — Todos os direitos reservados.  
