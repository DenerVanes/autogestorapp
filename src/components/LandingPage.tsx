
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, BarChart3, Fuel, Target, CheckCircle, ArrowRight, Star, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Auto Gestor APP
            </h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/login')}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Já tenho conta - ENTRAR
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Gerencie suas Finanças como
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Motorista de App </span>
            de Forma Inteligente
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Com o Auto Gestor APP, você controla receitas, despesas e lucro real. 
            Tome decisões baseadas em dados e maximize seus ganhos.
          </p>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg inline-block mb-8">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              Por apenas R$ 0,66 por dia
            </div>
            <div className="text-sm text-gray-500">
              Equivalente a R$ 19,90/mês
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              TESTE GRÁTIS POR 7 DIAS
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => scrollToSection('demo')}
              className="px-8 py-6 text-lg rounded-xl"
            >
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
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
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-6 text-lg rounded-xl"
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
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-6 text-lg rounded-xl"
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
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-gray-600">Preview do Dashboard</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-6 text-lg rounded-xl"
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
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-6 text-lg rounded-xl"
            >
              JUNTE-SE A ELES - TESTE GRÁTIS
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Comece Hoje Mesmo
          </h2>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="text-4xl md:text-5xl font-bold mb-4">
              R$ 0,66 por dia
            </div>
            <div className="text-xl mb-6">
              Menos que um café por dia para controlar suas finanças
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span>Controle completo de receitas e despesas</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span>Relatórios e gráficos detalhados</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span>Gestão de combustível e quilometragem</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span>Suporte via email</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span>Atualizações gratuitas</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span>Acesso completo a todas as funcionalidades</span>
                </div>
              </div>
            </div>
          </div>

          <Button 
            size="lg"
            onClick={() => navigate('/signup')}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl font-bold"
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
