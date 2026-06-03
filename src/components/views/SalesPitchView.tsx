import { useState } from 'react';
import {
  Presentation,
  Shield,
  Globe,
  Server,
  Award,
  ChevronDown,
  ChevronRight,
  Search,
  Copy,
  Check,
  Wifi,
  HeadphonesIcon,
  TrendingUp,
} from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

interface PitchCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  items: {
    title: string;
    description: string;
    script?: string;
    tags?: string[];
  }[];
}

const pitchData: PitchCategory[] = [
  {
    id: 'connectivity',
    title: 'Conectividad Empresarial',
    icon: Wifi,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    items: [
      {
        title: 'Fibra Dedicada Simétrica',
        description: 'Velocidades simétricas de 100Mbps hasta 10Gbps con ancho de banda dedicado garantizado. Sin contención ni reducción de velocidad en horas pico.',
        script: '"A diferencia de los ISPs residenciales, nuestra fibra dedicada garantiza que cada Megabit que contratás estará disponible las 24 horas del día, los 365 días del año. Tu empresa nunca competirá por ancho de banda."',
        tags: ['Fibra', 'SLA', 'Dedicado'],
      },
      {
        title: 'SLA Garantizado 99.9%',
        description: 'Acuerdo de nivel de servicio con tiempo de actividad garantizado del 99.9%. Compensaciones contractuales en caso de incumplimiento.',
        script: '"Nuestro SLA incluye compensaciones reales si no cumplimos. No son solo promesas — son compromisos contractuales que protegen tu inversión."',
        tags: ['SLA', 'Garantía', 'Uptime'],
      },
      {
        title: 'Redundancia y Alta Disponibilidad',
        description: 'Rutas redundantes de fibra, múltiples equipos de borde y conexiones de backbone diversificadas para garantizar continuidad de servicio.',
        script: '"Tenemos rutas de fibra completamente separadas físicamente. Si un cable falla, el tráfico automáticamente redirige por la ruta alternativa en menos de 50 milisegundos."',
        tags: ['Redundancia', 'HA', 'Failover'],
      },
    ],
  },
  {
    id: 'datacenter',
    title: 'Servicios de Datacenter',
    icon: Server,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-50 dark:bg-slate-800/50',
    items: [
      {
        title: 'Colocation Tier III',
        description: 'Espacio físico en nuestro datacenter certificado Tier III en San Salvador. Incluye energía redundante, cooling preciso y conectividad de alta velocidad.',
        script: '"Nuestro datacenter cuenta con certificación Tier III, lo que significa 99.982% de uptime garantizado. Tenemos generadores, UPS redundante y enfriamiento de precisión para tus equipos."',
        tags: ['Tier III', 'Colocation', 'Datacenter'],
      },
      {
        title: 'Seguridad Física 24/7',
        description: 'Acceso controlado por biometría, CCTV en todos los puntos, personal de seguridad las 24 horas y registro de accesos a instalaciones.',
        script: '"Solo personas autorizadas pueden acceder a tu cage o rack. Cada acceso queda registrado con timestamp y foto. Recibís una notificación cuando alguien accede a tus equipos."',
        tags: ['Seguridad', 'Acceso', 'CCTV'],
      },
      {
        title: 'Cross-Connect y Meet-Me-Room',
        description: 'Conexión directa con los principales carriers de El Salvador y Centroamérica. Reducción de latencia y costos en interconexiones.',
        script: '"Desde nuestro datacenter tenés acceso directo a Tigo, Claro, Digicel y operadores regionales. Esto elimina un salto de red y reduce la latencia entre tu empresa y tus proveedores."',
        tags: ['Interconexión', 'Carriers', 'Latencia'],
      },
    ],
  },
  {
    id: 'security',
    title: 'Ciberseguridad',
    icon: Shield,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    items: [
      {
        title: 'Protección DDoS Avanzada',
        description: 'Mitigación automática de ataques DDoS volumétricos de hasta 100Gbps. Detección en tiempo real con notificaciones y reportes post-ataque.',
        script: '"El año pasado, los ataques DDoS en Centroamérica crecieron un 300%. Nuestra plataforma detecta y mitiga automáticamente en segundos, antes de que tu usuario final note algo."',
        tags: ['DDoS', 'Seguridad', 'Protección'],
      },
      {
        title: 'Firewall Gestionado',
        description: 'Solución firewall de próxima generación con IPS/IDS, filtrado de contenido, inspección SSL y gestión proactiva por parte de nuestro equipo NOC.',
        script: '"No solo vendemos el firewall, lo administramos por vos. Nuestro equipo monitorea las reglas, actualiza las firmas de amenazas y te alerta sobre intentos de intrusión en tiempo real."',
        tags: ['Firewall', 'NGFW', 'IPS/IDS'],
      },
    ],
  },
  {
    id: 'mpls',
    title: 'Redes MPLS y SD-WAN',
    icon: Globe,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    items: [
      {
        title: 'MPLS Corporativo',
        description: 'Red privada virtual para conectar todas tus sucursales y oficinas con calidad de servicio garantizada. QoS para voz, video y datos críticos.',
        script: '"Con nuestra red MPLS, tus 10 sucursales se comportan como si estuvieran en la misma oficina. Las llamadas VoIP tienen prioridad, y el tráfico de backup no afecta las aplicaciones críticas."',
        tags: ['MPLS', 'QoS', 'WAN'],
      },
      {
        title: 'SD-WAN Inteligente',
        description: 'Gestión inteligente de múltiples enlaces WAN con failover automático, balanceo de carga y visibilidad centralizada desde un portal web.',
        script: '"SD-WAN combina tu fibra dedicada con un enlace de respaldo 4G. Si la fibra falla, el cambio es automático en menos de 2 segundos. Además, desde el portal ves el estado de todos los enlaces en tiempo real."',
        tags: ['SD-WAN', 'Failover', 'Multi-WAN'],
      },
    ],
  },
  {
    id: 'support',
    title: 'Soporte y NOC',
    icon: HeadphonesIcon,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    items: [
      {
        title: 'NOC 24/7/365',
        description: 'Centro de operaciones de red activo las 24 horas del día, los 7 días de la semana. Monitoreo proactivo, alertas en tiempo real y respuesta rápida a incidentes.',
        script: '"Cuando hay un problema a las 3 AM, nuestro equipo ya lo sabe antes que vos. Tenemos ingenieros certificados Cisco y Fortinet disponibles en todo momento para resolver cualquier incidencia."',
        tags: ['NOC', 'Soporte', '24/7'],
      },
      {
        title: 'Tiempo de Respuesta Garantizado',
        description: 'SLA de respuesta: 15 minutos para incidentes críticos, 4 horas para problemas mayores. Escalación automática hasta gerencia si no se resuelve en tiempo.',
        script: '"En nuestro SLA, definimos tiempos de respuesta específicos según la criticidad. Para una caída total de servicio, un ingeniero está trabajando en el problema en menos de 15 minutos."',
        tags: ['SLA', 'Respuesta', 'Escalación'],
      },
    ],
  },
  {
    id: 'advantages',
    title: 'Ventajas Competitivas DataRed',
    icon: Award,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/40',
    items: [
      {
        title: 'Presencia Local con Alcance Regional',
        description: 'Somos 100% salvadoreños con presencia en toda Centroamérica. Conocemos el mercado local, tenemos relaciones directas con reguladores y entendemos las necesidades específicas de las empresas de El Salvador.',
        script: '"No somos una empresa transnacional que tarda semanas en entender tu problema. Somos locales — nuestro ingeniero puede estar en tu oficina hoy mismo si es necesario."',
        tags: ['Local', 'Presencia', 'Servicio'],
      },
      {
        title: 'Infraestructura Propia',
        description: 'Nuestra red de fibra óptica es propia. No revendemos servicios de terceros. Esto nos da control total sobre la calidad, velocidad de resolución y escalabilidad de los servicios.',
        script: '"Somos dueños de la fibra que llega hasta tu edificio. Cuando hay un problema, no tenemos que esperar que otro proveedor lo resuelva — lo hacemos nosotros mismos."',
        tags: ['Infraestructura', 'Fibra Propia', 'Control'],
      },
      {
        title: 'Portal de Cliente Autogestión',
        description: 'Plataforma web y app móvil para monitorear tu servicio, ver estadísticas de uso, abrir tickets de soporte y consultar facturas en tiempo real.',
        script: '"Desde tu celular podés ver el consumo de ancho de banda de tu empresa en tiempo real, abrir un ticket de soporte y darle seguimiento. Sin llamadas telefónicas, sin esperar en cola."',
        tags: ['Portal', 'Autogestión', 'Transparencia'],
      },
      {
        title: 'Facturación Transparente',
        description: 'Sin cargos ocultos, sin letras pequeñas. El precio acordado es el precio que pagás. Facturación electrónica, desglose detallado y recordatorios automáticos.',
        script: '"Muchos proveedores cobran instalación, renta de equipo, IP adicionales y soporte por separado. Con DataRed, el precio que cotizamos es lo que aparece en tu factura."',
        tags: ['Facturación', 'Transparencia', 'Precio'],
      },
    ],
  },
];

export default function SalesPitchView() {
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('advantages');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const filteredData = pitchData.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        search === '' ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
    ),
  })).filter(cat => cat.items.length > 0);

  async function copyScript(script: string, id: string) {
    await navigator.clipboard.writeText(script);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  }

  const totalItems = pitchData.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pitch de Ventas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Biblioteca de ventajas competitivas y scripts de ventas — {totalItems} recursos
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2">
          <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Material Comercial Oficial</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar ventajas, argumentos o scripts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {pitchData.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setExpandedCategory(expandedCategory === cat.id ? null : cat.id);
                setSearch('');
              }}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center',
                expandedCategory === cat.id
                  ? `${cat.bgColor} border-current ${cat.color}`
                  : 'bg-card border-border hover:bg-accent'
              )}
            >
              <Icon className={cn('w-5 h-5', expandedCategory === cat.id ? cat.color : 'text-muted-foreground')} />
              <span className={cn('text-xs font-medium leading-tight', expandedCategory === cat.id ? cat.color : 'text-muted-foreground')}>
                {cat.items.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {filteredData.map((category) => {
          const CategoryIcon = category.icon;
          const isOpen = search !== '' || expandedCategory === category.id;

          return (
            <div
              key={category.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              {/* Category Header */}
              <button
                className="w-full flex items-center justify-between p-5 hover:bg-accent/50 transition-colors text-left"
                onClick={() => setExpandedCategory(isOpen && search === '' ? null : category.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn('p-2.5 rounded-xl', category.bgColor)}>
                    <CategoryIcon className={cn('w-5 h-5', category.color)} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{category.title}</p>
                    <p className="text-xs text-muted-foreground">{category.items.length} argumentos de venta</p>
                  </div>
                </div>
                <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
              </button>

              {/* Items */}
              {isOpen && (
                <div className="border-t border-border divide-y divide-border">
                  {category.items.map((item, idx) => {
                    const itemId = `${category.id}-${idx}`;
                    const isItemExpanded = expandedItem === itemId || search !== '';

                    return (
                      <div key={idx} className="group">
                        <div
                          className="flex items-start gap-4 p-5 cursor-pointer hover:bg-accent/30 transition-colors"
                          onClick={() => setExpandedItem(isItemExpanded && search === '' ? null : itemId)}
                        >
                          <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', category.color.replace('text-', 'bg-'))} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-sm text-foreground">{item.title}</p>
                              {search === '' && (
                                <ChevronRight className={cn('w-4 h-4 text-muted-foreground transition-transform flex-shrink-0', isItemExpanded && 'rotate-90')} />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                            {item.tags && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {item.tags.map((tag) => (
                                  <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Script Section */}
                        {isItemExpanded && item.script && (
                          <div className="mx-5 mb-5 rounded-xl bg-muted/50 border border-border overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/80">
                              <div className="flex items-center gap-2">
                                <Presentation className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Script de Venta</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  item.script && copyScript(item.script, itemId);
                                }}
                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-md hover:bg-accent"
                              >
                                {copiedScript === itemId ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-500" />
                                    <span className="text-emerald-600">Copiado</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    Copiar
                                  </>
                                )}
                              </button>
                            </div>
                            <blockquote className="px-4 py-4 text-sm text-foreground italic leading-relaxed border-l-4 border-blue-400 ml-0">
                              {item.script}
                            </blockquote>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredData.length === 0 && (
        <div className="flex flex-col items-center justify-center bg-card border border-border rounded-xl p-16 text-center">
          <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium text-foreground">Sin resultados</p>
          <p className="text-xs text-muted-foreground mt-1">Intenta con otros términos de búsqueda</p>
        </div>
      )}
    </div>
  );
}
