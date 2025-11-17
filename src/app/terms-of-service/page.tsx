import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Serviço | Pype',
  description: 'Termos de Serviço da Pype - Condições de uso da plataforma de orquestração de pipelines.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Termos de Serviço
          </h1>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Última atualização: 17 de novembro de 2025
          </p>

          <div className="prose dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Aceitação dos Termos
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Bem-vindo à Pype. Ao acessar ou utilizar nossa plataforma de orquestração de pipelines de dados 
                (&quot;Serviço&quot;), você concorda em cumprir e estar vinculado a estes Termos de Serviço (&quot;Termos&quot;).
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Se você não concordar com qualquer parte destes termos, não utilize nosso Serviço. O uso continuado 
                do Serviço constitui aceitação de quaisquer modificações a estes Termos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Descrição do Serviço
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                A Pype é uma plataforma SaaS multi-tenant que fornece:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Orquestração de pipelines de dados através de arquivos YAML</li>
                <li>Conectores para fontes e destinos de dados (HTTP, Sankhya, bancos de dados)</li>
                <li>Agendamento e execução automatizada de jobs</li>
                <li>Monitoramento e logs de execução</li>
                <li>Gerenciamento de credenciais e variáveis de ambiente</li>
                <li>Interface administrativa web</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Elegibilidade e Cadastro
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                3.1 Elegibilidade
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Você deve ter pelo menos 18 anos e capacidade legal para firmar contratos. O Serviço é destinado 
                a empresas e profissionais.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                3.2 Conta e Segurança
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Você é responsável por:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Fornecer informações precisas e completas durante o cadastro</li>
                <li>Manter a confidencialidade de suas credenciais</li>
                <li>Todas as atividades realizadas sob sua conta</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Planos e Pagamentos
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                4.1 Planos de Assinatura
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Oferecemos diferentes planos de assinatura com recursos variados. Os detalhes de cada plano, 
                incluindo preços e limites, estão disponíveis em nossa página de preços.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                4.2 Cobrança
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>As assinaturas são cobradas mensalmente ou anualmente, conforme selecionado</li>
                <li>Pagamentos são processados através do Stripe</li>
                <li>Você autoriza cobranças recorrentes até o cancelamento</li>
                <li>Preços estão sujeitos a alteração mediante notificação prévia de 30 dias</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                4.3 Reembolsos
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Oferecemos reembolso total se você cancelar dentro de 7 dias da primeira assinatura. 
                Após esse período, não há reembolsos proporcionais, mas você pode usar o serviço até 
                o fim do período pago.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Uso Aceitável
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                5.1 Uso Permitido
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Você pode usar o Serviço para:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Integração e sincronização de dados entre sistemas</li>
                <li>ETL (Extract, Transform, Load) e processamento de dados</li>
                <li>Automação de workflows de negócio</li>
                <li>Qualquer uso legal conforme a legislação brasileira</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                5.2 Uso Proibido
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Você NÃO PODE:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Violar leis, direitos de terceiros ou estes Termos</li>
                <li>Fazer engenharia reversa, descompilar ou desmontar o Serviço</li>
                <li>Acessar dados de outros tenants ou usuários</li>
                <li>Sobrecarregar nossa infraestrutura com tráfego excessivo</li>
                <li>Usar o Serviço para spam, phishing ou atividades maliciosas</li>
                <li>Armazenar ou processar dados ilegais ou prejudiciais</li>
                <li>Revender ou sublicenciar o Serviço sem autorização</li>
                <li>Remover avisos de propriedade intelectual</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Seus Dados
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                6.1 Propriedade
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Você mantém todos os direitos sobre os dados que processa através do Serviço. Concede-nos 
                licença limitada para armazenar, processar e transmitir seus dados apenas para fornecer o Serviço.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                6.2 Responsabilidades
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Você é responsável por:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Legalidade e direitos sobre os dados processados</li>
                <li>Obter consentimentos necessários para processamento de dados pessoais</li>
                <li>Conformidade com LGPD e outras regulamentações aplicáveis</li>
                <li>Backups de dados críticos (fornecemos backups de infraestrutura)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Propriedade Intelectual
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                O Serviço, incluindo software, design, marcas, logos e conteúdo, é propriedade da Pype 
                e protegido por leis de propriedade intelectual.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Concedemos licença limitada, não exclusiva, não transferível para usar o Serviço conforme 
                estes Termos. Esta licença não inclui direitos de revenda ou uso comercial do Serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Disponibilidade e SLA
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                8.1 Uptime
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nos esforçamos para manter 99.9% de uptime (excluindo manutenções programadas). 
                SLAs específicos estão disponíveis para planos Enterprise.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                8.2 Manutenção
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Reservamo-nos o direito de:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Realizar manutenções programadas (com notificação prévia)</li>
                <li>Executar manutenções emergenciais sem aviso prévio</li>
                <li>Modificar ou descontinuar recursos (com notificação de 30 dias)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Limitação de Responsabilidade
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                9.1 Isenções
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                O Serviço é fornecido &quot;como está&quot; e &quot;conforme disponível&quot;. Não garantimos:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Operação ininterrupta ou livre de erros</li>
                <li>Resultados específicos ou precisão de dados processados</li>
                <li>Compatibilidade com todos os sistemas e APIs</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                9.2 Limites de Responsabilidade
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nossa responsabilidade total é limitada ao valor pago por você nos últimos 12 meses. 
                Não somos responsáveis por:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Danos indiretos, incidentais ou consequenciais</li>
                <li>Perda de lucros, dados ou oportunidades de negócio</li>
                <li>Falhas de sistemas ou APIs de terceiros</li>
                <li>Uso indevido do Serviço por você ou terceiros</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Indenização
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Você concorda em indenizar e isentar a Pype de quaisquer reivindicações, danos, 
                obrigações, perdas, responsabilidades, custos ou dívidas resultantes de:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-4">
                <li>Seu uso do Serviço</li>
                <li>Violação destes Termos</li>
                <li>Violação de direitos de terceiros</li>
                <li>Dados que você processa através do Serviço</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Rescisão
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                11.1 Por Você
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Você pode cancelar sua assinatura a qualquer momento através do painel administrativo. 
                O cancelamento entra em vigor no final do período de cobrança atual.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                11.2 Por Nós
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Podemos suspender ou encerrar sua conta imediatamente se:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Você violar estes Termos</li>
                <li>Houver inadimplência de pagamento por mais de 15 dias</li>
                <li>Atividades fraudulentas ou ilegais forem detectadas</li>
                <li>Houver risco à segurança ou estabilidade do Serviço</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                11.3 Após Rescisão
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Após rescisão, você tem 30 dias para exportar seus dados. Após esse período, 
                podemos deletar permanentemente seus dados conforme nossa política de retenção.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                12. Modificações aos Termos
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações 
                significativas serão notificadas por e-mail ou através do Serviço com 30 dias de 
                antecedência. O uso continuado após as alterações constitui aceitação dos novos Termos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                13. Lei Aplicável e Jurisdição
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Estes Termos são regidos pelas leis da República Federativa do Brasil. Quaisquer 
                disputas serão resolvidas nos tribunais da comarca de [SUA CIDADE], com renúncia 
                expressa a qualquer outro foro, por mais privilegiado que seja.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                14. Disposições Gerais
              </h2>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Acordo Integral:</strong> Estes Termos constituem o acordo completo entre você e a Pype</li>
                <li><strong>Cessão:</strong> Você não pode transferir seus direitos sem nosso consentimento</li>
                <li><strong>Divisibilidade:</strong> Se alguma cláusula for inválida, as demais permanecem em vigor</li>
                <li><strong>Renúncia:</strong> Nossa falha em exigir cumprimento não constitui renúncia de direitos</li>
                <li><strong>Idioma:</strong> Em caso de tradução, a versão em português prevalece</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                15. Contato
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Para questões sobre estes Termos de Serviço:
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>E-mail Legal:</strong> <a href="mailto:legal@pype.app.br" className="text-blue-600 dark:text-blue-400 hover:underline">legal@pype.app.br</a>
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Suporte Geral:</strong> <a href="mailto:support@pype.app.br" className="text-blue-600 dark:text-blue-400 hover:underline">support@pype.app.br</a>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Website:</strong> <a href="https://pype.app.br" className="text-blue-600 dark:text-blue-400 hover:underline">https://pype.app.br</a>
                </p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Estes Termos de Serviço estão em conformidade com o Código de Defesa do Consumidor (Lei nº 8.078/1990), 
                Marco Civil da Internet (Lei nº 12.965/2014) e Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
