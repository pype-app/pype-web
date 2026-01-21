import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Pype',
  description: 'Política de Privacidade da Pype - Saiba como coletamos, usamos e protegemos seus dados.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Política de Privacidade
          </h1>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Última atualização: 17 de novembro de 2025
          </p>

          <div className="prose dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Introdução
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                A Pype (&quot;nós&quot;, &quot;nosso&quot; ou &quot;nossa&quot;) está comprometida em proteger sua privacidade. 
                Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas 
                informações quando você utiliza nossa plataforma de orquestração de pipelines de dados.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Ao utilizar os serviços da Pype, você concorda com a coleta e uso de informações de acordo 
                com esta política.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Informações que Coletamos
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                2.1 Informações Fornecidas por Você
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li><strong>Dados de Cadastro:</strong> Nome, e-mail, senha (criptografada), empresa/organização</li>
                <li><strong>Informações de Perfil:</strong> Configurações de conta, preferências do usuário</li>
                <li><strong>Dados de Pipeline:</strong> Configurações YAML, credenciais de API (criptografadas), variáveis de ambiente</li>
                <li><strong>Dados de Pagamento:</strong> Informações de cobrança processadas por terceiros (Stripe)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                2.2 Informações Coletadas Automaticamente
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Dados de Uso:</strong> Logs de execução de pipelines, timestamps, status de jobs</li>
                <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional, identificadores de dispositivo</li>
                <li><strong>Cookies:</strong> Cookies de sessão e preferências (ver Seção 6)</li>
                <li><strong>Métricas de Performance:</strong> Tempo de execução, taxas de sucesso/falha, uso de recursos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Como Usamos Suas Informações
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Utilizamos as informações coletadas para:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Fornecer, operar e manter nossos serviços</li>
                <li>Processar e executar pipelines de dados conforme suas configurações</li>
                <li>Autenticar usuários e manter a segurança da conta</li>
                <li>Gerenciar multi-tenancy e isolamento de dados</li>
                <li>Processar pagamentos e gerenciar assinaturas</li>
                <li>Enviar notificações sobre execuções de pipeline e alertas</li>
                <li>Melhorar e otimizar nossa plataforma</li>
                <li>Fornecer suporte ao cliente</li>
                <li>Detectar e prevenir fraudes ou atividades maliciosas</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Compartilhamento de Informações
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Não vendemos suas informações pessoais. Podemos compartilhar suas informações nas seguintes situações:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                4.1 Provedores de Serviços
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li><strong>Microsoft Azure:</strong> Hospedagem de infraestrutura e serviços de nuvem</li>
                <li><strong>PostgreSQL:</strong> Armazenamento de banco de dados</li>
                <li><strong>Stripe:</strong> Processamento de pagamentos</li>
                <li><strong>Hangfire:</strong> Agendamento de jobs (auto-hospedado)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                4.2 Requisitos Legais
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Podemos divulgar suas informações se exigido por lei, ordem judicial, ou para proteger 
                nossos direitos legais.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                4.3 Transferências de Negócio
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Em caso de fusão, aquisição ou venda de ativos, suas informações podem ser transferidas 
                como parte da transação.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Segurança dos Dados
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Criptografia:</strong> TLS/SSL para dados em trânsito, AES-256 para dados sensíveis em repouso</li>
                <li><strong>Autenticação:</strong> JWT tokens, bcrypt para senhas, autenticação multi-tenant</li>
                <li><strong>Acesso:</strong> Controle de acesso baseado em roles (RBAC)</li>
                <li><strong>Isolamento:</strong> Dados segregados por tenant no banco de dados</li>
                <li><strong>Monitoramento:</strong> Logs de auditoria e detecção de anomalias</li>
                <li><strong>Backups:</strong> Backups regulares criptografados</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                Embora nos esforcemos para proteger suas informações, nenhum método de transmissão pela 
                internet é 100% seguro.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Cookies e Tecnologias Similares
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Utilizamos cookies e tecnologias similares para:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Cookies Essenciais:</strong> Autenticação de sessão, segurança</li>
                <li><strong>Cookies de Preferências:</strong> Tema (claro/escuro), idioma, configurações de UI</li>
                <li><strong>Cookies Analíticos:</strong> Google Analytics (se consentido)</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                Você pode controlar cookies através do banner de consentimento ou das configurações do seu navegador.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Retenção de Dados
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Retemos suas informações pelo tempo necessário para:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Dados de Conta:</strong> Enquanto sua conta estiver ativa</li>
                <li><strong>Logs de Execução:</strong> 90 dias (configurável)</li>
                <li><strong>Dados de Cobrança:</strong> 7 anos (requisitos fiscais)</li>
                <li><strong>Logs de Auditoria:</strong> 1 ano</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                Após o período de retenção, os dados são anonimizados ou deletados de forma segura.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Seus Direitos (LGPD)
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Acesso:</strong> Confirmar se processamos seus dados e solicitar cópia</li>
                <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li><strong>Exclusão:</strong> Solicitar exclusão de dados (sujeito a obrigações legais)</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Revogação de Consentimento:</strong> Retirar consentimento a qualquer momento</li>
                <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados</li>
                <li><strong>Informação:</strong> Obter informações sobre compartilhamento de dados</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                Para exercer esses direitos, entre em contato através de <a href="mailto:privacy@pype.app.br" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@pype.app.br</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Transferências Internacionais
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Nossos servidores estão localizados no Brasil (Azure Brazil South). Dados podem ser 
                transferidos para regiões da Microsoft Azure para fins de backup e redundância, sempre 
                com garantias adequadas de proteção.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Dados de Menores
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Nossos serviços são destinados a empresas e profissionais. Não coletamos intencionalmente 
                informações de menores de 18 anos. Se você acredita que coletamos dados de um menor, 
                entre em contato conosco imediatamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Alterações a Esta Política
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre 
                alterações significativas via e-mail ou através de aviso em nossa plataforma. A data da 
                última atualização será sempre indicada no topo desta página.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                12. Contato
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Para questões sobre esta Política de Privacidade ou para exercer seus direitos:
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>E-mail:</strong> <a href="mailto:privacy@pype.app.br" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@pype.app.br</a>
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Suporte:</strong> <a href="mailto:support@pype.app.br" className="text-blue-600 dark:text-blue-400 hover:underline">support@pype.app.br</a>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>DPO (Encarregado de Dados):</strong> <a href="mailto:dpo@pype.app.br" className="text-blue-600 dark:text-blue-400 hover:underline">dpo@pype.app.br</a>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                13. Base Legal para Processamento
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Processamos seus dados com base em:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Execução de Contrato:</strong> Para fornecer os serviços contratados</li>
                <li><strong>Consentimento:</strong> Para cookies analíticos e comunicações de marketing</li>
                <li><strong>Interesse Legítimo:</strong> Para segurança, prevenção de fraudes e melhoria de serviços</li>
                <li><strong>Obrigação Legal:</strong> Para cumprimento de requisitos fiscais e regulatórios</li>
              </ul>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Esta Política de Privacidade está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) 
                e o Marco Civil da Internet (Lei nº 12.965/2014).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
