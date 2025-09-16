export interface MicroSaaSTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  category: 'productivity' | 'content' | 'analysis' | 'automation';
  status: 'available' | 'coming-soon' | 'beta';
}

export const microSaasTools: MicroSaaSTool[] = [
  {
    id: 'worksheet-generator',
    title: 'Werkblad Generator',
    description: 'Genereer automatisch werkbladen met AI op basis van onderwerp en niveau',
    icon: '📝',
    route: '/tools/worksheet-generator',
    category: 'content',
    status: 'available'
  },
  {
    id: 'quiz-maker',
    title: 'Quiz Maker',
    description: 'Maak interactieve quizzen en toetsen met automatische feedback',
    icon: '🧩',
    route: '/tools/quiz-maker',
    category: 'content',
    status: 'available'
  },
  {
    id: 'grade-analyzer',
    title: 'Cijfer Analyzer',
    description: 'Analyseer prestaties en genereer rapporten voor individuele leerlingen',
    icon: '📊',
    route: '/tools/grade-analyzer',
    category: 'analysis',
    status: 'available'
  },
  {
    id: 'schedule-optimizer',
    title: 'Rooster Optimizer',
    description: 'Optimaliseer lesroosters en plan automatisch huiswerk deadlines',
    icon: '📅',
    route: '/tools/schedule-optimizer',
    category: 'productivity',
    status: 'beta'
  },
  {
    id: 'content-library',
    title: 'Content Bibliotheek',
    description: 'Toegang tot duizenden educatieve resources en materialen',
    icon: '📚',
    route: '/tools/content-library',
    category: 'content',
    status: 'available'
  },
  {
    id: 'student-tracker',
    title: 'Leerling Tracker',
    description: 'Volg voortgang en gedrag van leerlingen in real-time',
    icon: '👥',
    route: '/tools/student-tracker',
    category: 'analysis',
    status: 'available'
  },
  {
    id: 'email-templates',
    title: 'Email Templates',
    description: 'Vooraf gemaakte email templates voor ouder-communicatie',
    icon: '📧',
    route: '/tools/email-templates',
    category: 'productivity',
    status: 'available'
  },
  {
    id: 'homework-planner',
    title: 'Huiswerk Planner',
    description: 'Plan en distribueer huiswerk automatisch aan leerlingen',
    icon: '📋',
    route: '/tools/homework-planner',
    category: 'automation',
    status: 'coming-soon'
  },
  {
    id: 'virtual-classroom',
    title: 'Virtuele Classroom',
    description: 'Organiseer online lessen en interactieve sessies',
    icon: '💻',
    route: '/tools/virtual-classroom',
    category: 'productivity',
    status: 'beta'
  },
  {
    id: 'progress-reports',
    title: 'Voortgang Rapporten',
    description: 'Genereer gedetailleerde voortgangsrapporten voor ouders',
    icon: '📈',
    route: '/tools/progress-reports',
    category: 'analysis',
    status: 'available'
  },
  {
    id: 'lesson-planner',
    title: 'Les Planner',
    description: 'Plan en structureer lessen met AI-ondersteuning',
    icon: '🗓️',
    route: '/tools/lesson-planner',
    category: 'productivity',
    status: 'available'
  },
  {
    id: 'resource-generator',
    title: 'Resource Generator',
    description: 'Maak onderwijsmateriaal zoals flashcards en posters',
    icon: '🎨',
    route: '/tools/resource-generator',
    category: 'content',
    status: 'beta'
  }
];

export const getCategoryTools = (category: MicroSaaSTool['category']) => {
  return microSaasTools.filter(tool => tool.category === category);
};

export const getAvailableTools = () => {
  return microSaasTools.filter(tool => tool.status === 'available');
};

export const getToolById = (id: string) => {
  return microSaasTools.find(tool => tool.id === id);
};