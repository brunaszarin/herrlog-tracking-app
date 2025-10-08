# Herrlog Tracking App 🚛   
Aplicação de rastreamento e visualização de rotas em tempo real

O sistema permite:  
- 🚗 Cadastro, edição e exclusão de veículos.  
- 📂 Upload de arquivos JSON com informações de localização.  
- 🗺️ Exibição das rotas dos veículos em um mapa interativo.  



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
```

## ⚠️ Nota pessoal:
Este projeto foi desenvolvido dentro de um prazo bastante limitado, com foco em garantir o funcionamento completo das principais funcionalidades e a entrega de uma base sólida. Embora ainda existam oportunidades de aprimoramento e refatoração, o resultado representa o melhor possível dentro das condições e do tempo disponíveis, priorizando qualidade, clareza e usabilidade.

## 📄 Licença
MIT License © Herrlog — Todos os direitos reservados.  
