export const PIPELINE_TEMPLATES = {
  basic: `# Basic Pipeline
pipeline: "my-pipeline"
version: "1"
name: "My Basic Pipeline"
description: "Basic example pipeline"
enabled: true
schedule: "0 0 * * *"

steps:
  - source:
      type: Pype.Connectors.Http.HttpJsonGetSourceConnector
      params:
        url: "https://jsonplaceholder.typicode.com/posts"
        method: "GET"
  
  - transform:
      map:
        id: "id"
        title: "title"
        content: "body"
  
  - sink:
      type: Pype.Connectors.Http.HttpJsonPostSinkConnector
      options:
        url: "https://httpbin.org/post"
        mode: "batch"
        batchSize: 10
`,

  advanced: `# Advanced Pipeline with Connectors
pipeline: "advanced-pipeline"
version: "1"
name: "Advanced Pipeline"
description: "Pipeline with multiple connectors and transformations"
enabled: true
schedule: "0 */6 * * *"

idempotency:
  key: "id"

steps:
  - source:
      type: Pype.Connectors.Http.HttpJsonGetSourceConnector
      params:
        url: "https://api.example.com/data"
        method: "GET"
        headers:
          Authorization: "Bearer \${secret:api/token}"
          Content-Type: "application/json"
    
  - transform:
      map:
        id: "id"
        name: "name"
        email: "email"
        processedAt: "$.timestamp"
      
  - sink:
      type: Pype.Connectors.Http.HttpJsonPostSinkConnector
      options:
        url: "https://webhook.site/your-webhook-url"
        mode: "batch"
        batchSize: 50

  - sink:
      type: Pype.Connectors.Http.HttpJsonPostSinkConnector
      options:
        url: "https://api.destination.com/webhook"
        mode: "single"
`,

  connector: `# Pipeline with Specific Connectors
pipeline: "connector-pipeline"
version: "1"
name: "SAP B1 → Sankhya Pipeline"
description: "Pipeline using SAP B1, Sankhya and HTTP connectors"
enabled: true
schedule: "0 2 * * *"

idempotency:
  key: "CardCode"

authProfiles:
  sankhya_auth:
    type: apiKeyPair
    params:
      idHeader: "X-Api-Key-Id"
      keyHeader: "X-Api-Key"
      id: "svc-orchestrator"
      key: "\${secret:sankhya/apikeys/svc-orchestrator/raw}"

steps:
  - source:
      type: Pype.Connectors.SapB1.SapB1SourceConnector
      params:
        server: "\${secret:sap/params/SERVER}"
        database: "\${secret:sap/params/DATABASE}"
        username: "\${secret:sap/auth/USER}"
        password: "\${secret:sap/auth/PASSWORD}"
        query: |
          SELECT T0.CardCode, T0.CardName, T0.Phone1
          FROM OCRD T0
          WHERE T0.CardType = 'C'
          AND T0.CreateDate >= '[%0]'

  - transform:
      map:
        code: "CardCode"
        name: "CardName"
        phone: "Phone1"
        source: "SAP B1"

  - sink:
      type: Pype.Connectors.Sankhya.SankhyaSbrSinkConnector
      authRef: "sankhya_auth"
      params:
        baseUrl: "\${secret:sankhya/params/BASE_URL}"
        user: "\${secret:sankhya/auth/USER}"
        password: "\${secret:sankhya/auth/PASSWORD}"
        serviceName: "CrudServiceProvider.saveRecord"
        entity: "Parceiro"
`,

  apdata: `# Pipeline with Apdata Connector
pipeline: "apdata-pipeline"
version: "1"
name: "Apdata Integration Pipeline"
description: "Pipeline for Apdata integration"
enabled: true
schedule: "0 */4 * * *"

idempotency:
  key: "codigo_cliente"

steps:
  - source:
      type: Pype.Connectors.Apdata.ApdataSourceConnector
      params:
        server: "\${secret:apdata/params/SERVER}"
        port: "\${secret:apdata/params/PORT}"
        database: "\${secret:apdata/params/DATABASE}"
        username: "\${secret:apdata/auth/USER}"
        password: "\${secret:apdata/auth/PASSWORD}"
        query: |
          SELECT 
            customer_code,
            customer_name,
            last_purchase_date,
            total_value
          FROM vw_active_customers
          WHERE last_purchase_date >= DATEADD(day, -30, GETDATE())

  - transform:
      map:
        id: "customer_code"
        name: "customer_name"
        lastPurchase: "last_purchase_date"
        totalValue: "total_value"
        processedAt: "\$.timestamp"

  - sink:
      type: Pype.Connectors.Http.HttpJsonPostSinkConnector
      options:
        url: "\${secret:webhook/BASE_URL}/customers"
        mode: "batch"
        batchSize: 100
        headers:
          Content-Type: "application/json"
          Authorization: "Bearer \${secret:api/token}"
`
};

export type TemplateType = keyof typeof PIPELINE_TEMPLATES;