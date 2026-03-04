export const translations = {
    pt: {
        title: 'AP101 Tracker',
        loading: 'Iniciando...',
        authError: 'Falha na autenticação do Widget.',
        configError: 'Credenciais ou configuração não encontradas.',
        status: { idle: 'Disponível', working: 'Em Trabalho', paused: 'Em Pausa', finished: 'Finalizado' },
        actions: { start: 'Registrar Entrada', pause: 'Iniciar Pausa', resume: 'Voltar ao Trabalho', exit: 'Encerrar Expediente', openPanel: 'Abrir Painel de Jornada', closePanel: 'Fechar Painel' },
        dashboard: { title: 'Painel de Jornada', workToday: 'Trabalho (Hoje)', pauseTotal: 'Pausas (Total)', weekSummary: 'Resumo da Semana', timeline: 'Linha do Tempo (Hoje)', emptyTimeline: 'Nenhum registro ainda hoje.', liquidHours: '* Horas líquidas trabalhadas', filter: 'Filtrar' },
        days: { Dom: 'Dom', Seg: 'Seg', Ter: 'Ter', Qua: 'Qua', Qui: 'Qui', Sex: 'Sex', Sab: 'Sáb' },
        history: { ENTRY: 'Entrada', PAUSE_START: 'Início Pausa', PAUSE_END: 'Fim Pausa', EXIT: 'Saída' }
    },
    en: {
        title: 'AP101 Tracker',
        loading: 'Initializing...',
        authError: 'Widget authentication failed.',
        configError: 'Credentials or configuration not found.',
        status: { idle: 'Available', working: 'Working', paused: 'On Break', finished: 'Finished' },
        actions: { start: 'Clock In', pause: 'Start Break', resume: 'Resume Work', exit: 'Clock Out', openPanel: 'Open Journey Panel', closePanel: 'Close Panel' },
        dashboard: { title: 'Journey Panel', workToday: 'Work (Today)', pauseTotal: 'Breaks (Total)', weekSummary: 'Weekly Summary', timeline: 'Timeline (Today)', emptyTimeline: 'No records today.', liquidHours: '* Net hours worked', filter: 'Filter' },
        days: { Dom: 'Sun', Seg: 'Mon', Ter: 'Tue', Qua: 'Wed', Qui: 'Thu', Sex: 'Fri', Sab: 'Sat' },
        history: { ENTRY: 'Clock In', PAUSE_START: 'Break Started', PAUSE_END: 'Break Ended', EXIT: 'Clock Out' }
    }
}