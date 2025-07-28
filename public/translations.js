const translations = {
  es: {
    // Welcome Screen
    'welcome.slide1.title': '¡Bienvenido!',
    'welcome.slide1.text': 'Primero, elige tu idioma y confirma que tienes la edad para unirte a nuestra comunidad.',
    'welcome.slide1.age_gate_button_disabled': 'Elige un idioma primero',
    'welcome.slide1.age_gate_button': 'Confirmo que tengo +16 años',
    'welcome.slide1.terms_notice_pt1': 'Al continuar, aceptas nuestros',
    'welcome.slide1.terms_link': 'Términos',
    'welcome.slide1.terms_notice_pt2': 'y',
    'welcome.slide1.privacy_link': 'Política de Privacidad',
    'welcome.slide2.title': 'Pensamientos Globales: Botellas al Mar',
    'welcome.slide2.text': 'Lanza tus ideas al mundo de forma anónima. Como un mensaje en una botella, no sabes quién lo leerá, solo que llegará a algún rincón del planeta.',
    'welcome.slide3.title': 'Revelación Diaria: Un Misterio Compartido',
    'welcome.slide3.text': 'Cada día, una nueva pregunta para todos. Responde a ciegas y vuelve mañana para descubrir un mosaico de respuestas sinceras de todo el mundo.',
    'welcome.slide4.title': 'Mis Pensamientos: Tu Universo Personal',
    'welcome.slide4.text': 'Aquí se guardan tus pensamientos y los ecos que generan. Lee las respuestas que otros usuarios anónimos han dejado a tus mensajes.',
    'welcome.slide5.title': 'Cápsula del Tiempo: Un Mensaje al Futuro',
    'welcome.slide5.text': 'Escribe un mensaje para el mañana. Fija una fecha y tu pensamiento será liberado en ese preciso instante.',
    'welcome.slide6.title': 'Nuestros Valores: Un Espacio Realmente LIBRE',
    'welcome.slide6.text': 'Aquí no hay \'me gusta\', ni seguidores, ni algoritmos. Solo existe la libertad de expresarte con un anonimato radical y conectar de forma pura.',
    'welcome.start_button': 'Comenzar a ser LIBRE',

    // Header
    'header.subtitle': 'Escribe lo que quieras, sin esperar nada a cambio.<br>Tus palabras serán una botella lanzada al mar, encontrada por alguien en algún lugar del mundo, sin saber quién eres, ni quién la encontró.',
    'header.global_count': 'pensamientos lanzados',
    // Nav
    'nav.global_thoughts': 'Pensamientos globales',
    'nav.daily_revelation': 'Revelación Diaria',
    'nav.my_thoughts': 'Mis pensamientos',
    'nav.time_capsule': 'Cápsula del tiempo',
    'nav.new_badge': '¡Nuevo!',
    // Feed Tab
    'feed.title': 'Pensamientos de todo el mundo',
    'feed.title_tooltip': 'Ver un pensamiento aleatorio del mundo',
    'feed.details_summary': 'Ver mapa, ranking y estadísticas',
    'feed.ranking_title': 'Ranking de países más activos:',
    'feed.stats_title': '📊 Estadísticas anónimas',
    'feed.stats_today': 'Pensamientos escritos <strong>hoy</strong>:',
    'feed.stats_week_countries': 'Países diferentes la última semana:',
    'feed.stats_record': 'Récord de pensamientos en un día:',
    'feed.textarea_placeholder': 'Escribe lo que quieras...',
    'feed.send_button': 'Enviar pensamiento',
    'feed.pagination_page': 'Página',
    'feed.pagination_of': 'de',
    'feed.pagination_previous': 'Anterior',
    'feed.pagination_next': 'Siguiente',
    'feed.action_reply': '💬 Responder',
    'feed.action_translate': '[ Traducir ]',
    'feed.action_report': 'Reportar',
    'feed.reported_button': 'Reportado',
    'feed.reply_placeholder': 'Escribe tu respuesta...',
    'feed.send_reply_button': 'Enviar respuesta',
    'feed.own_thought_label': 'Es tu propio pensamiento',
    'feed.capsule_label': 'Mensaje de una cápsula del tiempo',
    // Revelation Tab
    'revelation.title': 'Revelación Diaria',
    'revelation.subtitle': 'Cada día, una nueva pregunta. Responde a ciegas y vuelve mañana para ver las respuestas anónimas de todo el mundo.',
    'revelation.todays_question': 'Pregunta de Hoy:',
    'revelation.textarea_placeholder': 'Tu respuesta honesta...',
    'revelation.send_button': 'Enviar respuesta',
    'revelation.thanks_message': 'Gracias por tu contribución.',
    'revelation.next_revelation_in': 'La próxima revelación comenzará en:',
    'revelation.view_yesterday': 'Ver la revelación de ayer →',
    'revelation.yesterdays_question_prefix': 'Pregunta de ayer:',
    // My Thoughts Tab
    'mine.title': 'Mi Universo Personal',
    'mine.stats_title': '📊 Tu Actividad Anónima',
    'mine.stats_thoughts_sent': 'Pensamientos lanzados:',
    'mine.stats_replies_received': 'Respuestas recibidas:',
    'mine.stats_global_reach': 'Alcance global:',
    'mine.stats_countries': 'países diferentes',
    'mine.export_id_button': 'Exportar ID',
    'mine.import_id_button': 'Importar ID',
    'mine.id_info': 'Para mantener tu historial aunque borres caché o cambies de dispositivo, exporta tu ID y guárdalo en un lugar seguro.',
    'mine.history_title': 'Mi Historial de Pensamientos',
    'mine.replies_received_title': 'Respuestas recibidas',
    'mine.new_replies_badge': '¡Nuevas!',
    'mine.no_replies': 'Aún no hay respuestas para este pensamiento.',
    'mine.sent_on': 'Enviado el',
    // Time Capsule Tab
    'capsule.title': 'Cápsula del tiempo',
    'capsule.subtitle': 'Un eco de tus pensamientos, viajando silenciosamente hacia un rincón lejano del mañana.',
    'capsule.textarea_placeholder': 'Tu mensaje secreto para el futuro...',
    'capsule.schedule_button': 'Programar',
    'capsule.pending_title': 'Pendientes',
    'capsule.opened_title': 'Abiertas',
    'capsule.scheduled_to_open': 'Cápsula programada para abrirse el',
    'capsule.created_on': 'Creada el',
    'capsule.opened_on': 'Cápsula abierta el',
    'capsule.scheduled_on': 'Programada el',
    // About Tab
    'about.title': 'Información y Aspectos Legales',
    'about.why_libre.title': '¿Por qué Libre?',
    'about.why_libre.item1': '<b>Anonimato radical:</b> Nadie te sigue, nadie sabe quién eres. Tu identidad no importa, solo tu pensamiento.',
    'about.why_libre.item2': '<b>Sin validación social:</b> No hay “me gusta”, ni seguidores, ni comentarios públicos que te condicionen.',
    'about.why_libre.item3': '<b>Libertad de expresión pura:</b> Un espacio para soltar lo que llevas dentro, sin miedo a juicios ni presión social.',
    'about.why_libre.item4': '<b>Conexión humana inesperada:</b> Tu mensaje puede llegar a cualquier persona, en cualquier país, en cualquier momento.',
    'about.why_libre.item5': '<b>Sin historial, sin reputación:</b> Cada mensaje es un instante aislado, sin contexto previo ni futuro.',
    'about.why_libre.item6': '<b>Cero algoritmos, cero manipulación:</b> No hay feeds personalizados, ni trending topics. Todo es azar.',
    'about.terms.title': 'Términos de Servicio',
    'about.terms.content_html': `<p>Al utilizar LIBRE (el "Servicio"), aceptas cumplir con estos Términos de Servicio. El acceso y uso del Servicio están condicionados a tu aceptación y cumplimiento de estos términos.</p>
        <ul class="list-disc pl-5">
            <li><strong>Requisito de Edad:</strong> Debes tener al menos 16 años para utilizar este Servicio. Al acceder o utilizar LIBRE, declaras y garantizas que cumples con este requisito de edad. No recopilamos deliberadamente información de personas menores de 16 años.</li>
            <li><strong>Contenido del Usuario:</strong> Eres el único responsable del contenido que publicas. Al publicar contenido, garantizas que tienes derecho a hacerlo y que no infringe ninguna ley ni los derechos de terceros. No publiques contenido que sea ilegal, ofensivo, amenazante, difamatorio, que incite al odio o que viole cualquier ley o regulación.</li>
            <li><strong>Conducta del Usuario:</strong> Aceptas no utilizar el Servicio para ningún propósito ilegal o no autorizado. El acoso, el spam y cualquier forma de abuso están estrictamente prohibidos.</li>
            <li><strong>Moderación de Contenido:</strong> Nos reservamos el derecho, pero no la obligación, de monitorear y eliminar contenido que, a nuestra entera discreción, viole estos términos o sea inapropiado. El sistema de reportes por parte de la comunidad es una herramienta clave para mantener la plataforma segura.</li>
            <li><strong>Limitación de Responsabilidad:</strong> El Servicio se proporciona "tal cual", sin garantías de ningún tipo. No seremos responsables de ningún daño directo o indirecto que surja de tu uso del Servicio.</li>
        </ul>`,
    'about.privacy.title': 'Política de Privacidad',
    'about.privacy.content_html': `<p>Tu privacidad es el pilar fundamental de LIBRE. Esta política explica qué información se recopila y cómo se utiliza para mantener el anonimato.</p>
          <ul class="list-disc pl-5">
              <li><strong>Anonimato:</strong> El Servicio está diseñado para ser radicalmente anónimo. No se te solicita ni se almacena ninguna información de identificación personal (nombre, correo electrónico, etc.).</li>
              <li><strong>Datos Recopilados:</strong>
                  <ul class="list-disc pl-5 mt-2">
                      <li><strong>Identificador Anónimo:</strong> Al usar el servicio, se genera un identificador único y anónimo (ej: \`anon-xxxxxx\`) que se guarda en el almacenamiento local (\`localStorage\`) de tu navegador. Este ID te permite ver tu historial de mensajes, pero no está vinculado a tu identidad real. Si borras los datos de tu navegador, este ID se perderá a menos que lo hayas exportado.</li>
                      <li><strong>País:</strong> Para fines estadísticos y para mostrar la procedencia de los mensajes en el mapa, detectamos tu país a través de tu dirección IP. La dirección IP en sí misma **no se almacena en ningún momento**. Solo se guarda el código del país (ej: "ES" para España) junto con el mensaje.</li>
                  </ul>
              </li>
              <li class="mt-2"><strong>Uso de Almacenamiento Local (\`localStorage\`):</strong> Utilizamos el almacenamiento local de tu navegador para:
                  <ul class="list-disc pl-5 mt-2">
                      <li>Guardar tu identificador anónimo.</li>
                      <li>Recordar si has aceptado el aviso de edad y visto la bienvenida.</li>
                      <li>Registrar los últimos mensajes respondidos para el sistema de notificaciones.</li>
                  </ul>
              </li>
              <li class="mt-2"><strong>No Compartimos Datos:</strong> Dado que no recopilamos datos personales, no hay nada que compartir o vender a terceros.</li>
          </ul>`,
    
    // Footer & Legal
    'footer.support_text': 'Si te gusta Libre, apóyanos en Ko-fi:',
    'footer.support_button': '☕ Apóyanos',
    'footer.terms': 'Términos de Servicio',
    'footer.privacy': 'Política de Privacidad',
    'footer.contact': 'Contacto:',
    // Empty states
    'empty.no_thoughts': 'Aún no hay pensamientos. ¡Sé el primero!',
    'empty.no_revelation_answers': 'Nadie respondió a la pregunta de ayer. ¡Asegúrate de responder hoy!',
    'empty.my_thoughts': 'No has escrito aún...',
    'empty.my_capsules': 'No has programado ninguna cápsula aún.',
    // JS Messages & Prompts
    'js.notification.country_wait': 'Cargando país, por favor espera.',
    'js.notification.offensive_word': 'Tu mensaje contiene palabras que no están permitidas. Por favor, modifícalo.',
    'js.notification.thought_sent': 'Pensamiento enviado al mundo.',
    'js.notification.thought_error': 'Error al guardar el pensamiento.',
    'js.notification.report_confirm': '¿Seguro que quieres reportar este pensamiento como inapropiado?',
    'js.notification.reporting': 'Reportando...',
    'js.notification.report_success': 'Pensamiento reportado. Gracias por tu ayuda.',
    'js.notification.report_error': 'No se pudo enviar el reporte. Inténtalo de nuevo.',
    'js.notification.translate_confirm': 'Estás a punto de salir de Libre para ver la traducción en Google Translate. Esta función es experimental.\n\n¿Deseas continuar?',
    'js.notification.reply_error_own': 'No puedes responder a tu propio pensamiento.',
    'js.notification.reply_error_generic': 'Error al guardar la respuesta.',
    'js.prompt.export_id': 'Este es tu identificador anónimo. Cópialo y guárdalo en un lugar seguro para restaurar tu historial cuando quieras:',
    'js.prompt.import_id': 'Pega aquí tu identificador anónimo guardado anteriormente:',
    'js.notification.id_restored': 'Identificador restaurado con éxito.',
    'js.notification.id_invalid': 'El identificador no es válido.',
    'js.notification.capsule_missing_fields': 'Debes escribir un mensaje y elegir fecha y hora.',
    'js.notification.capsule_in_past': '¡La cápsula debe viajar al futuro! Elige una fecha posterior.',
    'js.notification.capsule_scheduled': 'Cápsula programada para',
    'js.notification.capsule_error': 'Error al guardar la cápsula.',
    'js.notification.report_limit_exceeded': 'Has alcanzado el límite de 3 reportes por día.',
    'js.notification.report_already_reported': 'Ya has reportado este pensamiento.',
    
    // Inspirational Phrases
    'inspirational_phrases': [
      "La libertad es el oxígeno del alma. – Moshe Dayan", "La creatividad requiere tener el valor de desprenderse de las certezas. – Erich Fromm", "Ser anónimo es ser verdaderamente libre.", "A veces, lo que más necesitamos decir es lo que menos nos atrevemos a compartir.", "La honestidad florece en el anonimato.", "Tus pensamientos pueden ser el faro para alguien más.", "Escribir sin miedo es un acto de valentía.", "La mente es más ligera cuando se libera lo que pesa.", "La autenticidad no necesita nombre ni rostro.", "Las palabras anónimas pueden resonar en todo el mundo.", "Deja que tus pensamientos viajen libres, sin destino.", "Lo que no se dice, también necesita salir.", "En el anonimato, todos somos iguales.", "Expresarte es un regalo para ti mismo.", "A veces lo más importante es soltar."
    ],
    // Revelation Questions
    'revelation_questions': [
      "¿Qué es algo pequeño que te hizo feliz hoy?", "Si pudieras dar un consejo a tu 'yo' más joven, ¿cuál sería?", "Describe un sonido que te traiga paz.", "¿Cuál es un sueño que nunca has contado a nadie?", "¿Qué significa la palabra 'hogar' para ti?", "¿A qué le tienes miedo en silencio?", "Nombra una canción que sea la banda sonora de tu vida ahora mismo.", "¿Qué es la libertad para ti?", "Describe un acto de bondad que presenciaste o hiciste.", "¿Cuál es el mejor olor del mundo para ti?", "Si pudieras aprender una habilidad instantáneamente, ¿cuál sería?", "¿Qué es algo que la gente suele malinterpretar sobre ti?", "Un recuerdo de tu infancia que todavía te hace sonreír.", "¿Qué te mantiene despierto por la noche?", "¿Cuál es una causa por la que lucharías?"
    ]
  },
  en: {
    // Welcome Screen
    'welcome.slide1.title': 'Welcome!',
    'welcome.slide1.text': 'First, choose your language and confirm you are old enough to join our community.',
    'welcome.slide1.age_gate_button_disabled': 'Choose a language first',
    'welcome.slide1.age_gate_button': 'I confirm I am 16+',
    'welcome.slide1.terms_notice_pt1': 'By continuing, you agree to our',
    'welcome.slide1.terms_link': 'Terms',
    'welcome.slide1.terms_notice_pt2': 'and',
    'welcome.slide1.privacy_link': 'Privacy Policy',
    'welcome.slide2.title': 'Global Thoughts: Bottles in the Sea',
    'welcome.slide2.text': 'Launch your ideas into the world anonymously. Like a message in a bottle, you don\'t know who will read it, only that it will reach some corner of the planet.',
    'welcome.slide3.title': 'Daily Revelation: A Shared Mystery',
    'welcome.slide3.text': 'Every day, a new question for everyone. Answer blindly and come back tomorrow to discover a mosaic of sincere answers from around the world.',
    'welcome.slide4.title': 'My Thoughts: Your Personal Universe',
    'welcome.slide4.text': 'Here, your thoughts and the echoes they generate are saved. Read the responses that other anonymous users have left for your messages.',
    'welcome.slide5.title': 'Time Capsule: A Message to the Future',
    'welcome.slide5.text': 'Write a message for tomorrow. Set a date, and your thought will be released at that precise moment.',
    'welcome.slide6.title': 'Our Values: A Truly FREE Space',
    'welcome.slide6.text': 'There are no \'likes\', no followers, no algorithms here. There is only the freedom to express yourself with radical anonymity and connect purely.',
    'welcome.start_button': 'Start being FREE',

    // Header
    'header.subtitle': 'Write whatever you want, expecting nothing in return.<br>Your words will be a bottle cast into the sea, found by someone somewhere in the world, without knowing who you are, or who found it.',
    'header.global_count': 'thoughts launched',
    // Nav
    'nav.global_thoughts': 'Global Thoughts',
    'nav.daily_revelation': 'Daily Revelation',
    'nav.my_thoughts': 'My Thoughts',
    'nav.time_capsule': 'Time Capsule',
    'nav.new_badge': 'New!',
    // Feed Tab
    'feed.title': 'Thoughts from around the world',
    'feed.title_tooltip': 'See a random thought from the world',
    'feed.details_summary': 'View map, ranking, and statistics',
    'feed.ranking_title': 'Ranking of most active countries:',
    'feed.stats_title': '📊 Anonymous Statistics',
    'feed.stats_today': 'Thoughts written <strong>today</strong>:',
    'feed.stats_week_countries': 'Different countries in the last week:',
    'feed.stats_record': 'Record for thoughts in one day:',
    'feed.textarea_placeholder': 'Write what you want...',
    'feed.send_button': 'Send thought',
    'feed.pagination_page': 'Page',
    'feed.pagination_of': 'of',
    'feed.pagination_previous': 'Previous',
    'feed.pagination_next': 'Next',
    'feed.action_reply': '💬 Reply',
    'feed.action_translate': '[ Translate ]',
    'feed.action_report': 'Report',
    'feed.reported_button': 'Reported',
    'feed.reply_placeholder': 'Write your reply...',
    'feed.send_reply_button': 'Send reply',
    'feed.own_thought_label': 'This is your own thought',
    'feed.capsule_label': 'Message from a time capsule',
    // Revelation Tab
    'revelation.title': 'Daily Revelation',
    'revelation.subtitle': 'A new question every day. Answer blindly and come back tomorrow to see anonymous answers from around the world.',
    'revelation.todays_question': 'Today\'s Question:',
    'revelation.textarea_placeholder': 'Your honest answer...',
    'revelation.send_button': 'Send Answer',
    'revelation.thanks_message': 'Thank you for your contribution.',
    'revelation.next_revelation_in': 'The next revelation will begin in:',
    'revelation.view_yesterday': 'See yesterday\'s revelation →',
    'revelation.yesterdays_question_prefix': 'Yesterday\'s question:',
    // My Thoughts Tab
    'mine.title': 'My Personal Universe',
    'mine.stats_title': '📊 Your Anonymous Activity',
    'mine.stats_thoughts_sent': 'Thoughts launched:',
    'mine.stats_replies_received': 'Replies received:',
    'mine.stats_global_reach': 'Global reach:',
    'mine.stats_countries': 'different countries',
    'mine.export_id_button': 'Export ID',
    'mine.import_id_button': 'Import ID',
    'mine.id_info': 'To keep your history even if you clear your cache or change devices, export your ID and save it in a safe place.',
    'mine.history_title': 'My Thought History',
    'mine.replies_received_title': 'Replies Received',
    'mine.new_replies_badge': 'New!',
    'mine.no_replies': 'There are no replies to this thought yet.',
    'mine.sent_on': 'Sent on',
    // Time Capsule Tab
    'capsule.title': 'Time Capsule',
    'capsule.subtitle': 'An echo of your thoughts, silently traveling to a distant corner of tomorrow.',
    'capsule.textarea_placeholder': 'Your secret message to the future...',
    'capsule.schedule_button': 'Schedule',
    'capsule.pending_title': 'Pending',
    'capsule.opened_title': 'Opened',
    'capsule.scheduled_to_open': 'Capsule scheduled to open on',
    'capsule.created_on': 'Created on',
    'capsule.opened_on': 'Capsule opened on',
    'capsule.scheduled_on': 'Scheduled on',
    // About Tab
    'about.title': 'Information and Legal',
    'about.why_libre.title': 'Why Libre?',
    'about.why_libre.item1': '<b>Radical Anonymity:</b> No one follows you, no one knows who you are. Your identity doesn\'t matter, only your thoughts.',
    'about.why_libre.item2': '<b>No Social Validation:</b> There are no “likes”, no followers, no public comments to condition you.',
    'about.why_libre.item3': '<b>Pure Freedom of Expression:</b> A space to release what\'s inside you, without fear of judgment or social pressure.',
    'about.why_libre.item4': '<b>Unexpected Human Connection:</b> Your message can reach anyone, in any country, at any time.',
    'about.why_libre.item5': '<b>No History, No Reputation:</b> Each message is an isolated moment, without previous or future context.',
    'about.why_libre.item6': '<b>Zero Algorithms, Zero Manipulation:</b> No personalized feeds, no trending topics. Everything is random.',
    'about.terms.title': 'Terms of Service',
    'about.terms.content_html': `<p>By using LIBRE (the "Service"), you agree to comply with these Terms of Service. Access to and use of the Service is conditioned upon your acceptance of and compliance with these terms.</p>
        <ul class="list-disc pl-5">
            <li><strong>Age Requirement:</strong> You must be at least 16 years old to use this Service. By accessing or using LIBRE, you represent and warrant that you meet this age requirement. We do not knowingly collect information from individuals under 16.</li>
            <li><strong>User Content:</strong> You are solely responsible for the content you post. By posting content, you warrant that you have the right to do so and that it does not infringe any law or the rights of third parties. Do not post content that is illegal, offensive, threatening, defamatory, incites hatred, or violates any law or regulation.</li>
            <li><strong>User Conduct:</strong> You agree not to use the Service for any illegal or unauthorized purpose. Harassment, spam, and any form of abuse are strictly prohibited.</li>
            <li><strong>Content Moderation:</strong> We reserve the right, but not the obligation, to monitor and remove content that, in our sole discretion, violates these terms or is otherwise inappropriate. The community reporting system is a key tool for keeping the platform safe.</li>
            <li><strong>Limitation of Liability:</strong> The Service is provided "as is", without warranties of any kind. We will not be liable for any direct or indirect damages arising from your use of the Service.</li>
        </ul>`,
    'about.privacy.title': 'Privacy Policy',
    'about.privacy.content_html': `<p>Your privacy is the cornerstone of LIBRE. This policy explains what information is collected and how it is used to maintain anonymity.</p>
          <ul class="list-disc pl-5">
              <li><strong>Anonymity:</strong> The Service is designed to be radically anonymous. You are not asked for, nor is any personally identifiable information (name, email, etc.) stored.</li>
              <li><strong>Data Collected:</strong>
                  <ul class="list-disc pl-5 mt-2">
                      <li><strong>Anonymous Identifier:</strong> When you use the service, a unique and anonymous identifier (e.g., \`anon-xxxxxx\`) is generated and saved in your browser's local storage (\`localStorage\`). This ID allows you to see your message history but is not linked to your real identity. If you clear your browser data, this ID will be lost unless you have exported it.</li>
                      <li><strong>Country:</strong> For statistical purposes and to show the origin of messages on the map, we detect your country via your IP address. The IP address itself **is not stored at any time**. Only the country code (e.g., "US" for the United States) is saved with the message.</li>
                  </ul>
              </li>
              <li class="mt-2"><strong>Use of Local Storage (\`localStorage\`):</strong> We use your browser's local storage to:
                  <ul class="list-disc pl-5 mt-2">
                      <li>Save your anonymous identifier.</li>
                      <li>Remember if you have accepted the age notice and seen the welcome screen.</li>
                      <li>Register the last replied-to messages for the notification system.</li>
                  </ul>
              </li>
              <li class="mt-2"><strong>No Data Sharing:</strong> Since we do not collect personal data, there is nothing to share or sell to third parties.</li>
          </ul>`,

    // Footer & Legal
    'footer.support_text': 'If you like Libre, support us on Ko-fi:',
    'footer.support_button': '☕ Support Us',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.contact': 'Contact:',
    // Empty states
    'empty.no_thoughts': 'No thoughts yet. Be the first!',
    'empty.no_revelation_answers': 'Nobody answered yesterday\'s question. Be sure to answer today!',
    'empty.my_thoughts': 'You haven\'t written anything yet...',
    'empty.my_capsules': 'You haven\'t scheduled any capsules yet.',
    // JS Messages & Prompts
    'js.notification.country_wait': 'Loading country, please wait.',
    'js.notification.offensive_word': 'Your message contains words that are not allowed. Please modify it.',
    'js.notification.thought_sent': 'Thought sent to the world.',
    'js.notification.thought_error': 'Error saving thought.',
    'js.notification.report_confirm': 'Are you sure you want to report this thought as inappropriate?',
    'js.notification.reporting': 'Reporting...',
    'js.notification.report_success': 'Thought reported. Thank you for your help.',
    'js.notification.report_error': 'Could not send the report. Please try again.',
    'js.notification.translate_confirm': 'You are about to leave Libre to see the translation on Google Translate. This feature is experimental.\n\nDo you wish to continue?',
    'js.notification.reply_error_own': 'You cannot reply to your own thought.',
    'js.notification.reply_error_generic': 'Error saving reply.',
    'js.prompt.export_id': 'This is your anonymous identifier. Copy it and save it in a safe place to restore your history whenever you want:',
    'js.prompt.import_id': 'Paste your previously saved anonymous identifier here:',
    'js.notification.id_restored': 'Identifier restored successfully.',
    'js.notification.id_invalid': 'The identifier is not valid.',
    'js.notification.capsule_missing_fields': 'You must write a message and choose a date and time.',
    'js.notification.capsule_in_past': 'The capsule must travel to the future! Choose a later date.',
    'js.notification.capsule_scheduled': 'Capsule scheduled for',
    'js.notification.capsule_error': 'Error saving the capsule.',
    'js.notification.report_limit_exceeded': 'You have reached the limit of 3 reports per day.',
    'js.notification.report_already_reported': 'You have already reported this thought.',

    // Inspirational Phrases
    'inspirational_phrases': [
      "Freedom is the oxygen of the soul. – Moshe Dayan", "Creativity requires the courage to let go of certainties. – Erich Fromm", "To be anonymous is to be truly free.", "Sometimes, what we need to say the most is what we dare to share the least.", "Honesty flourishes in anonymity.", "Your thoughts can be a beacon for someone else.", "Writing without fear is an act of courage.", "The mind is lighter when what weighs it down is released.", "Authenticity needs no name or face.", "Anonymous words can resonate throughout the world.", "Let your thoughts travel free, without a destination.", "What is left unsaid also needs to come out.", "In anonymity, we are all equal.", "Expressing yourself is a gift to yourself.", "Sometimes the most important thing is to let go."
    ],
    // Revelation Questions
    'revelation_questions': [
      "What's something small that made you happy today?", "If you could give advice to your younger self, what would it be?", "Describe a sound that brings you peace.", "What's a dream you've never told anyone?", "What does the word 'home' mean to you?", "What are you silently afraid of?", "Name a song that is the soundtrack of your life right now.", "What does freedom mean to you?", "Describe an act of kindness you witnessed or performed.", "What is the best smell in the world to you?", "If you could learn one skill instantly, what would it be?", "What is something people often misunderstand about you?", "A childhood memory that still makes you smile.", "What keeps you up at night?", "What is a cause you would fight for?"
    ]
  }
};