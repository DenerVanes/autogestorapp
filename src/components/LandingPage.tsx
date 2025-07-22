
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, BarChart3, Fuel, Target, CheckCircle, ArrowRight, Star, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
// Tente importar usando o alias @ para src

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-row items-center justify-between gap-3">
          {/* Lado esquerdo: logo + nome */}
          <div className="flex flex-row items-center space-x-3 min-w-0">
            <img
              src="/nova-logo.png"
              alt="Logo Auto Gestor"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover flex-shrink-0"
            />
            <span className="hidden md:inline text-lg md:text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent truncate">
              Auto Gestor APP
            </span>
          </div>
          {/* Lado direito: botões */}
          <div className="flex flex-row items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 px-4 py-2 text-sm md:text-base"
            >
              Entrar
            </Button>
            <Button
              onClick={() => navigate('/signup')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm md:text-base"
            >
              Criar Conta
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start gap-16">
            {/* Coluna da esquerda - Textos e botões */}
            <div className="flex-1 text-left">
              <h1 className="text-4xl md:text-5xl mb-4 leading-tight text-orange-600 font-bold" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                Dirija como um profissional<br />
                Gerencie como um <span className="text-black">empreendedor</span>
              </h1>
              <p className="text-base md:text-lg text-neutral-700 mb-10 max-w-2xl leading-relaxed font-normal" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                Com o Auto Gestor APP, você controla receitas, despesas e lucro real. Tome decisões baseadas em dados e maximize seus ganhos.
              </p>
              
              <div className="flex justify-center w-full mb-12">
                <div className="bg-white px-6 py-4 rounded-2xl shadow-lg text-center w-auto">
                  <div className="text-2xl font-bold text-blue-500">
                    Por apenas R$ 0,66 por dia
                  </div>
                  <div className="text-sm text-gray-500">
                    Equivalente a R$ 19,90/mês
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <Button
                  size="lg"
                  onClick={() => scrollToSection('demo')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-7 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  Ver demonstração
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/signup')}
                  className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 px-10 py-7 text-lg rounded-2xl font-semibold"
                >
                  Crie uma conta grátis
                </Button>
              </div>
            </div>

            {/* Coluna da direita - Imagem */}
            <div className="flex-1 flex justify-center md:justify-end">
              <img
                src="/funcionalidades-hero.png"
                alt="Funcionalidades do Auto Gestor APP"
                className="max-w-full md:max-w-xl rounded-3xl shadow-xl"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="solucoes" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Soluções que Transformam sua Gestão Financeira
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Controle Total das Finanças</h3>
                <p className="text-gray-600">
                  Registre receitas e despesas em segundos. Visualize seu lucro real diário, semanal e mensal.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Fuel className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Gestão Inteligente de Combustível</h3>
                <p className="text-gray-600">
                  Controle gastos com combustível por quilometragem e otimize seus custos operacionais.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Relatórios Detalhados</h3>
                <p className="text-gray-600">
                  Gráficos e análises avançadas para tomada de decisão estratégica e informada.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Metas e Planejamento</h3>
                <p className="text-gray-600">
                  Acompanhe seu progresso diário, semanal e mensal com metas personalizadas.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-xl font-bold"
            >
              TESTE GRÁTIS POR 7 DIAS
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simples de Usar, Poderoso nos Resultados
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4">Cadastre-se</h3>
              <p className="text-gray-600 text-lg">
                Teste grátis por 7 dias, sem compromisso nem cartão de crédito
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4">Registre</h3>
              <p className="text-gray-600 text-lg">
                Adicione receitas e despesas facilmente através da interface intuitiva
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4">Analise</h3>
              <p className="text-gray-600 text-lg">
                Veja relatórios detalhados e tome decisões inteligentes baseadas em dados
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-xl"
            >
              COMEÇAR AGORA - TESTE GRÁTIS
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Veja o Auto Gestor APP em Ação
            </h2>
            <p className="text-xl text-gray-600">
              Interface intuitiva e poderosa para o controle total das suas finanças
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Dashboard Completo</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>Visão geral das finanças em tempo real</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>Gráficos interativos e relatórios</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>Controle de quilometragem e combustível</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span>Análise de lucro por período</span>
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center w-full">
                <img
                  src="/dashboard-mockup-pronto.png"
                  alt="Preview do Dashboard no celular"
                  style={{ maxWidth: '340px', width: '100%', height: 'auto', borderRadius: '32px', boxShadow: '0 0 16px rgba(0,0,0,0.10)' }}
                  onLoad={() => console.log('Imagem carregada com sucesso!')}
                  onError={(e) => { console.log('Erro ao carregar a imagem!', e); }}
                />
                <img
                  src="/dashboard-mockup-escuro.png"
                  alt="Preview do Dashboard no celular (tema escuro)"
                  style={{ maxWidth: '340px', width: '100%', height: 'auto', borderRadius: '32px', boxShadow: '0 0 16px rgba(0,0,0,0.10)' }}
                />
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-xl"
            >
              TESTE GRÁTIS POR 7 DIAS
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Motoristas que já Transformaram suas Finanças
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardContent className="p-4">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="flex justify-center mb-4">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Carlos Silva"
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shadow"
                  />
                </div>
                <p className="text-gray-600 mb-4">
                  "Com o Auto Gestor APP consegui aumentar meu lucro em 25%. Agora sei exatamente onde estou gastando e quanto realmente ganho."
                </p>
                <div className="font-bold">Carlos Silva</div>
                <div className="text-sm text-gray-500">Motorista Uber - São Paulo</div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-4">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="flex justify-center mb-4">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="Ana Paula"
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shadow"
                  />
                </div>
                <p className="text-gray-600 mb-4">
                  "Finalmente encontrei uma ferramenta que entende as necessidades de quem trabalha com app. Simples e muito eficiente!"
                </p>
                <div className="font-bold">Ana Paula</div>
                <div className="text-sm text-gray-500">Motorista 99 - Rio de Janeiro</div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-4">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="flex justify-center mb-4">
                  <img
                    src="https://randomuser.me/api/portraits/men/65.jpg"
                    alt="Roberto Santos"
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shadow"
                  />
                </div>
                <p className="text-gray-600 mb-4">
                  "Os relatórios me ajudaram a identificar os melhores horários e rotas. Minha renda aumentou significativamente."
                </p>
                <div className="font-bold">Roberto Santos</div>
                <div className="text-sm text-gray-500">Motorista iFood - Belo Horizonte</div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-xl"
            >
              JUNTE-SE A ELES - TESTE GRÁTIS
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing CTA Section */}
      <section id="preco" className="py-20 bg-gradient-to-br from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            R$ 0,66 por dia
          </h2>
          <p className="text-xl mb-10">
            Menos que um café por dia para controlar suas finanças
          </p>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-x-12 gap-y-6 text-left mb-12">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" />
              <span>Controle completo de receitas e despesas</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" />
              <span>Suporte via email</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" />
              <span>Relatórios e gráficos detalhados</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" />
              <span>Atualizações gratuitas</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" />
              <span>Gestão de combustível e quilometragem</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" />
              <span>Acesso completo a todas as funcionalidades</span>
            </div>
          </div>

          <Button 
            size="lg"
            onClick={() => navigate('/signup')}
            className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-7 text-lg rounded-2xl font-bold"
          >
            TESTE GRÁTIS POR 7 DIAS
          </Button>
          <p className="mt-4 text-blue-100">
            Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Auto Gestor APP</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Gestão financeira inteligente para motoristas de app
            </p>
            
            <div className="border-t border-gray-800 pt-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Mail className="w-5 h-5 text-blue-400" />
                <a href="mailto:autogestorapp@gmail.com" className="text-blue-400 hover:text-blue-300">
                  autogestorapp@gmail.com
                </a>
              </div>
              
              <p className="text-gray-500 text-sm">
                © 2025 Auto Gestor APP. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
