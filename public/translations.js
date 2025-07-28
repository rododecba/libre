const translations = {
  es: {
    header: {
      subtitle: "Escribe lo que quieras, sin esperar nada a cambio.<br>Tus palabras serán una botella lanzada al mar, encontrada por alguien en algún lugar del mundo, sin saber quién eres, ni quién la encontró.",
      global_count: "pensamientos lanzados"
    },
    nav: {
      global_thoughts: "Pensamientos globales",
      daily_revelation: "Revelación Diaria",
      my_thoughts: "Mis pensamientos",
      new_badge: "¡Nuevo!",
      time_capsule: "Cápsula del tiempo"
    },
    feed: {
      title: "Pensamientos de todo el mundo",
      title_tooltip: "Ver un pensamiento aleatorio del mundo",
      details_summary: "Ver mapa, ranking y estadísticas",
      textarea_placeholder: "Escribe aquí tu pensamiento anónimo...",
      send_button: "Enviar pensamiento",
      ranking_title: "Top 5 Países",
      stats_title: "Estadísticas Anónimas",
      stats_today: "Pensamientos hoy:",
      stats_week_countries: "Países activos (últimos 7 días):",
      stats_record: "Récord de pensamientos en un día:",
      action_reply: "Responder",
      action_translate: "Traducir",
      action_report: "Reportar",
      reported_button: "Reportado",
      own_thought_label: "Este es tu pensamiento.",
      capsule_label: "Esta es tu cápsula del tiempo.",
      reply_placeholder: "Escribe tu respuesta anónima...",
      send_reply_button: "Enviar Respuesta",
      pagination_previous: "Anterior",
      pagination_next: "Siguiente",
      pagination_page: "Pág.",
      pagination_of: "de"
    },
    revelation: {
      title: "Revelación Diaria",
      subtitle: "Cada día, una nueva pregunta. Responde a ciegas y vuelve mañana para ver las respuestas anónimas de todo el mundo.",
      todays_question: "Pregunta de Hoy:",
      textarea_placeholder: "Escribe tu respuesta anónima aquí...",
      send_button: "Enviar respuesta",
      thanks_message: "Gracias por tu contribución.",
      next_revelation_in: "La próxima revelación comenzará en:",
      view_yesterday: "Ver la revelación de ayer →",
      yesterdays_question_prefix: "La pregunta de ayer fue:",
      send_error: "Error al enviar la respuesta."
    },
    mine: {
      title: "Mi Universo Personal",
      export_id_button: "Exportar ID",
      import_id_button: "Importar ID",
      id_info: "Para mantener tu historial aunque borres caché o cambies de dispositivo, exporta tu ID y guárdalo en un lugar seguro.",
      history_title: "Mi Historial de Pensamientos",
      stats_title: "Mis Estadísticas",
      stats_thoughts_sent: "Pensamientos enviados:",
      stats_replies_received: "Respuestas recibidas:",
      stats_global_reach: "Alcance global:",
      stats_countries: "países",
      sent_on: "Enviado el",
      replies_received_title: "Respuestas Recibidas",
      new_replies_badge: "¡Nuevas!",
      no_replies: "Aún no hay respuestas para este pensamiento."
    },
    capsule: {
      title: "Cápsula del tiempo",
      subtitle: "Un eco de tus pensamientos, viajando silenciosamente hacia un rincón lejano del mañana.",
      textarea_placeholder: "Escribe el mensaje para tu yo del futuro...",
      schedule_button: "Programar",
      created_on: "Creada el",
      scheduled_on: "Programada el",
      scheduled_to_open: "Se abrirá el",
      opened_on: "Abierta el",
      pending_title: "Cápsulas Pendientes",
      opened_title: "Cápsulas Abiertas"
    },
    footer: {
      support_text: "Si te gusta Libre, apóyanos en Ko-fi:",
      support_button: "☕ Apóyanos",
      terms: "Términos de Servicio",
      privacy: "Política de Privacidad",
      contact: "Contacto:"
    },
    age_gate: {
      text: "LIBRE es una comunidad para **mayores de 16 años**. Al continuar, confirmas que cumples este requisito.",
      learn_more: "Saber más",
      accept_button: "Entendido"
    },
    lang_banner: {
      text: "Elige tu idioma:",
      button_es: "Español",
      button_en: "English"
    },
    empty: {
      no_thoughts: "Aún no hay pensamientos en el mundo. ¡Sé el primero!",
      my_thoughts: "Aún no has enviado ningún pensamiento. ¡Anímate a escribir!",
      my_capsules: "Aún no has programado ninguna cápsula del tiempo.",
      no_revelation_answers: "Aún no hay respuestas para la revelación de ayer. Quizás seas el primero mañana."
    },
    js: {
      notification: {
        country_wait: "Esperando ubicación, inténtalo de nuevo en un segundo.",
        thought_sent: "Pensamiento enviado al universo.",
        thought_error: "Error al enviar el pensamiento.",
        offensive_word: "El texto contiene palabras no permitidas.",
        report_confirm: "¿Estás seguro de que quieres reportar este pensamiento?",
        reporting: "Reportando...",
        report_success: "Pensamiento reportado. Gracias por tu ayuda.",
        report_limit_exceeded: "Has alcanzado tu límite de 3 reportes por día.",
        report_already_reported: "Ya has reportado este pensamiento.",
        report_error: "Error al reportar el pensamiento.",
        translate_confirm: "¿Quieres traducir este texto con Google Translate?",
        reply_error_generic: "Error al enviar la respuesta.",
        reply_error_own: "No puedes responder a tus propios pensamientos.",
        id_restored: "ID restaurado con éxito.",
        id_invalid: "El ID introducido no es válido.",
        capsule_missing_fields: "Por favor, completa el mensaje, la fecha y la hora.",
        capsule_in_past: "La fecha de la cápsula no puede ser en el pasado.",
        capsule_scheduled: "Cápsula programada con éxito para",
        capsule_error: "Error al programar la cápsula."
      },
      prompt: {
        export_id: "Copia y guarda este ID anónimo para restaurar tu historial en otro dispositivo:",
        import_id: "Pega aquí tu ID anónimo para restaurar tu historial:"
      }
    },
    inspirational_phrases: [
      "¿Qué pesa hoy en tu corazón?",
      "Suelta aquí eso que no te atreves a decir en voz alta.",
      "Un secreto, un sueño, un recuerdo...",
      "¿Qué te gustaría que el mundo supiera?",
      "Deja un mensaje para un desconocido."
    ],
    revelation_questions: [
      "¿Cuál es el mejor consejo que te han dado?",
      "Si pudieras cenar con cualquier persona (viva o muerta), ¿quién sería?",
      "¿Qué pequeña cosa te hizo sonreír hoy?",
      "Describe tu lugar feliz.",
      "¿Qué canción ha marcado tu vida y por qué?",
      "¿Un error del que aprendiste una gran lección?",
      "¿Qué te gustaría decirle a tu 'yo' de hace 10 años?"
    ],
    tutorial: {
      step_1_title: "Paso 1: Escribe libremente",
      step_1_text: "Este es tu espacio. Escribe lo que sientas aquí. Nadie sabrá que eres tú. Cuando termines, pulsa 'Enviar'.",
      step_2_title: "Paso 2: Pensamientos del mundo",
      step_2_text: "Aquí aparecen los pensamientos y cápsulas del tiempo de personas de todo el mundo. Puedes responderles o simplemente leer.",
      step_3_title: "Paso 3: El globo aleatorio",
      step_3_text: "Haz clic en el globo para leer un pensamiento al azar de cualquier parte del mundo. ¡Una sorpresa cada vez!",
      step_4_title: "Paso 4: Tu universo personal",
      step_4_text: "Aquí verás tus propios pensamientos y las respuestas anónimas que has recibido. Es tu rincón privado.",
      step_5_title: "Paso 5: Revelación Diaria",
      step_5_text: "Cada día hay una nueva pregunta. Responde a ciegas y vuelve mañana para ver lo que otros contestaron. ¡Disfruta del misterio!",
      skip_button: "Omitir Tutorial",
      next_button: "Siguiente",
      done_button: "Finalizar"
    }
  },
  en: {
    header: {
      subtitle: "Write whatever you want, without expecting anything in return.<br>Your words will be a bottle thrown into the sea, found by someone somewhere in the world, without knowing who you are, or who found it.",
      global_count: "thoughts released"
    },
    nav: {
      global_thoughts: "Global Thoughts",
      daily_revelation: "Daily Revelation",
      my_thoughts: "My Thoughts",
      new_badge: "New!",
      time_capsule: "Time Capsule"
    },
    feed: {
      title: "Thoughts from around the world",
      title_tooltip: "See a random thought from the world",
      details_summary: "View map, ranking, and statistics",
      textarea_placeholder: "Write your anonymous thought here...",
      send_button: "Send Thought",
      ranking_title: "Top 5 Countries",
      stats_title: "Anonymous Statistics",
      stats_today: "Thoughts today:",
      stats_week_countries: "Active countries (last 7 days):",
      stats_record: "Record thoughts in one day:",
      action_reply: "Reply",
      action_translate: "Translate",
      action_report: "Report",
      reported_button: "Reported",
      own_thought_label: "This is your thought.",
      capsule_label: "This is your time capsule.",
      reply_placeholder: "Write your anonymous reply...",
      send_reply_button: "Send Reply",
      pagination_previous: "Previous",
      pagination_next: "Next",
      pagination_page: "Page",
      pagination_of: "of"
    },
    revelation: {
      title: "Daily Revelation",
      subtitle: "A new question every day. Answer blindly and come back tomorrow to see the anonymous answers from around the world.",
      todays_question: "Today's Question:",
      textarea_placeholder: "Write your anonymous answer here...",
      send_button: "Send Answer",
      thanks_message: "Thank you for your contribution.",
      next_revelation_in: "The next revelation will begin in:",
      view_yesterday: "View yesterday's revelation →",
      yesterdays_question_prefix: "Yesterday's question was:",
      send_error: "Error sending the answer."
    },
    mine: {
      title: "My Personal Universe",
      export_id_button: "Export ID",
      import_id_button: "Import ID",
      id_info: "To keep your history even if you clear your cache or change devices, export your ID and save it in a safe place.",
      history_title: "My Thought History",
      stats_title: "My Stats",
      stats_thoughts_sent: "Thoughts sent:",
      stats_replies_received: "Replies received:",
      stats_global_reach: "Global reach:",
      stats_countries: "countries",
      sent_on: "Sent on",
      replies_received_title: "Replies Received",
      new_replies_badge: "New!",
      no_replies: "No replies for this thought yet."
    },
    capsule: {
      title: "Time Capsule",
      subtitle: "An echo of your thoughts, traveling silently to a distant corner of tomorrow.",
      textarea_placeholder: "Write a message for your future self...",
      schedule_button: "Schedule",
      created_on: "Created on",
      scheduled_on: "Scheduled on",
      scheduled_to_open: "Scheduled to open on",
      opened_on: "Opened on",
      pending_title: "Pending Capsules",
      opened_title: "Opened Capsules"
    },
    footer: {
      support_text: "If you like Libre, support us on Ko-fi:",
      support_button: "☕ Support Us",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      contact: "Contact:"
    },
    age_gate: {
      text: "LIBRE is a community for people **16 and older**. By continuing, you confirm that you meet this requirement.",
      learn_more: "Learn more",
      accept_button: "I Understand"
    },
    lang_banner: {
      text: "Choose your language:",
      button_es: "Español",
      button_en: "English"
    },
    empty: {
      no_thoughts: "There are no thoughts in the world yet. Be the first!",
      my_thoughts: "You haven't sent any thoughts yet. Go ahead and write something!",
      my_capsules: "You haven't scheduled any time capsules yet.",
      no_revelation_answers: "No answers for yesterday's revelation yet. Maybe you'll be the first tomorrow."
    },
    js: {
      notification: {
        country_wait: "Waiting for location, please try again in a second.",
        thought_sent: "Thought sent to the universe.",
        thought_error: "Error sending thought.",
        offensive_word: "Text contains forbidden words.",
        report_confirm: "Are you sure you want to report this thought?",
        reporting: "Reporting...",
        report_success: "Thought reported. Thank you for your help.",
        report_limit_exceeded: "You have reached your limit of 3 reports per day.",
        report_already_reported: "You have already reported this thought.",
        report_error: "Error reporting thought.",
        translate_confirm: "Do you want to translate this text with Google Translate?",
        reply_error_generic: "Error sending reply.",
        reply_error_own: "You cannot reply to your own thoughts.",
        id_restored: "ID restored successfully.",
        id_invalid: "The entered ID is not valid.",
        capsule_missing_fields: "Please fill in the message, date, and time.",
        capsule_in_past: "The capsule date cannot be in the past.",
        capsule_scheduled: "Capsule scheduled successfully for",
        capsule_error: "Error scheduling capsule."
      },
      prompt: {
        export_id: "Copy and save this anonymous ID to restore your history on another device:",
        import_id: "Paste your anonymous ID here to restore your history:"
      }
    },
    inspirational_phrases: [
      "What weighs on your heart today?",
      "Let go of what you don't dare to say out loud.",
      "A secret, a dream, a memory...",
      "What do you wish the world knew?",
      "Leave a message for a stranger."
    ],
    revelation_questions: [
      "What is the best advice you have ever been given?",
      "If you could have dinner with anyone (living or dead), who would it be?",
      "What little thing made you smile today?",
      "Describe your happy place.",
      "What song has marked your life and why?",
      "A mistake from which you learned a great lesson?",
      "What would you like to say to your 10-year-younger self?"
    ],
    tutorial: {
      step_1_title: "Step 1: Write freely",
      step_1_text: "This is your space. Write whatever you feel here. No one will know it's you. When you're done, press 'Send'.",
      step_2_title: "Step 2: Thoughts from the world",
      step_2_text: "Thoughts and time capsules from people around the world appear here. You can reply to them or just read.",
      step_3_title: "Step 3: The random globe",
      step_3_text: "Click the globe to read a random thought from anywhere in the world. A surprise every time!",
      step_4_title: "Step 4: Your personal universe",
      step_4_text: "Here you will see your own thoughts and the anonymous replies you have received. It is your private corner.",
      step_5_title: "Step 5: Daily Revelation",
      step_5_text: "Every day there is a new question. Answer blindly and come back tomorrow to see what others answered. Enjoy the mystery!",
      skip_button: "Skip Tutorial",
      next_button: "Next",
      done_button: "Done"
    }
  }
};