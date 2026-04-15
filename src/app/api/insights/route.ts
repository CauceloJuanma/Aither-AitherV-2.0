import { NextResponse } from 'next/server';

// Configuración de GitHub
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_PROJECT_NUMBER = process.env.GITHUB_PROJECT_NUMBER || '5';
const GITHUB_PROJECT_OWNER = process.env.GITHUB_PROJECT_OWNER || 'Aaron3312';

// Tipos para los datos de insights
export interface TaskData {
  id: string;
  name: string;
  phase: string;
  estimatedTime: number; // en minutos
  actualTime: number; // en minutos
  estimatedCost: number; // en unidades monetarias
  actualCost: number; // en unidades monetarias
  status: 'completed' | 'in_progress' | 'pending';
  startDate: string;
  endDate?: string;
}

export interface PhaseData {
  phase: string;
  totalTasks: number;
  completedTasks: number;
  estimatedTime: number;
  actualTime: number;
  estimatedCost: number;
  actualCost: number;
}

export interface ProjectInsights {
  tasks: TaskData[];
  phases: PhaseData[];
  summary: {
    totalEstimatedTime: number;
    totalActualTime: number;
    totalEstimatedCost: number;
    totalActualCost: number;
    completionPercentage: number;
  };
}

// Función para obtener datos de GitHub Projects
async function fetchGitHubProjectData(): Promise<ProjectInsights> {
  if (!GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN no configurado, usando datos de ejemplo');
    return generateMockData();
  }

  try {
    const query = `
      query($owner: String!, $number: Int!) {
        user(login: $owner) {
          projectV2(number: $number) {
            title
            items(first: 100) {
              nodes {
                id
                fieldValues(first: 20) {
                  nodes {
                    ... on ProjectV2ItemFieldTextValue {
                      text
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldNumberValue {
                      number
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      name
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldDateValue {
                      date
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                    }
                  }
                }
                content {
                  ... on Issue {
                    title
                    number
                    state
                    createdAt
                    closedAt
                  }
                  ... on DraftIssue {
                    title
                    createdAt
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          owner: GITHUB_PROJECT_OWNER,
          number: parseInt(GITHUB_PROJECT_NUMBER),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error('GraphQL query failed');
    }

    // Procesar los datos de GitHub Projects
    return parseGitHubProjectData(data);
  } catch (error) {
    console.error('Error fetching GitHub Project data:', error);
    return generateMockData();
  }
}

// Función para parsear los datos de GitHub Projects
function parseGitHubProjectData(data: { data?: { user?: { projectV2?: { items?: { nodes?: unknown[] } } } } }): ProjectInsights {
  const items = data.data?.user?.projectV2?.items?.nodes || [];

  const tasks: TaskData[] = items.map((item: unknown, index: number) => {
    const itemObj = item as Record<string, unknown>;
    const fieldValues = (itemObj.fieldValues as { nodes?: unknown[] })?.nodes || [];
    const content = itemObj.content as Record<string, unknown> | undefined;

    // Extraer valores de campos personalizados
    const getFieldValue = (fieldName: string) => {
      const field = fieldValues.find((f: unknown) => {
        const fObj = f as Record<string, unknown>;
        return (fObj.field as Record<string, unknown>)?.name === fieldName;
      }) as Record<string, unknown> | undefined;
      return field?.text || field?.number || field?.name || field?.date || null;
    };

    const phase = (getFieldValue('Fase') || getFieldValue('Phase') || 'SIN_FASE') as string;
    const estimatedTime = getFieldValue('Estimated Time') || getFieldValue('Tiempo Estimado') || 0;
    const actualTime = getFieldValue('Time(minutes)') || getFieldValue('Tiempo Real') || getFieldValue('Actual Time') || 0;

    // Calcular costos basados en tiempo (ej: $100 por hora = $1.67 por minuto)
    const costPerMinute = 1.67; // Ajusta este valor según tu tarifa
    const estimatedCost = typeof estimatedTime === 'number' ? estimatedTime * costPerMinute : 0;
    const actualCost = typeof actualTime === 'number' ? actualTime * costPerMinute : 0;

    const status = getFieldValue('Status') || content?.state;

    // Mapear el estado de GitHub a nuestro formato
    let taskStatus: 'completed' | 'in_progress' | 'pending' = 'pending';
    if (status === 'CLOSED' || status === 'Done' || status === 'Completado') {
      taskStatus = 'completed';
    } else if (status === 'OPEN' || status === 'In Progress' || status === 'En Progreso' || status === 'blocked') {
      taskStatus = 'in_progress';
    }

    return {
      id: (itemObj.id as string) || `task-${index}`,
      name: (content?.title as string) || `Tarea ${index + 1}`,
      phase: phase.toUpperCase(),
      estimatedTime: typeof estimatedTime === 'number' ? estimatedTime : 0,
      actualTime: typeof actualTime === 'number' ? actualTime : 0,
      estimatedCost: typeof estimatedCost === 'number' ? estimatedCost : 0,
      actualCost: typeof actualCost === 'number' ? actualCost : 0,
      status: taskStatus,
      startDate: (content?.createdAt as string) || new Date().toISOString(),
      endDate: (content?.closedAt as string) || undefined,
    };
  });

  // Calcular datos agregados por fase
  const phasesMap = new Map<string, PhaseData>();

  tasks.forEach(task => {
    if (!phasesMap.has(task.phase)) {
      phasesMap.set(task.phase, {
        phase: task.phase,
        totalTasks: 0,
        completedTasks: 0,
        estimatedTime: 0,
        actualTime: 0,
        estimatedCost: 0,
        actualCost: 0
      });
    }

    const phaseData = phasesMap.get(task.phase)!;
    phaseData.totalTasks++;
    if (task.status === 'completed') {
      phaseData.completedTasks++;
    }
    phaseData.estimatedTime += task.estimatedTime;
    phaseData.actualTime += task.actualTime;
    phaseData.estimatedCost += task.estimatedCost;
    phaseData.actualCost += task.actualCost;
  });

  const phases = Array.from(phasesMap.values());

  // Calcular resumen general
  const summary = {
    totalEstimatedTime: tasks.reduce((sum, t) => sum + t.estimatedTime, 0),
    totalActualTime: tasks.reduce((sum, t) => sum + t.actualTime, 0),
    totalEstimatedCost: tasks.reduce((sum, t) => sum + t.estimatedCost, 0),
    totalActualCost: tasks.reduce((sum, t) => sum + t.actualCost, 0),
    completionPercentage: tasks.length > 0
      ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100
      : 0
  };

  return { tasks, phases, summary };
}

// Datos de ejemplo (fallback cuando no hay token de GitHub)
function generateMockData(): ProjectInsights {
  const tasks: TaskData[] = [
    {
      id: '1',
      name: 'Diseño de arquitectura',
      phase: 'PLANIFICACIÓN',
      estimatedTime: 2400, // minutos (40 horas)
      actualTime: 2700, // minutos (45 horas)
      estimatedCost: 4000,
      actualCost: 4500,
      status: 'completed',
      startDate: '2024-01-01',
      endDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Setup del proyecto',
      phase: 'PLANIFICACIÓN',
      estimatedTime: 960, // minutos (16 horas)
      actualTime: 1080, // minutos (18 horas)
      estimatedCost: 1600,
      actualCost: 1800,
      status: 'completed',
      startDate: '2024-01-16',
      endDate: '2024-01-20'
    },
    {
      id: '3',
      name: 'Desarrollo de API REST',
      phase: 'DESARROLLO',
      estimatedTime: 4800, // minutos (80 horas)
      actualTime: 5520, // minutos (92 horas)
      estimatedCost: 8000,
      actualCost: 9200,
      status: 'completed',
      startDate: '2024-01-21',
      endDate: '2024-02-15'
    },
    {
      id: '4',
      name: 'Integración base de datos',
      phase: 'DESARROLLO',
      estimatedTime: 3600, // minutos (60 horas)
      actualTime: 3300, // minutos (55 horas)
      estimatedCost: 6000,
      actualCost: 5500,
      status: 'completed',
      startDate: '2024-02-01',
      endDate: '2024-02-20'
    },
    {
      id: '5',
      name: 'Desarrollo UI/UX',
      phase: 'DESARROLLO',
      estimatedTime: 6000, // minutos (100 horas)
      actualTime: 6600, // minutos (110 horas)
      estimatedCost: 10000,
      actualCost: 11000,
      status: 'in_progress',
      startDate: '2024-02-21'
    },
    {
      id: '6',
      name: 'Pruebas unitarias',
      phase: 'TESTING',
      estimatedTime: 2400, // minutos (40 horas)
      actualTime: 2100, // minutos (35 horas)
      estimatedCost: 4000,
      actualCost: 3500,
      status: 'completed',
      startDate: '2024-03-01',
      endDate: '2024-03-10'
    },
    {
      id: '7',
      name: 'Pruebas de integración',
      phase: 'TESTING',
      estimatedTime: 3000, // minutos (50 horas)
      actualTime: 2880, // minutos (48 horas)
      estimatedCost: 5000,
      actualCost: 4800,
      status: 'in_progress',
      startDate: '2024-03-11'
    },
    {
      id: '8',
      name: 'Deploy a staging',
      phase: 'DESPLIEGUE',
      estimatedTime: 1440, // minutos (24 horas)
      actualTime: 1200, // minutos (20 horas)
      estimatedCost: 2400,
      actualCost: 2000,
      status: 'completed',
      startDate: '2024-03-20',
      endDate: '2024-03-22'
    },
    {
      id: '9',
      name: 'Deploy a producción',
      phase: 'DESPLIEGUE',
      estimatedTime: 1920, // minutos (32 horas)
      actualTime: 0,
      estimatedCost: 3200,
      actualCost: 0,
      status: 'pending',
      startDate: '2024-04-01'
    },
    {
      id: '10',
      name: 'Documentación técnica',
      phase: 'DOCUMENTACIÓN',
      estimatedTime: 2400, // minutos (40 horas)
      actualTime: 1800, // minutos (30 horas)
      estimatedCost: 4000,
      actualCost: 3000,
      status: 'in_progress',
      startDate: '2024-03-25'
    }
  ];

  // Calcular datos agregados por fase
  const phasesMap = new Map<string, PhaseData>();

  tasks.forEach(task => {
    if (!phasesMap.has(task.phase)) {
      phasesMap.set(task.phase, {
        phase: task.phase,
        totalTasks: 0,
        completedTasks: 0,
        estimatedTime: 0,
        actualTime: 0,
        estimatedCost: 0,
        actualCost: 0
      });
    }

    const phaseData = phasesMap.get(task.phase)!;
    phaseData.totalTasks++;
    if (task.status === 'completed') {
      phaseData.completedTasks++;
    }
    phaseData.estimatedTime += task.estimatedTime;
    phaseData.actualTime += task.actualTime;
    phaseData.estimatedCost += task.estimatedCost;
    phaseData.actualCost += task.actualCost;
  });

  const phases = Array.from(phasesMap.values());

  // Calcular resumen general
  const summary = {
    totalEstimatedTime: tasks.reduce((sum, t) => sum + t.estimatedTime, 0),
    totalActualTime: tasks.reduce((sum, t) => sum + t.actualTime, 0),
    totalEstimatedCost: tasks.reduce((sum, t) => sum + t.estimatedCost, 0),
    totalActualCost: tasks.reduce((sum, t) => sum + t.actualCost, 0),
    completionPercentage: (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100
  };

  return { tasks, phases, summary };
}

export async function GET() {
  try {
    // Obtener datos desde GitHub Projects (o usar fallback si no hay token)
    const data = await fetchGitHubProjectData();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en GET /api/insights:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de insights' },
      { status: 500 }
    );
  }
}
