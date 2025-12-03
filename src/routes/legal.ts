import { Request, Response } from "express";

/**
 * Privacy Policy - Obrigatório para aprovação no Meta Developer
 * URL: /privacy-policy
 */
export function privacyPolicy(req: Request, res: Response): void {
	const currentDate = new Date().toLocaleDateString("pt-BR");

	res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Privacidade - FlowCloser</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #1a73e8; 
            margin-top: 0;
        }
        h2 { 
            color: #5f6368; 
            margin-top: 30px; 
            font-size: 1.3em;
        }
        .update-date { 
            color: #5f6368; 
            font-size: 14px; 
            margin-bottom: 30px;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        hr {
            margin: 40px 0;
            border: none;
            border-top: 1px solid #ddd;
        }
        .footer {
            text-align: center;
            color: #5f6368;
            font-size: 14px;
            margin-top: 40px;
        }
        .logo-container {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }
        .logo-container img {
            max-width: 200px;
            height: auto;
            margin: 10px 20px;
        }
        .logo-agencia {
            max-width: 150px;
        }
        .logo-app {
            max-width: 180px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-container">
            <img src="/images/flowoff_logo.png" alt="FlowOff Logo" class="logo-agencia">
            <img src="/images/NEOFLOW.png" alt="NEOFLOW Logo" class="logo-app">
        </div>
        <h1>Política de Privacidade - FlowCloser</h1>
        <p class="update-date">Última atualização: ${currentDate}</p>
        
        <h2>1. Informações que Coletamos</h2>
        <p>O FlowCloser coleta as seguintes informações quando você interage conosco via Instagram:</p>
        <ul>
            <li>Nome completo (quando fornecido)</li>
            <li>Nome da empresa ou projeto (quando fornecido)</li>
            <li>Tipo de projeto desejado</li>
            <li>Orçamento estimado (quando mencionado)</li>
            <li>Urgência do projeto (quando mencionada)</li>
            <li>Preferência de contato</li>
            <li>ID do usuário do Instagram (fornecido automaticamente pela plataforma)</li>
            <li>Mensagens e histórico de conversação</li>
        </ul>
        
        <h2>2. Como Usamos Suas Informações</h2>
        <p>Utilizamos suas informações para:</p>
        <ul>
            <li>Qualificar sua solicitação e entender suas necessidades</li>
            <li>Fornecer respostas personalizadas sobre nossos serviços</li>
            <li>Entrar em contato para discutir seu projeto</li>
            <li>Melhorar nossos serviços e experiência do usuário</li>
            <li>Manter histórico de conversas para contexto futuro</li>
        </ul>
        
        <h2>3. Armazenamento de Dados</h2>
        <p>Seus dados são armazenados de forma segura:</p>
        <ul>
            <li><strong>Banco de Dados SQLite:</strong> Para sessões e histórico de conversas (armazenado localmente no servidor)</li>
            <li><strong>Instagram Business API:</strong> Mensagens são processadas através da API oficial do Instagram</li>
        </ul>
        <p>As sessões são mantidas temporariamente durante a conversa e podem ser armazenadas por até 24 horas para contexto.</p>
        
        <h2>4. Compartilhamento de Dados</h2>
        <p>Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:</p>
        <ul>
            <li>Quando necessário para fornecer nossos serviços (ex: processamento via APIs de IA)</li>
            <li>Quando exigido por lei ou ordem judicial</li>
            <li>Com seu consentimento explícito</li>
        </ul>
        
        <h2>5. Seus Direitos</h2>
        <p>Você tem o direito de:</p>
        <ul>
            <li>Acessar suas informações pessoais</li>
            <li>Corrigir dados incorretos</li>
            <li>Solicitar exclusão de seus dados</li>
            <li>Retirar seu consentimento a qualquer momento</li>
            <li>Optar por não receber comunicações de marketing</li>
        </ul>
        <p><strong>Para solicitar exclusão de seus dados:</strong></p>
        <ul>
            <li>Acesse suas configurações do Facebook: <a href="https://www.facebook.com/settings?tab=applications" target="_blank">Apps e Sites</a></li>
            <li>Remova o aplicativo FlowCloser</li>
            <li>Clique em "Enviar Solicitação" para solicitar a exclusão dos seus dados</li>
            <li>Você receberá um código de confirmação e poderá acompanhar o status em: <a href="/data-deletion-status">Status de Exclusão de Dados</a></li>
        </ul>
        <p>Para outras solicitações, entre em contato através do Instagram ou email: privacy@flowoff.xyz</p>
        
        <h2>6. Segurança</h2>
        <p>Implementamos medidas de segurança para proteger suas informações, incluindo:</p>
        <ul>
            <li>Criptografia de dados em trânsito (HTTPS)</li>
            <li>Armazenamento seguro em servidores protegidos</li>
            <li>Acesso restrito a informações pessoais</li>
            <li>Monitoramento contínuo de segurança</li>
        </ul>
        
        <h2>7. Retenção de Dados</h2>
        <p>Mantemos suas informações pelo tempo necessário para:</p>
        <ul>
            <li>Fornecer nossos serviços</li>
            <li>Cumprir obrigações legais</li>
            <li>Resolver disputas</li>
            <li>Melhorar nossos serviços</li>
        </ul>
        <p>Você pode solicitar a exclusão de seus dados a qualquer momento.</p>
        
        <h2>8. Cookies e Tecnologias Similares</h2>
        <p>Não utilizamos cookies neste serviço. As sessões são gerenciadas temporariamente durante a conversa via Instagram.</p>
        
        <h2>9. Menores de Idade</h2>
        <p>Nossos serviços não são direcionados a menores de 18 anos. Não coletamos intencionalmente informações de menores.</p>
        
        <h2>10. Alterações nesta Política</h2>
        <p>Podemos atualizar esta política periodicamente. Alterações significativas serão comunicadas via Instagram ou através desta página.</p>
        <p>A data da última atualização está indicada no topo desta página.</p>
        
        <h2>11. Contato</h2>
        <p>Para questões sobre privacidade, entre em contato:</p>
        <ul>
            <li><strong>Email:</strong> privacy@flowoff.xyz</li>
            <li><strong>Instagram:</strong> Envie mensagem direta para nosso perfil</li>
            <li><strong>Website:</strong> <a href="https://flowoff.xyz">flowoff.xyz</a></li>
        </ul>
        
        <h2>12. LGPD (Lei Geral de Proteção de Dados)</h2>
        <p>Este serviço está em conformidade com a LGPD (Lei nº 13.709/2018). Seus dados são tratados de acordo com as bases legais aplicáveis:</p>
        <ul>
            <li>Consentimento do titular</li>
            <li>Execução de contrato ou procedimentos preliminares</li>
            <li>Legítimo interesse</li>
        </ul>
        
        <hr>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} NΞØ Protocol - FlowCloser. Todos os direitos reservados.</p>
            <p>Built onchain. Powered by $NEOFLW.</p>
            <p style="margin-top: 10px;">// 🪩 By NEØ PROTOCOL™ //</p>
        </div>
    </div>
</body>
</html>
  `);
}

/**
 * Terms of Service - Obrigatório para aprovação no Meta Developer
 * URL: /terms-of-service
 */
export function termsOfService(req: Request, res: Response): void {
	const currentDate = new Date().toLocaleDateString("pt-BR");

	res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Termos de Serviço - FlowCloser</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #1a73e8; 
            margin-top: 0;
        }
        h2 { 
            color: #5f6368; 
            margin-top: 30px; 
            font-size: 1.3em;
        }
        .update-date { 
            color: #5f6368; 
            font-size: 14px; 
            margin-bottom: 30px;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        hr {
            margin: 40px 0;
            border: none;
            border-top: 1px solid #ddd;
        }
        .footer {
            text-align: center;
            color: #5f6368;
            font-size: 14px;
            margin-top: 40px;
        }
        .logo-container {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }
        .logo-container img {
            max-width: 200px;
            height: auto;
            margin: 10px 20px;
        }
        .logo-agencia {
            max-width: 150px;
        }
        .logo-app {
            max-width: 180px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-container">
            <img src="/images/flowoff_logo.png" alt="FlowOff Logo" class="logo-agencia">
            <img src="/images/NEOFLOW.png" alt="NEOFLOW Logo" class="logo-app">
        </div>
        <h1>Termos de Serviço - FlowCloser</h1>
        <p class="update-date">Última atualização: ${currentDate}</p>
        
        <h2>1. Aceitação dos Termos</h2>
        <p>Ao usar o FlowCloser via Instagram, você concorda com estes Termos de Serviço. Se você não concorda com algum destes termos, não deve usar nosso serviço.</p>
        
        <h2>2. Descrição do Serviço</h2>
        <p>O FlowCloser é um assistente automatizado de inteligência artificial que:</p>
        <ul>
            <li>Fornece informações sobre serviços de presença digital (sites, PWAs, micro SaaS, webapps)</li>
            <li>Qualifica leads e entende necessidades de clientes</li>
            <li>Facilita o contato entre clientes e nossa equipe</li>
            <li>Oferece suporte inicial e orientações sobre nossos serviços</li>
        </ul>
        
        <h2>3. Uso Aceitável</h2>
        <p>Você concorda em:</p>
        <ul>
            <li>Fornecer informações verdadeiras e precisas</li>
            <li>Não usar o serviço para fins ilegais ou não autorizados</li>
            <li>Não tentar comprometer a segurança do sistema</li>
            <li>Não usar o serviço para spam ou atividades maliciosas</li>
            <li>Respeitar os limites de uso do serviço</li>
            <li>Não tentar enganar ou manipular o sistema</li>
        </ul>
        
        <h2>4. Propriedade Intelectual</h2>
        <p>Todo o conteúdo gerado pelo FlowCloser, incluindo respostas, propostas e materiais, é propriedade da NΞØ Protocol ou de seus licenciadores.</p>
        <p>Você não pode copiar, modificar, distribuir ou criar trabalhos derivados sem autorização prévia por escrito.</p>
        
        <h2>5. Limitação de Responsabilidade</h2>
        <p>O FlowCloser é fornecido "como está" e "conforme disponível". Não garantimos:</p>
        <ul>
            <li>Disponibilidade ininterrupta do serviço</li>
            <li>Precisão absoluta das informações fornecidas</li>
            <li>Adequação para todos os propósitos</li>
            <li>Ausência de erros ou interrupções</li>
        </ul>
        <p>Em nenhuma circunstância seremos responsáveis por danos diretos, indiretos, incidentais ou consequenciais resultantes do uso ou incapacidade de usar o serviço.</p>
        
        <h2>6. Modificações do Serviço</h2>
        <p>Reservamos o direito de:</p>
        <ul>
            <li>Modificar ou descontinuar o serviço a qualquer momento</li>
            <li>Alterar estes termos de serviço</li>
            <li>Limitar ou restringir o acesso ao serviço</li>
        </ul>
        <p>Alterações significativas serão comunicadas através desta página ou via Instagram.</p>
        
        <h2>7. Privacidade</h2>
        <p>O uso do FlowCloser também está sujeito à nossa <a href="/privacy-policy">Política de Privacidade</a>, que descreve como coletamos, usamos e protegemos suas informações.</p>
        
        <h2>8. Serviços de Terceiros</h2>
        <p>O FlowCloser utiliza serviços de terceiros, incluindo:</p>
        <ul>
            <li>Instagram Business API (Meta)</li>
            <li>Serviços de IA (OpenAI, Google Gemini)</li>
            <li>Plataformas de hospedagem (Railway)</li>
        </ul>
        <p>O uso desses serviços está sujeito aos termos e políticas de privacidade de cada provedor.</p>
        
        <h2>9. Rescisão</h2>
        <p>Podemos encerrar ou suspender seu acesso ao serviço imediatamente, sem aviso prévio, por qualquer motivo, incluindo violação destes termos.</p>
        
        <h2>10. Lei Aplicável</h2>
        <p>Estes termos são regidos pelas leis do Brasil. Qualquer disputa será resolvida nos tribunais competentes do Brasil.</p>
        
        <h2>11. Contato</h2>
        <p>Para questões sobre estes termos de serviço:</p>
        <ul>
            <li><strong>Email:</strong> terms@flowoff.xyz</li>
            <li><strong>Instagram:</strong> Envie mensagem direta para nosso perfil</li>
            <li><strong>Website:</strong> <a href="https://flowoff.xyz">flowoff.xyz</a></li>
        </ul>
        
        <h2>12. Disposições Gerais</h2>
        <p>Se qualquer disposição destes termos for considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor.</p>
        <p>Estes termos constituem o acordo completo entre você e a NΞØ Protocol em relação ao uso do FlowCloser.</p>
        
        <hr>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} NΞØ Protocol - FlowCloser. Todos os direitos reservados.</p>
            <p>Built onchain. Powered by $NEOFLW.</p>
            <p style="margin-top: 10px;">// 🪩 By NEØ PROTOCOL™ //</p>
        </div>
    </div>
</body>
</html>
  `);
}

